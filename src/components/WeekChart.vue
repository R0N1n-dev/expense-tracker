<script setup>
import { useExpenses } from '../composables/useExpenses'

const { week } = useExpenses()
</script>

<template>
  <div class="week">
    <div v-for="d in week" :key="d.k" class="col" :class="{ today: d.today }">
      <div :style="{ height: d.h + 'px' }"></div>
      {{ d.label }}
    </div>
  </div>
</template>

<style scoped>
.week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; align-items: end; height: 112px; }
.col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 6px; height: 100%; font-size: 12px; color: var(--mute); }
.col div { width: 100%; max-width: 30px; border-radius: 8px; background: var(--empty); min-height: 6px; transition: height 0.5s; }
.col.today { color: var(--ink); font-weight: 700; }
.col.today div { background: var(--accent); }
</style>
