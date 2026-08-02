<script setup>
import { computed, ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import BadgeComposer from './components/BadgeComposer.vue'
import IconPicker from './components/IconPicker.vue'
import TextEditor from './components/TextEditor.vue'
import ToastContainer from './components/ToastContainer.vue'
import ColorPicker from './components/ColorPicker.vue'
import ClubPicker from './components/ClubPicker.vue'
import AppBackground from './components/AppBackground.vue'
import { useBadgeConfig } from './composables/useBadgeConfig.js'
import { clubs } from './data/clubs.js'
import { shapes, shapeGroups } from './data/shapes.js'
import { iconsById } from './data/icons.js'
import { loadFont } from './utils/fonts.js'
import { wavesBg, crisscrossBg } from './utils/patterns.js'
import { burstParticles } from './utils/particles.js'

const {
  config,
  selectedSymbolId,
  selectedTextId,
  setPaletteColor,
  addPaletteColor,
  removePaletteColor,
  setPalette,
  setShape,
  setBackgroundType,
  setStripeCount,
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

const bgTypes = ['solid', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'striped-v', 'striped-h', 'striped-diagonal']
const stripeTypes = new Set(['striped-v', 'striped-h', 'striped-diagonal'])
const imageBgTypes = new Set(['grass', 'stadium', 'fabric', 'brick', 'pitch'])

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

const bgOptions = [
  { id: 'grass',       label: 'Grass',      thumb: '/backgrounds/grass.jpg', isImgOption: true },
  { id: 'stadium',     label: 'Stadium',    thumb: '/backgrounds/stadium.png', isImgOption: true },
  { id: 'fabric',      label: 'Fabric',     thumb: '/backgrounds/fabric.png', isImgOption: true },
  { id: 'brick',       label: 'Brick',      thumb: '/backgrounds/brick.jpg', isImgOption: true },
  { id: 'pitch',       label: 'Pitch',      thumb: '/backgrounds/pitch.png', isImgOption: true },
  { id: 'bokeh',       label: 'Bokeh' },
  { id: 'waves',       label: 'Waves' },
  { id: 'crisscross',  label: 'Criss-Cross' },
]

const appBg = ref(bgOptions[Math.floor(Math.random() * bgOptions.length)].id)
const overlay = reactive({ color: '#000000', opacity: 0.25 })

const wavesThumb = computed(() => wavesBg(config.palette))
const crisscrossThumb = computed(() => crisscrossBg(config.palette))

function onKeyDown(e) {
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (selectedSymbolId.value) removeSymbol(selectedSymbolId.value)
  else if (selectedTextId.value) removeText(selectedTextId.value)
}

const controlsPane  = ref(null)
const particleCanvas = ref(null)
const badgeWrap      = ref(null)
const isPulsing      = ref(false)
let   stopParticles  = null
let   pulseTimer     = null
let   burstTimer     = null

function forwardScroll(e) {
  controlsPane.value?.scrollBy({ top: e.deltaY, behavior: 'auto' })
}

function sizeCanvas() {
  const c = particleCanvas.value
  if (!c) return
  c.width  = c.offsetWidth
  c.height = c.offsetHeight
}

function triggerEffects() {
  const c = particleCanvas.value
  const b = badgeWrap.value
  if (!c || !b) return

  // Badge center in canvas coordinates
  const cr = c.getBoundingClientRect()
  const br = b.getBoundingClientRect()
  const cx = br.left + br.width  / 2 - cr.left
  const cy = br.top  + br.height / 2 - cr.top

  stopParticles?.()
  stopParticles = burstParticles(c, cx, cy, config.palette)

  // Badge pulse
  isPulsing.value = false
  clearTimeout(pulseTimer)
  nextTick(() => {
    isPulsing.value = true
    pulseTimer = setTimeout(() => { isPulsing.value = false }, 400)
  })
}

// Watch only design-relevant fields — excludes x/y positions so drag
// events and range-slider scrubbing don't spam the particle burst.
const _designFingerprint = computed(() => JSON.stringify({
  shapeId:    config.shapeId,
  palette:    config.palette,
  background: config.background,
  border:     config.border,
  texts:   config.texts.map(({ id, content, fontFamily, fontWeight, fontSize, color, letterSpacing, arc, arcRadius }) =>
             ({ id, content, fontFamily, fontWeight, fontSize, color, letterSpacing, arc, arcRadius })),
  symbols: config.symbols.map(({ instanceId, iconId, color, size }) =>
             ({ instanceId, iconId, color, size })),
}))

watch(_designFingerprint, () => {
  clearTimeout(burstTimer)
  burstTimer = setTimeout(triggerEffects, 350)
})

onMounted(() => {
  loadFont('EB Garamond')
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', sizeCanvas)
  nextTick(sizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', sizeCanvas)
  stopParticles?.()
})

function randomizeAll() {
  const club     = clubs[Math.floor(Math.random() * clubs.length)]
  const shape    = shapes[Math.floor(Math.random() * shapes.length)]
  const bgType   = bgTypes[Math.floor(Math.random() * bgTypes.length)]
  const third    = club.colors[2]?.hex

  setPalette(club.colors.map(c => c.hex))
  setShape(shape.id)
  setBackgroundType(bgType)
  setStripeCount(Math.floor(Math.random() * 11) + 2)
  setBorderColor(third || '#ffffff')
  setBorderWidth(third ? Math.floor(Math.random() * 5) + 2 : 0)
  appBg.value = bgOptions[Math.floor(Math.random() * bgOptions.length)].id
}

const showScene = ref(true)
</script>

<template>
  <div class="app">
    <AppBackground :type="appBg" />
    <div
      class="app-overlay"
      :style="imageBgTypes.has(appBg) ? { background: overlay.color, opacity: overlay.opacity } : { opacity: 0 }"
    />
    <ToastContainer />
    <main class="app-body">
      <!-- Preview -->
      <section class="preview-pane" @wheel.prevent="forwardScroll">
        <canvas ref="particleCanvas" class="particle-canvas" />
        <div ref="badgeWrap" :class="['badge-wrap', { pulsing: isPulsing }]">
          <BadgeComposer
            :config="config"
            :selected-symbol-id="selectedSymbolId"
            :size="380"
            uid="main"
            @update-text="updateText"
            @update-text-position="updateTextPosition"
            @update-symbol-position="updateSymbolPosition"
            @select-symbol="selectSymbol"
            @select-text="selectText"
          />
        </div>
        <div class="scene-wrap">
          <button class="scene-toggle hud-pill" @click="showScene = !showScene" title="Toggle scene controls">
            {{ showScene ? '▲ scene' : '▼ scene' }}
          </button>

          <div v-show="showScene" class="scene-controls">
            <p class="drag-hint hud-pill">Drag symbols and text to reposition</p>

            <div class="bg-picker hud-pill">
              <button
                v-for="opt in bgOptions"
                :key="opt.id"
                class="bg-opt"
                :class="{ active: appBg === opt.id }"
                :title="opt.label"
                :style="opt.id === 'waves' ? wavesThumb : opt.id === 'crisscross' ? crisscrossThumb : {}"
                @click="appBg = opt.id"
              >
                <img v-if="opt.thumb" :src="opt.thumb" class="bg-opt-thumb" />
                <span v-else-if="opt.id === 'bokeh'"    class="bg-opt-bokeh" />
                <span v-else-if="opt.id === 'none'"     class="bg-opt-none" />
              </button>
            </div>

            <div class="overlay-controls hud-pill">
              <input
                type="color"
                :value="overlay.color"
                class="overlay-color"
                title="Overlay color"
                @input="overlay.color = $event.target.value"
              />
              <input
                type="range" min="0" max="1" step="0.05"
                :value="overlay.opacity"
                class="overlay-opacity"
                @input="overlay.opacity = Number($event.target.value)"
              />
              <span class="overlay-label">overlay</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Controls -->
      <aside class="controls-pane" ref="controlsPane">

        <div class="logo-row">
          <p class="logo">⚔ Crest Forge</p>
          <button class="randomize-btn" title="Randomize everything" @click="randomizeAll">&#9861;</button>
        </div>

        <!-- Club Colors / Palette -->
        <div class="control-group">
          <h3 class="control-label">Club Colors</h3>
          <ClubPicker @apply="setPalette" />
          <div class="palette-editor" style="margin-top: 10px;">
            <div
              v-for="(color, i) in config.palette"
              :key="i"
              class="palette-slot"
              :style="{ background: color }"
              :title="color"
            >
              <input
                type="color"
                :value="color"
                class="palette-input-overlay"
                @input="setPaletteColor(i, $event.target.value)"
              />
              <button
                class="palette-remove"
                title="Remove color"
                @click.stop="removePaletteColor(i)"
              >×</button>
            </div>
            <button
              v-if="config.palette.length < 6"
              class="palette-add"
              title="Add color"
              @click="addPaletteColor"
            >+</button>
          </div>
          <p class="palette-hint">Click to change · hover to remove · up to 6 colors</p>
        </div>

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
          <div v-if="stripeTypes.has(config.background.type)" class="stripe-count-row">
            <span class="color-label">Stripes</span>
            <div class="stripe-stepper">
              <button class="stepper-btn" @click="setStripeCount(config.background.stripeCount - 1)">−</button>
              <span class="stepper-val">{{ config.background.stripeCount }}</span>
              <button class="stepper-btn" @click="setStripeCount(config.background.stripeCount + 1)">+</button>
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
                  <ColorPicker
                    :value="sym.color"
                    @click.stop
                    @change="updateSymbol(sym.instanceId, { color: $event })"
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

        <!-- Border -->
        <div class="control-group">
          <h3 class="control-label">Border</h3>
          <div class="bg-color-row" style="margin-bottom: 10px">
            <span class="color-label">Color</span>
            <ColorPicker :value="config.border.color" @change="setBorderColor($event)" />
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
  color: #e8e8ec;
  font-family: system-ui, sans-serif;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid #2a2a35;
}

.logo {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #e8c84a;
  margin: 0;
}

.randomize-btn {
  background: none;
  border: 1px solid #3a3a4a;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 3px 7px;
  transition: border-color 0.15s, color 0.15s;
}
.randomize-btn:hover {
  border-color: #e8c84a;
  color: #e8c84a;
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
  position: relative;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  width: 100%;
  height: 100%;
}

@keyframes badge-pulse {
  0%   { transform: scale(1); filter: drop-shadow(0 0 0px rgba(232,200,74,0)); }
  30%  { transform: scale(1.035); filter: drop-shadow(0 0 18px rgba(232,200,74,0.7)); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(232,200,74,0)); }
}

.badge-wrap {
  display: inline-flex;
}

.badge-wrap.pulsing {
  animation: badge-pulse 0.35s ease-out forwards;
}

.hud-pill {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  padding: 5px 8px;
}

.scene-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.scene-toggle {
  font-size: 11px;
  color: #b9b6b6;
  border: none;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: color 0.15s;
}
.scene-toggle:hover { color: #fff; }

.scene-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drag-hint { font-size: 12px; color: #b9b6b6; margin: 0; }

.app-overlay {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.bg-picker {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.bg-opt {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  background: #1a1a24;
  transition: border-color 0.15s, transform 0.1s;
  flex-shrink: 0;
}
.bg-opt:hover   { transform: scale(1.1); border-color: rgba(255,255,255,0.3); }
.bg-opt.active  { border-color: #e8c84a; }

.bg-opt-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.bg-opt-none {
  display: block;
  width: 100%;
  height: 100%;
  background: #07070e;
}

.bg-opt-bokeh {
  display: block;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 40%, rgba(100,120,255,0.6) 0%, transparent 60%),
              radial-gradient(circle at 70% 60%, rgba(255,100,150,0.5) 0%, transparent 55%),
              radial-gradient(circle at 50% 30%, rgba(255,200,80,0.4) 0%, transparent 50%),
              #07070e;
}

.overlay-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.overlay-color {
  width: 24px;
  height: 24px;
  padding: 1px;
  border: 1px solid #3a3a48;
  border-radius: 4px;
  background: #1e1e28;
  cursor: pointer;
  flex-shrink: 0;
}

.overlay-opacity {
  flex: 1;
  accent-color: #e8c84a;
}

.overlay-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}

.controls-pane {
  width: 300px;
  border-left: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(10, 10, 18, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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
  color: #e8d06a;
  text-shadow:
    0 0 4px rgba(232, 208, 106, 0.95),
    0 0 12px rgba(232, 200, 74, 0.5),
    0 0 24px rgba(232, 200, 74, 0.2);
  margin: 0 0 10px;
}

.shape-group { margin-bottom: 12px; }
.shape-group-label {
  font-size: 11px;
  color: #b89e50;
  text-shadow: 0 0 8px rgba(232, 200, 74, 0.25);
  margin: 0 0 6px;
}

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

/* Club Colors palette editor */
.palette-editor {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.palette-slot {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
  flex: 1;
}

.palette-slot:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.04);
}

.palette-input-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.palette-remove {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #1e1e28;
  border: 1px solid #555;
  color: #aaa;
  font-size: 11px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background 0.12s, color 0.12s;
}
.palette-remove:hover { background: #e05555; border-color: #e05555; color: #fff; }
.palette-slot:hover .palette-remove { display: flex; }

.palette-add {
  flex: 1;
  min-width: 36px;
  border-radius: 6px;
  border: 2px dashed #3a3a4a;
  background: transparent;
  color: #555;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.palette-add:hover { border-color: #e8c84a; color: #e8c84a; }

.palette-hint {
  font-size: 11px;
  color: #888;
  margin: 0;
  line-height: 1.4;
}

/* Stripe count stepper */
.stripe-count-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.stripe-stepper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stepper-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #3a3a48;
  background: #1e1e28;
  color: #ccc;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.12s, color 0.12s;
}
.stepper-btn:hover { border-color: #e8c84a; color: #e8c84a; }

.stepper-val {
  font-size: 13px;
  color: #e8e8ec;
  min-width: 18px;
  text-align: center;
}

/* Background / border color rows */
.bg-color-stack { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }

.bg-color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-label {
  font-size: 11px;
  color: #aaa;
  min-width: 44px;
}

.range-row label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #aaa;
}
.range-row input[type="range"] { flex: 1; accent-color: #e8c84a; }
.range-row span { font-size: 11px; color: #ddd; min-width: 24px; text-align: right; }

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
  color: #aaa;
}
.sym-size input[type="range"] { flex: 1; accent-color: #e8c84a; }
.sym-size span { font-size: 11px; color: #ddd; min-width: 24px; text-align: right; }
</style>
