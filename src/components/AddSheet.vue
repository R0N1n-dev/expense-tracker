<script setup>
import { computed, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import BottomSheet from './BottomSheet.vue'
import AmountPad from './AmountPad.vue'
import { categoriesFor } from '../data/categories'
import { dateInputValue, fromDateInput } from '../lib/format'

const props = defineProps({
  open: { type: Boolean, required: true },
  editing: { type: Object, default: null },
  suggestRepeat: { type: String, default: null },
})
const emit = defineEmits(['close', 'save', 'delete', 'duplicate'])

const amount = ref('')
const pick = ref('food')
const note = ref('')
const type = ref('expense')
const date = ref('')
const repeat = ref('none')
const confirming = ref(false)

const options = computed(() => categoriesFor(type.value))

function todayInput() {
  return dateInputValue(Date.now())
}

// Fill the form each time the sheet opens: the expense being edited, or a blank one.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    confirming.value = false
    type.value = props.editing?.type === 'income' ? 'income' : 'expense'
    amount.value = props.editing ? String(props.editing.amt) : ''
    pick.value =
      props.editing && props.editing.cat ? props.editing.cat : categoriesFor(type.value)[0].id
    note.value = props.editing ? props.editing.note : ''
    date.value = props.editing ? dateInputValue(props.editing.t) : todayInput()
    repeat.value =
      !props.editing && ['weekly', 'monthly'].includes(props.suggestRepeat)
        ? props.suggestRepeat
        : 'none'
  },
)

function setType(next) {
  type.value = next
  if (!options.value.some((c) => c.id === pick.value)) pick.value = options.value[0].id
}

function save() {
  if (!amount.value) return
  emit('save', {
    cat: pick.value,
    note: note.value.trim(),
    amt: +amount.value,
    type: type.value,
    t: fromDateInput(date.value || todayInput()),
    repeat: repeat.value === 'none' ? null : repeat.value,
  })
}

function del() {
  if (!confirming.value) {
    confirming.value = true
    return
  }
  emit('delete')
}
</script>

<template>
  <BottomSheet
    :open="open"
    :title="editing ? (editing.type === 'income' ? 'Edit income' : 'Edit expense') : 'Add entry'"
    @close="emit('close')"
  >
    <div class="seg type" role="group" aria-label="Entry type">
      <button :class="{ on: type === 'expense' }" :aria-pressed="type === 'expense'" @click="setType('expense')">Expense</button>
      <button :class="{ on: type === 'income' }" :aria-pressed="type === 'income'" @click="setType('income')">Income</button>
    </div>

    <AmountPad v-model="amount">
      <div class="chips">
        <button
          v-for="c in options"
          :key="c.id"
          class="chip"
          :class="{ on: pick === c.id }"
          :style="{ '--c': c.color }"
          :aria-pressed="pick === c.id"
          @click="pick = c.id"
        >
          <AppIcon :name="c.icon" />{{ c.name }}
        </button>
      </div>
      <input
        v-model="note"
        class="field note"
        placeholder="Note (optional)"
        maxlength="40"
        aria-label="Note"
      />
      <div class="meta">
        <label class="meta-item">
          <span>Date</span>
          <input v-model="date" type="date" class="field date" :max="todayInput()" />
        </label>
        <label v-if="!editing" class="meta-item">
          <span>Repeat</span>
          <select v-model="repeat" class="field">
            <option value="none">Never</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
      </div>
    </AmountPad>

    <button class="save" :disabled="!amount" @click="save">
      <AppIcon name="check" />{{ editing ? 'Save changes' : type === 'income' ? 'Save income' : 'Save expense' }}
    </button>

    <div v-if="editing" class="actions">
      <button class="btn" @click="emit('duplicate')"><AppIcon name="copy" />Duplicate</button>
      <button class="btn danger" :class="{ sure: confirming }" @click="del">
        <AppIcon name="trash" />{{ confirming ? 'Tap again' : 'Delete' }}
      </button>
    </div>
  </BottomSheet>
</template>

<style scoped>
.type { margin: 10px 0 4px; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.chip { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 74px; padding: 10px 6px; border-radius: 16px; border: 2px solid transparent; background: var(--bg); font-size: 12px; color: var(--mute); }
.chip.on { border-color: var(--c); color: var(--ink); font-weight: 700; }
.chip svg { color: var(--c); }
.note { margin: 10px 0; }
.meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.meta:has(.meta-item:only-child) { grid-template-columns: 1fr; }
.meta-item { display: grid; gap: 5px; font-size: 12px; font-weight: 600; color: var(--mute); }
.field.date { padding: 0 10px; }
select.field { padding: 0 10px; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
.actions .btn { min-height: 50px; }
.actions .sure { background: var(--over); color: #fff; }
</style>
