// Validación del POST de reservas. Devuelve { ok, data } o { ok: false, errors: { campo: código } }.
import { SERVICES, MAX_AGE_YEARS } from './config.js'

// DUI salvadoreño: 8 dígitos + verificador. Suma ponderada 9..2; verificador = (10 - suma % 10) % 10.
export function validDUI(v) {
  const m = /^(\d{8})-?(\d)$/.exec(String(v || '').trim())
  if (!m) return false
  const sum = [...m[1]].reduce((a, d, i) => a + Number(d) * (9 - i), 0)
  return (10 - (sum % 10)) % 10 === Number(m[2])
}
export const validSVPhone = (v) => /^[267]\d{7}$/.test(String(v || '').replace(/\D/g, '').replace(/^503(?=\d{8}$)/, ''))
export const validIntlPhone = (v) => /^\+[1-9]\d{6,14}$/.test(String(v || '').replace(/[\s()-]/g, ''))
export const validPassport = (v) => /^[A-Za-z0-9]{5,20}$/.test(String(v || '').trim())
export const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())
export const GENEROS = ['masculino', 'femenino']
// Fecha de nacimiento YYYY-MM-DD: debe existir (sin 30 de febrero), no ser futura (hora de El Salvador) y no superar MAX_AGE_YEARS.
export function validBirthDate(v, today = new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10)) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ''))
  if (!m) return false
  const [y, mo, d] = m.slice(1).map(Number)
  const dt = new Date(Date.UTC(y, mo - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return false
  return v <= today && y >= Number(today.slice(0, 4)) - MAX_AGE_YEARS
}
const clean = (v) => String(v || '').trim().replace(/\s+/g, ' ')

export function validateBooking(b = {}) {
  const errors = {}
  const service = String(b.service || '')
  if (!SERVICES[service]) errors.service = 'required'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date || '')) errors.date = 'required'
  if (!/^\d{2}:\d{2}$/.test(b.time || '')) errors.time = 'required'
  const nombres = clean(b.nombres)
  const apellidos = clean(b.apellidos)
  if (nombres.length < 2 || nombres.length > 60) errors.nombres = 'invalid'
  if (apellidos.length < 2 || apellidos.length > 60) errors.apellidos = 'invalid'
  const genero = String(b.genero || '')
  if (!GENEROS.includes(genero)) errors.genero = 'required'
  const fecha_nacimiento = String(b.fecha_nacimiento || '')
  if (!validBirthDate(fecha_nacimiento)) errors.fecha_nacimiento = 'invalid'
  const foreign = b.residencia === 'extranjero'
  let telefono = String(b.telefono || '').replace(/[\s()-]/g, '')
  if (foreign) {
    if (!validIntlPhone(telefono)) errors.telefono = 'invalid'
    if (!validPassport(b.pasaporte)) errors.pasaporte = 'invalid'
    if (!/^[A-Z]{2}$/.test(b.pais || '')) errors.pais = 'required'
  } else {
    if (!validSVPhone(telefono)) errors.telefono = 'invalid'
    else telefono = '+503' + telefono.replace(/\D/g, '').slice(-8)
    if (!validDUI(b.dui)) errors.dui = 'invalid'
  }
  const correo = String(b.correo || '').trim().toLowerCase()
  if (correo && !validEmail(correo)) errors.correo = 'invalid'
  const motivo = String(b.motivo || '').trim()
  if (motivo.length > 100) errors.motivo = 'too_long'
  if (b.consentimiento !== true && b.consentimiento !== 'on') errors.consentimiento = 'required'
  if (Object.keys(errors).length) return { ok: false, errors }
  return {
    ok: true,
    data: {
      service, date: b.date, time: b.time, nombres, apellidos, genero, fecha_nacimiento, telefono, correo, motivo,
      residencia: foreign ? 'extranjero' : 'nacional',
      dui: foreign ? '' : String(b.dui).trim().replace(/^(\d{8})-?(\d)$/, '$1-$2'),
      pasaporte: foreign ? String(b.pasaporte).trim().toUpperCase() : '',
      pais: foreign ? b.pais : 'SV',
      lang: b.lang === 'en' ? 'en' : 'es',
    },
  }
}
