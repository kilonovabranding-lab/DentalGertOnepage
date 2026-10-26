// Lógica de reservas compartida entre Pages Functions (API) y el Worker de cron.
import { SERVICES, PII_RETENTION_DAYS, MAX_DAYS_AHEAD } from './config.js'
import { execTool } from './composio.js'
import { monthSlots, daySlots, busyByDate, blocksFor, localNow, addDays, parseTime, toISO } from './slots.js'
import { freeBusy, createEvent, listEvents, appendBooking, setSheetStatus, sheetOwners, sendMail, clinicEmail, patientEmail, CLINIC_EMAIL, REM_EMAIL, monthLabel } from './google.js'

const MONTH_RE = /^\d{4}-\d{2}$/

// Ocupación de un rango: Google Calendar (freeBusy, cacheado 60 s) + bloques de reservas web en D1.
async function busyMap(env, fromDate, toDate, { fresh = false } = {}) {
  const fromISO = toISO(fromDate, 0)
  const toISOv = toISO(addDays(toDate, 1), 0)
  let busy
  const cache = typeof caches !== 'undefined' ? caches.default : null
  const key = new Request(`https://cache.local/freebusy/${fromDate}/${toDate}`)
  if (cache && !fresh) {
    const hit = await cache.match(key)
    if (hit) busy = await hit.json()
  }
  if (!busy) {
    busy = await freeBusy(env, fromISO, toISOv)
    if (cache) await cache.put(key, new Response(JSON.stringify(busy), { headers: { 'cache-control': 'max-age=60' } }))
  }
  const map = busyByDate(busy)
  const { results } = await env.DB.prepare('SELECT date, block FROM booking_blocks WHERE date BETWEEN ? AND ?').bind(fromDate, toDate).all()
  for (const r of results) (map[r.date] ||= []).push([r.block, r.block + 5])
  return map
}

export async function availability(env, service, month) {
  if (!SERVICES[service] || !MONTH_RE.test(month)) return null
  const now = localNow()
  const last = addDays(now.date, MAX_DAYS_AHEAD)
  const first = `${month}-01`
  const end = addDays(addDays(first, 32).slice(0, 7) + '-01', -1)
  if (end < now.date || first > last) return monthSlots(month, SERVICES[service].min, {}, now)
  const map = await busyMap(env, first < now.date ? now.date : first, end > last ? last : end)
  return monthSlots(month, SERVICES[service].min, map, now)
}

