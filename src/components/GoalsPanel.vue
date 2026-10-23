<script setup>
import { reactive, ref } from 'vue'
import AppIcon from './AppIcon.vue'
import { useExpenses } from '../composables/useExpenses'
import { fmt, longDate } from '../lib/format'

const { goals, addGoal, contributeGoal, removeGoal } = useExpenses()

const name = ref('')
const target = ref('')
const deadline = ref('')
const contrib = reactive({})
const confirming = ref('')

function create() {
  if (!name.value.trim() || !(Number(target.value) > 0)) return
  addGoal({ name: name.value, target: target.value, deadline: deadline.value || null })
  name.value = ''
  target.value = ''
  deadline.value = ''
}

function apply(goal, sign) {
  const n = Number(contrib[goal.id])
  if (!(n > 0)) return
  contributeGoal(goal.id, n * sign)
  contrib[goal.id] = ''
}

function remove(id) {
  if (confirming.value !== id) {
    confirming.value = id
    return
  }
  removeGoal(id)
  confirming.value = ''
}

const pct = (goal) => (goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0)
</script>

<template>
  <p class="hint">
    Savings envelopes are separate from your spending budget: moving money into a goal does not
    count as an expense.
  </p>

  <div v-if="goals.length" class="stack">
    <div v-for="goal in goals" :key="goal.id" class="goal card">
      <div class="row-between head">
        <span class="name"><i :style="{ background: goal.color }"></i>{{ goal.name }}</span>
        <button class="icon-btn plain del" :aria-label="`Delete ${goal.name}`" @click="remove(goal.id)">
          <AppIcon :name="confirming === goal.id ? 'check' : 'trash'" />
        </button>
      </div>
      <div class="amounts">
        <b>UGX {{ fmt(goal.saved) }}</b>
        <span class="muted">of UGX {{ fmt(goal.target) }}</span>
        <b class="pct">{{ Math.round(pct(goal)) }}%</b>
      </div>
      <div class="track"><i :style="{ width: pct(goal) + '%', background: goal.color }"></i></div>
      <div class="row-between foot">
        <small class="muted">
          {{ goal.saved >= goal.target ? 'Goal reached 🎉' : `UGX ${fmt(goal.target - goal.saved)} to go` }}
          <template v-if="goal.deadline">· by {{ longDate(goal.deadline) }}</template>
        </small>
      </div>
      <div class="contribute">
        <input
          v-model="contrib[goal.id]"
          class="field mini"
          type="number"
          inputmode="numeric"
          min="0"
          placeholder="Amount"
          :aria-label="`Amount to add to ${goal.name}`"
        />
        <button class="btn tiny primary" :disabled="!(Number(contrib[goal.id]) > 0)" @click="apply(goal, 1)">
          <AppIcon name="plus" />Add
        </button>
        <button class="btn tiny" :disabled="!(Number(contrib[goal.id]) > 0)" @click="apply(goal, -1)">
          <AppIcon name="minus" />Take
        </button>
      </div>
      <p v-if="confirming === goal.id" class="confirm">Tap the trash again to delete this goal.</p>
    </div>
  </div>
  <p v-else class="empty-state">No goals yet. A phone, a trip, an emergency fund — name it below.</p>

  <div class="sheet-label">New goal</div>
  <div class="card new-goal">
    <input v-model="name" class="field" placeholder="Goal name (e.g. Laptop fund)" maxlength="40" aria-label="Goal name" />
    <div class="two">
      <input
        v-model="target"
        class="field"
        type="number"
        inputmode="numeric"
        min="0"
        step="1000"
        placeholder="Target UGX"
        aria-label="Target amount"
      />
      <input v-model="deadline" class="field" type="date" aria-label="Goal deadline" />
    </div>
    <button class="btn primary" :disabled="!name.trim() || !(Number(target) > 0)" @click="create">
      <AppIcon name="target" />Create goal
    </button>
  </div>
</template>

<style scoped>
.hint { margin: 0 0 12px; font-size: 13px; color: var(--mute); line-height: 1.45; }
.goal { display: grid; gap: 8px; padding: 12px 13px; }
.head .name { display: flex; align-items: center; gap: 7px; font-weight: 700; }
.head .name i { width: 10px; height: 10px; border-radius: 50%; }
.del { width: 32px; height: 32px; color: var(--mute); }
.amounts { display: flex; align-items: baseline; gap: 6px; font-size: 13px; }
.amounts b { font-size: 16px; }
.amounts .pct { margin-left: auto; font-size: 12px; color: var(--mute); }
.track { height: 8px; border-radius: 4px; background: var(--empty); overflow: hidden; }
.track i { display: block; height: 100%; border-radius: 4px; }
.foot small { font-size: 11px; }
.contribute { display: grid; grid-template-columns: 1fr auto auto; gap: 6px; align-items: center; }
.mini { height: 36px; border-radius: 10px; font-size: 13px; }
.confirm { margin: 0; font-size: 11px; color: var(--over); }
.new-goal { display: grid; gap: 8px; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
</style>
