<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import BottomSheet from './BottomSheet.vue'
import CategoryBudgetPanel from './CategoryBudgetPanel.vue'
import GoalsPanel from './GoalsPanel.vue'
import RecurringPanel from './RecurringPanel.vue'
import { useExpenses } from '../composables/useExpenses'

defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close', 'add', 'edit-budget'])
const { categoryRows, goals, recurring } = useExpenses()
const tab = ref('budgets')
</script>

<template>
  <BottomSheet :open="open" title="Plan & automate" @close="emit('close')">
    <div class="tabs" role="tablist" aria-label="Planning sections">
      <button role="tab" :aria-selected="tab === 'budgets'" :class="{ on: tab === 'budgets' }" @click="tab = 'budgets'">
        <AppIcon name="chart" />Limits
        <span v-if="categoryRows.length">{{ categoryRows.length }}</span>
      </button>
      <button role="tab" :aria-selected="tab === 'goals'" :class="{ on: tab === 'goals' }" @click="tab = 'goals'">
        <AppIcon name="target" />Goals
        <span v-if="goals.length">{{ goals.length }}</span>
      </button>
      <button role="tab" :aria-selected="tab === 'recurring'" :class="{ on: tab === 'recurring' }" @click="tab = 'recurring'">
        <AppIcon name="repeat" />Repeat
        <span v-if="recurring.length">{{ recurring.length }}</span>
      </button>
    </div>

    <div class="panel">
      <CategoryBudgetPanel v-if="tab === 'budgets'" />
      <GoalsPanel v-else-if="tab === 'goals'" />
      <RecurringPanel v-else @add="emit('add')" />
    </div>

    <button v-if="tab === 'budgets'" class="monthly-budget" @click="emit('edit-budget')">
      Change the overall monthly budget
      <AppIcon name="right" />
    </button>
  </BottomSheet>
</template>

<style scoped>
.tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 4px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); margin: 10px 0 14px; }
.tabs button { height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 5px; font-size: 13px; color: var(--mute); font-weight: 600; }
.tabs button svg { width: 16px; height: 16px; }
.tabs button.on { background: var(--surface); color: var(--ink); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); }
.tabs button span { min-width: 17px; height: 17px; border-radius: 9px; background: var(--empty); font-size: 10px; display: grid; place-items: center; padding: 0 4px; }
.monthly-budget { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; margin-top: 16px; padding: 12px; font-size: 13px; color: var(--accent); font-weight: 600; }
.monthly-budget svg { width: 14px; height: 14px; }
</style>
