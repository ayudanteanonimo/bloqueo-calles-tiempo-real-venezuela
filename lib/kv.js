import { kv } from '@vercel/kv'

const KEY = 'vias-ve:blocks'
const MAX = 300

function sanitize(str, max = 300) {
  return String(str || '').trim().slice(0, max)
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function getBlocks() {
  try {
    const data = await kv.get(KEY)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function addBlock(block) {
  const list = await getBlocks()
  list.unshift(block)
  await kv.set(KEY, list.slice(0, MAX))
  return block
}

export async function resolveBlock(id) {
  const list = await getBlocks()
  await kv.set(KEY, list.filter(b => b.id !== id))
}

export { sanitize }
