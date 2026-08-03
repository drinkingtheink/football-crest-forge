<script setup>
import { ref, computed } from 'vue'
import { icons, iconGroups } from '../data/icons.js'

const props = defineProps({
  // { [iconId]: count } — how many of each symbol are currently in the design
  placedCounts: { type: Object, default: () => ({}) },
})
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

    <!-- Scroll wrapper separate from flex grid so tooltips aren't clipped -->
    <div class="icon-grid-scroll">
      <div class="icon-grid">
        <button
          v-for="ic in filtered"
          :key="ic.id"
          class="icon-btn"
          :class="{ placed: placedCounts[ic.id] > 0 }"
          :data-label="ic.label"
          @click="$emit('add-icon', ic.id)"
        >
          <svg
            :viewBox="ic.viewBox ? `0 0 ${ic.viewBox[0]} ${ic.viewBox[1]}` : '0 0 100 100'"
            width="34" height="34"
          >
            <path v-for="(p, i) in ic.paths" :key="i" :d="p" fill="currentColor" />
          </svg>
          <span
            v-if="placedCounts[ic.id]"
            class="placed-badge"
            :title="`${placedCounts[ic.id]} in design`"
          >{{ placedCounts[ic.id] }}</span>
        </button>
      </div>
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

.icon-grid-scroll {
  max-height: 200px;
  overflow-y: auto;
  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #3a3a48 transparent;
}
.icon-grid-scroll::-webkit-scrollbar {
  width: 8px;
}
.icon-grid-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.icon-grid-scroll::-webkit-scrollbar-thumb {
  background: #2f2f3b;
  border-radius: 6px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.icon-grid-scroll::-webkit-scrollbar-thumb:hover {
  background: #e8c84a;
  background-clip: content-box;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  /* overflow visible so ::after tooltips aren't clipped by the scroll container */
  overflow: visible;
  padding-bottom: 2px;
}

.icon-btn {
  position: relative;
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

/* Symbols already placed in the design */
.icon-btn.placed {
  border-color: rgba(232, 200, 74, 0.55);
  background: rgba(232, 200, 74, 0.08);
  color: #cdb96a;
}
.placed-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 15px;
  height: 15px;
  box-sizing: border-box;
  padding: 0 3px;
  border-radius: 8px;
  background: #e8c84a;
  border: 1px solid #13131a;
  color: #111;
  font-size: 9px;
  font-weight: 700;
  line-height: 13px;
  text-align: center;
  font-family: system-ui, sans-serif;
  z-index: 11;
}

/* CSS tooltip */
.icon-btn::after {
  content: attr(data-label);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #0f0f13;
  border: 1px solid #3a3a48;
  border-radius: 4px;
  color: #e8e8ec;
  font-size: 11px;
  font-family: system-ui, sans-serif;
  padding: 3px 8px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.12s;
  z-index: 10;
}
.icon-btn:hover::after {
  opacity: 1;
}
</style>
