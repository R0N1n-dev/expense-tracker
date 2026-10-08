# Expense tracker

Vue 3 + Vite, plain JavaScript, packaged for Android with Capacitor.
App id: `com.devn1n.expensetracker` (see `capacitor.config.json`). Change it before you publish.

## Develop in the browser

    npm install
    npm run dev

## Run on Android

Needs Android Studio. The `android/` project, icons and splash images are already generated.

    npm run android      # build, sync, open Android Studio

Then press Run in Android Studio with a phone or emulator connected.

## Change the icon or splash

The source images live in `assets/`. They are drawn by `scripts/make-icons.mjs`.

    npm run icons        # redraw assets/*.png (edit colors in the script)
    npm run assets       # regenerate every Android icon and splash size
    npm run android

Or replace the files in `assets/` with your own. Required names and sizes:

    icon-only.png        1024x1024   full square icon
    icon-foreground.png  1024x1024   transparent, artwork inside the center 60%
    icon-background.png  1024x1024   solid or gradient
    splash.png           2732x2732   light splash, logo in the center 1200px
    splash-dark.png      2732x2732   dark splash

## Splash behavior

`launchAutoHide` is off in `capacitor.config.json`. `src/main.js` hides the splash after saved
data has loaded and the first screen is drawn. Android 12 and newer show the app icon on the
`splash_background` color (`res/values/colors.xml`, dark variant in `values-night`).
Older Android shows `splash.png` or `splash-dark.png`.
