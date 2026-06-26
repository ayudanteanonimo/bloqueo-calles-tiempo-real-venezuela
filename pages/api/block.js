import { addBlock, resolveBlock, sanitize } from '../../lib/kv'

// Explicitly enable body parser for all methods including DELETE
export const config = {
  api: { bodyParser: true }
}

const TYPES = ['policia', 'derrumbe', 'accidente', 'inundacion', 'protesta', 'otro']

// Venezuela bounding box with generous margin
const GEO = { latMin: 0.5, latMax: 14, lngMin: -74, lngMax: -58.5 }

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  // ── POST: add block ──────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = req.body || {}
      const lat = parseFloat(body.lat)
      const lng = parseFloat(body.lng)

      if (isNaN(lat) || isNaN(lng))
        return res.status(400).json({ error: 'Coordenadas inválidas' })

      if (lat < GEO.latMin || lat > GEO.latMax || lng < GEO.lngMin || lng > GEO.lngMax)
        return res.status(400).json({ error: 'Ubicación fuera del área permitida' })

      const type = String(body.type || '').trim()
      if (!TYPES.includes(type))
        return res.status(400).json({ error: 'Tipo de bloqueo inválido' })

      const desc = sanitize(body.desc, 300)
      if (!desc)
        return res.status(400).json({ error: 'La descripción es requerida' })

      const block = {
        id:         'b-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        lat,
        lng,
        type,
        via:        sanitize(body.via, 80),
        desc,
        reportedBy: sanitize(body.reportedBy || 'Anónimo', 40),
        ts:         Date.now(),
      }

      await addBlock(block)
      return res.status(201).json({ ok: true, block })

    } catch (err) {
      console.error('[block POST]', err)
      return res.status(500).json({ error: 'Error al guardar el bloqueo' })
    }
  }

  // ── DELETE: resolve block ────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const body = req.body || {}
      const id = String(body.id || '').trim()

      if (!id)
        return res.status(400).json({ error: 'ID requerido' })

      await resolveBlock(id)
      return res.status(200).json({ ok: true })

    } catch (err) {
      console.error('[block DELETE]', err)
      return res.status(500).json({ error: 'Error al resolver el bloqueo' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
