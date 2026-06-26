import { getBlocks } from '../../lib/kv'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const blocks = await getBlocks()
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ blocks })
  } catch {
    res.status(500).json({ error: 'Error al cargar datos' })
  }
}
