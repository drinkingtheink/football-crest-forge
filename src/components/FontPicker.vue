<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue'
import { fontGroups, fontsByGroup, loadFont } from '../utils/fonts.js'

const props = defineProps({ value: { type: String, default: '' } })
const emit = defineEmits(['change', 'preview'])

const open = ref(false)
const search = ref('')
let baseline = ''   // last committed font — the revert target when closing without a pick
const triggerRef = ref(null)
const panelRef = ref(null)
const listRef = ref(null)
const panelStyle = ref({})
let io = null

// Font names are rendered in their own typeface, but the actual font files load
// lazily as each row scrolls into view — so opening the picker over ~100 fonts
// never downloads more than the handful you can see.
const groups = computed(() => {
  const q = search.value.trim().toLowerCase()
  return fontGroups
    .map(g => ({ group: g, items: q ? fontsByGroup[g].filter(f => f.family.toLowerCase().includes(q)) : fontsByGroup[g] }))
    .filter(x => x.items.length)
})

function position() {
  const r = triggerRef.value?.getBoundingClientRect()
  if (!r) return
  const below = window.innerHeight - r.bottom
  panelStyle.value = {
    left: `${r.left}px`,
    top: `${r.bottom + 4}px`,
    width: `${Math.max(r.width, 220)}px`,
    maxHeight: `${Math.max(180, Math.min(400, below - 16))}px`,
  }
}

function observeRows() {
  io?.disconnect()
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        loadFont(e.target.dataset.family)
        io.unobserve(e.target)
      }
    }
  }, { root: listRef.value, rootMargin: '150px 0px' })
  listRef.value?.querySelectorAll('[data-family]').forEach(el => io.observe(el))
}

async function openPanel() {
  open.value = true
  baseline = props.value
  if (props.value) loadFont(props.value)
  await nextTick()
  position()
  observeRows()
  window.addEventListener('scroll', reposition, true)
  window.addEventListener('resize', reposition)
}
function closePanel() {
  if (!open.value) return
  // Revert any lingering hover-preview back to the last committed font.
  if (props.value !== baseline) emit('preview', baseline)
  open.value = false
  search.value = ''
  io?.disconnect(); io = null
  window.removeEventListener('scroll', reposition, true)
  window.removeEventListener('resize', reposition)
}
function reposition() { if (open.value) position() }
function toggle() { open.value ? closePanel() : openPanel() }

// Live-preview the hovered font on the actual text block.
function previewFont(family) {
  loadFont(family)
  emit('preview', family)
}

// Commit the font but keep the menu open — it only closes on click/focus elsewhere.
function choose(family) {
  baseline = family
  emit('change', family)
  loadFont(family)
}

watch(groups, () => { if (open.value) nextTick(observeRows) })

function onDocPointer(e) {
  if (!open.value) return
  if (triggerRef.value?.contains(e.target) || panelRef.value?.contains(e.target)) return
  closePanel()
}
function onKey(e) { if (e.key === 'Escape') closePanel() }
document.addEventListener('pointerdown', onDocPointer)
document.addEventListener('keydown', onKey)
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onKey)
  closePanel()
})
</script>

<template>
  <div class="fp">
    <button ref="triggerRef" type="button" class="fp-trigger" :title="value" @click="toggle">
      <span class="fp-current" :style="{ fontFamily: value }">{{ value || 'Choose font' }}</span>
      <span class="fp-caret">▾</span>
    </button>

    <Teleport to="body">
      <div v-if="open" ref="panelRef" class="fp-panel" :style="panelStyle">
        <input
          v-model="search"
          class="fp-search"
          type="text"
          placeholder="Search fonts…"
          @keydown.stop
        />
        <div ref="listRef" class="fp-list">
          <template v-for="g in groups" :key="g.group">
            <div class="fp-group">{{ g.group }}</div>
            <button
              v-for="f in g.items"
              :key="f.family"
              type="button"
              class="fp-item"
              :class="{ active: f.family === value }"
              :data-family="f.family"
              :style="{ fontFamily: f.family }"
              @mouseenter="previewFont(f.family)"
              @focus="previewFont(f.family)"
              @click="choose(f.family)"
            >{{ f.family }}</button>
          </template>
          <div v-if="!groups.length" class="fp-empty">No fonts match “{{ search }}”</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.fp { width: 100%; }

.fp-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 6px;
  color: #e8e8ec;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.3;
}
.fp-trigger:hover { border-color: #3a3a48; }
.fp-current { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fp-caret { color: #888; font-size: 10px; flex: none; }

.fp-panel {
  position: fixed;
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #13131a;
  border: 1px solid #2a2a35;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
}
.fp-search {
  margin: 8px 8px 4px;
  padding: 6px 9px;
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 5px;
  color: #e8e8ec;
  font-size: 12px;
  outline: none;
}
.fp-search:focus { border-color: #e8c84a; }

.fp-list { overflow-y: auto; padding: 0 6px 8px; }
.fp-group {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 8px 6px 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #e8d06a;
  background: #13131a;
}
.fp-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 9px;
  background: none;
  border: none;
  border-radius: 5px;
  color: #e8e8ec;
  cursor: pointer;
  font-size: 18px;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fp-item:hover { background: #1e1e28; }
.fp-item.active { background: rgba(232, 200, 74, 0.14); color: #e8c84a; }
.fp-empty { padding: 12px 8px; font-size: 12px; color: #888; }
</style>
