// Operaciones de Google (Calendar, Sheets, Drive, Gmail) a través de Composio.
import { execTool } from './composio.js'
import { SERVICES, TZ, TZ_OFFSET } from './config.js'
import { fmtTime, parseTime } from './slots.js'

const CLINIC_EMAIL = 'dentalgert@gmail.com'
const REM_EMAIL = 'remagencysv@gmail.com'
const WA = '50377390440'
const MONTHS = { es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] }

export const monthLabel = (month) => `${MONTHS.es[Number(month.slice(5)) - 1]} ${month.slice(0, 4)}`
export const endTime = (b) => fmtTime(parseTime(b.time) + b.duration)
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const GENERO = { masculino: 'Masculino', femenino: 'Femenino' }
export const generoLabel = (g) => GENERO[g] || ''
// '1990-04-15' → '15/04/1990 (36 años)', edad calculada al día de la cita.
export function fmtBirth(iso, on) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  const ref = on || new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10)
  const age = Number(ref.slice(0, 4)) - Number(m[1]) - (ref.slice(5) < `${m[2]}-${m[3]}` ? 1 : 0)
  return `${m[3]}/${m[2]}/${m[1]} (${age} ${age === 1 ? 'año' : 'años'})`
}

// Cuentas de Sheets/Drive donde se guarda el registro. REM es opcional: se usa solo si sus conexiones están configuradas.
export function sheetOwners(env) {
  const owners = [{ key: 'dental', sheets: env.CA_SHEETS_DENTAL, drive: env.CA_DRIVE_DENTAL, shareWith: REM_EMAIL }]
  if (env.CA_SHEETS_REM && env.CA_DRIVE_REM) owners.push({ key: 'rem', sheets: env.CA_SHEETS_REM, drive: env.CA_DRIVE_REM })
  return owners
}

/* ---------- Calendar ---------- */
export async function freeBusy(env, fromISO, toISO) {
  const d = await execTool(env, 'GOOGLECALENDAR_FREE_BUSY_QUERY', env.CA_CALENDAR_DENTAL, {
    timeMin: fromISO, timeMax: toISO, items: [{ id: env.CALENDAR_ID || 'primary' }],
  })
  const cals = d.calendars || {}
  return Object.values(cals).flatMap((c) => c.busy || [])
}

export async function createEvent(env, b) {
  const svc = SERVICES[b.service]
  const doc = b.residencia === 'extranjero' ? `Pasaporte ${b.pasaporte} (${b.pais})` : `DUI ${b.dui}`
  const ev = await execTool(env, 'GOOGLECALENDAR_CREATE_EVENT', env.CA_CALENDAR_DENTAL, {
    calendar_id: env.CALENDAR_ID || 'primary',
    summary: `${svc.es}: ${b.nombres} ${b.apellidos}`,
    description: [`Paciente: ${b.nombres} ${b.apellidos}`, b.genero && `Género: ${generoLabel(b.genero)}`, b.fecha_nacimiento && `Fecha de nacimiento: ${fmtBirth(b.fecha_nacimiento, b.date)}`, `Teléfono: ${b.telefono}`, doc, b.correo && `Correo: ${b.correo}`, b.motivo && `Motivo: ${b.motivo}`, `Reserva web: ${b.id}`].filter(Boolean).join('\n'),
    location: 'Dental Gert, Colonia Médica, San Salvador',
    start_datetime: `${b.date}T${b.time}:00`,
    timezone: TZ,
    event_duration_hour: Math.floor(b.duration / 60),
    event_duration_minutes: b.duration % 60,
    attendees: b.correo ? [b.correo] : [],
    send_updates: true,
    transparency: 'opaque',
    exclude_organizer: false,
  })
  return ev.id || ev.event?.id || ev.response_data?.id
}

