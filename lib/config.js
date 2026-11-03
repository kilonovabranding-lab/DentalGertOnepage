// Reglas de negocio de Dental Gert. Fuente única para el servidor (el front recibe lo que necesita vía API y content.mjs).
export const TZ = 'America/El_Salvador'
export const TZ_OFFSET = '-06:00' // El Salvador no usa horario de verano
export const STEP_MIN = 15 // inicios cada 15 min
export const BLOCK_MIN = 5 // granularidad de bloqueo en D1
export const BUFFER_MIN = 0
export const MIN_NOTICE_MIN = 120
export const MAX_DAYS_AHEAD = 60

export const SERVICES = {
  diagnostico: { min: 25, es: 'Diagnóstico', en: 'Diagnosis' },
  limpieza: { min: 25, es: 'Limpieza dental', en: 'Dental cleaning' },
  relleno: { min: 40, es: 'Relleno dental', en: 'Dental filling' },
  endodoncia: { min: 60, es: 'Endodoncia', en: 'Root canal' },
  extraccion: { min: 30, es: 'Extracción dental', en: 'Tooth extraction' },
  cordales: { min: 75, es: 'Cirugía de cordales', en: 'Wisdom tooth surgery' },
  implantes: { min: 90, es: 'Implantes dentales', en: 'Dental implants' },
  blanqueamiento: { min: 75, es: 'Blanqueamiento dental', en: 'Teeth whitening' },
}

// Ventanas laborales por día de la semana (0 = domingo), en minutos desde medianoche.
const h = (s) => { const [a, b] = s.split(':').map(Number); return a * 60 + b }
export const HOURS = {
  0: [],
  1: [[h('08:00'), h('12:00')], [h('13:30'), h('16:30')]],
  2: [[h('08:00'), h('12:00')], [h('13:30'), h('16:30')]],
  3: [[h('08:00'), h('12:00')], [h('13:30'), h('16:30')]],
  4: [[h('08:00'), h('12:00')], [h('13:30'), h('16:30')]],
  5: [[h('08:00'), h('12:00')], [h('13:30'), h('16:30')]],
  6: [[h('08:00'), h('13:00')]],
}

// Feriados oficiales de El Salvador (Código de Trabajo, San Salvador). Revisar y agregar el año siguiente cada diciembre.
// Cierres particulares (vacaciones, mantenimiento, capacitaciones): la clínica crea un evento de día completo
// marcado como "Ocupado" en su Google Calendar y la web bloquea ese día sola.
export const CLOSED_DATES = [
  // 2026
  '2026-11-02', // Día de los Difuntos
  '2026-12-25', // Navidad
  // 2027 (Pascua: 28 de marzo)
  '2027-01-01', // Año Nuevo
  '2027-03-25', '2027-03-26', '2027-03-27', // Jueves, Viernes y Sábado Santo
  '2027-05-01', // Día del Trabajo
  '2027-05-10', // Día de la Madre
  '2027-06-17', // Día del Padre
  '2027-08-03', '2027-08-04', '2027-08-05', '2027-08-06', // Fiestas agostinas (San Salvador)
  '2027-09-15', // Independencia
  '2027-11-02', // Día de los Difuntos
  '2027-12-25', // Navidad
]

export const PII_RETENTION_DAYS = 30
export const MAX_AGE_YEARS = 110 // fecha de nacimiento: rango aceptado en el formulario
