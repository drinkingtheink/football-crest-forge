<script setup>
import { computed, ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import BadgeComposer from './components/BadgeComposer.vue'
import IconPicker from './components/IconPicker.vue'
import TextEditor from './components/TextEditor.vue'
import ToastContainer from './components/ToastContainer.vue'
import ColorPicker from './components/ColorPicker.vue'
import ClubPicker from './components/ClubPicker.vue'
import AppBackground from './components/AppBackground.vue'
import SnapshotPanel from './components/SnapshotPanel.vue'
import { useBadgeConfig } from './composables/useBadgeConfig.js'
import { saveSnapshot } from './utils/snapshots.js'
import { clubs } from './data/clubs.js'
import { shapes, shapesById } from './data/shapes.js'
import { icons, iconsById } from './data/icons.js'
import { auroraBg, wavesBg, crisscrossBg } from './utils/patterns.js'
import { burstParticles } from './utils/particles.js'
import { useToast } from './composables/useToast.js'

const { addToast } = useToast()

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
  setSashWidth,
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
  pasteSymbol,
  pasteText,
  deselectAll,
  loadConfig,
} = useBadgeConfig()

const clipboard = ref(null)

const bgTypes = ['solid', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'chevron', 'sash', 'striped-v', 'striped-h', 'striped-diagonal']
const stripeTypes = new Set(['striped-v', 'striped-h', 'striped-diagonal'])
const imageBgTypes = new Set(['grass', 'stadium', 'fabric', 'brick', 'pitch'])

// Auto-scroll sidebar to selected symbol row
const symRefs = {}
function setSymRef(el, instanceId) {
  if (el) symRefs[instanceId] = el
  else delete symRefs[instanceId]
}

watch(selectedSymbolId, async (id) => {
  if (!id) return
  await nextTick()
  setTimeout(() => symRefs[id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120)
})

const bgOptions = [
  { id: 'grass',       label: 'Grass',      thumb: '/backgrounds/grass.jpg', isImgOption: true },
  { id: 'stadium',     label: 'Stadium',    thumb: '/backgrounds/stadium.png', isImgOption: true },
  { id: 'fabric',      label: 'Fabric',     thumb: '/backgrounds/fabric.png', isImgOption: true },
  { id: 'brick',       label: 'Brick',      thumb: '/backgrounds/brick.jpg', isImgOption: true },
  { id: 'pitch',       label: 'Pitch',      thumb: '/backgrounds/pitch.png', isImgOption: true },
  { id: 'bokeh',       label: 'Bokeh' },
  { id: 'aurora',      label: 'Aurora' },
  { id: 'waves',       label: 'Waves' },
  { id: 'crisscross',  label: 'Criss-Cross' },
]

const appBg = ref(bgOptions[Math.floor(Math.random() * bgOptions.length)].id)
const overlay = reactive({ color: config.palette[0] ?? '#000000', opacity: 0.7 })

const activeClub = ref(null)
const activeClubModified = computed(() => {
  if (!activeClub.value) return false
  const original = activeClub.value.colors.map(c => c.hex.toLowerCase())
  if (original.length !== config.palette.length) return true
  return original.some((c, i) => c !== config.palette[i]?.toLowerCase())
})

function applyClub(club) {
  setPalette(club.colors.map(c => c.hex))
  activeClub.value = club
}
watch(() => config.palette[0], c => { if (c) overlay.color = c })

const auroraThumb    = computed(() => auroraBg(config.palette))
const wavesThumb     = computed(() => wavesBg(config.palette))
const crisscrossThumb = computed(() => crisscrossBg(config.palette))

const _ARROW_DELTA = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

function onPickIcon(iconId) {
  if (selectedSymbolId.value) {
    updateSymbol(selectedSymbolId.value, { iconId })
  } else {
    addSymbol(iconId)
  }
}

function onKeyDown(e) {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault()
    snapshotPanelRef.value?.startSave()
    return
  }

  if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
    if (selectedSymbolId.value) {
      const sym = config.symbols.find(s => s.instanceId === selectedSymbolId.value)
      if (sym) clipboard.value = { type: 'symbol', data: { ...sym } }
    } else if (selectedTextId.value) {
      const text = config.texts.find(t => t.id === selectedTextId.value)
      if (text) clipboard.value = { type: 'text', data: { ...text } }
    }
    return
  }

  if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
    if (!clipboard.value) return
    e.preventDefault()
    if (clipboard.value.type === 'symbol') pasteSymbol(clipboard.value.data)
    else pasteText(clipboard.value.data)
    return
  }

  if (e.key in _ARROW_DELTA) {
    e.preventDefault()
    const step = e.shiftKey ? 10 : 1
    const [dx, dy] = _ARROW_DELTA[e.key].map(v => v * step)
    if (selectedSymbolId.value) {
      const sym = config.symbols.find(s => s.instanceId === selectedSymbolId.value)
      if (sym) updateSymbolPosition(selectedSymbolId.value, sym.x + dx, sym.y + dy)
    } else if (selectedTextId.value) {
      const text = config.texts.find(t => t.id === selectedTextId.value)
      if (text) {
        if (text.arc) {
          updateText(selectedTextId.value, { arcX: (text.arcX ?? 100) + dx, arcY: (text.arcY ?? 120) + dy })
        } else {
          updateTextPosition(selectedTextId.value, (text.x ?? 100) + dx, (text.y ?? 120) + dy)
        }
      }
    }
    return
  }

  if (e.key === 'Escape') { deselectAll(); return }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); randomizeAll(); return }
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  if (selectedSymbolId.value) removeSymbol(selectedSymbolId.value)
  else if (selectedTextId.value) removeText(selectedTextId.value)
}

