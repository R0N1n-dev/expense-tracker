import { computed, ref, watch } from 'vue'
import { EXPENSE_CATEGORIES, categoryById, categoryByName } from '../data/categories'
import {
  addMonths,
  dateInputValue,
  dayKey,
  daysInMonth,
  fromDateInput,
  monthKey,
  monthKeyOf,
  monthLabel,
  monthShort,
  uid,
} from '../lib/format'
import { getJSON, setJSON } from '../lib/storage'
import { refreshWidget } from '../lib/widget'
import { parseCSV } from '../lib/csv'

const BUDGET_KEY = 'budget'
const EXPENSES_KEY = 'expenses'
const CAT_BUDGETS_KEY = 'categoryBudgets'
const GOALS_KEY = 'goals'
const RECURRING_KEY = 'recurring'
const DEFAULT_BUDGET = 900000

const budget = ref(DEFAULT_BUDGET)
const items = ref([])
const categoryBudgets = ref({})
const goals = ref([])
const recurring = ref([])
const selectedMonth = ref(monthKey(new Date()))
const filters = ref({ q: '', cat: 'all', type: 'all', scope: 'month' })

const now = new Date()
const todayKey = dayKey(now)
const currentMonth = monthKey(now)

function normalizeItem(raw) {
  const type = raw?.type === 'income' ? 'income' : 'expense'
  const fallback = type === 'income' ? 'other-income' : 'other'
  const cat = categoryById(raw?.cat)
  const amt = Math.abs(Number(raw?.amt))
  const item = {
    id: raw?.id ?? uid(),
    cat: cat.type === type ? cat.id : fallback,
    note: String(raw?.note ?? '').slice(0, 80),
    amt: Number.isFinite(amt) ? amt : 0,
    t: Number(raw?.t) || Date.now(),
    type,
  }
  if (raw?.recurringId) item.recurringId = raw.recurringId
  return item
}

function normalizeGoal(raw) {
  const target = Math.max(0, Number(raw?.target) || 0)
  return {
    id: raw?.id ?? uid(),
    name: String(raw?.name ?? 'Goal').slice(0, 40),
    target,
    saved: Math.min(target, Math.max(0, Number(raw?.saved) || 0)),
    deadline: Number(raw?.deadline) || null,
    color: typeof raw?.color === 'string' ? raw.color : '#2EC4B6',
  }
}

function normalizeRecurring(raw) {
  const type = raw?.type === 'income' ? 'income' : 'expense'
  const cat = categoryById(raw?.cat)
  return {
    id: raw?.id ?? uid(),
    cat: cat.type === type ? cat.id : type === 'income' ? 'other-income' : 'other',
    note: String(raw?.note ?? '').slice(0, 80),
    amt: Math.max(0, Number(raw?.amt) || 0),
    type,
    freq: raw?.freq === 'weekly' ? 'weekly' : 'monthly',
    nextDue: Number(raw?.nextDue) || Date.now(),
    active: raw?.active !== false,
  }
}

// Move a timestamp forward one billing period, keeping the day-of-month when
// possible (31 Jan -> 28 Feb, not 3 Mar).
function advance(ts, freq) {
  const d = new Date(ts)
  if (freq === 'weekly') {
    d.setDate(d.getDate() + 7)
    return d.getTime()
  }
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + 1)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return d.getTime()
}

function setBudget(n) {
  if (!(n > 0)) return
  budget.value = n
  setJSON(BUDGET_KEY, n).then(refreshWidget)
}

function setCategoryBudget(catId, amount) {
  const next = { ...categoryBudgets.value }
  const n = Number(amount)
  if (n > 0) next[catId] = Math.round(n)
  else delete next[catId]
  categoryBudgets.value = next
}

// Post any recurring entries that became due while the app was closed.
function postDueRecurring() {
  const stamp = Date.now()
  let changed = false
  recurring.value.forEach((rule) => {
    if (!rule.active) return
    let guard = 0
    while (rule.nextDue <= stamp && guard < 60) {
      items.value.unshift(
        normalizeItem({
          cat: rule.cat,
          note: rule.note,
          amt: rule.amt,
          type: rule.type,
          t: rule.nextDue,
          recurringId: rule.id,
        }),
      )
      rule.nextDue = advance(rule.nextDue, rule.freq)
      changed = true
      guard++
    }
  })
  return changed
}

