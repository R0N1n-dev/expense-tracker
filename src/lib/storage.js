import { Preferences } from '@capacitor/preferences'

// Writes are serialised per key so rapid edits cannot land out of order.
const queues = new Map()

// On Android and iOS this uses native storage. In the browser it falls back to localStorage.
export async function getJSON(key, fallback) {
  try {
    const pending = queues.get(key)
    if (pending) await pending
    const { value } = await Preferences.get({ key })
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function setJSON(key, value) {
  const write = async () => {
    try {
      await Preferences.set({ key, value: JSON.stringify(value) })
    } catch {
      /* write failed, data stays in memory for this session */
    }
  }
  const next = (queues.get(key) ?? Promise.resolve()).then(write, write)
  queues.set(key, next)
  return next
}
