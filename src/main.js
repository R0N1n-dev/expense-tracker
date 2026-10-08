import { createApp } from 'vue'
import { SplashScreen } from '@capacitor/splash-screen'
import '@fontsource-variable/bricolage-grotesque'
import './style.css'
import App from './App.vue'
import { loadStore } from './composables/useExpenses'
import { loadTheme } from './composables/useTheme'

await Promise.all([loadStore(), loadTheme()])
createApp(App).mount('#app')

// The splash stays up (launchAutoHide is off) until saved data is loaded and the first screen is drawn.
try {
  await SplashScreen.hide({ fadeOutDuration: 200 })
} catch {
  /* not running inside Capacitor */
}