const controlsPane    = ref(null)
const particleCanvas  = ref(null)
const badgeWrap       = ref(null)
const snapshotPanelRef = ref(null)

async function doSaveSnapshot(name) {
  const svgEl = badgeWrap.value?.querySelector('svg')
  return saveSnapshot(name, config, svgEl)
}
const isPulsing      = ref(false)
const isBadgeActive  = ref(false)
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
  texts:   config.texts.map(({ id, content, fontFamily, fontWeight, fontSize, color, letterSpacing, arc, arcRx, arcRy }) =>
             ({ id, content, fontFamily, fontWeight, fontSize, color, letterSpacing, arc, arcRx, arcRy })),
  symbols: config.symbols.map(({ instanceId, iconId, color, size }) =>
             ({ instanceId, iconId, color, size })),
}))

watch(_designFingerprint, () => {
  clearTimeout(burstTimer)
  burstTimer = setTimeout(triggerEffects, 350)
})

const currentShapeFit = computed(() => shapesById[config.shapeId]?.arcFit ?? null)

function fitArcToShape(textId) {
  const fit = currentShapeFit.value
  if (!fit) return
  updateText(textId, { arcRx: fit.rx, arcRy: fit.ry, arcX: fit.cx, arcY: fit.cy })
}

function onDocumentClick(e) {
  if (!selectedSymbolId.value && !selectedTextId.value) return
  if (e.target.closest('svg')) return
  if (e.target.closest('.symbol-item, .text-item')) return
  deselectAll()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', sizeCanvas)
  document.addEventListener('click', onDocumentClick)
  nextTick(sizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', sizeCanvas)
  document.removeEventListener('click', onDocumentClick)
  stopParticles?.()
})

function onSymbolOutsideBounds(instanceId) {
  addToast('Symbol outside badge bounds', {
    type: 'tip',
    duration: 7000,
    action: { label: 'Go Free', fn: () => updateSymbol(instanceId, { clipped: false }) },
  })
}

function randomizeColors() {
  const club = clubs[Math.floor(Math.random() * clubs.length)]
  setPalette(club.colors.map(c => c.hex))
  activeClub.value = club
}

