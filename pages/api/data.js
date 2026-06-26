import { getBlocks } from '../../lib/kv'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const blocks = await getBlocks()
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ blocks })
  } catch (err) {
    console.error('[data]', err)
    return res.status(500).json({ error: 'Error al cargar datos', blocks: [] })
  }
}