// Call once before mounting the app.
export async function loadStore() {
  const [savedBudget, savedItems, savedCats, savedGoals, savedRecurring] = await Promise.all([
    getJSON(BUDGET_KEY, DEFAULT_BUDGET),
    getJSON(EXPENSES_KEY, []),
    getJSON(CAT_BUDGETS_KEY, {}),
    getJSON(GOALS_KEY, []),
    getJSON(RECURRING_KEY, []),
  ])
  budget.value = savedBudget > 0 ? savedBudget : DEFAULT_BUDGET
  items.value = Array.isArray(savedItems)
    ? savedItems.map(normalizeItem).filter((e) => e.amt > 0)
    : []
  categoryBudgets.value = savedCats && typeof savedCats === 'object' ? savedCats : {}
  goals.value = Array.isArray(savedGoals) ? savedGoals.map(normalizeGoal) : []
  recurring.value = Array.isArray(savedRecurring) ? savedRecurring.map(normalizeRecurring) : []
  postDueRecurring()
}

watch(
  items,
  (v) => {
    setJSON(EXPENSES_KEY, v)
    refreshWidget()
  },
  { deep: true },
)
watch(budget, (v) => refreshWidget())
watch(categoryBudgets, (v) => setJSON(CAT_BUDGETS_KEY, v), { deep: true })
watch(goals, (v) => setJSON(GOALS_KEY, v), { deep: true })
watch(recurring, (v) => setJSON(RECURRING_KEY, v), { deep: true })

const monthItems = computed(() =>
  items.value.filter((e) => monthKeyOf(e.t) === selectedMonth.value),
)
const monthExpenses = computed(() => monthItems.value.filter((e) => e.type !== 'income'))
const monthIncome = computed(() => monthItems.value.filter((e) => e.type === 'income'))

const spent = computed(() => monthExpenses.value.reduce((s, e) => s + e.amt, 0))
const income = computed(() => monthIncome.value.reduce((s, e) => s + e.amt, 0))
const net = computed(() => income.value - spent.value)
const left = computed(() => budget.value - spent.value)
const pctUsed = computed(() =>
  budget.value > 0 ? Math.round((spent.value / budget.value) * 100) : 0,
)
const monthDays = computed(() => daysInMonth(selectedMonth.value))
const elapsedDays = computed(() => {
  if (selectedMonth.value === currentMonth) return now.getDate()
  if (selectedMonth.value < currentMonth) return monthDays.value
  return 0
})
const daysLeft = computed(() => {
  if (selectedMonth.value !== currentMonth) return 0
  return monthDays.value - now.getDate() + 1
})
const perDay = computed(() =>
  left.value > 0 && daysLeft.value > 0 ? left.value / daysLeft.value : 0,
)
const isCurrentMonth = computed(() => selectedMonth.value === currentMonth)
const monthName = computed(() => monthLabel(selectedMonth.value))
const canGoForward = computed(() => selectedMonth.value < currentMonth)

const segments = computed(() => {
  const total = Math.max(budget.value, spent.value)
  const sums = {}
  monthExpenses.value.forEach((e) => (sums[e.cat] = (sums[e.cat] ?? 0) + e.amt))
  return Object.keys(sums)
    .map((id) => {
      const c = categoryById(id)
      const amt = sums[id]
      return {
        id,
        name: c.name,
        color: c.color,
        amt,
        pct: (amt / total) * 100,
        share: spent.value > 0 ? (amt / spent.value) * 100 : 0,
      }
    })
    .sort((a, b) => b.amt - a.amt)
})

const week = computed(() => {
  const end =
    selectedMonth.value === currentMonth
      ? now
      : new Date(Math.floor(selectedMonth.value / 100), selectedMonth.value % 100, 0)
  const days = []
  for (let n = 6; n >= 0; n--) {
    const d = new Date(end)
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - n)
    days.push(d)
  }
  const totals = days.map((d) =>
    items.value
      .filter((e) => e.type !== 'income' && dayKey(new Date(e.t)) === dayKey(d))
      .reduce((s, e) => s + e.amt, 0),
  )
  const max = Math.max(...totals, 1)
  return days.map((d, i) => ({
    k: dayKey(d),
    today: dayKey(d) === todayKey,
    label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    amt: totals[i],
    h: Math.max(6, (totals[i] / max) * 70),
  }))
})

