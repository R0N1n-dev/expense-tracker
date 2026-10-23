# Nsimbi — money, decoded

**Nsimbi** (Luganda for *money / coin*) is an offline-first expense tracker built with Vue 3,
Vite and Capacitor for Android. It handles the whole money picture: spending, income, monthly and
per-category budgets, savings goals, recurring bills, insights, exports and themes that stay
readable in light and dark mode.

App id: `com.devn1n.expensetracker` (change it in `capacitor.config.json` and the Android project
before publishing). Everything is stored on the device — no account, no server, no tracking.

## What it does

### 1. Expenses **and** income
Log both sides of the ledger. The home screen shows spent, income, net cashflow and budget left;
income never eats into the spending budget. Each entry has a date, note, category, type and
optional monthly/weekly repeat.

### 2. Month-by-month history
Move through months with the arrows or jump “back to this month”. Budget maths, category
breakdowns, charts and the recent list all follow the selected month, and past months stay
editable.

### 3. Search and filters
Search notes and category names, then filter by type, category and period (selected month or all
time). The result count updates live and one tap clears everything.

### 4. Category budgets
Give Food, Transport, Rent or any category its own monthly ceiling. Progress bars show how much
is left, and the home screen plus Insights warn you when a limit is crossed. Limits are separate
from the overall monthly budget.

### 5. Savings goals
Create envelopes with a target, optional deadline and colour, then add or withdraw money as you
go. Goals are deliberately separate from expenses so saving does not double-count as spending.

### 6. Recurring entries that post themselves
Mark rent, salary, airtime or subscriptions as weekly/monthly. Nsimbi posts anything that became
due while the app was closed, keeps the original day of the month (31 Jan → 28 Feb), and lets you
pause, resume, post now or delete a rule. Past entries are never rewritten.

### 7. Insights, not just totals
For the selected month: daily average, projected month-end spend, safe daily allowance, savings
rate, month-over-month change, biggest category, largest single expense, active spending days and
a six-month bar chart you can tap to navigate.

### 8. CSV export and import
Export one row per entry (`date,type,category,note,amount`) for Excel, Sheets or a accountant, or
import the same shape back. Quoted commas, escaped quotes, CRLF and a BOM are handled. Copy to the
clipboard or download the file.

### 9. JSON backup and restore
Copy or download a versioned JSON backup containing entries, budget, category limits, goals and
recurring rules. Restore by choosing a file or pasting the text. Invalid data is rejected instead
of half-imported.

### 10. Duplicate, delete and undo
Duplicate an entry for today with one tap, or delete with a confirmation tap and a toast that
offers **Undo**.

### 11. Ten accessible themes, light/dark/system
All nine palettes from the brand guide plus the original Violet Pulse, each with a light and dark
rendition. Colours are contrast-checked at runtime, and the native status/navigation bar icons are
switched natively so they never disappear in light mode.

### 12. Home-screen widget, offline-first storage and accessibility
The Android widget shows the month, spent, budget left and a quick-add button, and ignores income
rows. The app is fully usable offline, remembers everything through Capacitor Preferences, respects
`prefers-reduced-motion`, has labelled controls, visible focus rings, comfortable touch targets and
sheet dialogs that close on Escape.

## Themes

Pick a theme and appearance mode in **Settings → Appearance & data**. The choice is saved;
`System` follows the phone. Every theme is expanded into accessible tokens (background, surface,
ink, muted text, lines, brand, accent, on-brand, on-accent, shadows) by `src/data/themes.js`.

| Theme | Kind | Primary | Secondary | Accent |
| --- | --- | --- | --- | --- |
| Violet Pulse (default) | dual | `#5B47E0` | `#8B7BFF` | `#F59E0B` |
| Classic Corporate | dual | `#1E2761` | `#408EC6` | `#408EC6` |
| Energetic Retail | dual | `#2C3E50` | `#E67E22` | `#E67E22` |
| Eco-Organic | dual | `#2C5F2D` | `#97BC62` | `#97BC62` |
| Cyber High-Contrast | dual | `#1A1A1A` | `#C1DD13` | `#C1DD13` |
| Minimalist Editorial | dual | `#CC313D` | `#F7C5CC` | `#CC313D` |
| The High-End Trio | triple | `#1E2761` | `#408EC6` | `#7A2048` |
| The Bright Tech Vibe | triple | `#2D3047` | `#2EC4B6` | `#FF7A59` |
| The Playful Pastel | triple | `#B298E7` | `#B8E3E9` | `#F5B8D5` |
| The Earthy Muted | triple | `#4A5842` | `#EFEBE4` | `#D98A6C` |

