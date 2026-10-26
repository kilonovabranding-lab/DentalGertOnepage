// POST /api/bookings → 201 { booking } | 400 { errors } | 409 { slots } | 403 turnstile
import { validateBooking } from '../../lib/validate.js'
import { createBooking, processOutbox } from '../../lib/bookings.js'
import { endTime } from '../../lib/google.js'

async function turnstileOk(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token || '', remoteip: ip || '' }),
  })
  return (await r.json()).success === true
}

export async function onRequestPost({ request, env, waitUntil }) {
  const body = await request.json().catch(() => null)
  if (!body) return Response.json({ error: 'bad_request' }, { status: 400 })
  if (!(await turnstileOk(env, body.turnstile, request.headers.get('cf-connecting-ip')))) return Response.json({ error: 'captcha' }, { status: 403 })
  const v = validateBooking(body)
  if (!v.ok) return Response.json({ errors: v.errors }, { status: 400 })
  const r = await createBooking(env, v.data)
  if (r.conflict) return Response.json({ error: 'slot_taken', slots: r.slots }, { status: 409 })
  waitUntil(processOutbox(env, r.booking.id))
  const b = r.booking
  return Response.json({ booking: { id: b.id, service: b.service, date: b.date, time: b.time, end: endTime(b), nombres: b.nombres, correo: !!b.correo } }, { status: 201 })
}
