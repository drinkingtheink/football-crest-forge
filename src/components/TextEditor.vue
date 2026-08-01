<script setup>
import { ref, watch, nextTick } from 'vue'
import { fontGroups, fontsByGroup, loadFont } from '../utils/fonts.js'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  texts: { type: Array, required: true },
  selectedTextId: { type: String, default: null },
})

const emit = defineEmits([
  'add-text', 'remove-text', 'update-text', 'select-text',
])

// Auto-scroll to selected row
const rowRefs = {}
function setRowRef(el, id) {
  if (el) rowRefs[id] = el
  else delete rowRefs[id]
}
watch(() => props.selectedTextId, async (id) => {
  if (!id) return
  await nextTick()
  rowRefs[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})

const ARC_OPTS = [
  { value: null,     label: 'Straight' },
  { value: 'top',    label: 'Arc top' },
  { value: 'bottom', label: 'Arc bottom' },
]

function onFontChange(textId, event) {
  const family = event.target.value
  loadFont(family)
  emit('update-text', textId, { fontFamily: family })
}
</script>

<template>
  <div class="text-editor">
    <button class="add-btn" @click="$emit('add-text')">+ Add Text</button>

    <div class="text-list">
      <div
        v-for="text in texts"
        :key="text.id"
        :ref="el => setRowRef(el, text.id)"
        class="text-item"
        :class="{ selected: selectedTextId === text.id }"
        @click="$emit('select-text', text.id)"
      >
        <!-- Row summary -->
        <div class="text-row">
          <span class="text-preview" :style="{ color: text.color }">
            {{ text.content || '…' }}
          </span>
          <div class="text-row-controls">
            <ColorPicker
              :value="text.color"
              @click.stop
              @change="$emit('update-text', text.id, { color: $event })"
            />
            <button
              class="t-remove"
              title="Remove"
              @click.stop="$emit('remove-text', text.id)"
            >×</button>
          </div>
        </div>

        <!-- Expanded controls -->
        <div v-if="selectedTextId === text.id" class="text-expanded" @click.stop>

          <label class="field">
            <span>Content</span>
            <input
              type="text"
              :value="text.content"
              class="t-input"
              @input="$emit('update-text', text.id, { content: $event.target.value })"
            />
          </label>

          <div class="field">
            <span>Font</span>
            <select
              :value="text.fontFamily"
              class="t-select"
              @change="onFontChange(text.id, $event)"
            >
              <optgroup v-for="group in fontGroups" :key="group" :label="group">
                <option
                  v-for="font in fontsByGroup[group]"
                  :key="font.family"
                  :value="font.family"
                >{{ font.family }}</option>
              </optgroup>
            </select>
            <span
              v-if="text.fontFamily"
              class="font-preview"
              :style="{ fontFamily: text.fontFamily }"
            >AaBbCc&nbsp;123</span>
          </div>

          <div class="field-row">
            <label class="field field-half">
              <span>Size</span>
              <input
                type="number" min="6" max="60"
                :value="text.fontSize"
                class="t-number"
                @input="$emit('update-text', text.id, { fontSize: Number($event.target.value) })"
              />
            </label>
            <label class="field field-half">
              <span>Weight</span>
              <select
                :value="text.fontWeight"
                class="t-select"
                @change="$emit('update-text', text.id, { fontWeight: $event.target.value })"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </label>
          </div>

          <label class="field">
            <span>Letter spacing <em>{{ text.letterSpacing ?? 0 }}px</em></span>
            <input
              type="range" min="-3" max="16" step="0.5"
              :value="text.letterSpacing ?? 0"
              @input="$emit('update-text', text.id, { letterSpacing: Number($event.target.value) })"
            />
          </label>

          <label class="field">
            <span>Layout</span>
            <div class="arc-opts">
              <button
                v-for="opt in ARC_OPTS"
                :key="String(opt.value)"
                class="arc-btn"
                :class="{ active: text.arc === opt.value }"
                @click="$emit('update-text', text.id, { arc: opt.value })"
              >{{ opt.label }}</button>
            </div>
          </label>

          <!-- Arc controls (only when arc mode active) -->
          <template v-if="text.arc">
            <label class="field">
              <span>Arc radius <em>{{ text.arcRadius }}</em></span>
              <input
                type="range" min="30" max="120"
                :value="text.arcRadius"
                @input="$emit('update-text', text.id, { arcRadius: Number($event.target.value) })"
              />
            </label>
            <label class="field">
              <span>Vertical position <em>{{ text.arcY }}</em></span>
              <input
                type="range" min="40" max="200"
                :value="text.arcY"
                @input="$emit('update-text', text.id, { arcY: Number($event.target.value) })"
              />
            </label>
          </template>

          <!-- Straight text position (only when not arc) -->
          <template v-else>
            <p class="field-hint">Drag the text on the badge to reposition it.</p>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-editor { display: flex; flex-direction: column; gap: 8px; }

.add-btn {
  background: #1e1e28;
  border: 1px dashed #3a3a4a;
  border-radius: 6px;
  color: #aaa;
  cursor: pointer;
  font-size: 12px;
  padding: 7px;
  text-align: center;
  transition: border-color 0.15s, color 0.15s;
  width: 100%;
}
.add-btn:hover { border-color: #e8c84a; color: #e8c84a; }

.text-list { display: flex; flex-direction: column; gap: 5px; }

.text-item {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.15s;
}
.text-item:hover { border-color: #555; }
.text-item.selected { border-color: #e8c84a; }

.text-row {
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 7px 8px;
}

.text-preview {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-row-controls { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }


.t-remove {
  background: none; border: none;
  color: #666; cursor: pointer;
  font-size: 16px; line-height: 1; padding: 0 2px;
  transition: color 0.15s;
}
.t-remove:hover { color: #e05555; }

/* Expanded panel */
.text-expanded {
  background: #191922;
  border-top: 1px solid #2a2a35;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 10px 12px;
}

.field { display: flex; flex-direction: column; gap: 4px; }

.field > span {
  color: #888;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
}
.field > span em { color: #aaa; font-style: normal; }

.field-row { display: flex; gap: 8px; }
.field-half { flex: 1; }

.t-input {
  background: #252530;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #e8e8ec;
  font-size: 13px;
  padding: 5px 8px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.t-input:focus { border-color: #e8c84a; }

.t-number {
  background: #252530;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #e8e8ec;
  font-size: 13px;
  padding: 5px 6px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.t-select {
  background: #252530;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #e8e8ec;
  font-size: 12px;
  padding: 5px 6px;
  outline: none;
  width: 100%;
}

.field input[type="range"] { accent-color: #e8c84a; width: 100%; }

.arc-opts { display: flex; gap: 5px; }

.arc-btn {
  flex: 1;
  background: #252530;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  font-size: 10px;
  padding: 4px 2px;
  transition: border-color 0.15s, color 0.15s;
}
.arc-btn:hover { border-color: #666; color: #ccc; }
.arc-btn.active { border-color: #e8c84a; color: #e8c84a; }

.field-hint { color: #555; font-size: 11px; margin: 0; }

.font-preview {
  color: #ccc;
  font-size: 14px;
  letter-spacing: 0.02em;
  margin-top: 2px;
  display: block;
}
</style>
