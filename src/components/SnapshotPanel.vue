<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { listSnapshots, deleteSnapshot } from '../utils/snapshots.js'

const props = defineProps({ saveFn: { type: Function, required: true } })
const emit = defineEmits(['load'])

const snapshots = ref([])
const saving = ref(false)
const showNameInput = ref(false)
const nameInput = ref('')
const nameFieldRef = ref(null)

function refresh() { snapshots.value = listSnapshots() }
defineExpose({ refresh, startSave })
onMounted(refresh)

watch(showNameInput, async (v) => {
  if (v) { await nextTick(); nameFieldRef.value?.focus() }
})

function startSave() {
  nameInput.value = `Design ${new Date().toLocaleDateString()}`
  showNameInput.value = true
}

async function confirmSave() {
  const name = nameInput.value.trim()
  if (!name) return
  saving.value = true
  try {
    const saved = await props.saveFn(name)
    if (saved === false) return   // save failed (e.g. storage full); keep the dialog open
    refresh()
    showNameInput.value = false
    nameInput.value = ''
  } finally {
    saving.value = false
  }
}

function cancelSave() {
  showNameInput.value = false
  nameInput.value = ''
}

function handleLoad(snap) { emit('load', snap.config) }

function handleDelete(snap) {
  if (!window.confirm(`Delete "${snap.name}"?`)) return
  deleteSnapshot(snap.id)
  refresh()
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="snapshot-panel">
    <div class="snap-header">
      <button v-if="!showNameInput" class="snap-save-btn" @click="startSave">+ Save Snapshot</button>
      <div v-else class="snap-name-form">
        <input
          ref="nameFieldRef"
          v-model="nameInput"
          class="snap-name-input"
          placeholder="Snapshot name"
          @keydown.enter="confirmSave"
          @keydown.escape="cancelSave"
        />
        <button class="snap-confirm-btn" :disabled="saving" @click="confirmSave">
          {{ saving ? '…' : 'Save' }}
        </button>
        <button class="snap-cancel-btn" @click="cancelSave">✕</button>
      </div>
    </div>

    <p v-if="!snapshots.length" class="snap-empty">No snapshots saved yet.<br>Save a snapshot to revisit this design later.</p>

    <div v-else class="snap-grid">
      <div v-for="snap in snapshots" :key="snap.id" class="snap-card">
        <button class="snap-thumb-btn" @click="handleLoad(snap)" :title="`Load: ${snap.name}`">
          <img v-if="snap.thumbnail" :src="snap.thumbnail" class="snap-thumb" />
          <div v-else class="snap-thumb-placeholder" />
        </button>
        <div class="snap-meta">
          <span class="snap-name" :title="snap.name">{{ snap.name }}</span>
          <span class="snap-date">{{ formatDate(snap.timestamp) }}</span>
        </div>
        <div class="snap-actions">
          <button class="snap-load-btn" @click="handleLoad(snap)">Load</button>
          <button class="snap-del-btn" @click="handleDelete(snap)" title="Delete">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.snap-header { margin-bottom: 10px; }

.snap-save-btn {
  width: 100%;
  background: #1e1e28;
  border: 1px dashed #3a3a4a;
  border-radius: 6px;
  color: #aaa;
  font-size: 12px;
  padding: 8px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.snap-save-btn:hover { border-color: #e8c84a; color: #e8c84a; }

.snap-name-form {
  display: flex;
  gap: 5px;
  align-items: center;
}

.snap-name-input {
  flex: 1;
  min-width: 0;
  background: #1e1e28;
  border: 1px solid #3a3a4a;
  border-radius: 5px;
  color: #e8e8ec;
  font-size: 12px;
  padding: 6px 8px;
  outline: none;
}
.snap-name-input:focus { border-color: #e8c84a; }

.snap-confirm-btn {
  background: #e8c84a;
  border: none;
  border-radius: 5px;
  color: #111;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.snap-confirm-btn:disabled { opacity: 0.55; cursor: default; }

.snap-cancel-btn {
  background: none;
  border: 1px solid #3a3a4a;
  border-radius: 5px;
  color: #888;
  font-size: 13px;
  padding: 5px 7px;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.12s, border-color 0.12s;
}
.snap-cancel-btn:hover { color: #e05555; border-color: #e05555; }

.snap-empty {
  font-size: 11px;
  color: #555;
  text-align: center;
  line-height: 1.6;
  margin: 6px 0 0;
}

.snap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.snap-card {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 7px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.snap-card:hover { border-color: #555; }

.snap-thumb-btn {
  display: block;
  width: 100%;
  background: #0f0f13;
  border: none;
  padding: 0;
  cursor: pointer;
  aspect-ratio: 5 / 6;
  overflow: hidden;
}

.snap-thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.snap-thumb-placeholder {
  width: 100%;
  height: 100%;
  background: #13131a;
}

.snap-meta {
  padding: 5px 7px 2px;
}

.snap-name {
  display: block;
  font-size: 11px;
  color: #ddd;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snap-date {
  display: block;
  font-size: 10px;
  color: #555;
  margin-top: 1px;
}

.snap-actions {
  display: flex;
  gap: 4px;
  padding: 4px 7px 6px;
}

.snap-load-btn {
  flex: 1;
  background: #2a2a38;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #bbb;
  font-size: 11px;
  padding: 4px 0;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.snap-load-btn:hover { background: #e8c84a; color: #111; border-color: #e8c84a; }

.snap-del-btn {
  background: none;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #555;
  font-size: 12px;
  padding: 3px 7px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.12s, border-color 0.12s;
}
.snap-del-btn:hover { color: #e05555; border-color: #e05555; }
</style>
