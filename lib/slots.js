// Motor de disponibilidad puro: sin I/O, todo en minutos y fechas locales de El Salvador.
import { HOURS, CLOSED_DATES, STEP_MIN, BUFFER_MIN, MIN_NOTICE_MIN, MAX_DAYS_AHEAD, TZ_OFFSET } from './config.js'

const pad = (n) => String(n).padStart(2, '0')
export const fmtTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`
export const parseTime = (s) => { const [a, b] = s.split(':').map(Number); return a * 60 + b }

// "Ahora" en El Salvador → { date: 'YYYY-MM-DD', min }
export function localNow(now = new Date()) {
  const t = new Date(now.getTime() - 6 * 3600e3)
  return { date: t.toISOString().slice(0, 10), min: t.getUTCHours() * 60 + t.getUTCMinutes() }
}
export const addDays = (date, n) => { const d = new Date(date + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
export const weekday = (date) => new Date(date + 'T00:00:00Z').getUTCDay()
export const toISO = (date, min) => `${date}T${fmtTime(min)}:00${TZ_OFFSET}`

// Convierte intervalos ocupados ISO (cualquier zona) a { 'YYYY-MM-DD': [[ini, fin], ...] } en minutos locales.
export function busyByDate(intervals) {
  const out = {}
  for (const { start, end } of intervals) {
    let s = new Date(start).getTime() - 6 * 3600e3
    const e = new Date(end).getTime() - 6 * 3600e3
    while (s < e) {
      const d = new Date(s).toISOString().slice(0, 10)
      const dayEnd = Date.parse(d + 'T00:00:00Z') + 86400e3
      const segEnd = Math.min(e, dayEnd)
      const a = (s - Date.parse(d + 'T00:00:00Z')) / 60e3
      ;(out[d] ||= []).push([a, (segEnd - Date.parse(d + 'T00:00:00Z')) / 60e3])
      s = segEnd
    }
  }
  return out
}

// Horarios libres de un día para una duración dada.
export function daySlots(date, duration, busy = [], now = localNow()) {
  if (CLOSED_DATES.includes(date)) return []
  if (date < now.date || date > addDays(now.date, MAX_DAYS_AHEAD)) return []
  const out = []
  for (const [open, close] of HOURS[weekday(date)]) {
    for (let s = open; s + duration <= close; s += STEP_MIN) {
      if (date === now.date && s < now.min + MIN_NOTICE_MIN) continue
      const e = s + duration + BUFFER_MIN
      if (busy.some(([a, b]) => s < b && a < e)) continue
      out.push(fmtTime(s))
    }
  }
  return out
}

// Disponibilidad de un mes 'YYYY-MM' → { 'YYYY-MM-DD': ['08:00', ...] }
export function monthSlots(month, duration, busyMap = {}, now = localNow()) {
  const days = {}
  for (let d = month + '-01'; d.startsWith(month); d = addDays(d, 1)) days[d] = daySlots(d, duration, busyMap[d] || [], now)
  return days
}

// Bloques de 5 min que ocupa una cita (para la restricción UNIQUE en D1).
export function blocksFor(startMin, duration, block = 5) {
  const out = []
  for (let m = startMin; m < startMin + duration + BUFFER_MIN; m += block) out.push(m)
  return out
}
