<script setup>
import BottomSheet from './BottomSheet.vue'
import { CATEGORIES, categoryById } from '../data/categories'
import { useExpenses } from '../composables/useExpenses'

defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close'])
const { filters, setFilter, resetFilters, filteredItems } = useExpenses()

function setType(type) {
  const patch = { type }
  if (filters.value.cat !== 'all' && type !== 'all' && categoryById(filters.value.cat).type !== type) {
    patch.cat = 'all'
  }
  setFilter(patch)
}
</script>

<template>
  <BottomSheet :open="open" title="Filter entries" @close="emit('close')">
    <div class="sheet-label">Search</div>
    <input
      class="field"
      :value="filters.q"
      type="search"
      placeholder="Note or category"
      aria-label="Search note or category"
      @input="setFilter({ q: $event.target.value })"
    />

    <div class="sheet-label">Type</div>
    <div class="seg" role="group" aria-label="Entry type">
      <button :class="{ on: filters.type === 'all' }" :aria-pressed="filters.type === 'all'" @click="setType('all')">All</button>
      <button :class="{ on: filters.type === 'expense' }" :aria-pressed="filters.type === 'expense'" @click="setType('expense')">Expenses</button>
      <button :class="{ on: filters.type === 'income' }" :aria-pressed="filters.type === 'income'" @click="setType('income')">Income</button>
    </div>

    <div class="sheet-label">Period</div>
    <div class="seg" role="group" aria-label="Period">
      <button :class="{ on: filters.scope === 'month' }" :aria-pressed="filters.scope === 'month'" @click="setFilter({ scope: 'month' })">
        Selected month
      </button>
      <button :class="{ on: filters.scope === 'all' }" :aria-pressed="filters.scope === 'all'" @click="setFilter({ scope: 'all' })">
        All time
      </button>
    </div>

    <div class="sheet-label">Category</div>
    <div class="cats">
      <button class="cat" :class="{ on: filters.cat === 'all' }" :aria-pressed="filters.cat === 'all'" @click="setFilter({ cat: 'all' })">
        All
      </button>
      <button
        v-for="c in CATEGORIES"
        :key="c.id"
        class="cat"
        :class="{ on: filters.cat === c.id }"
        :style="{ '--c': c.color }"
        :aria-pressed="filters.cat === c.id"
        @click="setFilter({ cat: c.id })"
      >
        <i></i>{{ c.name }}<small v-if="c.type === 'income'">in</small>
      </button>
    </div>

    <div class="foot">
      <button class="btn" @click="resetFilters">Reset</button>
      <button class="btn primary" @click="emit('close')">
        Show {{ filteredItems.length }}
      </button>
    </div>
  </BottomSheet>
</template>

<style scoped>
.cats { display: flex; flex-wrap: wrap; gap: 8px; }
.cat { display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); font-size: 13px; color: var(--mute); }
.cat i { width: 8px; height: 8px; border-radius: 50%; background: var(--c, var(--mute)); }
.cat small { font-size: 10px; opacity: 0.7; }
.cat.on { border-color: var(--c, var(--brand)); color: var(--ink); font-weight: 700; background: color-mix(in srgb, var(--c, var(--brand)) 10%, var(--surface)); }
.foot { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; margin-top: 22px; }
.btn { min-height: 50px; }
</style>
