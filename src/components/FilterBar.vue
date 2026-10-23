<script setup>
import AppIcon from './AppIcon.vue'
import { useExpenses } from '../composables/useExpenses'

defineEmits(['open-filters'])
const { filters, filtersActive, setFilter, resetFilters, filteredItems, isCurrentMonth } =
  useExpenses()
</script>

<template>
  <div class="bar">
    <label class="search">
      <AppIcon name="search" />
      <input
        :value="filters.q"
        type="search"
        :placeholder="filters.scope === 'all' ? 'Search all entries' : 'Search this month'"
        aria-label="Search entries"
        @input="setFilter({ q: $event.target.value })"
      />
    </label>
    <button
      class="filter-btn"
      :class="{ on: filtersActive }"
      aria-label="Filters"
      @click="$emit('open-filters')"
    >
      <AppIcon name="filter" />
      <span v-if="filtersActive" class="dot"></span>
    </button>
  </div>
  <div v-if="filtersActive" class="active-row">
    <span class="pill">
      <b>{{ filteredItems.length }}</b>
      result{{ filteredItems.length === 1 ? '' : 's' }}
      <template v-if="filters.scope === 'all'">· all time</template>
      <template v-else-if="!isCurrentMonth">· selected month</template>
    </span>
    <button class="clear" @click="resetFilters">Clear</button>
  </div>
</template>

<style scoped>
.bar { display: flex; gap: 8px; align-items: center; }
.search { flex: 1; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 13px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); color: var(--mute); }
.search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-size: 14px; color: var(--ink); }
.search input::placeholder { color: var(--mute); }
.search svg { width: 17px; height: 17px; }
.filter-btn { position: relative; width: 44px; height: 44px; border-radius: 14px; border: 1px solid var(--line); background: var(--surface); display: grid; place-items: center; color: var(--mute); }
.filter-btn.on { color: var(--accent); border-color: var(--accent); }
.filter-btn .dot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); }
.active-row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.clear { font-size: 12px; font-weight: 600; color: var(--accent); padding: 4px; }
</style>