// Inserta la reserva de forma atómica. Devuelve { booking } o { conflict: true, slots }.
export async function createBooking(env, data) {
  const duration = SERVICES[data.service].min
  const map = await busyMap(env, data.date, data.date, { fresh: true })
  const free = daySlots(data.date, duration, map[data.date] || [])
  if (!free.includes(data.time)) return { conflict: true, slots: free }
  const id = 'DG-' + crypto.randomUUID().slice(0, 8).toUpperCase()
  const created_at = new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 19).replace('T', ' ')
  const b = { ...data, id, duration, created_at, status: 'confirmada' }
  const stmts = [
    env.DB.prepare(`INSERT INTO bookings (id, created_at, date, time, service, duration, nombres, apellidos, telefono, residencia, dui, pasaporte, pais, correo, motivo, lang, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, created_at, b.date, b.time, b.service, duration, b.nombres, b.apellidos, b.telefono, b.residencia, b.dui, b.pasaporte, b.pais, b.correo, b.motivo, b.lang, b.status),
    ...blocksFor(parseTime(b.time), duration).map((m) => env.DB.prepare('INSERT INTO booking_blocks (date, block, booking_id) VALUES (?, ?, ?)').bind(b.date, m, id)),
    ...['event', 'sheet:dental', ...(sheetOwners(env).some((o) => o.key === 'rem') ? ['sheet:rem'] : []), 'mail:clinic', ...(b.correo ? ['mail:patient'] : [])]
      .map((t) => env.DB.prepare('INSERT INTO outbox (booking_id, task) VALUES (?, ?)').bind(id, t)),
  ]
  try {
    await env.DB.batch(stmts) // transaccional: si un bloque ya existe (UNIQUE), no se inserta nada
  } catch (e) {
    if (/UNIQUE|PRIMARY KEY|constraint/i.test(e.message)) {
      const again = await busyMap(env, data.date, data.date, { fresh: true })
      return { conflict: true, slots: daySlots(data.date, duration, again[data.date] || []) }
    }
    throw e
  }
  return { booking: b }
}

/* ---------- Outbox: tareas hacia Google con reintentos ---------- */
const MAX_ATTEMPTS = 8

async function runTask(env, task, b) {
  if (task === 'event') {
    const eventId = await createEvent(env, b)
    await env.DB.prepare('UPDATE bookings SET event_id = ? WHERE id = ?').bind(eventId, b.id).run()
    b.event_id = eventId
  } else if (task.startsWith('sheet:')) {
    const owner = sheetOwners(env).find((o) => o.key === task.slice(6))
    if (!owner) return
    const rowN = await appendBooking(env, owner, b)
    if (rowN) await env.DB.prepare(`UPDATE bookings SET sheet_rows = json_set(coalesce(sheet_rows, '{}'), '$.' || ?, ?) WHERE id = ?`).bind(owner.key, rowN, b.id).run()
  } else if (task === 'mail:clinic') {
    const m = clinicEmail(b)
    await sendMail(env, CLINIC_EMAIL, m.subject, m.html)
  } else if (task === 'mail:patient') {
    const m = patientEmail(b)
    await sendMail(env, b.correo, m.subject, m.html)
  }
}

export async function processOutbox(env, bookingId = null) {
  const q = bookingId
    ? env.DB.prepare('SELECT * FROM outbox WHERE done = 0 AND booking_id = ? ORDER BY id').bind(bookingId)
    : env.DB.prepare('SELECT * FROM outbox WHERE done = 0 AND attempts < ? ORDER BY id LIMIT 40').bind(MAX_ATTEMPTS)
  const { results } = await q.all()
  const cache = {}
  for (const t of results) {
    const b = (cache[t.booking_id] ||= await env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(t.booking_id).first())
    if (!b) continue
    try {
      await runTask(env, t.task, b)
      await env.DB.prepare('UPDATE outbox SET done = 1, attempts = attempts + 1, last_error = NULL WHERE id = ?').bind(t.id).run()
    } catch (e) {
      console.error('outbox', t.task, b.id, e.message)
      await env.DB.prepare('UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?').bind(e.message.slice(0, 500), t.id).run()
    }
  }
}

/* ---------- Reconciliación con Google Calendar ---------- */
export async function reconcile(env) {
  const now = localNow()
  const { results: open } = await env.DB.prepare("SELECT * FROM bookings WHERE status = 'confirmada' AND event_id IS NOT NULL AND date >= ?").bind(now.date).all()
  if (!open.length) return
  const events = await listEvents(env, toISO(addDays(now.date, -1), 0), toISO(addDays(now.date, MAX_DAYS_AHEAD + 2), 0))
  const byId = Object.fromEntries(events.map((e) => [e.id, e]))
  for (const b of open) {
    const ev = byId[b.event_id]
    let status = null
    if (!ev || ev.status === 'cancelled') status = 'cancelada'
    else {
      const start = new Date(ev.start?.dateTime || ev.start?.date).getTime() - 6 * 3600e3
      const d = new Date(start).toISOString()
      if (d.slice(0, 10) !== b.date || d.slice(11, 16) !== b.time) status = 'reprogramada'
    }
    if (!status) continue
    // Los bloques de D1 se liberan: desde aquí manda Google Calendar (freeBusy).
    await env.DB.batch([
      env.DB.prepare('UPDATE bookings SET status = ? WHERE id = ?').bind(status, b.id),
      env.DB.prepare('DELETE FROM booking_blocks WHERE booking_id = ?').bind(b.id),
    ])
    const rows = JSON.parse(b.sheet_rows || '{}')
    for (const owner of sheetOwners(env)) {
      if (rows[owner.key]) await setSheetStatus(env, owner, b, rows[owner.key], status).catch((e) => console.warn('status', e.message))
    }
  }
}

/* ---------- Cierre mensual y purga ---------- */
export async function monthlyClose(env) {
  const now = localNow()
  const prev = addDays(now.date.slice(0, 7) + '-01', -1).slice(0, 7)
  const done = await env.DB.prepare('SELECT v FROM kv WHERE k = ?').bind('closed:' + prev).first()
  if (done) return
  const owner = sheetOwners(env)[0]
  const sheet = await env.DB.prepare('SELECT spreadsheet_id FROM sheets WHERE month = ? AND owner = ?').bind(prev, owner.key).first()
  if (!sheet) {
    // Mes sin reservas web: se avisa sin crear un Sheet vacío.
    await sendMail(env, REM_EMAIL, `Respaldo Dental Gert · Citas · ${monthLabel(prev)}`, `<p style="font-family:Arial,sans-serif">No hubo citas agendadas desde la web para <b>${monthLabel(prev)}</b>.</p>`)
    await env.DB.prepare('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)').bind('closed:' + prev, new Date().toISOString()).run()
    return
  }
  const id = sheet.spreadsheet_id
  const { count } = await env.DB.prepare("SELECT count(*) AS count FROM bookings WHERE substr(date, 1, 7) = ? AND status = 'confirmada'").bind(prev).first()
  const url = `https://docs.google.com/spreadsheets/d/${id}/edit`
  const xlsx = `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`
  await sendMail(env, REM_EMAIL, `Respaldo Dental Gert · Citas · ${monthLabel(prev)}`,
    `<div style="font-family:Arial,sans-serif"><p>Respaldo mensual de citas de Dental Gert: <b>${monthLabel(prev)}</b> (${count} citas confirmadas).</p><p><a href="${url}">Abrir Google Sheet</a> · <a href="${xlsx}">Descargar .xlsx</a></p><p style="color:#5a6b85;font-size:12px">El archivo está compartido con remagencysv@gmail.com como editor y aparece en "Compartidos conmigo" de Google Drive.</p></div>`)
  // Si la conexión de Drive de REM existe, deja además una copia propia en su Drive.
  if (env.CA_DRIVE_REM) {
    try {
      await execTool(env, 'GOOGLEDRIVE_COPY_FILE', env.CA_DRIVE_REM, { file_id: id, new_title: `Respaldo · Dental Gert · Citas · ${monthLabel(prev)}` })
    } catch (e) { console.warn('copy rem', e.message) }
  }
  await env.DB.prepare('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)').bind('closed:' + prev, new Date().toISOString()).run()
}

export async function purgePII(env) {
  const cutoff = addDays(localNow().date, -PII_RETENTION_DAYS)
  await env.DB.prepare(`UPDATE bookings SET nombres = '', apellidos = '', telefono = '', dui = '', pasaporte = '', correo = '', motivo = '', pii_purged = 1
    WHERE date < ? AND pii_purged = 0`).bind(cutoff).run()
  await env.DB.prepare('DELETE FROM booking_blocks WHERE date < ?').bind(cutoff).run()
}
