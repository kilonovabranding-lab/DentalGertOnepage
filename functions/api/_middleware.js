// Respuestas JSON uniformes y errores sin filtrar detalles internos.
export async function onRequest({ next }) {
  try {
    const res = await next()
    res.headers.set('cache-control', 'no-store')
    return res
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'server' }, { status: 500 })
  }
}
