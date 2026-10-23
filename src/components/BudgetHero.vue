<script setup>
import AppIcon from './AppIcon.vue'
import { useExpenses } from '../composables/useExpenses'
import { fmt } from '../lib/format'

defineEmits(['edit-budget'])
const {
  budget,
  spent,
  income,
  net,
  left,
  daysLeft,
  perDay,
  pctUsed,
  segments,
  monthName,
  isCurrentMonth,
  elapsedDays,
  overCategories,
  categoryRows,
} = useExpenses()
</script>

<template>
  <section class="hero">
    <div class="hero-top">
      <div>
        <div class="sub">{{ isCurrentMonth ? 'Spent this month' : `Spent in ${monthName}` }}</div>
        <p class="amt"><small>UGX</small>{{ fmt(spent) }}</p>
      </div>
      <button class="budget-chip" aria-label="Change monthly budget" @click="$emit('edit-budget')">
        <span>Budget</span>
        <b>UGX {{ fmt(budget) }}</b>
        <AppIcon name="pencil" />
      </button>
    </div>

    <div class="stats">
      <div class="stat">
        <span>Income</span>
        <b class="in">+{{ fmt(income) }}</b>
      </div>
      <div class="stat">
        <span>Net cashflow</span>
        <b :class="{ neg: net < 0 }">{{ net < 0 ? '−' : '+' }}{{ fmt(Math.abs(net)) }}</b>
      </div>
      <div class="stat">
        <span>{{ left >= 0 ? 'Budget left' : 'Over budget' }}</span>
        <b :class="{ neg: left < 0 }">{{ fmt(Math.abs(left)) }}</b>
      </div>
    </div>

    <div class="bar-wrap">
      <div
        class="bar"
        role="img"
        :aria-label="`Spending by category, ${pctUsed} percent of budget used`"
      >
        <span v-for="s in segments" :key="s.id" :style="{ width: s.pct + '%', background: s.color }"></span>
      </div>
      <span class="pct" :class="{ over: pctUsed > 100 }">{{ pctUsed }}%</span>
    </div>

    <div v-if="segments.length" class="legend">
      <span v-for="s in segments.slice(0, 4)" :key="s.id">
        <i :style="{ background: s.color }"></i>{{ s.name }} {{ fmt(s.amt) }}
      </span>
    </div>

    <p v-if="isCurrentMonth && left >= 0" class="pace">
      UGX <b>{{ fmt(left) }}</b> left for {{ daysLeft }} days. That is
      <b>UGX {{ fmt(perDay) }}</b> a day.
    </p>
    <p v-else-if="isCurrentMonth" class="pace">
      You are <b>UGX {{ fmt(-left) }}</b> over budget this month.
    </p>
    <p v-else-if="elapsedDays" class="pace">
      Average of <b>UGX {{ fmt(spent / elapsedDays) }}</b> a day over
      {{ elapsedDays }} days.
    </p>

    <div v-if="overCategories.length" class="alerts" role="status">
      <AppIcon name="bolt" />
      <span>
        Over limit:
        <b>{{ overCategories.map((c) => c.name).join(', ') }}</b>
      </span>
    </div>
    <button v-if="categoryRows.length" class="limit-link" @click="$emit('open-plan')">
      {{ categoryRows.length }} category limit{{ categoryRows.length === 1 ? '' : 's' }} set
      <AppIcon name="right" />
    </button>
  </section>
</template>

<style scoped>
.hero { margin-top: 22px; }
.hero-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
.amt { font-size: clamp(36px, 11.5vw, 48px); font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin: 6px 0 0; }
.amt small { font-size: 17px; font-weight: 500; color: var(--mute); letter-spacing: 0; margin-right: 6px; }
.budget-chip { display: grid; gap: 1px; justify-items: end; padding: 8px 10px; border-radius: 12px; border: 1px solid var(--line); background: var(--surface); font-size: 11px; color: var(--mute); }
.budget-chip b { font-size: 12px; color: var(--ink); }
.budget-chip svg { width: 12px; height: 12px; margin-top: 2px; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 18px; }
.stat { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 9px 11px; display: grid; gap: 3px; min-width: 0; }
.stat span { font-size: 11px; color: var(--mute); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stat b { font-size: 15px; font-weight: 700; }
.stat b.in { color: var(--ok); }
.stat b.neg { color: var(--over); }
.bar-wrap { display: flex; align-items: center; gap: 10px; margin: 20px 0 12px; }
.bar { display: flex; gap: 3px; height: 30px; flex: 1; border-radius: 15px; background: var(--empty); overflow: hidden; }
.bar span { display: block; height: 100%; min-width: 6px; transition: width 0.5s; }
.pct { font-size: 12px; font-weight: 700; color: var(--mute); min-width: 38px; text-align: right; }
.pct.over { color: var(--over); }
.legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px; }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
.pace { margin: 16px 0 0; font-size: 14px; padding: 13px 15px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }
.pace b { font-weight: 700; }
.alerts { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, var(--over) 12%, transparent); color: var(--over); font-size: 13px; }
.alerts svg { width: 16px; height: 16px; }
.limit-link { display: flex; align-items: center; gap: 4px; margin-top: 10px; padding: 4px 0; color: var(--accent); font-size: 13px; font-weight: 600; }
.limit-link svg { width: 14px; height: 14px; }
</style>
