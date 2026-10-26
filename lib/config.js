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

// Días cerrados extra (YYYY-MM-DD). La clínica también puede bloquear días con eventos "ocupado" en su Calendar.
export const CLOSED_DATES = [] // TODO: confirmar feriados con Dental Gert

export const PII_RETENTION_DAYS = 30
