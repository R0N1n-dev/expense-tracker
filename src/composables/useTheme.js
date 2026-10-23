import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core'
import { computed, ref, watch } from 'vue'
import { DEFAULT_MODE, DEFAULT_THEME, THEMES, themeById, themeTokens } from '../data/themes'
import { getJSON, setJSON } from '../lib/storage'

const THEME_KEY = 'themeId'
const MODE_KEY = 'themeMode'

const media = matchMedia('(prefers-color-scheme: dark)')
const systemDark = ref(media.matches)
const themeId = ref(DEFAULT_THEME)
const mode = ref(DEFAULT_MODE)

const theme = computed(() => themeById(themeId.value))
const dark = computed(() =>
  mode.value === 'dark' ? true : mode.value === 'light' ? false : systemDark.value,
)
const tokens = computed(() => themeTokens(theme.value, dark.value))

let meta = null
let lastApplied = ''

// The status bar has to follow the app theme, not the OS theme: in light mode
// we ask for dark icons, in dark mode for light icons. Capacitor 8 bundles the
// native SystemBars plugin, which also handles the navigation/gesture bar.
async function syncSystemBars() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await SystemBars.setStyle({
      style: dark.value ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
    })
  } catch {
    /* plugin missing on an old native build */
  }
}

function apply() {
  const root = document.documentElement
  root.setAttribute('data-theme', dark.value ? 'dark' : 'light')
  root.setAttribute('data-theme-id', theme.value.id)
  root.style.colorScheme = dark.value ? 'dark' : 'light'
  for (const [name, value] of Object.entries(tokens.value)) {
    root.style.setProperty(name, value)
  }
  if (!meta) meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', tokens.value['--bg'])

  const signature = `${theme.value.id}:${dark.value}`
  if (signature !== lastApplied) {
    lastApplied = signature
    syncSystemBars()
  }
}

// Call once before mounting the app.
export async function loadTheme() {
  const [savedTheme, savedMode, legacyMode] = await Promise.all([
    getJSON(THEME_KEY, null),
    getJSON(MODE_KEY, null),
    getJSON('theme', null),
  ])
  if (THEMES.some((t) => t.id === savedTheme)) themeId.value = savedTheme
  if (['system', 'light', 'dark'].includes(savedMode)) {
    mode.value = savedMode
  } else if (legacyMode === 'dark' || legacyMode === 'light') {
    // Migrate the single dark/light switch used before themes existed.
    mode.value = legacyMode
  }
  apply()

  media.addEventListener('change', (event) => {
    systemDark.value = event.matches
    apply()
  })
  // Some Android skins reset the bar appearance when the WebView is paused.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncSystemBars()
  })
}

watch([themeId, mode], () => {
  apply()
  setJSON(THEME_KEY, themeId.value)
  setJSON(MODE_KEY, mode.value)
})

export function useTheme() {
  function setTheme(id) {
    if (THEMES.some((t) => t.id === id)) themeId.value = id
  }
  function setMode(next) {
    if (['system', 'light', 'dark'].includes(next)) mode.value = next
  }
  function toggle() {
    setMode(dark.value ? 'light' : 'dark')
  }
  return { themeId, theme, mode, dark, tokens, setTheme, setMode, toggle, themes: THEMES }
}
