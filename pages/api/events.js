import { getBlocks } from '../../lib/kv'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  let closed = false

  const send = (event, data) => {
    if (closed) return
    try {
      res.write('event: ' + event + '\ndata: ' + JSON.stringify(data) + '\n\n')
    } catch { closed = true }
  }

  // Send initial data immediately
  try {
    const blocks = await getBlocks()
    send('init', { blocks })
  } catch (err) {
    console.error('[events init]', err)
    send('init', { blocks: [] })
  }

  // Track a hash of the full list to detect any change (add or delete)
  let lastHash = ''

  const hashBlocks = (blocks) => {
    if (!blocks.length) return 'empty'
    // Use all ids joined — detects additions AND deletions
    return blocks.map(b => b.id).join(',')
  }

  const poll = setInterval(async () => {
    if (closed) { clearInterval(poll); return }
    try {
      const blocks = await getBlocks()
      const hash = hashBlocks(blocks)
      if (hash !== lastHash) {
        lastHash = hash
        send('update', { blocks })
      }
    } catch { /* ignore poll errors */ }
  }, 4000)

  // Heartbeat every 18s to keep connection alive through proxies
  const hb = setInterval(() => {
    if (closed) { clearInterval(hb); return }
    try { res.write(': ping\n\n') } catch { closed = true }
  }, 18000)

  req.on('close', () => {
    closed = true
    clearInterval(poll)
    clearInterval(hb)
    try { res.end() } catch {}
  })
}