function randomizeAll() {
  const club     = clubs[Math.floor(Math.random() * clubs.length)]
  const shape    = shapes[Math.floor(Math.random() * shapes.length)]
  const bgType   = bgTypes[Math.floor(Math.random() * bgTypes.length)]
  const third    = club.colors[2]?.hex

  setPalette(club.colors.map(c => c.hex))
  setShape(shape.id)
  setBackgroundType(bgType)
  setStripeCount(Math.floor(Math.random() * 15) + 2)
  setBorderColor(third || '#ffffff')
  setBorderWidth(third ? Math.floor(Math.random() * 5) + 4 : 0)
  appBg.value = bgOptions[Math.floor(Math.random() * bgOptions.length)].id

  ;[...config.symbols].forEach(s => removeSymbol(s.instanceId))
  if (Math.random() < 1/3) {
    addSymbol(icons[Math.floor(Math.random() * icons.length)].id)
    const sym = config.symbols.find(s => s.instanceId === selectedSymbolId.value)
    if (third) {
      const strokeColor = config.palette.find(c => c.toLowerCase() !== third.toLowerCase()) ?? config.palette[0]
      updateSymbol(selectedSymbolId.value, { color: third, strokeWidth: 8, strokeColor })
    } else {
      const strokeColor = config.palette.find(c => c.toLowerCase() !== sym.color.toLowerCase())
        ?? (sym.color.toLowerCase() === '#000000' ? '#ffffff' : '#000000')
      updateSymbol(selectedSymbolId.value, { strokeWidth: 8, strokeColor })
    }
  }

  updateText('club-name', { y: 55 })
  updateText('year', { y: 185 })
  activeClub.value = club
}

const showScene = ref(true)

