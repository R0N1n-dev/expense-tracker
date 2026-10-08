<script setup>
import { onMounted, ref } from 'vue'
import AppIcon from './components/AppIcon.vue'
import BudgetHero from './components/BudgetHero.vue'
import WeekChart from './components/WeekChart.vue'
import DayGroup from './components/DayGroup.vue'
import AddSheet from './components/AddSheet.vue'
import BudgetSheet from './components/BudgetSheet.vue'
import { useExpenses } from './composables/useExpenses'
import { useTheme } from './composables/useTheme'
import { fmt } from './lib/format'
import { consumeWidgetAction } from './lib/widget'

const { month, budget, setBudget, groups, todayKey, add, update, remove } = useExpenses()
const { dark, toggle } = useTheme()

const sheetOpen = ref(false)
const budgetOpen = ref(false)
const editing = ref(null)
const newId = ref(0)
const openDays = ref([todayKey])

function toggleDay(k) {
  openDays.value = openDays.value.includes(k)
    ? openDays.value.filter((x) => x !== k)
    : [...openDays.value, k]
}

function onBudget(n) {
  setBudget(n)
  budgetOpen.value = false
}

function openAdd() {
  editing.value = null
  sheetOpen.value = true
}

function openEdit(expense) {
  editing.value = expense
  sheetOpen.value = true
}

function flash(id) {
  newId.value = id
  setTimeout(() => (newId.value = 0), 1200)
}

function onSave(p) {
  let id
  if (editing.value) {
    id = editing.value.id
    update(id, p)
  } else {
    id = add(p)
    if (!openDays.value.includes(todayKey)) openDays.value.push(todayKey)
  }
  sheetOpen.value = false
  flash(id)
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

function onDelete() {
  remove(editing.value.id)
  sheetOpen.value = false
}
</script>

<template>
  <div class="app">
    <header>
      <div>
        <h1>{{ month }}</h1>
        <button class="budget-btn sub" aria-label="Change monthly budget" @click="budgetOpen = true">
          Budget UGX {{ fmt(budget) }}<AppIcon name="pencil" />
        </button>
      </div>
      <button
        class="icon-btn"
        :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggle"
      >
        <AppIcon :name="dark ? 'sun' : 'moon'" />
      </button>
    </header>

    <BudgetHero />

    <h2>Last 7 days</h2>
    <WeekChart />

    <h2>Recent</h2>
    <p v-if="!groups.length" class="empty">No expenses yet. Tap Add expense to log your first one.</p>
    <DayGroup
      v-for="g in groups"
      :key="g.k"
      :group="g"
      :open="openDays.includes(g.k)"
      :new-id="newId"
      @toggle="toggleDay(g.k)"
      @edit="openEdit"
    />

    <button class="fab" @click="openAdd"><AppIcon name="plus" />Add expense</button>
    <AddSheet
      :open="sheetOpen"
      :editing="editing"
      @close="sheetOpen = false"
      @save="onSave"
      @delete="onDelete"
    />
    <BudgetSheet :open="budgetOpen" :current="budget" @close="budgetOpen = false" @save="onBudget" />
  </div>
</template>

<style scoped>
.app { max-width: 440px; margin: 0 auto; padding: 20px 20px 120px; }
header { display: flex; justify-content: space-between; align-items: center; }
h1 { font-size: 20px; font-weight: 700; margin: 0; }
h2 { font-size: 16px; font-weight: 700; margin: 32px 0 12px; }
.empty { color: var(--mute); font-size: 15px; padding: 18px 16px; border-radius: 14px; border: 1px dashed var(--line); margin: 0; }
.budget-btn { display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 0; }
.budget-btn svg { width: 14px; height: 14px; }
.fab { position: fixed; left: 50%; transform: translateX(-50%); bottom: calc(20px + env(safe-area-inset-bottom, 0px)); display: flex; align-items: center; gap: 8px; padding: 0 26px; height: 56px; border-radius: 28px; background: var(--accent); color: var(--on-accent); font-weight: 700; font-size: 16px; box-shadow: var(--shadow); }
</style>
