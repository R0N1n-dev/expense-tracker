import { Preferences } from '@capacitor/preferences'

// On Android and iOS this uses native storage. In the browser it falls back to localStorage.
export async function getJSON(key, fallback) {
  try {
    const { value } = await Preferences.get({ key })
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export async function setJSON(key, value) {
  try {
    await Preferences.set({ key, value: JSON.stringify(value) })
  } catch {
    /* write failed, data stays in memory for this session */
  }
}
