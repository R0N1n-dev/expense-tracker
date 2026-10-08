<script setup>
import { ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import BottomSheet from './BottomSheet.vue'
import AmountPad from './AmountPad.vue'
import { CATEGORIES } from '../data/categories'

const props = defineProps({
  open: { type: Boolean, required: true },
  editing: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save', 'delete'])

const amount = ref('')
const pick = ref('food')
const note = ref('')
const confirming = ref(false)

// Fill the form each time the sheet opens: the expense being edited, or a blank one.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    confirming.value = false
    amount.value = props.editing ? String(props.editing.amt) : ''
    pick.value = props.editing ? props.editing.cat : 'food'
    note.value = props.editing ? props.editing.note : ''
  },
)

function save() {
  if (!amount.value) return
  emit('save', { cat: pick.value, note: note.value.trim(), amt: +amount.value })
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
  <BottomSheet :open="open" :title="editing ? 'Edit expense' : 'Add expense'" @close="emit('close')">
    <AmountPad v-model="amount">
      <div class="chips">
        <button
          v-for="c in CATEGORIES"
          :key="c.id"
          class="chip"
          :class="{ on: pick === c.id }"
          :style="{ '--c': c.color }"
          @click="pick = c.id"
        >
          <AppIcon :name="c.icon" />{{ c.name }}
        </button>
      </div>
      <input v-model="note" class="note" placeholder="Note (optional)" maxlength="40" />
    </AmountPad>
    <button class="save" :disabled="!amount" @click="save">
      <AppIcon name="check" />{{ editing ? 'Save changes' : 'Save expense' }}
    </button>
    <button v-if="editing" class="del" :class="{ sure: confirming }" @click="del">
      <AppIcon name="trash" />{{ confirming ? 'Tap again to delete' : 'Delete expense' }}
    </button>
  </BottomSheet>
</template>

<style scoped>
.chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.chip { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 76px; padding: 10px 6px; border-radius: 16px; border: 2px solid transparent; background: var(--bg); font-size: 13px; color: var(--mute); }
.chip.on { border-color: var(--c); color: var(--ink); font-weight: 700; }
.chip svg { color: var(--c); }
.note { width: 100%; height: 46px; margin: 10px 0; padding: 0 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); font: inherit; }
.del { width: 100%; height: 50px; margin-top: 8px; border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; color: #ef4444; background: color-mix(in srgb, #ef4444 12%, transparent); }
.del.sure { background: #ef4444; color: #fff; }
</style>