Light mode tints the canvas from the primary and darkens the primary/accent until text and action
buttons clear WCAG AA. Dark mode tints a near-black canvas from the primary and promotes the
secondary to the action colour. Theme tests assert minimum contrast in both modes.

### Native status bar (light-mode fix)

Capacitor 8 ships a native `SystemBars` API that controls the real status bar and the
navigation/gesture bar. On every theme or appearance change, `useTheme` calls:

```js
SystemBars.setStyle({ style: dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light })
```

- dark mode → light system-bar content
- light mode → dark system-bar content
- the nav/gesture bar follows at the same time
- `MainActivity` calls `EdgeToEdge.enable(this)` so older Android versions also draw the app
  background behind the bars
- `SystemBars.insetsHandling` is set to `native` in `capacitor.config.json`; with
  `viewport-fit=cover` the web view receives correct `env(safe-area-inset-*)` values and pads its
  content, so nothing hides under the bars

This follows the **app** theme rather than the OS theme, which fixes light text on a light
background when the system is dark (and the reverse). The browser fallback updates
`<meta name="theme-color">`.

## Develop

Requirements: Node 20+ (Node 24 is used here), npm, and Android Studio for native builds.

```bash
npm install
npm run dev        # browser dev server
npm test           # Vitest: theme contrast, CSV parser and app smoke tests
npm run build      # production bundle in dist/
npm run preview    # serve the built bundle
```

### Run on Android

```bash
npm run android    # build, cap sync, open Android Studio
```

Then press Run with a phone or emulator connected. The `android/` project, icons and splash
images are committed. `npm run android` requires the Android SDK; a plain `npm run build` does not.

### Icons and splash

```bash
npm run icons      # redraw assets/*.png from scripts/make-icons.mjs
npm run assets     # regenerate every Android icon and splash size
```

Source sizes: `icon-only.png` 1024², `icon-foreground.png` 1024² (art inside the centre 60%),
`icon-background.png` 1024², `splash.png` / `splash-dark.png` 2732². The mark is a segmented
budget ring around an “N”; edit the colours in `scripts/make-icons.mjs`.


## Project map

```
src/
  App.vue                    shell, sheets, undo toast
  components/
    AddSheet.vue             expense/income form + repeat
    AmountPad.vue            big amount entry
    BudgetHero.vue           month totals, category bar, alerts
    DayGroup.vue             collapsible day list
    FilterBar.vue            search field + filter trigger
    FilterSheet.vue          type/category/period filters
    InsightsSheet.vue        pace, comparison and six-month chart
    MonthNav.vue             month navigation
    PlannerSheet.vue         tabs for limits, goals, recurring
    CategoryBudgetPanel.vue  per-category ceilings
    GoalsPanel.vue           savings envelopes
    RecurringPanel.vue       automated rules
    SettingsSheet.vue        themes, appearance, backup/restore
    BottomSheet.vue          accessible modal shell
    ...
  composables/useExpenses.js store, derived stats, import/export, recurring engine
  composables/useTheme.js    tokens, mode, persistence, native bar sync
  data/themes.js             palette definitions + light/dark token builder
  data/categories.js         expense/income categories
  lib/color.js               hex maths and WCAG contrast helpers
  lib/csv.js                 RFC 4180 parser
  lib/format.js              money, month and date helpers
  lib/storage.js             Capacitor Preferences wrapper
  lib/widget.js              home-screen widget bridge
android/.../ExpenseWidget.java      widget (income-aware)
```

## Data and migration

All keys live in Capacitor Preferences (`CapacitorStorage` on Android):

| Key | Contents |
| --- | --- |
| `themeId`, `themeMode` | selected theme and `system`/`light`/`dark` |
| `budget` | overall monthly budget |
| `expenses` | entries: `id, cat, note, amt, t, type`, optional `recurringId` |
| `categoryBudgets` | `{ categoryId: monthlyLimit }` |
| `goals` | `id, name, target, saved, deadline, color` |
| `recurring` | `id, cat, note, amt, type, freq, nextDue, active` |

Old entries without `type` are read as expenses, so upgrades keep existing data. Imported rows are
normalised (positive amounts, valid category/type pairing, numeric timestamps) and invalid rows are
skipped. The widget reads the same `expenses` and `budget` keys.

## Privacy and limitations

- Data never leaves the device unless you export it.
- There is one currency (UGX); amounts are whole shillings, so there are no decimals.
- Recurring entries are posted when the app opens, not by a background service. Nsimbi catches up
  on next launch.
- Deleting a recurring rule keeps its past entries.
- A restore replaces the current entries in that install; take a backup first.
- The widget refreshes whenever entries or the budget change; Android decides when it redraws.
