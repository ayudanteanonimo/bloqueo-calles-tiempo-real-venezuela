import { getBlocks } from '../../lib/kv'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const send = (event, data) => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`) } catch {}
  }

  // Send initial data immediately
  try {
    const blocks = await getBlocks()
    send('init', { blocks })
  } catch {
    send('error', { message: 'Error al cargar' })
  }

  let lastId = null

  // Poll every 4s, only send if something changed
  const poll = setInterval(async () => {
    try {
      const blocks = await getBlocks()
      const newId = blocks[0]?.id || 'empty'
      if (newId !== lastId) {
        lastId = newId
        send('update', { blocks })
      }
    } catch {}
  }, 4000)

  // Heartbeat every 20s
  const hb = setInterval(() => {
    try { res.write(': ping\n\n') } catch {}
  }, 20000)

  req.on('close', () => {
    clearInterval(poll)
    clearInterval(hb)
    res.end()
  })
}
