<script setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { clubs } from '../data/clubs.js'

const emit = defineEmits(['apply'])

const query = ref('')
const open  = ref(false)
const root  = ref(null)

onClickOutside(root, () => { open.value = false })

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = q
    ? clubs.filter(c => c.name.toLowerCase().includes(q))
    : clubs
  return list.slice(0, 8)
})

function select(club) {
  emit('apply', club.colors.map(c => c.hex))
  query.value = ''
  open.value  = false
}
</script>

<template>
  <div class="club-picker" ref="root">
    <div class="cp-input-wrap">
      <input
        class="cp-input"
        type="text"
        placeholder="Search 88 clubs…"
        v-model="query"
        @focus="open = true"
        @input="open = true"
        autocomplete="off"
        spellcheck="false"
      />
      <span class="cp-icon">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.5"/>
          <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
    </div>

    <ul v-if="open && results.length" class="cp-dropdown">
      <li
        v-for="club in results"
        :key="club.id"
        class="cp-result"
        @mousedown.prevent="select(club)"
      >
        <span class="cp-name">{{ club.name }}</span>
        <span class="cp-swatches">
          <span
            v-for="color in club.colors"
            :key="color.hex"
            class="cp-swatch"
            :style="{ background: color.hex }"
            :title="color.name"
          />
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.club-picker {
  position: relative;
  width: 100%;
}

.cp-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cp-input {
  width: 100%;
  background: rgba(232, 200, 74, 0.04);
  border: 1px solid rgba(232, 200, 74, 0.3);
  border-radius: 6px;
  color: #e8e8ec;
  font-size: 12px;
  padding: 7px 28px 7px 10px;
  outline: none;
  box-shadow: 0 0 8px rgba(232, 200, 74, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.cp-input:focus {
  border-color: rgba(232, 200, 74, 0.85);
  box-shadow: 0 0 0 2px rgba(232, 200, 74, 0.15), 0 0 14px rgba(232, 200, 74, 0.4), 0 0 28px rgba(232, 200, 74, 0.12);
}
.cp-input::placeholder { color: #777; }

.cp-icon {
  position: absolute;
  right: 8px;
  font-size: 13px;
  pointer-events: none;
  opacity: 0.5;
}

.cp-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #1a1a24;
  border: 1px solid #2a2a35;
  border-radius: 6px;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  max-height: 260px;
  overflow-y: auto;
}

.cp-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  cursor: pointer;
  gap: 8px;
  transition: background 0.1s;
}
.cp-result:hover { background: #25252f; }

.cp-name {
  font-size: 12px;
  color: #e8e8ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.cp-swatches {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.cp-swatch {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
</style>
