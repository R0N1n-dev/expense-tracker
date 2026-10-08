<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
})
defineEmits(['close'])
</script>

<template>
  <div class="scrim" :class="{ on: open }" @click="$emit('close')"></div>
  <div class="sheet" :class="{ on: open }" role="dialog" :aria-label="title" :aria-hidden="!open" :inert="!open || undefined">
    <div class="sh-head">
      {{ title }}
      <button class="icon-btn" aria-label="Close" @click="$emit('close')"><AppIcon name="x" /></button>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; background: rgba(10, 8, 30, 0.5); opacity: 0; pointer-events: none; transition: opacity 0.25s; }
.scrim.on { opacity: 1; pointer-events: auto; }
.sheet { position: fixed; left: 0; right: 0; bottom: 0; max-width: 440px; margin: 0 auto; background: var(--surface); border-radius: 28px 28px 0 0; padding: 18px 20px calc(20px + env(safe-area-inset-bottom, 0px)); transform: translateY(105%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 94%; overflow: auto; }
.sheet.on { transform: none; }
.sh-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
</style>