function stepBg(dir) {
  const idx = bgOptions.findIndex(o => o.id === appBg.value)
  appBg.value = bgOptions[(idx + dir + bgOptions.length) % bgOptions.length].id
}
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
      <section class="preview-pane" @wheel.prevent="forwardScroll" @mouseenter="isBadgeActive = true" @mouseleave="isBadgeActive = false">
        <canvas ref="particleCanvas" class="particle-canvas" />

        <button
          class="bg-arrow bg-arrow-left"
          :title="`← ${bgOptions[(bgOptions.findIndex(o => o.id === appBg) - 1 + bgOptions.length) % bgOptions.length].label}`"
          @click="stepBg(-1)"
        >‹</button>
        <button
          class="bg-arrow bg-arrow-right"
          :title="`${bgOptions[(bgOptions.findIndex(o => o.id === appBg) + 1) % bgOptions.length].label} →`"
          @click="stepBg(1)"
        >›</button>

        <div class="badge-float-wrap" :class="{ active: isBadgeActive }">
        <div ref="badgeWrap" :class="['badge-wrap', { pulsing: isPulsing }]">
          <BadgeComposer
            :config="config"
            :selected-symbol-id="selectedSymbolId"
            :size="380"
            uid="main"
            @update-text="updateText"
            @update-text-position="updateTextPosition"
            @update-symbol-position="updateSymbolPosition"
            @update-symbol="updateSymbol"
            @select-symbol="selectSymbol"
            @select-text="selectText"
            @deselect="deselectAll"
            @symbol-outside-bounds="onSymbolOutsideBounds"
          />
        </div>
        </div>
        <div class="scene-wrap">
          <button class="scene-toggle hud-pill" @click="showScene = !showScene" title="Toggle scene controls">
            {{ showScene ? '▲ scene' : '▼ scene' }}
          </button>

          <Transition name="scene-fade">
          <div v-show="showScene" class="scene-controls">
            <p class="drag-hint hud-pill">Drag or arrow-key symbols &amp; text &nbsp;·&nbsp; Shift+Arrow = 10px &nbsp;·&nbsp; ⌘C / ⌘V to copy &amp; paste &nbsp;·&nbsp; Space to randomize &nbsp;·&nbsp; ⌘S to snapshot</p>

            <div class="bg-picker hud-pill">
              <button
                v-for="opt in bgOptions"
                :key="opt.id"
                class="bg-opt"
                :class="{ active: appBg === opt.id }"
                :title="opt.label"
                :style="opt.id === 'aurora' ? auroraThumb : opt.id === 'waves' ? wavesThumb : opt.id === 'crisscross' ? crisscrossThumb : {}"
                @click="appBg = opt.id"
              >
                <img v-if="opt.thumb" :src="opt.thumb" class="bg-opt-thumb" />
                <span v-else-if="opt.id === 'bokeh'"    class="bg-opt-bokeh" />
                <span v-else-if="opt.id === 'none'"     class="bg-opt-none" />
              </button>
            </div>

            <div class="overlay-controls hud-pill" :style="{ visibility: imageBgTypes.has(appBg) ? 'visible' : 'hidden' }">
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
          </Transition>
        </div>
      </section>

      <!-- Controls -->
      <aside class="controls-pane" ref="controlsPane">

        <div class="logo-row">
          <p class="logo">⚔ Crest Forge</p>
          <button class="randomize-btn" title="Randomize everything" @click="randomizeAll">⚡</button>
        </div>

        <!-- Club Colors / Palette -->
        <div class="control-group">
          <h3 class="control-label">Club Colors</h3>
          <ClubPicker @apply="applyClub" />
          <button class="random-colors-btn" @click="randomizeColors" title="Load a random club's colors">⚡ Random Club Colors</button>
          <p v-if="activeClub" class="active-club-label">
            {{ activeClub.name }}<span v-if="activeClubModified" class="modified-flag"> · modified</span>
          </p>
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
          <div class="shape-grid">
            <button
              v-for="s in shapes"
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
          <div v-if="config.background.type === 'sash'" class="range-row">
            <label>
              Thickness
              <input
                type="range" min="68" max="280" step="4"
                :value="config.background.sashWidth"
                @input="setSashWidth(Number($event.target.value))"
              />
              <span>{{ config.background.sashWidth }}</span>
            </label>
          </div>
        </div>

        <!-- Text -->
        <div class="control-group">
          <h3 class="control-label">Text</h3>
          <TextEditor
            :texts="config.texts"
            :selected-text-id="selectedTextId"
            :shape-fit="currentShapeFit"
            @add-text="addText"
            @remove-text="removeText"
            @update-text="updateText"
            @select-text="selectText"
            @fit-arc="fitArcToShape"
          />
        </div>

        <!-- Symbol Gallery -->
        <div class="control-group">
          <h3 class="control-label">Add Symbol</h3>
          <IconPicker @add-icon="onPickIcon" />
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
                    :stroke="sym.strokeWidth > 0 ? sym.strokeColor : 'none'"
                    :stroke-width="sym.strokeWidth"
                    paint-order="stroke fill"
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

              <!-- Expanded controls, visible when this row is selected -->
              <Transition name="panel-fade">
              <div v-if="selectedSymbolId === sym.instanceId" class="sym-expanded" @click.stop>
                <label class="sym-field">
                  Size
                  <input
                    type="range" min="20" max="240"
                    :value="sym.size"
                    @input="updateSymbol(sym.instanceId, { size: Number($event.target.value) })"
                  />
                  <span>{{ sym.size }}</span>
                </label>
                <label v-if="iconsById[sym.iconId]?.supportsRing" class="sym-field">
                  Thickness
                  <input
                    type="range" min="2" max="44"
                    :value="sym.ringThickness ?? iconsById[sym.iconId]?.defaultRingThickness ?? 44"
                    @input="updateSymbol(sym.instanceId, { ringThickness: Number($event.target.value) })"
                  />
                  <span>{{ sym.ringThickness ?? iconsById[sym.iconId]?.defaultRingThickness ?? 44 }}</span>
                </label>
                <div class="sym-field sym-clip-row">
                  <span>Bounds</span>
                  <button
                    class="sym-clip-toggle"
                    :class="{ free: sym.clipped === false }"
                    @click.stop="updateSymbol(sym.instanceId, { clipped: sym.clipped === false ? true : false })"
                    :title="sym.clipped === false ? 'Click to clip to badge shape' : 'Click to allow outside badge bounds'"
                  >{{ sym.clipped === false ? 'Free' : 'Clipped' }}</button>
                </div>
                <div class="sym-field sym-stroke-row">
                  <span>Border</span>
                  <ColorPicker
                    :value="sym.strokeColor || '#000000'"
                    @change="updateSymbol(sym.instanceId, { strokeColor: $event })"
                  />
                  <input
                    type="range" min="0" max="10" step="0.5"
                    :value="sym.strokeWidth || 0"
                    class="sym-stroke-range"
                    @input="updateSymbol(sym.instanceId, { strokeWidth: Number($event.target.value) })"
                  />
                  <span>{{ sym.strokeWidth || 0 }}</span>
                </div>
              </div>
              </Transition>
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

        <!-- Snapshots -->
        <div class="control-group">
          <h3 class="control-label">Snapshots</h3>
          <SnapshotPanel
            ref="snapshotPanelRef"
            :save-fn="doSaveSnapshot"
            @load="loadConfig"
          />
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

