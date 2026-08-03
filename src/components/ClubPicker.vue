<script setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { clubs } from '../data/clubs.js'

const emit = defineEmits(['apply'])

const query = ref('')
const open  = ref(false)
const root  = ref(null)

onClickOutside(root, () => { open.value = false })

function getRandomSample() {
  return [...clubs].sort(() => Math.random() - 0.5).slice(0, 8).sort((a, b) => a.name.localeCompare(b.name))
}

const randomSample = ref(getRandomSample())

function reshuffle() {
  randomSample.value = getRandomSample()
  query.value = ''
  open.value = true
}

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return randomSample.value
  return clubs.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8)
})

function select(club) {
  emit('apply', club)
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

    <Transition name="dropdown-fade">
    <div v-if="open && results.length" class="cp-dropdown">
      <TransitionGroup tag="ul" name="club-swap" class="cp-list">
        <li
          v-for="(club, i) in results"
          :key="club.id"
          class="cp-result"
          :style="{ '--i': i }"
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
        <li key="reshuffle" class="cp-reshuffle" @mousedown.prevent="reshuffle" title="Show different clubs">
          <svg width="13" height="11" viewBox="0 0 20 16" fill="none">
            <path d="M1 4 C7 4 10 12 16 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <polyline points="14,10 16,12 14,14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 12 C7 12 10 4 16 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <polyline points="14,2 16,4 14,6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <small>Get Fresh Clubs</small>
        </li>
      </TransitionGroup>
    </div>
    </Transition>
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
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  max-height: 260px;
  overflow-y: auto;
}

.cp-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  position: relative;
}

/* Sleek staggered swap when "Get Fresh Clubs" replaces the list.
   Outgoing rows cascade out to the right, fresh rows cascade in from the
   left — both staggered by row index (--i) so the switch is easy to follow. */
.club-swap-move { transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1); }
.club-swap-enter-active {
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  /* Fresh rows wait for the old set to clear, then cascade in */
  transition-delay: calc(0.28s + var(--i, 0) * 0.08s);
}
.club-swap-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
  transition-delay: calc(var(--i, 0) * 0.06s);
  position: absolute;
  left: 0;
  right: 0;
}
.club-swap-enter-from { opacity: 0; transform: translateX(-26px); }
.club-swap-leave-to   { opacity: 0; transform: translateX(26px); }

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

.cp-reshuffle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  cursor: pointer;
  border-top: 1px solid #2a2a35;
  color: #555;
  transition: color 0.15s;
}
.cp-reshuffle:hover { color: #e8c84a; }
.cp-reshuffle:hover svg { transform: rotate(180deg); }
.cp-reshuffle svg { transition: transform 0.3s ease; }

.cp-reshuffle small { font-size: 60%; margin-left: 10px; }

.dropdown-fade-enter-active,
.dropdown-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-fade-enter-from,
.dropdown-fade-leave-to { opacity: 0; transform: translateY(-5px); }
</style>