const history = computed(() => {
  const out = []
  for (let n = 5; n >= 0; n--) {
    const key = addMonths(selectedMonth.value, -n)
    const list = items.value.filter((e) => monthKeyOf(e.t) === key)
    out.push({
      k: key,
      label: monthShort(key),
      spent: list.filter((e) => e.type !== 'income').reduce((s, e) => s + e.amt, 0),
      income: list.filter((e) => e.type === 'income').reduce((s, e) => s + e.amt, 0),
    })
  }
  return out
})
const historyMax = computed(() => Math.max(...history.value.map((h) => h.spent), 1))


const filtersActive = computed(
  () =>
    filters.value.q.trim() !== '' ||
    filters.value.cat !== 'all' ||
    filters.value.type !== 'all' ||
    filters.value.scope === 'all',
)

const filteredItems = computed(() => {
  const { q, cat, type, scope } = filters.value
  const needle = q.trim().toLowerCase()
  return items.value.filter((e) => {
    if (scope === 'month' && monthKeyOf(e.t) !== selectedMonth.value) return false
    if (cat !== 'all' && e.cat !== cat) return false
    if (type !== 'all' && e.type !== type) return false
    if (!needle) return true
    return `${e.note} ${categoryById(e.cat).name}`.toLowerCase().includes(needle)
  })
})

