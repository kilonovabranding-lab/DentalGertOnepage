import { test } from 'node:test'
import assert from 'node:assert/strict'
import { daySlots, monthSlots, busyByDate, blocksFor, localNow } from '../lib/slots.js'

const now = { date: '2026-11-01', min: 9 * 60 } // domingo 1 nov 2026, 9:00

test('domingo cerrado', () => assert.deepEqual(daySlots('2026-11-01', 25, [], now), []))

test('martes: primer y último slot de 25 min', () => {
  const s = daySlots('2026-11-03', 25, [], now)
  assert.equal(s[0], '08:00')
  assert.ok(s.includes('11:30') && !s.includes('11:45'))
  assert.ok(!s.includes('12:00') && !s.includes('13:15') && s.includes('13:30'))
  assert.ok(s.includes('16:00') && !s.includes('16:15'))
})

test('cordales 75 min no cruza el almuerzo ni el cierre', () => {
  const s = daySlots('2026-11-03', 75, [], now)
  assert.ok(s.includes('10:45') && !s.includes('11:00'))
  assert.ok(s.includes('15:15') && !s.includes('15:30'))
})

test('sábado cierra a la 1:00 pm', () => assert.equal(daySlots('2026-11-07', 60, [], now).at(-1), '12:00'))

test('regla de 2 h el mismo día', () => {
  assert.equal(daySlots('2026-11-03', 25, [], { date: '2026-11-03', min: 9 * 60 + 10 })[0], '11:15')
})

test('límite de 60 días', () => {
  assert.ok(daySlots('2026-12-31', 25, [], now).length > 0)
  assert.deepEqual(daySlots('2027-01-01', 25, [], now), [])
})

test('días pasados vacíos', () => assert.deepEqual(daySlots('2026-10-30', 25, [], now), []))

test('evento ocupado bloquea solapes', () => {
  const s = daySlots('2026-11-03', 40, [[9 * 60, 10 * 60]], now)
  assert.ok(s.includes('08:15') && !s.includes('08:30') && !s.includes('09:45') && s.includes('10:00'))
})

test('busyByDate convierte UTC a hora de El Salvador', () => {
  assert.deepEqual(busyByDate([{ start: '2026-11-02T15:00:00Z', end: '2026-11-02T16:00:00Z' }])['2026-11-02'], [[540, 600]])
})

test('busyByDate parte eventos de varios días', () => {
  const m = busyByDate([{ start: '2026-11-02T06:00:00Z', end: '2026-11-04T06:00:00Z' }])
  assert.deepEqual(m['2026-11-02'], [[0, 1440]])
  assert.deepEqual(m['2026-11-03'], [[0, 1440]])
})

test('localNow usa UTC-6', () => assert.deepEqual(localNow(new Date('2026-11-02T05:30:00Z')), { date: '2026-11-01', min: 23 * 60 + 30 }))

test('monthSlots cubre todo el mes', () => assert.equal(Object.keys(monthSlots('2026-11', 25, {}, now)).length, 30))

test('blocksFor', () => assert.deepEqual(blocksFor(480, 25), [480, 485, 490, 495, 500]))

test('feriado oficial cerrado (2 de noviembre)', () => assert.deepEqual(daySlots('2026-11-02', 25, [], now), []))