export async function listEvents(env, fromISO, toISO) {
  const items = []
  let pageToken
  do {
    const d = await execTool(env, 'GOOGLECALENDAR_EVENTS_LIST', env.CA_CALENDAR_DENTAL, {
      calendarId: env.CALENDAR_ID || 'primary', timeMin: fromISO, timeMax: toISO, showDeleted: true, singleEvents: true, maxResults: 250, pageToken,
    })
    items.push(...(d.items || []))
    pageToken = d.nextPageToken
  } while (pageToken)
  return items
}

/* ---------- Sheets ---------- */
export const SHEET_HEADER = ['Registro', 'ID', 'Fecha cita', 'Inicio', 'Fin', 'Servicio', 'Duración (min)', 'Nombres', 'Apellidos', 'Teléfono', 'Residencia', 'DUI', 'Pasaporte', 'País', 'Correo', 'Motivo', 'Idioma', 'Estado', 'ID evento', 'Género', 'Fecha de nacimiento']
export const STATUS_COL = 'R' // las columnas nuevas van al final para no mover Estado en los Sheets ya creados

export function sheetRow(b) {
  return [b.created_at, b.id, b.date, b.time, endTime(b), SERVICES[b.service].es, b.duration, b.nombres, b.apellidos, b.telefono,
    b.residencia === 'extranjero' ? 'Extranjero' : 'Nacional/Residente', b.dui, b.pasaporte, b.pais, b.correo, b.motivo, b.lang, b.status, b.event_id || '', generoLabel(b.genero), fmtBirth(b.fecha_nacimiento, b.date)]
}

async function ensureFolder(env, owner) {
  const k = `folder:${owner.key}`
  const hit = await env.DB.prepare('SELECT v FROM kv WHERE k = ?').bind(k).first()
  if (hit) return hit.v
  const f = await execTool(env, 'GOOGLEDRIVE_CREATE_FOLDER', owner.drive, { folder_name: 'Dental Gert · Citas' })
  const id = f.id || f.folder?.id
  await env.DB.prepare('INSERT OR REPLACE INTO kv (k, v) VALUES (?, ?)').bind(k, id).run()
  return id
}

// Devuelve { id, tab } del Sheet del mes para un dueño; lo crea, lo mueve a la carpeta y lo comparte si no existe.
export async function ensureMonthSheet(env, owner, month) {
  const hit = await env.DB.prepare('SELECT spreadsheet_id, tab FROM sheets WHERE month = ? AND owner = ?').bind(month, owner.key).first()
  if (hit) return { id: hit.spreadsheet_id, tab: hit.tab }
  const s = await execTool(env, 'GOOGLESHEETS_CREATE_GOOGLE_SHEET1', owner.sheets, { title: `Dental Gert · Citas · ${monthLabel(month)}` })
  const id = s.spreadsheet_id || s.spreadsheetId
  const tab = s.sheets?.[0]?.properties?.title || 'Hoja 1'
  await execTool(env, 'GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND', owner.sheets, { spreadsheetId: id, range: `'${tab}'!A1`, valueInputOption: 'RAW', values: [SHEET_HEADER] })
  try {
    const folder = await ensureFolder(env, owner)
    await execTool(env, 'GOOGLEDRIVE_MOVE_FILE', owner.drive, { file_id: id, add_parents: folder, remove_parents: 'root' })
  } catch (e) { console.warn('move sheet', e.message) }
  if (owner.shareWith) {
    try { await execTool(env, 'GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE', owner.drive, { file_id: id, role: 'writer', type: 'user', email_address: owner.shareWith }) } catch (e) { console.warn('share sheet', e.message) }
  }
  await env.DB.prepare('INSERT OR IGNORE INTO sheets (month, owner, spreadsheet_id, tab) VALUES (?, ?, ?, ?)').bind(month, owner.key, id, tab).run()
  return { id, tab }
}

export async function appendBooking(env, owner, b) {
  const { id, tab } = await ensureMonthSheet(env, owner, b.date.slice(0, 7))
  const r = await execTool(env, 'GOOGLESHEETS_SPREADSHEETS_VALUES_APPEND', owner.sheets, {
    spreadsheetId: id, range: `'${tab}'!A1`, valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', values: [sheetRow(b)],
  })
  const m = /![A-Z]+(\d+)/.exec(r.updates?.updatedRange || '')
  return m ? Number(m[1]) : null
}

