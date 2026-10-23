<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import BottomSheet from './BottomSheet.vue'
import { useTheme } from '../composables/useTheme'
import { useExpenses } from '../composables/useExpenses'
import { copyText, downloadText } from '../lib/data'

defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close'])

const { themes, themeId, mode, setTheme, setMode } = useTheme()
const { exportData, exportCSV, importData, importCSVText, clearFinancialData } = useExpenses()

const pasteOpen = ref(false)
const paste = ref('')
const result = ref('')
const resultBad = ref(false)
const confirmReset = ref(false)
const fileInput = ref(null)

function notify(message, bad = false) {
  result.value = message
  resultBad.value = bad
}

async function copy(kind) {
  const text = kind === 'csv' ? exportCSV() : JSON.stringify(exportData(), null, 2)
  const ok = await copyText(text)
  notify(ok ? `${kind === 'csv' ? 'CSV' : 'Backup'} copied to the clipboard.` : 'Could not copy. Try downloading instead.', !ok)
}

function download(kind) {
  const stamp = new Date().toISOString().slice(0, 10)
  const ok =
    kind === 'csv'
      ? downloadText(`nsimbi-expenses-${stamp}.csv`, exportCSV(), 'text/csv')
      : downloadText(`nsimbi-backup-${stamp}.json`, JSON.stringify(exportData(), null, 2), 'application/json')
  notify(ok ? 'Download started.' : 'Downloads are blocked here. Use Copy instead.', !ok)
}

function restoreText(text) {
  const clean = String(text ?? '').trim()
  if (!clean) return
  try {
    if (clean.startsWith('{')) {
      const counts = importData(JSON.parse(clean))
      notify(`Restored ${counts.items} entries, ${counts.goals} goals and ${counts.recurring} rules.`)
    } else {
      const counts = importCSVText(clean)
      notify(`Imported ${counts.items} entries from CSV.`)
    }
    paste.value = ''
    pasteOpen.value = false
    confirmReset.value = false
  } catch (error) {
    notify(error.message || 'That data could not be imported.', true)
  }
}

async function onFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  restoreText(await file.text())
  event.target.value = ''
}

function reset() {
  if (!confirmReset.value) {
    confirmReset.value = true
    notify('Tap the reset button again to erase all entries, goals and rules.', true)
    return
  }
  clearFinancialData()
  confirmReset.value = false
  notify('All financial data erased. Theme and appearance kept.')
}
</script>

