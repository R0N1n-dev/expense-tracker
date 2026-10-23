<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { categoryById } from '../data/categories'
import { useExpenses } from '../composables/useExpenses'
import { fmt, longDate, shortDate } from '../lib/format'

const emit = defineEmits(['add'])
const { recurringList, toggleRecurring, runRecurringNow, removeRecurring } = useExpenses()
const confirming = ref('')

function remove(id) {
  if (confirming.value !== id) {
    confirming.value = id
    return
  }
  removeRecurring(id)
  confirming.value = ''
}
</script>

<template>
  <p class="hint">
    Rent, salary, subscriptions, tithe. Due entries post themselves the next time you open Nsimbi,
    and they keep the original day of the month.
  </p>

  <button class="btn primary add-btn" @click="emit('add')">
    <AppIcon name="plus" />New recurring entry
  </button>

  <div v-if="recurringList.length" class="stack rules">
    <div v-for="r in recurringList" :key="r.id" class="rule card" :class="{ off: !r.active }">
      <div class="badge" :style="{ '--c': categoryById(r.cat).color }">
        <AppIcon :name="categoryById(r.cat).icon" />
      </div>
      <div class="body">
        <b>{{ r.note || categoryById(r.cat).name }}</b>
        <small>
          {{ r.type === 'income' ? 'Income' : categoryById(r.cat).name }} ·
          {{ r.freq === 'weekly' ? 'Weekly' : 'Monthly' }} ·
          {{ r.active ? `next ${shortDate(r.nextDue)}` : 'paused' }}
        </small>
      </div>
      <div class="amt">{{ r.type === 'income' ? '+' : '' }}{{ fmt(r.amt) }}</div>
      <div class="tools">
        <button
          class="switch"
          :class="{ on: r.active }"
          :aria-pressed="r.active"
          :aria-label="`${r.active ? 'Pause' : 'Resume'} ${r.note || categoryById(r.cat).name}`"
          @click="toggleRecurring(r.id)"
        >
          <span></span>
        </button>
        <button class="mini-btn" aria-label="Post now" title="Post now" @click="runRecurringNow(r.id)">
          <AppIcon name="bolt" />
        </button>
        <button
          class="mini-btn"
          :aria-label="`Delete ${r.note || categoryById(r.cat).name}`"
          @click="remove(r.id)"
        >
          <AppIcon :name="confirming === r.id ? 'check' : 'trash'" />
        </button>
      </div>
      <p v-if="confirming === r.id" class="confirm">
        Tap the trash again to stop this rule. Past entries stay.
      </p>
      <p v-if="r.active" class="next">Due {{ longDate(r.nextDue) }}</p>
    </div>
  </div>
  <p v-else class="empty-state">
    No recurring entries yet. Use “New recurring entry”, or tick Repeat when adding one.
  </p>
</template>

<style scoped>
.hint { margin: 0 0 12px; font-size: 13px; color: var(--mute); line-height: 1.45; }
.add-btn { width: 100%; margin-bottom: 12px; }
.rules { margin-top: 4px; }
.rule { display: grid; grid-template-columns: 40px 1fr auto; gap: 10px; align-items: center; padding: 11px 12px; }
.rule.off { opacity: 0.62; }
.badge { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; color: var(--c); background: color-mix(in srgb, var(--c) 18%, transparent); }
.badge svg { width: 20px; height: 20px; }
.body { min-width: 0; }
.body b { display: block; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.body small { font-size: 11px; color: var(--mute); }
.amt { font-weight: 700; font-size: 14px; }
.tools { grid-column: 1 / -1; display: flex; justify-content: flex-end; align-items: center; gap: 6px; }
.switch { width: 42px; height: 24px; border-radius: 12px; background: var(--empty); padding: 3px; transition: background 0.2s; }
.switch span { display: block; width: 18px; height: 18px; border-radius: 50%; background: var(--surface); transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2); }
.switch.on { background: var(--brand); }
.switch.on span { transform: translateX(18px); }
.mini-btn { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; color: var(--mute); border: 1px solid var(--line); }
.confirm { grid-column: 1 / -1; margin: 2px 0 0; font-size: 11px; color: var(--over); }
.next { grid-column: 1 / -1; margin: 0; font-size: 11px; color: var(--mute); }
</style>
