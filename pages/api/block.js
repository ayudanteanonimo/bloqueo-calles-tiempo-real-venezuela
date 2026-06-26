import { addBlock, resolveBlock, sanitize } from '../../lib/kv'

const TYPES = ['policia', 'derrumbe', 'accidente', 'inundacion', 'protesta', 'otro']

export default async function handler(req, res) {

  if (req.method === 'POST') {
    const { lat, lng, type, via, desc, reportedBy } = req.body

    const latN = parseFloat(lat)
    const lngN = parseFloat(lng)
    if (isNaN(latN) || isNaN(lngN))
      return res.status(400).json({ error: 'Coordenadas inválidas' })
    if (latN < 0 || latN > 15 || lngN < -75 || lngN > -59)
      return res.status(400).json({ error: 'Ubicación fuera de Venezuela' })
    if (!TYPES.includes(type))
      return res.status(400).json({ error: 'Tipo inválido' })
    const descClean = sanitize(desc, 300)
    if (!descClean)
      return res.status(400).json({ error: 'Descripción requerida' })

    const block = {
      id:         'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      lat:        latN,
      lng:        lngN,
      type,
      via:        sanitize(via, 80),
      desc:       descClean,
      reportedBy: sanitize(reportedBy || 'Anónimo', 40),
      ts:         Date.now(),
    }

    try {
      await addBlock(block)
      return res.status(201).json({ ok: true, block })
    } catch {
      return res.status(500).json({ error: 'Error al guardar' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'ID requerido' })
    try {
      await resolveBlock(id)
      return res.status(200).json({ ok: true })
    } catch {
      return res.status(500).json({ error: 'Error al resolver' })
    }
  }

  res.status(405).end()
}
