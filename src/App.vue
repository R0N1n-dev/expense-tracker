<script setup>
import { onMounted, ref } from 'vue'
import AppIcon from './components/AppIcon.vue'
import MonthNav from './components/MonthNav.vue'
import BudgetHero from './components/BudgetHero.vue'
import WeekChart from './components/WeekChart.vue'
import DayGroup from './components/DayGroup.vue'
import AddSheet from './components/AddSheet.vue'
import BudgetSheet from './components/BudgetSheet.vue'
import FilterBar from './components/FilterBar.vue'
import FilterSheet from './components/FilterSheet.vue'
import InsightsSheet from './components/InsightsSheet.vue'
import PlannerSheet from './components/PlannerSheet.vue'
import SettingsSheet from './components/SettingsSheet.vue'
import Toast from './components/Toast.vue'
import { useExpenses } from './composables/useExpenses'
import { useTheme } from './composables/useTheme'
import { dayKey } from './lib/format'
import { consumeWidgetAction } from './lib/widget'

const {
  budget,
  setBudget,
  groups,
  todayKey,
  add,
  update,
  remove,
  duplicate,
  restore,
  filtersActive,
  resetFilters,
  monthName,
  isCurrentMonth,
  filteredItems,
} = useExpenses()
const { dark, toggle } = useTheme()

const sheetOpen = ref(false)
const budgetOpen = ref(false)
const filterOpen = ref(false)
const insightsOpen = ref(false)
const plannerOpen = ref(false)
const settingsOpen = ref(false)
const editing = ref(null)
const newId = ref('')
const openDays = ref([todayKey])
const addSuggestion = ref(null)
const toast = ref(null)
let toastTimer = 0

function toggleDay(k) {
  openDays.value = openDays.value.includes(k)
    ? openDays.value.filter((x) => x !== k)
    : [...openDays.value, k]
}

function onBudget(n) {
  setBudget(n)
  budgetOpen.value = false
}

function openAdd(repeat = null) {
  editing.value = null
  addSuggestion.value = repeat
  sheetOpen.value = true
}

function openEdit(expense) {
  editing.value = expense
  addSuggestion.value = null
  sheetOpen.value = true
}

function openAddFromPlanner() {
  plannerOpen.value = false
  openAdd('monthly')
}

function flash(id) {
  newId.value = id
  setTimeout(() => (newId.value = ''), 1200)
}

function showToast(message, action = null, onAction = null) {
  clearTimeout(toastTimer)
  toast.value = { message, action, onAction }
  toastTimer = setTimeout(() => (toast.value = null), action ? 8000 : 4000)
}

function runToastAction() {
  const action = toast.value?.onAction
  toast.value = null
  clearTimeout(toastTimer)
  if (action) action()
}

function onSave(p) {
  let id
  if (editing.value) {
    id = editing.value.id
    update(id, p)
  } else {
    id = add(p)
    const key = dayKey(new Date(p.t))
    if (!openDays.value.includes(key)) openDays.value.push(key)
  }
  sheetOpen.value = false
  addSuggestion.value = null
  flash(id)
}

function onDelete() {
  if (!editing.value) return
  const entry = remove(editing.value.id)
  sheetOpen.value = false
  if (entry) {
    showToast('Entry deleted.', 'Undo', () => {
      restore(entry)
      flash(entry.item.id)
    })
  }
}

function onDuplicate() {
  if (!editing.value) return
  const id = duplicate(editing.value.id)
  sheetOpen.value = false
  if (id) {
    flash(id)
    showToast('Entry duplicated for today.')
  }
}

function clearFilters() {
  resetFilters()
}

// The widget's + button opens the app with the add sheet already showing.
async function checkWidgetAction() {
  if (document.visibilityState === 'hidden') return
  if ((await consumeWidgetAction()) === 'add') openAdd()
}

onMounted(() => {
  checkWidgetAction()
  document.addEventListener('visibilitychange', checkWidgetAction)
})
</script>

