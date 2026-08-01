<script setup>
import { computed } from 'vue'
import BadgeComposer from './components/BadgeComposer.vue'
import { useBadgeConfig } from './composables/useBadgeConfig.js'
import { shapes, shapeGroups } from './data/shapes.js'

const { config, setShape, setBackgroundType, setBackgroundColor, setBorderColor, updateTextPosition } = useBadgeConfig()

const bgTypes = ['solid', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'striped-v', 'striped-h']

const shapesByGroup = computed(() =>
  Object.fromEntries(shapeGroups.map(g => [g, shapes.filter(s => s.group === g)]))
)
</script>

<template>
  <div class="app">
    <header class="app-header">
      <span class="logo">⚔ Crest Forge</span>
    </header>

    <main class="app-body">
      <!-- Preview -->
      <section class="preview-pane">
        <BadgeComposer
          :config="config"
          :size="380"
          uid="main"
          @update-text-position="updateTextPosition"
        />
        <p class="drag-hint">Drag the text labels to reposition them</p>
      </section>

      <!-- Controls -->
      <aside class="controls-pane">

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
        </div>

      </aside>
    </main>
  </div>
</template>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0f0f13;
  color: #e8e8ec;
  font-family: system-ui, sans-serif;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 52px;
  border-bottom: 1px solid #2a2a35;
  background: #15151c;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #e8c84a;
}

.app-body {
  display: flex;
  flex: 1;
  gap: 0;
}

/* Preview */
.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px;
  min-height: 0;
}

.drag-hint {
  font-size: 12px;
  color: #666;
}

/* Controls */
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

/* Shape picker */
.shape-group {
  margin-bottom: 12px;
}

.shape-group-label {
  font-size: 11px;
  color: #555;
  margin: 0 0 6px;
}

.shape-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.shape-btn {
  background: #1e1e28;
  border: 2px solid #2a2a35;
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
  color: #556;
  transition: border-color 0.15s, color 0.15s;
}

.shape-btn:hover {
  border-color: #555;
  color: #aaa;
}

.shape-btn.active {
  border-color: #e8c84a;
  color: #e8c84a;
}

/* Background type */
.bg-type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}

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

/* Color inputs */
.color-row {
  display: flex;
  gap: 16px;
}

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
</style>
