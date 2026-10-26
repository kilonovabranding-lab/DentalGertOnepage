// GET /api/availability?service=limpieza&month=2026-11 → { days: { 'YYYY-MM-DD': ['08:00', ...] } }
import { availability } from '../../lib/bookings.js'

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url)
  const days = await availability(env, u.searchParams.get('service'), u.searchParams.get('month'))
  if (!days) return Response.json({ error: 'bad_request' }, { status: 400 })
  return Response.json({ days })
}
