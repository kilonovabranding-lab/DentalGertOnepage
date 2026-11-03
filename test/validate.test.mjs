import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validDUI, validBirthDate, validateBooking } from '../lib/validate.js'
import { fmtBirth } from '../lib/google.js'

const dv = (digits) => (10 - ([...digits].reduce((a, d, i) => a + Number(d) * (9 - i), 0) % 10)) % 10
const goodDUI = `12345678-${dv('12345678')}`
const base = { service: 'limpieza', date: '2026-11-02', time: '08:00', nombres: 'Ana', apellidos: 'López', genero: 'femenino', fecha_nacimiento: '1990-04-15', consentimiento: true }

test('DUI con dígito verificador', () => {
  assert.ok(validDUI(goodDUI))
  assert.ok(validDUI(goodDUI.replace('-', '')))
  assert.ok(!validDUI(`12345678-${(dv('12345678') + 1) % 10}`))
  assert.ok(!validDUI('1234'))
})

test('nacional válido normaliza teléfono', () => {
  const r = validateBooking({ ...base, telefono: '7739-0440', dui: goodDUI })
  assert.ok(r.ok)
  assert.equal(r.data.telefono, '+50377390440')
  assert.equal(r.data.residencia, 'nacional')
})

test('nacional sin DUI falla', () => assert.equal(validateBooking({ ...base, telefono: '77390440' }).errors.dui, 'invalid'))

test('teléfono SV inválido', () => assert.equal(validateBooking({ ...base, telefono: '57390440', dui: goodDUI }).errors.telefono, 'invalid'))

test('extranjero con pasaporte, sin DUI', () => {
  const r = validateBooking({ ...base, residencia: 'extranjero', telefono: '+1 555 123 4567', pasaporte: 'x1234567', pais: 'US' })
  assert.ok(r.ok)
  assert.equal(r.data.pasaporte, 'X1234567')
  assert.equal(r.data.dui, '')
})

test('extranjero sin pasaporte falla', () => {
  assert.equal(validateBooking({ ...base, residencia: 'extranjero', telefono: '+15551234567', pais: 'US' }).errors.pasaporte, 'invalid')
})

test('género y fecha de nacimiento llegan a data', () => {
  const r = validateBooking({ ...base, telefono: '77390440', dui: goodDUI })
  assert.ok(r.ok)
  assert.equal(r.data.genero, 'femenino')
  assert.equal(r.data.fecha_nacimiento, '1990-04-15')
})

test('género obligatorio y solo masculino/femenino', () => {
  assert.equal(validateBooking({ ...base, genero: '', telefono: '77390440', dui: goodDUI }).errors.genero, 'required')
  assert.equal(validateBooking({ ...base, genero: 'otro', telefono: '77390440', dui: goodDUI }).errors.genero, 'required')
  assert.ok(validateBooking({ ...base, genero: 'masculino', telefono: '77390440', dui: goodDUI }).ok)
})

test('fecha de nacimiento: real, no futura, máximo 110 años', () => {
  const today = '2026-11-02'
  assert.ok(validBirthDate('2000-02-29', today)) // bisiesto
  assert.ok(validBirthDate('2026-11-02', today)) // nacido hoy
  assert.ok(!validBirthDate('2001-02-29', today))
  assert.ok(!validBirthDate('2001-02-30', today))
  assert.ok(!validBirthDate('1990-13-01', today))
  assert.ok(!validBirthDate('2026-11-03', today))
  assert.ok(!validBirthDate('1915-06-01', today))
  assert.ok(validBirthDate('1916-01-01', today))
  assert.ok(!validBirthDate('15/04/1990', today))
  assert.ok(!validBirthDate('', today))
  assert.equal(validateBooking({ ...base, fecha_nacimiento: '', telefono: '77390440', dui: goodDUI }).errors.fecha_nacimiento, 'invalid')
})

test('fecha de nacimiento con edad al día de la cita', () => {
  assert.equal(fmtBirth('1990-04-15', '2026-11-02'), '15/04/1990 (36 años)')
  assert.equal(fmtBirth('1990-11-03', '2026-11-02'), '03/11/1990 (35 años)')
  assert.equal(fmtBirth('2025-11-02', '2026-11-02'), '02/11/2025 (1 año)')
  assert.equal(fmtBirth('', '2026-11-02'), '')
})

test('implantes dura 90 min', async () => {
  const { SERVICES } = await import('../lib/config.js')
  assert.equal(SERVICES.implantes.min, 90)
  assert.ok(validateBooking({ ...base, service: 'implantes', telefono: '77390440', dui: goodDUI }).ok)
})

test('motivo > 100, correo inválido y sin consentimiento', () => {
  const r = validateBooking({ ...base, telefono: '77390440', dui: goodDUI, motivo: 'x'.repeat(101), correo: 'no-es-correo', consentimiento: false })
  assert.equal(r.errors.motivo, 'too_long')
  assert.equal(r.errors.correo, 'invalid')
  assert.equal(r.errors.consentimiento, 'required')
})
