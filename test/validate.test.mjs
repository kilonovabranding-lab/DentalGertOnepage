import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validDUI, validateBooking } from '../lib/validate.js'

const dv = (digits) => (10 - ([...digits].reduce((a, d, i) => a + Number(d) * (9 - i), 0) % 10)) % 10
const goodDUI = `12345678-${dv('12345678')}`
const base = { service: 'limpieza', date: '2026-11-02', time: '08:00', nombres: 'Ana', apellidos: 'López', consentimiento: true }

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

test('motivo > 100, correo inválido y sin consentimiento', () => {
  const r = validateBooking({ ...base, telefono: '77390440', dui: goodDUI, motivo: 'x'.repeat(101), correo: 'no-es-correo', consentimiento: false })
  assert.equal(r.errors.motivo, 'too_long')
  assert.equal(r.errors.correo, 'invalid')
  assert.equal(r.errors.consentimiento, 'required')
})