<template>
  <BottomSheet :open="open" title="Appearance & data" @close="emit('close')">
    <div class="sheet-label">Appearance</div>
    <div class="seg" role="group" aria-label="Appearance mode">
      <button :class="{ on: mode === 'system' }" @click="setMode('system')">System</button>
      <button :class="{ on: mode === 'light' }" @click="setMode('light')">Light</button>
      <button :class="{ on: mode === 'dark' }" @click="setMode('dark')">Dark</button>
    </div>
    <p class="hint">
      System follows your phone. The status bar icons are switched natively to stay readable in
      every theme.
    </p>

    <div class="sheet-label">Colour theme · {{ themes.length }}</div>
    <div class="themes">
      <button
        v-for="t in themes"
        :key="t.id"
        class="theme"
        :class="{ on: themeId === t.id }"
        :aria-pressed="themeId === t.id"
        @click="setTheme(t.id)"
      >
        <span class="swatches">
          <i :style="{ background: t.primary }"></i>
          <i :style="{ background: t.secondary }"></i>
          <i :style="{ background: t.accent }"></i>
        </span>
        <b>{{ t.name }}</b>
        <small>{{ t.useCase }}</small>
        <span v-if="themeId === t.id" class="chosen"><AppIcon name="check" /></span>
      </button>
    </div>

    <hr class="divider" />

    <div class="sheet-label">Back up & move</div>
    <div class="tools">
      <button class="tool" @click="copy('csv')">
        <AppIcon name="copy" /><span><b>Copy CSV</b><small>For Excel or Sheets</small></span>
      </button>
      <button class="tool" @click="download('csv')">
        <AppIcon name="download" /><span><b>Download CSV</b><small>One row per entry</small></span>
      </button>
      <button class="tool" @click="copy('json')">
        <AppIcon name="shield" /><span><b>Copy backup</b><small>Everything, restorable</small></span>
      </button>
      <button class="tool" @click="download('json')">
        <AppIcon name="upload" /><span><b>Download backup</b><small>JSON file</small></span>
      </button>
    </div>
    <div class="import-row">
      <button class="btn" @click="fileInput?.click()">
        <AppIcon name="upload" />Import file
      </button>
      <button class="btn" @click="pasteOpen = !pasteOpen">
        <AppIcon name="copy" />Paste instead
      </button>
    </div>
    <input
      ref="fileInput"
      class="hidden-file"
      type="file"
      accept=".json,.csv,text/csv,application/json"
      @change="onFile"
    />
    <div v-if="pasteOpen" class="paste">
      <textarea
        v-model="paste"
        class="field area"
        rows="5"
        placeholder="Paste an Nsimbi backup (JSON) or a CSV with date,type,category,note,amount"
        aria-label="Paste backup or CSV"
      ></textarea>
      <button class="btn primary" :disabled="!paste.trim()" @click="restoreText(paste)">
        Restore pasted data
      </button>
    </div>
    <p class="hint">
      Importing replaces the entries in this install. Back up first if you are unsure. CSV import
      understands the same columns the export writes.
    </p>

    <p v-if="result" class="notice" :class="{ warn: resultBad }" role="status">{{ result }}</p>

    <hr class="divider" />

    <div class="sheet-label">Danger zone</div>
    <button class="btn danger wide" @click="reset">
      <AppIcon name="trash" />{{ confirmReset ? 'Tap again to erase everything' : 'Erase financial data' }}
    </button>

    <div class="about">
      <div class="logo">N</div>
      <div>
        <b>Nsimbi 1.0</b>
        <small>
          Nsimbi is Luganda for money. Your entries live only on this device; nothing is uploaded.
        </small>
      </div>
    </div>
    <p class="made">Made for Uganda · UGX · works offline 🇺🇬</p>
  </BottomSheet>
</template>


<style scoped>
.hint { margin: 8px 0 0; font-size: 12px; color: var(--mute); line-height: 1.45; }
.themes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.theme { position: relative; text-align: left; display: grid; gap: 5px; padding: 10px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }
.theme.on { border-color: var(--brand); box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 30%, transparent); }
.swatches { display: flex; gap: 3px; }
.swatches i { width: 100%; height: 16px; border-radius: 5px; }
.theme b { font-size: 12px; line-height: 1.2; }
.theme small { font-size: 10px; color: var(--mute); line-height: 1.25; }
.chosen { position: absolute; top: 7px; right: 7px; width: 18px; height: 18px; border-radius: 50%; background: var(--brand); color: var(--on-brand); display: grid; place-items: center; }
.chosen svg { width: 11px; height: 11px; }
.tools { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tool { display: flex; align-items: center; gap: 8px; padding: 10px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); text-align: left; color: var(--ink); }
.tool svg { width: 19px; height: 19px; color: var(--accent); }
.tool span { display: grid; gap: 1px; min-width: 0; }
.tool b { font-size: 12px; }
.tool small { font-size: 10px; color: var(--mute); line-height: 1.2; }
.import-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.import-row .btn { font-size: 13px; padding: 0 10px; }
.hidden-file { display: none; }
.paste { display: grid; gap: 8px; margin-top: 10px; }
.area { height: auto; padding: 10px 12px; resize: vertical; font-size: 13px; line-height: 1.4; }
.wide { width: 100%; }
.about { display: flex; gap: 10px; align-items: flex-start; margin-top: 22px; padding-top: 16px; border-top: 1px solid var(--line); }
.logo { width: 40px; height: 40px; border-radius: 13px; background: var(--brand); color: var(--on-brand); display: grid; place-items: center; font-weight: 800; font-size: 20px; flex: none; }
.about b { font-size: 14px; }
.about small { display: block; font-size: 11px; color: var(--mute); line-height: 1.4; margin-top: 2px; }
.made { text-align: center; font-size: 10px; color: var(--mute); margin: 14px 0 0; }
</style>
