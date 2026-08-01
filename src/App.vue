<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import BadgeComposer from './components/BadgeComposer.vue'
import IconPicker from './components/IconPicker.vue'
import TextEditor from './components/TextEditor.vue'
import { useBadgeConfig } from './composables/useBadgeConfig.js'
import { shapes, shapeGroups } from './data/shapes.js'
import { iconsById } from './data/icons.js'

const {
  config,
  selectedSymbolId,
  selectedTextId,
  setShape,
  setBackgroundType,
  setBackgroundColor,
  setBorderColor,
  setBorderWidth,
  addSymbol,
  removeSymbol,
  updateSymbol,
  updateSymbolPosition,
  selectSymbol,
  addText,
  removeText,
  updateText,
  updateTextPosition,
  selectText,
} = useBadgeConfig()

const bgTypes = ['solid', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'striped-v', 'striped-h']

const shapesByGroup = computed(() =>
  Object.fromEntries(shapeGroups.map(g => [g, shapes.filter(s => s.group === g)]))
)

// Auto-scroll sidebar to selected symbol row
const symRefs = {}
function setSymRef(el, instanceId) {
  if (el) symRefs[instanceId] = el
  else delete symRefs[instanceId]
}

watch(selectedSymbolId, async (id) => {
  if (!id) return
  await nextTick()
  symRefs[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})
</script>

<template>
  <div class="app">
    <main class="app-body">
      <!-- Preview -->
      <section class="preview-pane">
        <BadgeComposer
          :config="config"
          :selected-symbol-id="selectedSymbolId"
          :size="380"
          uid="main"
          @update-text-position="updateTextPosition"
          @update-symbol-position="updateSymbolPosition"
          @select-symbol="selectSymbol"
          @select-text="selectText"
        />
        <p class="drag-hint">Drag symbols and text to reposition</p>
      </section>

      <!-- Controls -->
      <aside class="controls-pane">

        <p class="logo">⚔ Crest Forge</p>

        <!-- Shape -->
        <div class="control-group">
          <h3 class="control-label">Shape</h3>
          <div v-for="group in shapeGroups" :key="group" class="shape-group">
            <p class="shape-group-label">{{ group }}</p>
            <div class="shape-grid">
              <button
                v-for="s in shapesByGroup[group]"
                :key="s.id"
                class="shape-btn"
                :class="{ active: config.shapeId === s.id }"
                @click="setShape(s.id)"
                :title="s.label"
              >
                <svg viewBox="0 0 200 240" width="40" height="48">
                  <path :d="s.path" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Text -->
        <div class="control-group">
          <h3 class="control-label">Text</h3>
          <TextEditor
            :texts="config.texts"
            :selected-text-id="selectedTextId"
            @add-text="addText"
            @remove-text="removeText"
            @update-text="updateText"
            @select-text="selectText"
          />
        </div>

        <!-- Symbol Gallery -->
        <div class="control-group">
          <h3 class="control-label">Add Symbol</h3>
          <IconPicker @add-icon="addSymbol" />
        </div>

        <!-- Placed Symbols -->
        <div v-if="config.symbols.length" class="control-group">
          <h3 class="control-label">Placed Symbols</h3>
          <div class="symbol-list">
            <div
              v-for="sym in config.symbols"
              :key="sym.instanceId"
              :ref="el => setSymRef(el, sym.instanceId)"
              class="symbol-item"
              :class="{ selected: selectedSymbolId === sym.instanceId }"
              @click="selectSymbol(sym.instanceId)"
            >
              <div class="sym-row">
                <svg viewBox="0 0 100 100" width="28" height="28" class="sym-preview">
                  <path
                    v-for="(p, i) in iconsById[sym.iconId]?.paths"
                    :key="i"
                    :d="p"
                    :fill="sym.color"
                  />
                </svg>

                <span class="sym-label">{{ iconsById[sym.iconId]?.label }}</span>

                <div class="sym-controls">
                  <input
                    type="color"
                    :value="sym.color"
                    class="sym-color"
                    title="Symbol color"
                    @click.stop
                    @input.stop="updateSymbol(sym.instanceId, { color: $event.target.value })"
                  />
                  <button
                    class="sym-remove"
                    title="Remove"
                    @click.stop="removeSymbol(sym.instanceId)"
                  >×</button>
                </div>
              </div>

              <!-- Inline size slider, visible when this row is selected -->
              <div v-if="selectedSymbolId === sym.instanceId" class="sym-size">
                <label>
                  Size
                  <input
                    type="range" min="20" max="160"
                    :value="sym.size"
                    @click.stop
                    @input.stop="updateSymbol(sym.instanceId, { size: Number($event.target.value) })"
                  />
                  <span>{{ sym.size }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Background -->
        <div class="control-group">
          <h3 class="control-label">Background</h3>
          <div class="bg-type-grid">
            <button
              v-for="t in bgTypes"
              :key="t"
              class="bg-type-btn"
              :class="{ active: config.background.type === t }"
              @click="setBackgroundType(t)"
            >{{ t }}</button>
          </div>
          <div class="color-row">
            <label>
              Color 1
              <input type="color" :value="config.background.colors[0]"
                @input="setBackgroundColor(0, $event.target.value)" />
            </label>
            <label v-if="config.background.type !== 'solid'">
              Color 2
              <input type="color" :value="config.background.colors[1]"
                @input="setBackgroundColor(1, $event.target.value)" />
            </label>
          </div>
        </div>

        <!-- Border -->
        <div class="control-group">
          <h3 class="control-label">Border</h3>
          <div class="color-row">
            <label>
              Color
              <input type="color" :value="config.border.color"
                @input="setBorderColor($event.target.value)" />
            </label>
          </div>
          <div class="range-row">
            <label>
              Thickness
              <input
                type="range" min="0" max="12" step="0.5"
                :value="config.border.width"
                @input="setBorderWidth($event.target.value)"
              />
              <span>{{ config.border.width }}</span>
            </label>
          </div>
        </div>

      </aside>
    </main>
  </div>
</template>

<style>
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #0f0f13;
  color: #e8e8ec;
  font-family: system-ui, sans-serif;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.logo {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #e8c84a;
  margin: 0 0 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2a2a35;
}

.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  overflow: hidden;
}

.drag-hint { font-size: 12px; color: #555; }

.controls-pane {
  width: 300px;
  border-left: 1px solid #2a2a35;
  background: #13131a;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.control-group {}

.control-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin: 0 0 10px;
}

.shape-group { margin-bottom: 12px; }
.shape-group-label { font-size: 11px; color: #555; margin: 0 0 6px; }

.shape-grid { display: flex; flex-wrap: wrap; gap: 6px; }

.shape-btn {
  background: #1e1e28;
  border: 2px solid #2a2a35;
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
  color: #556;
  transition: border-color 0.15s, color 0.15s;
}
.shape-btn:hover { border-color: #555; color: #aaa; }
.shape-btn.active { border-color: #e8c84a; color: #e8c84a; }

.bg-type-grid { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }

.bg-type-btn {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 4px;
  color: #aaa;
  font-size: 11px;
  padding: 4px 8px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.bg-type-btn:hover { border-color: #555; color: #ddd; }
.bg-type-btn.active { border-color: #e8c84a; color: #e8c84a; }

.color-row { display: flex; gap: 16px; margin-bottom: 10px; }

.color-row label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: #888;
}

.color-row input[type="color"] {
  width: 44px;
  height: 32px;
  padding: 2px;
  border: 1px solid #2a2a35;
  border-radius: 4px;
  background: #1e1e28;
  cursor: pointer;
}

.range-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;
}
.range-row input[type="range"] { flex: 1; accent-color: #e8c84a; }
.range-row span { font-size: 11px; color: #ccc; min-width: 24px; text-align: right; }

/* Placed symbols list */
.symbol-list { display: flex; flex-direction: column; gap: 6px; }

.symbol-item {
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s;
  overflow: hidden;
}
.symbol-item:hover { border-color: #555; }
.symbol-item.selected { border-color: #e8c84a; }

.sym-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
}

.sym-preview { flex-shrink: 0; }

.sym-label {
  flex: 1;
  font-size: 12px;
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sym-controls { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.sym-color {
  width: 28px;
  height: 24px;
  padding: 1px;
  border: 1px solid #3a3a48;
  border-radius: 3px;
  background: #13131a;
  cursor: pointer;
}

.sym-remove {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0 2px;
  transition: color 0.15s;
}
.sym-remove:hover { color: #e05555; }

.sym-size {
  background: #191922;
  border-top: 1px solid #2a2a35;
  padding: 6px 8px;
}
.sym-size label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #888;
}
.sym-size input[type="range"] { flex: 1; accent-color: #e8c84a; }
.sym-size span { font-size: 11px; color: #ccc; min-width: 24px; text-align: right; }
</style>