export async function setSheetStatus(env, owner, b, row, status) {
  const { id, tab } = await ensureMonthSheet(env, owner, b.date.slice(0, 7))
  await execTool(env, 'GOOGLESHEETS_BATCH_UPDATE', owner.sheets, { spreadsheet_id: id, sheet_name: tab, first_cell_location: `${STATUS_COL}${row}`, values: [[status]], valueInputOption: 'RAW' })
}

/* ---------- Gmail ---------- */
export const sendMail = (env, to, subject, html) =>
  execTool(env, 'GMAIL_SEND_EMAIL', env.CA_GMAIL_DENTAL, { user_id: 'me', recipient_email: to, subject, body: html, is_html: true })

const wrap = (inner) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0A1424"><div style="border-top:4px solid #2974DE;padding:24px">${inner}</div><p style="font-size:12px;color:#5a6b85;padding:0 24px">Dental Gert · Colonia Médica, San Salvador · +503 7739 0440</p></div>`
const row = (k, v) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#5a6b85">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>` : '')

export function clinicEmail(b) {
  const svc = SERVICES[b.service].es
  const phone = b.telefono.replace(/\D/g, '')
  return {
    subject: `Nueva cita: ${svc} · ${b.date} ${b.time} · ${b.nombres} ${b.apellidos}`,
    html: wrap(`<h2 style="margin:0 0 12px">Nueva cita agendada desde la web</h2><table>${row('Servicio', svc)}${row('Fecha', b.date)}${row('Hora', `${b.time} – ${endTime(b)}`)}${row('Paciente', `${b.nombres} ${b.apellidos}`)}${row('Género', generoLabel(b.genero))}${row('Fecha de nacimiento', fmtBirth(b.fecha_nacimiento, b.date))}${row('Teléfono', b.telefono)}${row('Residencia', b.residencia === 'extranjero' ? `Extranjero (${b.pais})` : 'Nacional/Residente')}${row('DUI', b.dui)}${row('Pasaporte', b.pasaporte)}${row('Correo', b.correo)}${row('Motivo', b.motivo)}${row('ID', b.id)}</table>
<p style="margin-top:20px"><a href="https://wa.me/${phone}" style="background:#2974DE;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none">Escribir por WhatsApp</a> &nbsp; <a href="tel:${b.telefono}">Llamar</a></p>`),
  }
}

export function patientEmail(b) {
  const en = b.lang === 'en'
  const svc = SERVICES[b.service][en ? 'en' : 'es']
  const wa = `https://wa.me/${WA}?text=${encodeURIComponent(en ? 'Hello Dental Gert, I would like to change my appointment' : 'Hola Dental Gert, quisiera cambiar mi cita')}`
  return {
    subject: en ? `Your appointment at Dental Gert is confirmed · ${b.date} ${b.time}` : `Tu cita en Dental Gert está confirmada · ${b.date} ${b.time}`,
    html: wrap(`<h2 style="margin:0 0 12px">${en ? `${esc(b.nombres)}, your appointment is confirmed` : `${esc(b.nombres)}, tu cita está confirmada`}</h2><table>${row(en ? 'Service' : 'Servicio', svc)}${row(en ? 'Date' : 'Fecha', b.date)}${row(en ? 'Time' : 'Hora', `${b.time} – ${endTime(b)}`)}${row(en ? 'Address' : 'Dirección', 'Colonia Médica, San Salvador')}</table>
<p>${en ? 'You will also receive a Google Calendar invitation.' : 'También recibirás una invitación de Google Calendar.'}</p>
<p><a href="https://maps.app.goo.gl/cWwQeTvxu6N4whk6A">${en ? 'How to get there' : 'Cómo llegar'}</a> · <a href="${wa}">${en ? 'Change or cancel via WhatsApp' : 'Cambiar o cancelar por WhatsApp'}</a></p>`),
  }
}

export { CLINIC_EMAIL, REM_EMAIL, TZ_OFFSET }
