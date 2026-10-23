<script setup>
defineProps({
  message: { type: String, default: '' },
  action: { type: String, default: '' },
})
defineEmits(['action', 'dismiss'])
</script>

<template>
  <div v-if="message" class="toast" role="status" aria-live="polite">
    <span>{{ message }}</span>
    <button v-if="action" class="action" @click="$emit('action')">{{ action }}</button>
    <button class="close" aria-label="Dismiss" @click="$emit('dismiss')">×</button>
  </div>
</template>

<style scoped>
.toast { position: fixed; left: 50%; bottom: calc(88px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 60; display: flex; align-items: center; gap: 12px; max-width: min(400px, calc(100vw - 32px)); padding: 11px 12px 11px 16px; border-radius: 14px; background: var(--ink); color: var(--bg); box-shadow: var(--shadow); font-size: 13px; animation: rise 0.25s ease-out; }
.toast span { flex: 1; }
.action { color: var(--on-accent); background: var(--accent); font-weight: 700; padding: 6px 12px; border-radius: 9px; }
.close { width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; color: var(--bg); opacity: 0.65; }
@keyframes rise { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
</style>
