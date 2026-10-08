<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import { fmt } from '../lib/format'

const amount = defineModel({ type: String, default: '' })
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0']
const shown = computed(() => (amount.value ? fmt(+amount.value) : '0'))

function press(k) {
  if (!amount.value && k.startsWith('0')) return
  if (amount.value.length + k.length > 9) return
  amount.value += k
}
function back() {
  amount.value = amount.value.slice(0, -1)
}
</script>

<template>
  <div class="big" :class="{ zero: !amount }"><small>UGX</small>{{ shown }}</div>
  <slot />
  <div class="keys">
    <button v-for="k in KEYS" :key="k" @click="press(k)">{{ k }}</button>
    <button aria-label="Delete last digit" @click="back"><AppIcon name="back" /></button>
  </div>
</template>

<style scoped>
.big { font-size: 44px; font-weight: 800; letter-spacing: -0.03em; margin: 8px 0 14px; text-align: center; }
.big small { font-size: 16px; color: var(--mute); font-weight: 500; margin-right: 6px; }
.big.zero { color: var(--mute); }
.keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.keys button { height: 50px; border-radius: 14px; background: var(--bg); font-size: 22px; font-weight: 500; display: grid; place-items: center; }
.keys button:active { background: var(--empty); }
</style>
