import { computed, ref, watch } from 'vue'
import { categoryById } from '../data/categories'
import { dayKey } from '../lib/format'
import { getJSON, setJSON } from '../lib/storage'
import { refreshWidget } from '../lib/widget'

const BUDGET_KEY = 'budget'
const EXPENSES_KEY = 'expenses'
const DEFAULT_BUDGET = 900000

const budget = ref(DEFAULT_BUDGET)
const items = ref([])

function setBudget(n) {
  if (!(n > 0)) return
  budget.value = n
  setJSON(BUDGET_KEY, n).then(refreshWidget)
}

// Call once before mounting the app.
export async function loadStore() {
  const savedBudget = await getJSON(BUDGET_KEY, DEFAULT_BUDGET)
  budget.value = savedBudget > 0 ? savedBudget : DEFAULT_BUDGET
  items.value = await getJSON(EXPENSES_KEY, [])
}

watch(
  items,
  async (v) => {
    await setJSON(EXPENSES_KEY, v)
    refreshWidget()
  },
  { deep: true },
)

const today = new Date()
const todayKey = dayKey(today)

const month = today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

const inMonth = computed(() =>
  items.value.filter((e) => {
    const d = new Date(e.t)
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }),
)
const spent = computed(() => inMonth.value.reduce((s, e) => s + e.amt, 0))
const left = computed(() => budget.value - spent.value)
const daysLeft =
  new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate() + 1
const perDay = computed(() => (left.value > 0 ? left.value / daysLeft : 0))
const pctUsed = computed(() => Math.round((spent.value / budget.value) * 100))

const segments = computed(() => {
  const total = Math.max(budget.value, spent.value)
  const sums = {}
  inMonth.value.forEach((e) => (sums[e.cat] = (sums[e.cat] ?? 0) + e.amt))
  return Object.keys(sums)
    .map((id) => {
      const c = categoryById(id)
      const amt = sums[id]
      return { id, name: c.name, color: c.color, amt, pct: (amt / total) * 100 }
    })
    .sort((a, b) => b.amt - a.amt)
})

const week = computed(() => {
  const days = []
  for (let n = 6; n >= 0; n--) {
    const d = new Date()
    d.setDate(d.getDate() - n)
    days.push(d)
  }
  const totals = days.map((d) =>
    items.value.filter((e) => dayKey(new Date(e.t)) === dayKey(d)).reduce((s, e) => s + e.amt, 0),
  )
  const max = Math.max(...totals, 1)
  return days.map((d, i) => ({
    k: dayKey(d),
    today: i === 6,
    label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    h: Math.max(6, (totals[i] / max) * 70),
  }))
})

const groups = computed(() => {
  const map = new Map()
  ;[...items.value]
    .sort((a, b) => b.t - a.t)
    .forEach((e) => {
      const k = dayKey(new Date(e.t))
      if (!map.has(k)) map.set(k, { k, t: e.t, items: [], total: 0 })
      const g = map.get(k)
      g.items.push(e)
      g.total += e.amt
    })
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return [...map.values()].map((g) => ({
    k: g.k,
    total: g.total,
    items: g.items,
    label:
      g.k === todayKey
        ? 'Today'
        : g.k === dayKey(yesterday)
          ? 'Yesterday'
          : new Date(g.t).toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            }),
  }))
})

function add(p) {
  const id = Date.now()
  items.value.unshift({ id, cat: p.cat, note: p.note, amt: p.amt, t: Date.now() })
  return id
}

function update(id, patch) {
  const e = items.value.find((x) => x.id === id)
  if (e) Object.assign(e, patch)
}

function remove(id) {
  items.value = items.value.filter((x) => x.id !== id)
}

export function useExpenses() {
  return { budget, setBudget, update, remove, month, todayKey, spent, left, daysLeft, perDay, pctUsed, segments, week, groups, add }
}