const groups = computed(() => {
  const map = new Map()
  ;[...filteredItems.value]
    .sort((a, b) => b.t - a.t)
    .forEach((e) => {
      const k = dayKey(new Date(e.t))
      if (!map.has(k)) map.set(k, { k, t: e.t, items: [], total: 0, income: 0 })
      const g = map.get(k)
      g.items.push(e)
      if (e.type === 'income') g.income += e.amt
      else g.total += e.amt
    })
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return [...map.values()].map((g) => ({
    k: g.k,
    total: g.total,
    income: g.income,
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

const categoryRows = computed(() =>
  EXPENSE_CATEGORIES.map((c) => {
    const limit = Number(categoryBudgets.value[c.id]) || 0
    const used = monthExpenses.value
      .filter((e) => e.cat === c.id)
      .reduce((s, e) => s + e.amt, 0)
    return {
      ...c,
      limit,
      used,
      pct: limit > 0 ? (used / limit) * 100 : 0,
      over: limit > 0 && used > limit,
    }
  })
    .filter((r) => r.limit > 0)
    .sort((a, b) => b.pct - a.pct),
)
const overCategories = computed(() => categoryRows.value.filter((r) => r.over))

const insights = computed(() => {
  const previous = history.value[history.value.length - 2]
  const previousSpent = previous?.spent ?? 0
  const biggest = [...monthExpenses.value].sort((a, b) => b.amt - a.amt)[0] ?? null
  const activeDays = new Set(monthExpenses.value.map((e) => dayKey(new Date(e.t)))).size
  return {
    dailyAvg: elapsedDays.value > 0 ? spent.value / elapsedDays.value : 0,
    projected: elapsedDays.value > 0 ? (spent.value / elapsedDays.value) * monthDays.value : 0,
    top: segments.value[0] ?? null,
    biggest,
    activeDays,
    avgActive: activeDays > 0 ? spent.value / activeDays : 0,
    previousSpent,
    delta:
      previousSpent > 0 ? ((spent.value - previousSpent) / previousSpent) * 100 : null,
    savingsRate: income.value > 0 ? (net.value / income.value) * 100 : null,
    overCount: overCategories.value.length,
  }
})

const recurringList = computed(() =>
  [...recurring.value].sort(
    (a, b) => Number(b.active) - Number(a.active) || a.nextDue - b.nextDue,
  ),
)


function add(p) {
  const id = uid()
  const item = normalizeItem({ ...p, id, t: p.t ?? Date.now() })
  items.value.unshift(item)
  if (p.repeat === 'weekly' || p.repeat === 'monthly') {
    recurring.value.push({
      id: uid(),
      cat: item.cat,
      note: item.note,
      amt: item.amt,
      type: item.type,
      freq: p.repeat,
      nextDue: advance(item.t, p.repeat),
      active: true,
    })
  }
  selectedMonth.value = monthKeyOf(item.t)
  return id
}

function duplicate(id) {
  const source = items.value.find((x) => x.id === id)
  if (!source) return null
  const copy = normalizeItem({
    ...source,
    id: uid(),
    t: Date.now(),
    recurringId: null,
    note: source.note ? `${source.note} (copy)` : '',
  })
  items.value.unshift(copy)
  selectedMonth.value = monthKeyOf(copy.t)
  return copy.id
}

function update(id, patch) {
  const e = items.value.find((x) => x.id === id)
  if (!e) return
  Object.assign(e, normalizeItem({ ...e, ...patch, id }))
  selectedMonth.value = monthKeyOf(e.t)
}

function remove(id) {
  const index = items.value.findIndex((x) => x.id === id)
  if (index === -1) return null
  const [item] = items.value.splice(index, 1)
  return { item, index }
}

function restore(entry = {}) {
  if (!entry.item) return
  const next = [...items.value]
  next.splice(Math.min(Math.max(entry.index ?? 0, 0), next.length), 0, entry.item)
  items.value = next
  selectedMonth.value = monthKeyOf(entry.item.t)
}

function shiftMonth(delta) {
  const next = addMonths(selectedMonth.value, delta)
  if (next > currentMonth) return
  selectedMonth.value = next
}

function goToMonth(key) {
  if (key <= currentMonth) selectedMonth.value = key
}

function goToday() {
  selectedMonth.value = currentMonth
}

function setFilter(patch) {
  filters.value = { ...filters.value, ...patch }
}

function resetFilters() {
  filters.value = { q: '', cat: 'all', type: 'all', scope: 'month' }
}

// ---- Goals -------------------------------------------------------------

function addGoal({ name, target, deadline }) {
  const t = Math.round(Number(target))
  if (!name?.trim() || !(t > 0)) return null
  const due = deadline
    ? Number(deadline) > 0
      ? Number(deadline)
      : fromDateInput(deadline)
    : null
  const goal = normalizeGoal({
    name: name.trim(),
    target: t,
    deadline: due,
    color: ['#2EC4B6', '#FF7A59', '#8B7BFF', '#F59E0B', '#EC4899'][goals.value.length % 5],
  })
  goals.value.push(goal)
  return goal.id
}

function contributeGoal(id, delta) {
  const goal = goals.value.find((g) => g.id === id)
  if (!goal) return
  goal.saved = Math.min(goal.target, Math.max(0, goal.saved + Number(delta || 0)))
}

function removeGoal(id) {
  goals.value = goals.value.filter((g) => g.id !== id)
}

// ---- Recurring ---------------------------------------------------------

function addRecurring(p) {
  const r = normalizeRecurring({
    ...p,
    freq: p.freq === 'weekly' ? 'weekly' : 'monthly',
    nextDue: p.nextDue ?? advance(Date.now(), p.freq),
  })
  if (!(r.amt > 0)) return
  recurring.value.push(r)
}

function removeRecurring(id) {
  recurring.value = recurring.value.filter((r) => r.id !== id)
}

function toggleRecurring(id) {
  const r = recurring.value.find((x) => x.id === id)
  if (r) r.active = !r.active
}

function runRecurringNow(id) {
  const r = recurring.value.find((x) => x.id === id)
  if (!r) return
  items.value.unshift(
    normalizeItem({
      cat: r.cat,
      note: r.note,
      amt: r.amt,
      type: r.type,
      t: Date.now(),
      recurringId: r.id,
    }),
  )
  r.nextDue = advance(Math.max(r.nextDue, Date.now()), r.freq)
  selectedMonth.value = currentMonth
}


// ---- Import / export ---------------------------------------------------

export function exportData() {
  return {
    app: 'Nsimbi',
    schema: 2,
    exportedAt: new Date().toISOString(),
    budget: budget.value,
    categoryBudgets: categoryBudgets.value,
    items: items.value,
    goals: goals.value,
    recurring: recurring.value,
  }
}

export function exportCSV() {
  const escape = (value) => {
    const s = String(value ?? '')
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
  }
  const rows = [['date', 'type', 'category', 'note', 'amount']]
  ;[...items.value]
    .sort((a, b) => a.t - b.t)
    .forEach((e) =>
      rows.push([dateInputValue(e.t), e.type, categoryById(e.cat).name, e.note, e.amt]),
    )
  return rows.map((r) => r.map(escape).join(',')).join('\n')
}

export function importData(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
    throw new Error('That file does not look like an Nsimbi backup.')
  }
  items.value = data.items.map(normalizeItem).filter((e) => e.amt > 0)
  if (data.budget > 0) budget.value = data.budget
  categoryBudgets.value =
    data.categoryBudgets && typeof data.categoryBudgets === 'object'
      ? data.categoryBudgets
      : {}
  goals.value = Array.isArray(data.goals) ? data.goals.map(normalizeGoal) : []
  recurring.value = Array.isArray(data.recurring)
    ? data.recurring.map(normalizeRecurring)
    : []
  selectedMonth.value = items.value.length
    ? monthKeyOf(Math.max(...items.value.map((e) => e.t)))
    : currentMonth
  return {
    items: items.value.length,
    goals: goals.value.length,
    recurring: recurring.value.length,
  }
}

export function importCSVText(text) {
  const rows = parseCSV(text)
  if (rows.length < 2) throw new Error('The CSV has no data rows.')
  const header = rows[0].map((h) => h.trim().toLowerCase())
  const find = (name) => header.indexOf(name)
  const dateIdx = find('date')
  const amountIdx = find('amount')
  const typeIdx = find('type')
  const catIdx = find('category')
  const noteIdx = find('note')
  if (amountIdx === -1) throw new Error('The CSV needs an "amount" column.')

  const imported = []
  for (const row of rows.slice(1)) {
    const amt = Math.abs(Number(String(row[amountIdx] ?? '').replaceAll(',', '')))
    if (!Number.isFinite(amt) || amt === 0) continue
    const rawDate = dateIdx === -1 ? '' : String(row[dateIdx] ?? '').trim()
    let t = Date.now()
    if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) t = fromDateInput(rawDate.slice(0, 10))
    else if (rawDate) {
      const parsed = new Date(rawDate)
      if (!Number.isNaN(parsed.getTime())) t = parsed.getTime()
    }
    const type =
      typeIdx !== -1 && String(row[typeIdx]).toLowerCase() === 'income'
        ? 'income'
        : 'expense'
    const category = catIdx === -1 ? null : categoryByName(row[catIdx])
    const cat =
      category && category.type === type
        ? category.id
        : type === 'income'
          ? 'other-income'
          : 'other'
    imported.push(
      normalizeItem({ cat, note: noteIdx === -1 ? '' : row[noteIdx], amt, type, t }),
    )
  }
  if (!imported.length) throw new Error('No valid rows found in that CSV.')
  items.value = imported
  selectedMonth.value = monthKeyOf(Math.max(...imported.map((e) => e.t)))
  return { items: imported.length }
}

export function clearFinancialData() {
  items.value = []
  goals.value = []
  recurring.value = []
  categoryBudgets.value = {}
  budget.value = DEFAULT_BUDGET
  selectedMonth.value = currentMonth
  resetFilters()
}

export function useExpenses() {
  return {
    budget,
    items,
    categoryBudgets,
    goals,
    recurring,
    selectedMonth,
    filters,
    filtersActive,
    setFilter,
    resetFilters,
    setBudget,
    setCategoryBudget,
    monthName,
    monthItems,
    monthExpenses,
    monthIncome,
    isCurrentMonth,
    canGoForward,
    todayKey,
    spent,
    income,
    net,
    left,
    monthDays,
    daysLeft,
    elapsedDays,
    perDay,
    pctUsed,
    segments,
    week,
    history,
    historyMax,
    groups,
    filteredItems,
    categoryRows,
    overCategories,
    insights,
    recurringList,
    add,
    duplicate,
    update,
    remove,
    restore,
    shiftMonth,
    goToMonth,
    goToday,
    addGoal,
    contributeGoal,
    removeGoal,
    addRecurring,
    removeRecurring,
    toggleRecurring,
    runRecurringNow,
    exportData,
    exportCSV,
    importData,
    importCSVText,
    clearFinancialData,
  }
}
