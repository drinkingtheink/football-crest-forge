<script setup>
import { watch, nextTick } from 'vue'
import ColorPicker from './ColorPicker.vue'
import FontPicker from './FontPicker.vue'

const props = defineProps({
  texts: { type: Array, required: true },
  selectedTextId: { type: String, default: null },
  selectedTextIds: { type: Array, default: () => [] },
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
  { value: 'arch',   label: 'Arch' },
  { value: 'top',    label: 'Arc top' },
  { value: 'bottom', label: 'Arc bottom' },
]

function onFontPick(textId, family) {
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
        :class="{ selected: selectedTextIds.includes(text.id) }"
        @click="$emit('select-text', text.id, $event.shiftKey || $event.metaKey)"
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
            <FontPicker
              :value="text.fontFamily"
              @preview="onFontPick(text.id, $event)"
              @change="onFontPick(text.id, $event)"
            />
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

          <div class="field">
            <span>Outline <em>{{ text.strokeWidth || 0 }}</em></span>
            <div class="stroke-row">
              <ColorPicker
                :value="text.strokeColor || '#000000'"
                @click.stop
                @change="$emit('update-text', text.id, { strokeColor: $event })"
              />
              <input
                type="range" min="0" max="16" step="0.25"
                :value="text.strokeWidth || 0"
                class="stroke-range"
                @input="$emit('update-text', text.id, { strokeWidth: Number($event.target.value) })"
              />
            </div>
          </div>

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

          <!-- Rotation (straight text only) -->
          <label v-if="!text.arc" class="field">
            <span>Rotation <em>{{ text.rotation ?? 0 }}°</em></span>
            <div class="rotation-row">
              <input
                type="range" min="-180" max="180"
                :value="text.rotation ?? 0"
                @input="$emit('update-text', text.id, { rotation: Number($event.target.value) })"
              />
              <button
                type="button"
                class="rotation-reset"
                title="Reset rotation to 0°"
                @click="$emit('update-text', text.id, { rotation: 0 })"
              >⟲</button>
            </div>
          </label>

          <!-- Arc / Arch controls (only when not straight) -->
          <template v-if="text.arc">
            <!-- Arch mode: single height slider -->
            <label v-if="text.arc === 'arch'" class="field">
              <span>Arch height <em>{{ text.archHeight ?? 40 }}</em></span>
              <input
                type="range" min="-240" max="240"
                :value="text.archHeight ?? 40"
                @input="$emit('update-text', text.id, { archHeight: Number($event.target.value) })"
              />
            </label>

            <!-- Arc top / bottom: radius + fit controls -->
            <template v-else>
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
              <button
                class="fit-arc-btn"
                :disabled="!shapeFit"
                :title="shapeFit ? 'Set arc curvature to match badge shape' : 'Only available on circular and oval badges'"
                @click.stop="$emit('fit-arc', text.id)"
              >Fit to badge</button>
            </template>

            <!-- Vertical position — all curved modes -->
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
  transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
  width: 100%;
}
.add-btn:hover { border-color: var(--accent-warm); color: var(--accent-warm); box-shadow: 0 0 10px var(--accent-warm-glow); }

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

.stroke-row { display: flex; align-items: center; gap: 8px; }
.stroke-range { flex: 1; accent-color: var(--accent-warm); }

.rotation-row { display: flex; align-items: center; gap: 6px; }
.rotation-row input { flex: 1; }
.rotation-reset {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 4px;
  border: 1px solid #2a2a35;
  background: #1e1e28;
  color: #888;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.rotation-reset:hover { border-color: #e8c84a; color: #e8c84a; }

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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #2a2a35;
  border-radius: 4px;
  color: #e8e8ec;
  font-size: 12px;
  padding: 5px 8px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.t-input:focus,
.t-number:focus,
.t-select:focus {
  border-color: var(--accent-warm);
  box-shadow: 0 0 0 2px rgba(255, 122, 46, 0.18), 0 0 14px var(--accent-warm-glow);
}

.field input[type="range"] { accent-color: var(--accent-warm); width: 100%; }

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