.bg-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-size: 28px;
  line-height: 1;
  padding: 10px 14px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  user-select: none;
  z-index: 6;
}
.bg-arrow:hover {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.28);
  color: #fff;
}
.bg-arrow-left  { left: 14px; }
.bg-arrow-right { right: 14px; }

@keyframes badge-float {
  from { transform: translateY(0); }
  to   { transform: translateY(-5px); }
}

@keyframes badge-pulse {
  0%   { transform: scale(1);     filter: drop-shadow(0 0 0px  rgba(232,200,74,0));   }
  30%  { transform: scale(1.035); filter: drop-shadow(0 0 18px rgba(232,200,74,0.7)); }
  100% { transform: scale(1);     filter: drop-shadow(0 0 0px  rgba(232,200,74,0));   }
}

.badge-float-wrap {
  animation: badge-float 3.4s ease-in-out infinite alternate;
}
.badge-float-wrap.active {
  animation-play-state: paused;
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
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
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

.drag-hint { font-size: 12px; color: #b9b6b6; margin: 0; text-align: center; }

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

@media (min-width: 1440px) {
  .controls-pane { width: 360px; }
}

@media (min-width: 1920px) {
  .controls-pane { width: 420px; }
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
.shape-btn:hover  { border-color: #555; color: #aaa; }
.shape-btn:active { transform: scale(0.93); }
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
.bg-type-btn:hover  { border-color: #555; color: #ddd; }
.bg-type-btn:active { transform: scale(0.93); }
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
  transition: background 0.35s ease, border-color 0.15s, transform 0.1s;
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

.random-colors-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 8px;
  padding: 7px 10px;
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-radius: 6px;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.random-colors-btn:hover { border-color: #e8c84a; color: #e8c84a; }

.active-club-label {
  font-size: 11px;
  color: #666;
  margin: 6px 0 0;
  line-height: 1.4;
}
.modified-flag { color: #555; }

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
.stepper-btn:hover  { border-color: #e8c84a; color: #e8c84a; }
.stepper-btn:active { transform: scale(0.88); }

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

.sym-expanded {
  background: #191922;
  border-top: 1px solid #2a2a35;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.sym-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #aaa;
}
.sym-field input[type="range"] { flex: 1; accent-color: #e8c84a; }
.sym-field > span:last-child { font-size: 11px; color: #ddd; min-width: 24px; text-align: right; }

.sym-stroke-row { gap: 6px; }
.sym-stroke-range { flex: 1; accent-color: #e8c84a; }

.sym-clip-row { gap: 8px; }
.sym-clip-toggle {
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid #2a2a35;
  background: #1e1e28;
  color: #888;
  font-size: 11px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.sym-clip-toggle:hover { border-color: #555; color: #ccc; }
.sym-clip-toggle.free { border-color: #e8c84a55; color: #e8c84a; }

/* ── Transitions ─────────────────────────────────────────────────────────── */
.scene-fade-enter-active,
.scene-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.scene-fade-enter-from,
.scene-fade-leave-to { opacity: 0; transform: translateY(-6px); }

.panel-fade-enter-active,
.panel-fade-leave-active { transition: opacity 0.18s ease; }
.panel-fade-enter-from,
.panel-fade-leave-to { opacity: 0; }
</style>
