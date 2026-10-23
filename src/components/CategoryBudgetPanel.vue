<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { EXPENSE_CATEGORIES } from '../data/categories'
import { useExpenses } from '../composables/useExpenses'
import { fmt } from '../lib/format'

const { categoryRows, categoryBudgets, setCategoryBudget, budget } = useExpenses()

const editing = ref('')
const draft = ref('')
const newCat = ref(EXPENSE_CATEGORIES[0].id)
const newAmount = ref('')

const limitTotal = computed(() =>
  Object.values(categoryBudgets.value).reduce((s, n) => s + (Number(n) || 0), 0),
)

function start(row) {
  editing.value = row.id
  draft.value = String(row.limit)
}

function saveRow(id) {
  setCategoryBudget(id, draft.value)
  editing.value = ''
}

function addLimit() {
  if (!(Number(newAmount.value) > 0)) return
  setCategoryBudget(newCat.value, newAmount.value)
  newAmount.value = ''
}
</script>

<template>
  <p class="hint">
    Give a category its own monthly ceiling. Nsimbi warns you on the home screen and in Insights
    when you cross it.
  </p>

  <div v-if="categoryRows.length" class="stack">
    <div v-for="row in categoryRows" :key="row.id" class="limit card">
      <div class="row-between">
        <span class="name">
          <i :style="{ background: row.color }"></i>{{ row.name }}
        </span>
        <b :class="{ over: row.over }">UGX {{ fmt(row.used) }} / {{ fmt(row.limit) }}</b>
      </div>
      <div class="track" :class="{ over: row.over }">
        <i :style="{ width: Math.min(100, row.pct) + '%', background: row.over ? 'var(--over)' : row.color }"></i>
      </div>
      <div class="row-between foot">
        <small :class="{ over: row.over }">
          {{ row.over ? `UGX ${fmt(row.used - row.limit)} over` : `UGX ${fmt(row.limit - row.used)} left` }}
        </small>
        <div v-if="editing === row.id" class="edit">
          <input v-model="draft" type="number" inputmode="numeric" min="0" class="mini" aria-label="Limit amount" />
          <button class="btn tiny primary" @click="saveRow(row.id)">Save</button>
          <button class="btn tiny" @click="setCategoryBudget(row.id, 0); editing = ''">Clear</button>
        </div>
        <button v-else class="btn tiny" @click="start(row)">
          <AppIcon name="pencil" />Edit
        </button>
      </div>
    </div>
  </div>
  <p v-else class="empty-state">No category limits yet. Add one below.</p>

  <div class="sheet-label">Add or update a limit</div>
  <div class="add card">
    <select v-model="newCat" class="field" aria-label="Category">
      <option v-for="c in EXPENSE_CATEGORIES" :key="c.id" :value="c.id">
        {{ c.name }}{{ categoryBudgets[c.id] ? ` · currently ${fmt(categoryBudgets[c.id])}` : '' }}
      </option>
    </select>
    <div class="add-row">
      <input
        v-model="newAmount"
        class="field"
        type="number"
        inputmode="numeric"
        min="0"
        step="1000"
        placeholder="Limit in UGX"
        aria-label="Limit in UGX"
      />
      <button class="btn primary" :disabled="!(Number(newAmount) > 0)" @click="addLimit">Set</button>
    </div>
  </div>

  <p v-if="limitTotal > budget" class="notice warn total-warn">
    Your category limits add up to UGX {{ fmt(limitTotal) }}, more than your monthly budget of
    UGX {{ fmt(budget) }}.
  </p>
</template>

<style scoped>
.hint { margin: 0 0 12px; font-size: 13px; color: var(--mute); line-height: 1.45; }
.limit { display: grid; gap: 8px; padding: 12px 13px; }
.name { display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 600; }
.name i { width: 9px; height: 9px; border-radius: 50%; }
.row-between b { font-size: 13px; }
b.over, small.over { color: var(--over); }
.track { height: 7px; border-radius: 4px; background: var(--empty); overflow: hidden; }
.track i { display: block; height: 100%; border-radius: 4px; }
.foot small { color: var(--mute); font-size: 11px; }
.edit { display: flex; gap: 5px; align-items: center; }
.mini { width: 102px; height: 34px; border-radius: 9px; border: 1px solid var(--line); background: var(--bg); padding: 0 8px; font-size: 13px; }
.add { display: grid; gap: 8px; }
.add-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
.add-row .btn { min-width: 70px; }
.total-warn { margin-top: 12px; }
</style>
