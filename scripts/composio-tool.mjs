// Utilidad local: node scripts/composio-tool.mjs schema SLUG | exec SLUG CA '{json}'
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split(/=(.*)/s).slice(0, 2)))
const [, , mode, slug, ca, args] = process.argv
const h = { 'x-api-key': env.COMPOSIO_API_KEY, 'content-type': 'application/json' }
const base = 'https://backend.composio.dev/api/v3'
const r = mode === 'schema'
  ? await fetch(`${base}/tools/${slug}`, { headers: h })
  : mode === 'search'
  ? await fetch(`${base}/tools?toolkit_slug=${slug}&limit=200`, { headers: h })
  : await fetch(`${base}/tools/execute/${slug}`, { method: 'POST', headers: h, body: JSON.stringify({ user_id: 'pg-test-8dbf7e88-4793-4c73-80f7-ba474b8ff67d', connected_account_id: ca, arguments: JSON.parse(args || '{}') }) })
const j = await r.json()
if (mode === 'search') console.log(j.items.map((t) => t.slug).join('\n'))
else if (mode === 'schema') console.log(JSON.stringify({ in: j.input_parameters?.properties ? Object.fromEntries(Object.entries(j.input_parameters.properties).map(([k, v]) => [k, (v.type || '') + ' ' + (v.description || '').slice(0, 90)])) : j, req: j.input_parameters?.required }, null, 1))
else console.log(JSON.stringify(j).slice(0, 1500))
