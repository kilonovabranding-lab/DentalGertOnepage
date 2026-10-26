// Solo lectura: lista las conexiones de Composio del usuario y muestra a qué correo pertenece cada una.
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split(/=(.*)/s).slice(0, 2)))
const KEY = env.COMPOSIO_API_KEY
const USER = process.argv[2] || 'pg-test-8dbf7e88-4793-4c73-80f7-ba474b8ff67d'
const api = async (path, body) => {
  const r = await fetch('https://backend.composio.dev/api/v3' + path, { method: body ? 'POST' : 'GET', headers: { 'x-api-key': KEY, 'content-type': 'application/json' }, body: body && JSON.stringify(body) })
  return r.json()
}
const exec = (slug, ca, args = {}) => api('/tools/execute/' + slug, { user_id: USER, connected_account_id: ca, arguments: args })
const list = await api('/connected_accounts?user_ids=' + USER + '&limit=50')
for (const a of list.items || []) {
  const tk = a.toolkit?.slug
  let who = '?'
  try {
    if (tk === 'gmail') who = (await exec('GMAIL_GET_PROFILE', a.id, { user_id: 'me' })).data?.response_data?.emailAddress ?? JSON.stringify((await exec('GMAIL_GET_PROFILE', a.id, { user_id: 'me' })).data).slice(0, 200)
    if (tk === 'googlecalendar') who = JSON.stringify((await exec('GOOGLECALENDAR_GET_CALENDAR', a.id, { calendar_id: 'primary' })).data).slice(0, 200)
    if (tk === 'googledrive') who = JSON.stringify((await exec('GOOGLEDRIVE_GET_ABOUT', a.id, { fields: 'user' })).data).slice(0, 200)
  } catch (e) { who = 'error ' + e.message }
  console.log(a.id, tk, a.status, who)
}
if (!list.items) console.log(JSON.stringify(list).slice(0, 500))
