import { ref } from 'vue'
import { getJSON, setJSON } from '../lib/storage'

const THEME_KEY = 'theme'
const dark = ref(matchMedia('(prefers-color-scheme: dark)').matches)

function apply() {
  document.documentElement.setAttribute('data-theme', dark.value ? 'dark' : 'light')
}
apply()

// Call once before mounting the app.
export async function loadTheme() {
  const saved = await getJSON(THEME_KEY, null)
  if (saved) dark.value = saved === 'dark'
  apply()
}

export function useTheme() {
  function toggle() {
    dark.value = !dark.value
    apply()
    setJSON(THEME_KEY, dark.value ? 'dark' : 'light')
  }
  return { dark, toggle }
}
