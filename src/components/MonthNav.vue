<script setup>
import AppIcon from './AppIcon.vue'
import { useExpenses } from '../composables/useExpenses'

const { monthName, isCurrentMonth, canGoForward, shiftMonth, goToday } = useExpenses()
</script>

<template>
  <div class="nav">
    <button class="icon-btn plain" aria-label="Previous month" @click="shiftMonth(-1)">
      <AppIcon name="left" />
    </button>
    <div class="lbl">
      <b aria-live="polite">{{ monthName }}</b>
      <button v-if="!isCurrentMonth" class="today" @click="goToday">Back to this month</button>
      <span v-else class="current">This month</span>
    </div>
    <button
      class="icon-btn plain"
      aria-label="Next month"
      :disabled="!canGoForward"
      @click="shiftMonth(1)"
    >
      <AppIcon name="right" />
    </button>
  </div>
</template>

<style scoped>
.nav { display: flex; align-items: center; gap: 4px; }
.lbl { flex: 1; text-align: center; display: grid; gap: 1px; }
.lbl b { font-size: 15px; font-weight: 700; }
.current { font-size: 11px; color: var(--mute); }
.today { font-size: 11px; color: var(--accent); font-weight: 600; padding: 1px; }
.icon-btn:disabled { opacity: 0.3; }
</style>
