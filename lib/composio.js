// Cliente mínimo de Composio (API v3). La key solo existe en el servidor (secreto de Cloudflare).
const BASE = 'https://backend.composio.dev/api/v3'

export async function execTool(env, slug, connectedAccountId, args) {
  if (!connectedAccountId) throw new Error(`Sin connected_account_id para ${slug}`)
  const r = await fetch(`${BASE}/tools/execute/${slug}`, {
    method: 'POST',
    headers: { 'x-api-key': env.COMPOSIO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ user_id: env.COMPOSIO_USER_ID, connected_account_id: connectedAccountId, arguments: args }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || !j.successful) throw new Error(`${slug}: ${String(j.error || j.message || r.status).slice(0, 300)}`)
  return j.data?.response_data ?? j.data
}
