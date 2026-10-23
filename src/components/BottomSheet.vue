<script>
// Sheets can hand over to each other (Planner -> Add). Count locks so closing
// one sheet does not unlock scrolling while another is still open.
let locks = 0
function acquireScrollLock() {
  locks += 1
  document.body.style.overflow = 'hidden'
}
function releaseScrollLock() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) document.body.style.overflow = ''
}
</script>

<script setup>
import { onBeforeUnmount, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
})
const emit = defineEmits(['close'])

let locked = false

function onKey(event) {
  if (event.key === 'Escape' && props.open) emit('close')
}

function lock() {
  if (locked) return
  locked = true
  acquireScrollLock()
  window.addEventListener('keydown', onKey)
}

function unlock() {
  if (!locked) return
  locked = false
  releaseScrollLock()
  window.removeEventListener('keydown', onKey)
}

watch(
  () => props.open,
  (open) => {
    if (open) lock()
    else unlock()
  },
)
onBeforeUnmount(unlock)
</script>

<template>
  <Teleport to="body">
    <div class="scrim" :class="{ on: open }" @click="emit('close')"></div>
    <div
      class="sheet"
      :class="{ on: open }"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      :aria-hidden="!open"
      :inert="!open || undefined"
    >
      <div class="grab" aria-hidden="true"></div>
      <div class="sh-head">
        <h2>{{ title }}</h2>
        <button class="icon-btn" aria-label="Close" @click="emit('close')">
          <AppIcon name="x" />
        </button>
      </div>
      <div class="sh-body"><slot /></div>
    </div>
  </Teleport>
</template>

<style scoped>
.scrim { position: fixed; inset: 0; background: var(--scrim); opacity: 0; pointer-events: none; transition: opacity 0.25s; z-index: 40; }
.scrim.on { opacity: 1; pointer-events: auto; }
.sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 41; max-width: 460px; margin: 0 auto; background: var(--surface); border-radius: 28px 28px 0 0; padding: 8px 20px calc(20px + env(safe-area-inset-bottom, 0px)); transform: translateY(105%); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); max-height: 94dvh; overflow: auto; overscroll-behavior: contain; box-shadow: 0 -18px 60px rgba(0, 0, 0, 0.24); }
.sheet.on { transform: none; }
.grab { width: 38px; height: 4px; border-radius: 2px; background: var(--line); margin: 4px auto 10px; }
.sh-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; gap: 12px; }
.sh-head h2 { font-size: 18px; margin: 0; font-weight: 700; }
.sh-body { padding-top: 4px; }
</style>
