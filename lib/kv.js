import { kv } from '@vercel/kv'

const KEY = 'vias-ve:blocks'
const MAX = 300

export function sanitize(str, max = 300) {
  if (str === null || str === undefined) return ''
  return String(str)
    .trim()
    .slice(0, max)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export async function getBlocks() {
  const data = await kv.get(KEY)
  if (!data) return []
  if (Array.isArray(data)) return data
  return []
}

export async function addBlock(block) {
  // Read → modify → write in one sequence
  let list = []
  try { list = await getBlocks() } catch { list = [] }
  list.unshift(block)
  await kv.set(KEY, list.slice(0, MAX))
  return block
}

export async function resolveBlock(id) {
  let list = []
  try { list = await getBlocks() } catch { list = [] }
  const updated = list.filter(b => b.id !== id)
  await kv.set(KEY, updated)
}
