<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'
import BottomSheet from './BottomSheet.vue'
import AmountPad from './AmountPad.vue'
import { fmt } from '../lib/format'

defineProps({
  open: { type: Boolean, required: true },
  current: { type: Number, required: true },
})
const emit = defineEmits(['close', 'save'])

const amount = ref('')

function save() {
  if (!amount.value) return
  emit('save', +amount.value)
  amount.value = ''
}
</script>

<template>
  <BottomSheet :open="open" title="Monthly budget" @close="emit('close')">
    <AmountPad v-model="amount">
      <p class="hint">
        Your spending is tracked against this amount. Current budget is
        <b>UGX {{ fmt(current) }}</b>.
      </p>
    </AmountPad>
    <button class="save" :disabled="!amount" @click="save"><AppIcon name="check" />Save budget</button>
  </BottomSheet>
</template>

<style scoped>
.hint { margin: 0 0 14px; text-align: center; font-size: 14px; color: var(--mute); }
.hint b { color: var(--ink); font-weight: 700; }
</style>
