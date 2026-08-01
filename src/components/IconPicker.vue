<script setup>
import { ref, computed } from 'vue'
import { icons, iconGroups } from '../data/icons.js'

const emit = defineEmits(['add-icon'])

const search = ref('')
const activeGroup = ref('All')

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return icons.filter(ic => {
    const matchGroup = activeGroup.value === 'All' || ic.group === activeGroup.value
    const matchSearch = !q || ic.label.toLowerCase().includes(q)
    return matchGroup && matchSearch
  })
})
</script>

<template>
  <div class="icon-picker">
    <input
      v-model="search"
      class="search"
      placeholder="Search symbols…"
      type="text"
    />

    <div class="group-tabs">
      <button
        v-for="g in iconGroups"
        :key="g"
        class="group-tab"
        :class="{ active: activeGroup === g }"
        @click="activeGroup = g"
      >{{ g }}</button>
    </div>

    <div class="icon-grid">
      <button
        v-for="ic in filtered"
        :key="ic.id"
        class="icon-btn"
        :title="`Add ${ic.label}`"
        @click="$emit('add-icon', ic.id)"
      >
        <svg viewBox="0 0 100 100" width="34" height="34">
          <path v-for="(p, i) in ic.paths" :key="i" :d="p" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.icon-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 5px;
  color: #e8e8ec;
  font-size: 13px;
  padding: 6px 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.search:focus { border-color: #555; }
.search::placeholder { color: #555; }

.group-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.group-tab {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  font-size: 10px;
  padding: 3px 7px;
  transition: border-color 0.15s, color 0.15s;
}
.group-tab:hover { border-color: #555; color: #ccc; }
.group-tab.active { border-color: #e8c84a; color: #e8c84a; }

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  max-height: 200px;
  overflow-y: auto;
}

.icon-btn {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 6px;
  color: #778;
  cursor: pointer;
  padding: 4px;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.icon-btn:hover {
  background: #252530;
  border-color: #e8c84a;
  color: #e8c84a;
}
</style>