<template>
  <div class="app">
    <header>
      <div class="brand">
        <div class="mark" aria-hidden="true">N</div>
        <div>
          <h1>Nsimbi</h1>
          <span class="tagline">money, decoded</span>
        </div>
      </div>
      <div class="actions">
        <button class="icon-btn plain" aria-label="Insights" @click="insightsOpen = true">
          <AppIcon name="chart" />
        </button>
        <button
          class="icon-btn plain"
          aria-label="Plan budgets, goals and recurring entries"
          @click="plannerOpen = true"
        >
          <AppIcon name="target" />
        </button>
        <button
          class="icon-btn plain"
          :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggle"
        >
          <AppIcon :name="dark ? 'sun' : 'moon'" />
        </button>
        <button
          class="icon-btn plain"
          aria-label="Settings, themes and backup"
          @click="settingsOpen = true"
        >
          <AppIcon name="gear" />
        </button>
      </div>
    </header>

    <div class="month-card"><MonthNav /></div>

    <BudgetHero @edit-budget="budgetOpen = true" @open-plan="plannerOpen = true" />

    <div class="section-head">
      <h2>Daily spend</h2>
      <span class="hint">{{ isCurrentMonth ? 'Last 7 days' : 'Final week' }}</span>
    </div>
    <WeekChart />

    <div class="section-head recent-head">
      <h2>Recent</h2>
      <span v-if="filteredItems.length" class="hint">{{ filteredItems.length }} entries</span>
    </div>
    <FilterBar @open-filters="filterOpen = true" />

    <div class="list">
      <p v-if="!groups.length && filtersActive" class="empty">
        No entries match those filters.
        <button class="inline-link" @click="clearFilters">Clear filters</button>
      </p>
      <p v-else-if="!groups.length && isCurrentMonth" class="empty">
        Nothing logged yet. Tap <b>Add entry</b> to record your first expense or income.
      </p>
      <p v-else-if="!groups.length" class="empty">Nothing recorded in {{ monthName }}.</p>
      <DayGroup
        v-for="g in groups"
        :key="g.k"
        :group="g"
        :open="openDays.includes(g.k)"
        :new-id="newId"
        @toggle="toggleDay(g.k)"
        @edit="openEdit"
      />
    </div>

    <button class="fab" @click="openAdd()"><AppIcon name="plus" />Add entry</button>

    <AddSheet
      :open="sheetOpen"
      :editing="editing"
      :suggest-repeat="addSuggestion"
      @close="sheetOpen = false"
      @save="onSave"
      @delete="onDelete"
      @duplicate="onDuplicate"
    />
    <BudgetSheet :open="budgetOpen" :current="budget" @close="budgetOpen = false" @save="onBudget" />
    <FilterSheet :open="filterOpen" @close="filterOpen = false" />
    <InsightsSheet :open="insightsOpen" @close="insightsOpen = false" />
    <PlannerSheet
      :open="plannerOpen"
      @close="plannerOpen = false"
      @add="openAddFromPlanner"
      @edit-budget="plannerOpen = false; budgetOpen = true"
    />
    <SettingsSheet :open="settingsOpen" @close="settingsOpen = false" />

    <Toast
      :message="toast?.message || ''"
      :action="toast?.action || ''"
      @action="runToastAction"
      @dismiss="toast = null"
    />
  </div>
</template>


<style scoped>
.app { max-width: 460px; margin: 0 auto; padding: 16px 20px 140px; }
header { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
.mark { width: 34px; height: 34px; border-radius: 11px; background: var(--brand); color: var(--on-brand); display: grid; place-items: center; font-weight: 800; font-size: 19px; flex: none; box-shadow: 0 4px 12px color-mix(in srgb, var(--brand) 30%, transparent); }
h1 { font-size: 19px; font-weight: 800; margin: 0; letter-spacing: -0.02em; line-height: 1.1; }
.tagline { font-size: 10px; color: var(--mute); letter-spacing: 0.02em; }
.actions { display: flex; align-items: center; gap: 0; }
.actions .icon-btn { width: 38px; height: 38px; color: var(--mute); }
.actions .icon-btn svg { width: 19px; height: 19px; }
@media (max-width: 345px) {
  .tagline { display: none; }
  .brand { gap: 7px; }
  .actions .icon-btn { width: 34px; height: 34px; }
  .actions .icon-btn svg { width: 18px; height: 18px; }
}
.month-card { margin-top: 14px; padding: 2px 4px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin: 30px 0 10px; }
.section-head h2 { font-size: 16px; font-weight: 700; margin: 0; }
.hint { font-size: 11px; color: var(--mute); }
.recent-head { margin-bottom: 12px; }
.list { margin-top: 10px; }
.empty { color: var(--mute); font-size: 14px; padding: 18px 16px; border-radius: 14px; border: 1px dashed var(--line); margin: 12px 0 0; line-height: 1.5; }
.empty b { color: var(--ink); }
.inline-link { color: var(--accent); font-weight: 600; padding: 0; text-decoration: underline; }
.fab { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(20px + env(safe-area-inset-bottom, 0px)); z-index: 20; display: flex; align-items: center; gap: 8px; padding: 0 26px; height: 56px; border-radius: 28px; background: var(--brand); color: var(--on-brand); font-weight: 700; font-size: 16px; box-shadow: var(--shadow); }
.fab:active { transform: translateX(-50%) scale(0.98); }
</style>
