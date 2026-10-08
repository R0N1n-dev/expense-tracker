<script setup>
import AppIcon from './AppIcon.vue'
import { categoryById } from '../data/categories'
import { fmt } from '../lib/format'

defineProps({
  group: { type: Object, required: true },
  open: { type: Boolean, required: true },
  newId: { type: Number, required: true },
})
defineEmits(['toggle', 'edit'])
</script>

<template>
  <button class="day" :aria-expanded="open" @click="$emit('toggle')">
    <span class="lbl">{{ group.label }}</span>
    <span class="n">{{ group.items.length }}</span>
    <span class="tot">UGX {{ fmt(group.total) }}</span>
    <AppIcon name="chev" class="chev" />
  </button>
  <div class="acc" :class="{ on: open }" :inert="!open || undefined">
    <div class="acc-in">
      <button v-for="e in group.items" :key="e.id" class="row" :class="{ new: e.id === newId }" @click="$emit('edit', e)">
        <div class="badge" :style="{ '--c': categoryById(e.cat).color }">
          <AppIcon :name="categoryById(e.cat).icon" />
        </div>
        <div class="t">
          <b>{{ e.note || categoryById(e.cat).name }}</b>
          <span>{{ categoryById(e.cat).name }}</span>
        </div>
        <div class="a">{{ fmt(e.amt) }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.day { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 48px; padding: 0 4px; margin-top: 6px; font-size: 15px; font-weight: 500; text-align: left; }
.day .lbl { flex: 1; }
.day .n { font-size: 12px; min-width: 22px; padding: 2px 7px; border-radius: 10px; background: var(--empty); color: var(--mute); text-align: center; }
.day .tot { color: var(--mute); font-weight: 400; }
.day .chev { color: var(--mute); transition: transform 0.25s; }
.day[aria-expanded='true'] .chev { transform: rotate(180deg); }
.day[aria-expanded='true'] .tot { color: var(--ink); font-weight: 700; }
.acc { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s; }
.acc.on { grid-template-rows: 1fr; }
.acc-in { overflow: hidden; min-height: 0; }
.row { display: flex; align-items: center; gap: 14px; padding: 12px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: 16px; margin-bottom: 8px; width: 100%; text-align: left; }
.row.new { animation: pop 0.9s; }
@keyframes pop {
  0% { transform: scale(0.96); box-shadow: 0 0 0 0 var(--accent); }
  40% { box-shadow: 0 0 0 4px var(--accent); }
  100% { transform: none; box-shadow: 0 0 0 0 transparent; }
}
.badge { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; flex: none; color: var(--c); background: color-mix(in srgb, var(--c) 18%, transparent); }
.badge svg { width: 22px; height: 22px; }
.t { flex: 1; min-width: 0; }
.t b { display: block; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.t span { font-size: 13px; color: var(--mute); }
.a { font-weight: 700; }
</style>
