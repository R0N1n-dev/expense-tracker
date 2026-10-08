import { Capacitor, registerPlugin } from '@capacitor/core'

// Native plugin lives in android/.../WidgetPlugin.java
const Widget = registerPlugin('Widget')
const native = Capacitor.isNativePlatform()

// Tell the home screen widget to redraw from the saved data.
export async function refreshWidget() {
  if (!native) return
  try {
    await Widget.refresh()
  } catch {
    /* widget plugin missing, ignore */
  }
}

// Returns 'add' once if the app was opened from the widget's + button, otherwise ''.
export async function consumeWidgetAction() {
  if (!native) return ''
  try {
    const { action } = await Widget.consumeAction()
    return action || ''
  } catch {
    return ''
  }
}
