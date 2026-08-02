<script setup>
import { ref, watch, nextTick } from 'vue'
import { fontGroups, fontsByGroup, loadFont } from '../utils/fonts.js'
import ColorPicker from './ColorPicker.vue'

const loadingFont = ref(false)

const props = defineProps({
  texts: { type: Array, required: true },
  selectedTextId: { type: String, default: null },
  shapeFit: { type: Object, default: null },
})

const emit = defineEmits([
  'add-text', 'remove-text', 'update-text', 'select-text', 'fit-arc',
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

async function onFontChange(textId, event) {
  const family = event.target.value
  emit('update-text', textId, { fontFamily: family })
  loadingFont.value = true
  await loadFont(family)
  loadingFont.value = false
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
        <Transition name="panel-fade">
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
              :class="{ 'font-loading': loadingFont }"
              :style="{ fontFamily: text.fontFamily }"
            >{{ loadingFont ? 'loading…' : 'AaBbCc 123' }}</span>
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
            <div class="field-row">
              <label class="field field-half">
                <span>Radius X <em>{{ text.arcRx ?? text.arcRadius ?? 78 }}</em></span>
                <input
                  type="range" min="20" max="120"
                  :value="text.arcRx ?? text.arcRadius ?? 78"
                  @input="$emit('update-text', text.id, { arcRx: Number($event.target.value) })"
                />
              </label>
              <label class="field field-half">
                <span>Radius Y <em>{{ text.arcRy ?? text.arcRadius ?? 78 }}</em></span>
                <input
                  type="range" min="20" max="120"
                  :value="text.arcRy ?? text.arcRadius ?? 78"
                  @input="$emit('update-text', text.id, { arcRy: Number($event.target.value) })"
                />
              </label>
            </div>
            <label class="field">
              <span>Vertical position <em>{{ text.arcY }}</em></span>
              <input
                type="range" min="40" max="200"
                :value="text.arcY"
                @input="$emit('update-text', text.id, { arcY: Number($event.target.value) })"
              />
            </label>
            <button
              class="fit-arc-btn"
              :disabled="!shapeFit"
              :title="shapeFit ? 'Set arc curvature to match badge shape' : 'Only available on circular and oval badges'"
              @click.stop="$emit('fit-arc', text.id)"
            >Fit to badge</button>
          </template>

          <!-- Straight text position (only when not arc) -->
          <template v-else>
            <p class="field-hint">Drag the text on the badge to reposition it.</p>
          </template>

        </div>
        </Transition>
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
  color: #c8aa58;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  text-shadow: 0 0 8px rgba(232, 200, 74, 0.2);
}
.field > span em { color: #ddc870; font-style: normal; }

.field-row { display: flex; gap: 8px; }
.field-half { flex: 1; }

.t-input,
.t-number,
.t-select {
  background: rgba(232, 200, 74, 0.04);
  border: 1px solid rgba(232, 200, 74, 0.28);
  border-radius: 4px;
  color: #e8e8ec;
  font-size: 12px;
  padding: 5px 8px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(232, 200, 74, 0.07);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.t-input:focus,
.t-number:focus,
.t-select:focus {
  border-color: rgba(232, 200, 74, 0.85);
  box-shadow: 0 0 0 2px rgba(232, 200, 74, 0.15), 0 0 14px rgba(232, 200, 74, 0.4), 0 0 28px rgba(232, 200, 74, 0.12);
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

.field-hint { color: #777; font-size: 11px; margin: 0; }

.fit-arc-btn {
  background: #1e1e28;
  border: 1px solid #3a3a4a;
  border-radius: 4px;
  color: #aaa;
  cursor: pointer;
  font-size: 11px;
  padding: 5px 10px;
  transition: border-color 0.15s, color 0.15s;
  width: 100%;
}
.fit-arc-btn:hover:not(:disabled) { border-color: #e8c84a; color: #e8c84a; }
.fit-arc-btn:disabled { color: #444; cursor: default; }

.font-preview {
  color: #ccc;
  font-size: 14px;
  letter-spacing: 0.02em;
  margin-top: 2px;
  display: block;
}
.font-preview.font-loading {
  color: #666;
  font-family: system-ui, sans-serif !important;
  font-size: 11px;
  font-style: italic;
}

.panel-fade-enter-active,
.panel-fade-leave-active { transition: opacity 0.18s ease; }
.panel-fade-enter-from,
.panel-fade-leave-to { opacity: 0; }
</style>
