<script setup>
import { useExpenses } from '../composables/useExpenses'
import { fmt } from '../lib/format'

const { spent, left, daysLeft, perDay, pctUsed, segments } = useExpenses()
</script>

<template>
  <section class="hero">
    <div class="sub">Spent this month</div>
    <p class="amt"><small>UGX</small>{{ fmt(spent) }}</p>
    <div
      class="bar"
      role="img"
      :aria-label="`Spending by category, ${pctUsed} percent of budget used`"
    >
      <span
        v-for="s in segments"
        :key="s.id"
        :style="{ width: s.pct + '%', background: s.color }"
      ></span>
    </div>
    <div class="legend">
      <span v-for="s in segments.slice(0, 4)" :key="s.id">
        <i :style="{ background: s.color }"></i>{{ s.name }} {{ fmt(s.amt) }}
      </span>
    </div>
    <p v-if="left >= 0" class="pace">
      UGX <b>{{ fmt(left) }}</b> left for {{ daysLeft }} days. That is
      <b>UGX {{ fmt(perDay) }}</b> a day.
    </p>
    <p v-else class="pace">
      You are <b>UGX {{ fmt(-left) }}</b> over budget this month.
    </p>
  </section>
</template>

<style scoped>
.hero { margin-top: 28px; }
.amt { font-size: 52px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin: 6px 0 0; }
.amt small { font-size: 18px; font-weight: 500; color: var(--mute); letter-spacing: 0; margin-right: 6px; }
.bar { display: flex; gap: 3px; height: 30px; margin: 22px 0 14px; border-radius: 15px; background: var(--empty); overflow: hidden; }
.bar span { display: block; height: 100%; min-width: 6px; transition: width 0.5s; }
.legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 14px; }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
.pace { margin: 16px 0 0; font-size: 15px; padding: 14px 16px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); }
.pace b { font-weight: 700; }
</style>
