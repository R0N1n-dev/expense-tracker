<script setup>
import AppIcon from './AppIcon.vue'
import BottomSheet from './BottomSheet.vue'
import { useExpenses } from '../composables/useExpenses'
import { fmt, longDate, monthLabel } from '../lib/format'

defineProps({ open: { type: Boolean, required: true } })
const emit = defineEmits(['close'])
const {
  monthName,
  isCurrentMonth,
  spent,
  income,
  net,
  perDay,
  daysLeft,
  insights,
  history,
  historyMax,
  overCategories,
  goToMonth,
} = useExpenses()

function pickMonth(key) {
  goToMonth(key)
  emit('close')
}
</script>

<template>
  <BottomSheet :open="open" title="Insights" @close="emit('close')">
    <p class="lede">{{ monthName }} · {{ isCurrentMonth ? 'live' : 'closed month' }}</p>

    <div class="summary card">
      <div>
        <span class="label">Spent</span>
        <b>UGX {{ fmt(spent) }}</b>
      </div>
      <div>
        <span class="label">Income</span>
        <b class="in">+{{ fmt(income) }}</b>
      </div>
      <div>
        <span class="label">Net</span>
        <b :class="{ neg: net < 0 }">{{ net < 0 ? '−' : '+' }}{{ fmt(Math.abs(net)) }}</b>
      </div>
    </div>

    <div class="grid">
      <div class="tile">
        <span>Daily average</span>
        <b>UGX {{ fmt(insights.dailyAvg) }}</b>
        <small>{{ insights.activeDays }} active days · {{ insights.activeDays ? 'UGX ' + fmt(insights.avgActive) + ' each' : 'none yet' }}</small>
      </div>
      <div class="tile">
        <span>Projected month</span>
        <b>UGX {{ fmt(insights.projected) }}</b>
        <small>at the current pace</small>
      </div>
      <div class="tile">
        <span>Safe daily spend</span>
        <b>UGX {{ fmt(perDay) }}</b>
        <small v-if="isCurrentMonth">{{ daysLeft }} days left</small>
        <small v-else>month closed</small>
      </div>
      <div class="tile">
        <span>Savings rate</span>
        <b>{{ insights.savingsRate === null ? '—' : Math.round(insights.savingsRate) + '%' }}</b>
        <small>of income kept</small>
      </div>
    </div>

    <div class="delta card" :class="{ good: insights.delta !== null && insights.delta <= 0 }">
      <AppIcon :name="insights.delta !== null && insights.delta <= 0 ? 'trend' : 'chart'" />
      <p v-if="insights.delta !== null">
        You spent
        <b>{{ Math.abs(Math.round(insights.delta)) }}% {{ insights.delta <= 0 ? 'less' : 'more' }}</b>
        than last month (UGX {{ fmt(insights.previousSpent) }}).
      </p>
      <p v-else>No spending recorded last month, so there is nothing to compare yet.</p>
    </div>

    <div v-if="insights.top" class="top card">
      <div class="row-between">
        <div>
          <span class="label">Biggest category</span>
          <b>{{ insights.top.name }}</b>
        </div>
        <div class="top-amt">
          UGX {{ fmt(insights.top.amt) }}
          <small>{{ Math.round(insights.top.share) }}%</small>
        </div>
      </div>
      <div class="track">
        <i
          :style="{
            width: Math.min(100, insights.top.share) + '%',
            background: insights.top.color,
          }"
        ></i>
      </div>
    </div>

    <div v-if="insights.biggest" class="card biggest">
      <span class="label">Largest single expense</span>
      <div class="row-between">
        <b>{{ insights.biggest.note || 'Untitled' }}</b>
        <b class="amt">UGX {{ fmt(insights.biggest.amt) }}</b>
      </div>
      <small class="muted">{{ longDate(insights.biggest.t) }}</small>
    </div>

    <div class="sheet-label">Last 6 months</div>
    <div class="chart" role="img" aria-label="Spending for the last six months">
      <button
        v-for="h in history"
        :key="h.k"
        class="col"
        :class="{ on: h.k === history[history.length - 1].k }"
        :title="`${monthLabel(h.k)}: UGX ${fmt(h.spent)}`"
        @click="pickMonth(h.k)"
      >
        <span class="val">{{ h.spent ? fmt(h.spent) : '' }}</span>
        <i :style="{ height: Math.max(4, (h.spent / historyMax) * 72) + 'px' }"></i>
        <span class="name">{{ h.label }}</span>
      </button>
    </div>

    <template v-if="overCategories.length">
      <div class="sheet-label">Over category limits</div>
      <div class="stack">
        <div v-for="c in overCategories" :key="c.id" class="over card">
          <span>{{ c.name }}</span>
          <b>UGX {{ fmt(c.used) }} / {{ fmt(c.limit) }}</b>
        </div>
      </div>
    </template>

    <p class="footnote">
      Projection extrapolates your average daily spend to the whole month. Tap a month bar to open
      it.
    </p>
  </BottomSheet>
</template>

<style scoped>
.lede { margin: 0 0 12px; font-size: 13px; color: var(--mute); }
.card { margin-bottom: 10px; }
.label { display: block; font-size: 11px; color: var(--mute); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.summary > div { display: grid; gap: 2px; min-width: 0; }
.summary b { font-size: clamp(13px, 4.2vw, 17px); }
.in { color: var(--ok); }
.neg { color: var(--over); }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.tile { background: var(--bg); border: 1px solid var(--line); border-radius: 14px; padding: 11px 12px; display: grid; gap: 2px; }
.tile span { font-size: 11px; color: var(--mute); }
.tile b { font-size: clamp(14px, 4.2vw, 16px); }
.tile small { font-size: 11px; color: var(--mute); }
.delta { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; border-left: 3px solid var(--over); }
.delta.good { border-left-color: var(--ok); }
.delta p { margin: 0; line-height: 1.4; }
.delta svg { width: 18px; height: 18px; color: var(--mute); margin-top: 2px; }
.top { display: grid; gap: 10px; }
.top b { font-size: 16px; }
.top-amt { text-align: right; font-weight: 700; display: grid; }
.top-amt small { font-size: 11px; color: var(--mute); font-weight: 500; }
.track { height: 8px; border-radius: 4px; background: var(--empty); overflow: hidden; }
.track i { display: block; height: 100%; border-radius: 4px; }
.biggest .row-between { margin: 3px 0; }
.biggest .amt { font-size: 15px; }
.biggest small { font-size: 12px; }
.chart { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; align-items: end; height: 132px; padding: 6px 2px 0; }
.col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 5px; height: 100%; font-size: 10px; color: var(--mute); }
.col i { width: 100%; max-width: 34px; border-radius: 6px 6px 2px 2px; background: var(--empty); display: block; }
.col.on i { background: var(--brand); }
.col .val { font-size: 9px; }
.col .name { font-weight: 600; }
.col.on { color: var(--ink); }
.over { display: flex; justify-content: space-between; gap: 10px; padding: 10px 12px; font-size: 13px; border-color: color-mix(in srgb, var(--over) 40%, var(--line)); }
.over b { color: var(--over); }
.footnote { font-size: 11px; color: var(--mute); margin: 16px 0 0; line-height: 1.4; }
</style>
