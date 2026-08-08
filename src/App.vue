<script setup>
import { computed, ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'
import BadgeComposer from './components/BadgeComposer.vue'
import LogoMark from './components/LogoMark.vue'
import IconPicker from './components/IconPicker.vue'
import TextEditor from './components/TextEditor.vue'
import ToastContainer from './components/ToastContainer.vue'
import ColorPicker from './components/ColorPicker.vue'
import ClubPicker from './components/ClubPicker.vue'
import AppBackground from './components/AppBackground.vue'
import SnapshotPanel from './components/SnapshotPanel.vue'
import AboutModal from './components/AboutModal.vue'
import { useBadgeConfig } from './composables/useBadgeConfig.js'
import { saveSnapshot } from './utils/snapshots.js'
import { clubs } from './data/clubs.js'
import { shapes, shapesById } from './data/shapes.js'
import { icons, iconsById } from './data/icons.js'
import { auroraBg, wavesBg, crisscrossBg, pinstripeBg, diamondsBg } from './utils/patterns.js'
import { randomFonts, loadFont } from './utils/fonts.js'
import { exportCrestPng, exportCrestSvg, crestFilename } from './utils/exportBadge.js'
import { createSparkField } from './utils/particles.js'
import { useToast } from './composables/useToast.js'

const { addToast } = useToast()

const {
  config,
  initialClub,
  selectedSymbolId,
  selectedTextId,
  selection,
  isSelected,
  toggleSelection,
  setPaletteColor,
  addPaletteColor,
  removePaletteColor,
  movePaletteColor,
  setPalette,
  setShape,
  setNoShield,
  setBackgroundType,
  setStripeCount,
  setSashWidth,
  setSunburstRays,
  setGradientStop,
  addGradientStop,
  removeGradientStop,
  setGradientAngle,
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
  resetConfig,
} = useBadgeConfig()

const clipboard = ref(null)

const bgTypes = ['solid', 'gradient', 'radial', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'chevron', 'sash', 'striped-v', 'striped-h', 'striped-diagonal', 'checkered', 'saltire', 'sunburst']
const stripeTypes = new Set(['striped-v', 'striped-h', 'striped-diagonal', 'checkered'])
const imageBgTypes = new Set(['grass', 'stadium', 'fabric', 'brick', 'pitch'])
// Patterns that respond to the Dark/Medium/Light tone selector.
const patternTonedTypes = new Set(['waves', 'crisscross', 'pinstripe', 'diamonds'])
const patternTones = ['dark', 'medium', 'light']

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
  { id: 'stadium',     label: 'Stadium',    thumb: '/backgrounds/stadium.jpg', isImgOption: true },
  { id: 'fabric',      label: 'Fabric',     thumb: '/backgrounds/fabric.png', isImgOption: true },
  { id: 'brick',       label: 'Brick',      thumb: '/backgrounds/brick.jpg', isImgOption: true },
  { id: 'pitch',       label: 'Pitch',      thumb: '/backgrounds/pitch.png', isImgOption: true },
  { id: 'bokeh',       label: 'Bokeh' },
  { id: 'aurora',      label: 'Aurora' },
  { id: 'waves',       label: 'Waves' },
  { id: 'crisscross',  label: 'Criss-Cross' },
  { id: 'pinstripe',   label: 'Pinstripe' },
  { id: 'diamonds',    label: 'Diamonds' },
]

const appBg = ref(bgOptions[Math.floor(Math.random() * bgOptions.length)].id)
const patternTone = ref('dark')
const overlay = reactive({ color: config.palette[0] ?? '#000000', opacity: 0.7 })

const activeClub = ref(initialClub)
const activeClubModified = computed(() => {
  if (!activeClub.value) return false
  const original = activeClub.value.colors.map(c => c.hex.toLowerCase())
  if (original.length !== config.palette.length) return true
  return original.some((c, i) => c !== config.palette[i]?.toLowerCase())
})

// Count of each iconId currently placed in the design, for the picker to flag
const placedIconCounts = computed(() => {
  const counts = {}
  for (const s of config.symbols) counts[s.iconId] = (counts[s.iconId] ?? 0) + 1
  return counts
})

function applyClub(club) {
  setPalette(club.colors.map(c => c.hex))
  activeClub.value = club
}

// ── Palette drag-to-reorder ─────────────────────────────────────────────────
const paletteDragIndex = ref(null)
const paletteOverIndex = ref(null)
function onPaletteDragStart(i, e) {
  paletteDragIndex.value = i
  e.dataTransfer.effectAllowed = 'move'
}
function onPaletteDragOver(i) {
  if (paletteDragIndex.value !== null) paletteOverIndex.value = i
}
function onPaletteDrop(i) {
  movePaletteColor(paletteDragIndex.value, i)
  paletteDragIndex.value = null
  paletteOverIndex.value = null
}
function onPaletteDragEnd() {
  paletteDragIndex.value = null
  paletteOverIndex.value = null
}
function openColorInput(e) {
  e.currentTarget.querySelector('input.palette-input-overlay')?.click()
}
watch(() => config.palette[0], c => { if (c) overlay.color = c })

const auroraThumb    = computed(() => auroraBg(config.palette))
const wavesThumb     = computed(() => wavesBg(config.palette, patternTone.value))
const crisscrossThumb = computed(() => crisscrossBg(config.palette, patternTone.value))
const pinstripeThumb = computed(() => pinstripeBg(config.palette, patternTone.value))
const diamondsThumb  = computed(() => diamondsBg(config.palette, patternTone.value))

const _ARROW_DELTA = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }

// Shift/⌘-click toggles membership; a plain click replaces the selection.
function onSelectSymbol(id, additive) { additive ? toggleSelection('symbol', id) : selectSymbol(id) }
function onSelectText(id, additive) { additive ? toggleSelection('text', id) : selectText(id) }

// Move one selected item by (dx, dy) — used by arrow-key nudge for the whole set.
function nudgeSelected(item, dx, dy) {
  if (item.type === 'symbol') {
    const sym = config.symbols.find(s => s.instanceId === item.id)
    if (sym) updateSymbolPosition(item.id, sym.x + dx, sym.y + dy)
  } else {
    const text = config.texts.find(t => t.id === item.id)
    if (!text) return
    if (text.arc) updateText(item.id, { arcX: (text.arcX ?? 100) + dx, arcY: (text.arcY ?? 120) + dy })
    else updateTextPosition(item.id, (text.x ?? 100) + dx, (text.y ?? 120) + dy)
  }
}

// ── Align selected elements to their combined bounding box ────────────────────
// Symbols align by their size box; straight text by its measured getBBox; arc
// text is excluded (its position is a circle centre, not a linear anchor).
const alignOps = [
  { edge: 'left',    title: 'Align left edges' },
  { edge: 'hcenter', title: 'Align horizontal centers' },
  { edge: 'right',   title: 'Align right edges' },
  { edge: 'top',     title: 'Align top edges' },
  { edge: 'vcenter', title: 'Align vertical centers' },
  { edge: 'bottom',  title: 'Align bottom edges' },
]

function isAlignable(s) {
  if (s.type === 'symbol') return true
  const t = config.texts.find(x => x.id === s.id)
  return !!t && !t.arc
}
const alignableCount = computed(() => selection.value.filter(isAlignable).length)

function alignSelection(edge) {
  const svg = badgeComposerRef.value?.svgRootEl
  if (!svg) return
  const boxes = []
  for (const s of selection.value) {
    if (s.type === 'symbol') {
      const sym = config.symbols.find(x => x.instanceId === s.id)
      if (!sym) continue
      const hw = sym.size / 2, hh = sym.size / 2
      boxes.push({ type: 'symbol', id: s.id, ax: sym.x, ay: sym.y, cx: sym.x, cy: sym.y, hw, hh, left: sym.x - hw, right: sym.x + hw, top: sym.y - hh, bottom: sym.y + hh })
    } else {
      const t = config.texts.find(x => x.id === s.id)
      if (!t || t.arc) continue
      const el = svg.querySelector(`[data-text-id="${CSS.escape(s.id)}"]`)
      if (!el) continue
      const bb = el.getBBox()
      boxes.push({ type: 'text', id: s.id, ax: t.x, ay: t.y, cx: bb.x + bb.width / 2, cy: bb.y + bb.height / 2, hw: bb.width / 2, hh: bb.height / 2, left: bb.x, right: bb.x + bb.width, top: bb.y, bottom: bb.y + bb.height })
    }
  }
  if (boxes.length < 2) return

  const gLeft = Math.min(...boxes.map(b => b.left))
  const gRight = Math.max(...boxes.map(b => b.right))
  const gTop = Math.min(...boxes.map(b => b.top))
  const gBottom = Math.max(...boxes.map(b => b.bottom))
  const gCX = (gLeft + gRight) / 2, gCY = (gTop + gBottom) / 2

  for (const b of boxes) {
    let nx = b.ax, ny = b.ay
    if (edge === 'left')         nx = b.ax + (gLeft + b.hw - b.cx)
    else if (edge === 'right')   nx = b.ax + (gRight - b.hw - b.cx)
    else if (edge === 'hcenter') nx = b.ax + (gCX - b.cx)
    else if (edge === 'top')     ny = b.ay + (gTop + b.hh - b.cy)
    else if (edge === 'bottom')  ny = b.ay + (gBottom - b.hh - b.cy)
    else if (edge === 'vcenter') ny = b.ay + (gCY - b.cy)
    if (b.type === 'symbol') updateSymbolPosition(b.id, nx, ny)
    else updateTextPosition(b.id, nx, ny)
  }
}

const ALIGN_ICONS = {
  left:    '<line x1="2.5" y1="2" x2="2.5" y2="14" stroke="#e8c84a" stroke-width="1.4"/><rect x="2.5" y="4.4" width="9" height="2.2" rx="1" fill="currentColor"/><rect x="2.5" y="9.4" width="5.5" height="2.2" rx="1" fill="currentColor"/>',
  right:   '<line x1="13.5" y1="2" x2="13.5" y2="14" stroke="#e8c84a" stroke-width="1.4"/><rect x="4.5" y="4.4" width="9" height="2.2" rx="1" fill="currentColor"/><rect x="8" y="9.4" width="5.5" height="2.2" rx="1" fill="currentColor"/>',
  hcenter: '<line x1="8" y1="2" x2="8" y2="14" stroke="#e8c84a" stroke-width="1.4"/><rect x="3.5" y="4.4" width="9" height="2.2" rx="1" fill="currentColor"/><rect x="5.25" y="9.4" width="5.5" height="2.2" rx="1" fill="currentColor"/>',
  top:     '<line x1="2" y1="2.5" x2="14" y2="2.5" stroke="#e8c84a" stroke-width="1.4"/><rect x="4.4" y="2.5" width="2.2" height="9" rx="1" fill="currentColor"/><rect x="9.4" y="2.5" width="2.2" height="5.5" rx="1" fill="currentColor"/>',
  bottom:  '<line x1="2" y1="13.5" x2="14" y2="13.5" stroke="#e8c84a" stroke-width="1.4"/><rect x="4.4" y="4.5" width="2.2" height="9" rx="1" fill="currentColor"/><rect x="9.4" y="8" width="2.2" height="5.5" rx="1" fill="currentColor"/>',
  vcenter: '<line x1="2" y1="8" x2="14" y2="8" stroke="#e8c84a" stroke-width="1.4"/><rect x="4.4" y="3.5" width="2.2" height="9" rx="1" fill="currentColor"/><rect x="9.4" y="5.25" width="2.2" height="5.5" rx="1" fill="currentColor"/>',
}
function alignIcon(edge) { return `<svg viewBox="0 0 16 16" width="15" height="15">${ALIGN_ICONS[edge]}</svg>` }

function onPickIcon(iconId) {
  if (selectedSymbolId.value) {
    updateSymbol(selectedSymbolId.value, { iconId })
  } else {
    addSymbol(iconId)
  }
}

// Placed-symbols thumbnail: use the icon's own viewBox, and scale strokeWidth
// (authored in 100-unit space) to it so the preview matches the badge.
function symPreviewVB(iconId) {
  const vb = iconsById[iconId]?.viewBox
  return vb ? `0 0 ${vb[0]} ${vb[1]}` : '0 0 100 100'
}
function symPreviewStroke(sym) {
  const vb = iconsById[sym.iconId]?.viewBox ?? [100, 100]
  return sym.strokeWidth * Math.max(vb[0], vb[1]) / 100
}

// ── Crest stage: pointer tilt ──────────────────────────────────────────────
const badgeTiltRef = ref(null)
const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const tilt = reactive({ rx: 0, ry: 0 })
const isDraggingEl = ref(false)

// Searing-hot cursor glow — follows the pointer over the stage, but not over the
// crest itself (where the tilt takes over).
const hotCursor = reactive({ x: 0, y: 0 })
const overCrest = ref(false)

// Tilt is a hover-only affordance — flatten and suspend it while dragging so
// it doesn't fight precise alignment.
function onElDragStart() { isDraggingEl.value = true; tilt.rx = 0; tilt.ry = 0 }
function onElDragEnd() { isDraggingEl.value = false }

function onBadgeMove(e) {
  overCrest.value = true // over the crest → suppress the hot-cursor glow
  if (reduceMotion || isDraggingEl.value || !badgeTiltRef.value) return
  const r = badgeTiltRef.value.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width
  const py = (e.clientY - r.top) / r.height
  const MAX = 7 // degrees
  tilt.ry = (px - 0.5) * 2 * MAX
  tilt.rx = -(py - 0.5) * 2 * MAX
}
function onBadgeLeave() {
  tilt.rx = 0; tilt.ry = 0
  overCrest.value = false
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
    selection.value.forEach(item => nudgeSelected(item, dx, dy))
    return
  }

  if (e.key === 'Escape') { deselectAll(); return }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); randomizeAll(); return }
  if (e.key !== 'Delete' && e.key !== 'Backspace') return
  // copy the list first — removeSymbol/removeText mutate the selection
  ;[...selection.value].forEach(item => item.type === 'symbol' ? removeSymbol(item.id) : removeText(item.id))
}

const controlsPane    = ref(null)
const particleCanvas  = ref(null)
const badgeWrap       = ref(null)
const snapshotPanelRef = ref(null)

async function doSaveSnapshot(name) {
  const svgEl = badgeWrap.value?.querySelector('svg')
  try {
    return await saveSnapshot(name, config, svgEl)
  } catch (e) {
    if (e.code === 'QUOTA') {
      addToast('Snapshot storage is full — delete a few snapshots and try again.', { type: 'tip', duration: 6000 })
      return false
    }
    throw e
  }
}
const isPulsing      = ref(false)
const isBadgeActive  = ref(false)
let   sparkField     = null
let   pulseTimer     = null
let   burstTimer     = null

// Foundry sparks off the moving cursor — throttled, intermittent, speed-scaled.
let _lastSparkT = 0
let _lastSparkPos = null
function onStageMove(e) {
  if (reduceMotion || !sparkField) return
  const c = particleCanvas.value
  if (!c) return
  const cr = c.getBoundingClientRect()
  const x = e.clientX - cr.left
  const y = e.clientY - cr.top
  hotCursor.x = x; hotCursor.y = y // track the hot-cursor glow position
  const now = performance.now()
  let speed = 0
  if (_lastSparkPos) {
    const dt = Math.max(1, now - _lastSparkPos.t)
    speed = Math.hypot(x - _lastSparkPos.x, y - _lastSparkPos.y) / dt // px/ms
  }
  _lastSparkPos = { x, y, t: now }
  if (now - _lastSparkT < 50) return  // throttle
  if (speed < 0.06) return            // near-still → no sparks
  if (Math.random() < 0.45) return    // skip ~45% → intermittent
  _lastSparkT = now
  const n = speed > 0.5 ? 2 : 1
  sparkField.emit(x, y, n, Math.min(1.5, 0.65 + speed))
}

// Denser ember trail while dragging a symbol/text — like moving hot metal.
let _emberT = 0
function onDragEmber(clientX, clientY) {
  if (reduceMotion || !sparkField) return
  const c = particleCanvas.value
  if (!c) return
  const now = performance.now()
  if (now - _emberT < 28) return
  _emberT = now
  const cr = c.getBoundingClientRect()
  sparkField.emit(clientX - cr.left, clientY - cr.top, 2 + Math.floor(Math.random() * 2), 1)
}

// Intermittent embers drifting up from the forge glow at the base of the stage.
let emberTimer = null
function spitEmber() {
  const c = particleCanvas.value
  if (sparkField && c) {
    const w = c.width, h = c.height
    sparkField.float(w * (0.12 + Math.random() * 0.76), h - (8 + Math.random() * 34))
    if (Math.random() < 0.25) sparkField.float(w * (0.12 + Math.random() * 0.76), h - (8 + Math.random() * 34))
  }
  emberTimer = setTimeout(spitEmber, 500 + Math.random() * 1300)
}

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

  sparkField?.burst(cx, cy)

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
  // fontFamily is intentionally excluded — hovering the font picker live-previews
  // fonts, and we don't want the forge burst/pulse firing on every hover.
  texts:   config.texts.map(({ id, content, fontWeight, fontSize, color, letterSpacing, arc, arcRx, arcRy }) =>
             ({ id, content, fontWeight, fontSize, color, letterSpacing, arc, arcRx, arcRy })),
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
  if (!selection.value.length) return
  if (e.target.closest('svg')) return
  if (e.target.closest('.symbol-item, .text-item')) return
  if (e.target.closest('.fp-panel')) return // teleported font-picker panel — keep the text selected
  deselectAll()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('resize', sizeCanvas)
  document.addEventListener('click', onDocumentClick)
  nextTick(() => {
    sizeCanvas()
    if (particleCanvas.value) {
      sparkField = createSparkField(particleCanvas.value)
      if (!reduceMotion) spitEmber()
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('resize', sizeCanvas)
  document.removeEventListener('click', onDocumentClick)
  clearTimeout(emberTimer)
  sparkField?.stop()
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

function startOver() {
  if (!window.confirm('Start over? This clears the current design.')) return
  resetConfig()
  activeClub.value = null
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
  patternTone.value = patternTones[Math.floor(Math.random() * patternTones.length)]

  ;[...config.symbols].forEach(s => removeSymbol(s.instanceId))
  if (Math.random() < 2/3) {
    addSymbol(icons[Math.floor(Math.random() * icons.length)].id)
    // Random symbols always take the palette's 3rd colour as their fill, with a
    // contrasting stroke so the shape never disappears against it.
    const fill = config.palette[2] ?? config.palette[config.palette.length - 1] ?? '#ffffff'
    const strokeColor = config.palette.find(c => c.toLowerCase() !== fill.toLowerCase())
      ?? (fill.toLowerCase() === '#000000' ? '#ffffff' : '#000000')
    updateSymbol(selectedSymbolId.value, {
      color: fill,
      size: 90 + Math.floor(Math.random() * 45), // bolder than a manual picker-add (default 72)
      strokeWidth: 3,
      strokeColor,
    })
  }

  const nameFont = randomFonts[Math.floor(Math.random() * randomFonts.length)].family
  const monogramFont = randomFonts[Math.floor(Math.random() * randomFonts.length)].family
  loadFont(nameFont)
  loadFont(monogramFont)

  // Intermittently outline the (white) crest text with a bold contrasting edge,
  // like a screen-printed kit. Otherwise clear any stroke left by a prior forge.
  let textStroke = { strokeWidth: 0 }
  if (Math.random() < 0.4) {
    const lum = hex => {
      const h = hex.replace('#', '')
      return 0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)
    }
    const strokeColor = [...config.palette].sort((a, b) => lum(a) - lum(b))[0] || '#000000'
    textStroke = { strokeColor, strokeWidth: Math.round((1.25 + Math.random() * 1.75) / 0.25) * 0.25 }
  }
  updateText('club-name', { y: 55, fontFamily: nameFont, ...textStroke })
  updateText('monogram', { y: 185, fontFamily: monogramFont, ...textStroke })
  activeClub.value = club
  // A freshly forged crest shows what it *is* — nothing selected, no glow.
  deselectAll()
}

const showScene = ref(true)
const showAbout = ref(false)

const badgeComposerRef = ref(null)
const isExporting = ref(false)

async function exportCrest(format) {
  const svgEl = badgeComposerRef.value?.svgRootEl
  if (!svgEl || isExporting.value) return
  isExporting.value = true
  try {
    const opts = { texts: config.texts, filename: crestFilename(config.texts, format) }
    if (format === 'svg') await exportCrestSvg(svgEl, opts)
    else await exportCrestPng(svgEl, opts)
    addToast(`${format.toUpperCase()} exported`, { type: 'tip', duration: 2500 })
  } catch (e) {
    addToast('Export failed — please try again', { type: 'tip', duration: 4000 })
  } finally {
    isExporting.value = false
  }
}
const exportPng = () => exportCrest('png')
const exportSvg = () => exportCrest('svg')

function stepBg(dir) {
  const idx = bgOptions.findIndex(o => o.id === appBg.value)
  appBg.value = bgOptions[(idx + dir + bgOptions.length) % bgOptions.length].id
}
</script>

<template>
  <div class="app">
    <AppBackground :type="appBg" :tone="patternTone" />
    <div
      v-if="imageBgTypes.has(appBg)"
      class="app-overlay"
      :style="{ background: overlay.color, opacity: overlay.opacity }"
    />
    <ToastContainer />
    <main class="app-body">
      <!-- Preview -->
      <section class="preview-pane" @wheel.prevent="forwardScroll" @mousemove="onStageMove" @mouseenter="isBadgeActive = true" @mouseleave="isBadgeActive = false">
        <canvas ref="particleCanvas" class="particle-canvas" />
        <!-- Searing-hot cursor glow — shown over the stage, off when over the crest -->
        <div
          v-show="isBadgeActive && !overCrest && !reduceMotion"
          class="hot-cursor"
          :style="{ left: hotCursor.x + 'px', top: hotCursor.y + 'px' }"
        />
        <!-- Warm forge glow at the base of the stage (behind the badge, above the background) -->
        <div class="forge-glow" />

        <!-- Align toolbar — appears when 2+ alignable elements are selected -->
        <Transition name="align-fade">
          <div v-if="alignableCount >= 2" class="align-bar">
            <button
              v-for="op in alignOps"
              :key="op.edge"
              class="align-btn"
              :title="op.title"
              @click="alignSelection(op.edge)"
              v-html="alignIcon(op.edge)"
            />
          </div>
        </Transition>

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
        <div
          ref="badgeTiltRef"
          class="badge-tilt"
          :style="{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }"
          @mousemove="onBadgeMove"
          @mouseleave="onBadgeLeave"
        >
        <div ref="badgeWrap" :class="['badge-wrap', { pulsing: isPulsing }]">
          <BadgeComposer
            ref="badgeComposerRef"
            :config="config"
            :selected-symbol-id="selectedSymbolId"
            :selection="selection"
            :size="380"
            uid="main"
            @update-text="updateText"
            @update-text-position="updateTextPosition"
            @update-symbol-position="updateSymbolPosition"
            @update-symbol="updateSymbol"
            @select-symbol="onSelectSymbol"
            @select-text="onSelectText"
            @deselect="deselectAll"
            @symbol-outside-bounds="onSymbolOutsideBounds"
            @ember="onDragEmber"
            @drag-start="onElDragStart"
            @drag-end="onElDragEnd"
          />
        </div>
        </div>
        </div>
        <div class="scene-wrap">
          <div class="scene-actions">
            <button class="start-over-btn" @click="startOver" title="Clear the current design and start fresh">
              ↺ Start Over
            </button>
            <button class="swap-colors-btn" @click="randomizeColors" title="Recast the palette">
              ⇄ Recast
            </button>
            <button class="export-png-btn" :disabled="isExporting" @click="exportPng" title="Download this crest as a transparent PNG">
              {{ isExporting ? '…' : '⬇ PNG' }}
            </button>
            <button class="export-png-btn" :disabled="isExporting" @click="exportSvg" title="Download this crest as a self-contained SVG">
              {{ isExporting ? '…' : '⬇ SVG' }}
            </button>
            <button class="scene-toggle" @click="showScene = !showScene" title="Toggle scene controls">
              {{ showScene ? '▲ scene' : '▼ scene' }}
            </button>
          </div>

          <Transition name="scene-fade">
          <div v-show="showScene" class="scene-controls">
            <p class="drag-hint hud-pill">Drag or arrow-key symbols &amp; text &nbsp;·&nbsp; Shift+Arrow = 10px &nbsp;·&nbsp; ⌘C / ⌘V to copy &amp; paste &nbsp;·&nbsp; Space to forge &nbsp;·&nbsp; ⌘S to snapshot</p>

            <div class="bg-picker hud-pill">
              <button
                v-for="opt in bgOptions"
                :key="opt.id"
                class="bg-opt"
                :class="{ active: appBg === opt.id }"
                :title="opt.label"
                :style="opt.id === 'aurora' ? auroraThumb : opt.id === 'waves' ? wavesThumb : opt.id === 'crisscross' ? crisscrossThumb : opt.id === 'pinstripe' ? pinstripeThumb : opt.id === 'diamonds' ? diamondsThumb : {}"
                @click="appBg = opt.id"
              >
                <img v-if="opt.thumb" :src="opt.thumb" class="bg-opt-thumb" />
                <span v-else-if="opt.id === 'bokeh'"    class="bg-opt-bokeh" />
                <span v-else-if="opt.id === 'none'"     class="bg-opt-none" />
              </button>
            </div>

            <div class="overlay-controls hud-pill" :style="{ visibility: (imageBgTypes.has(appBg) || patternTonedTypes.has(appBg)) ? 'visible' : 'hidden' }">
              <template v-if="imageBgTypes.has(appBg)">
                <input
                  type="color"
                  :value="overlay.color"
                  class="overlay-color"
                  title="Overlay color"
                  @input="overlay.color = $event.target.value"
                />
                <div class="overlay-swatches">
                  <button
                    v-for="(color, i) in config.palette"
                    :key="i"
                    class="overlay-swatch"
                    :class="{ active: overlay.color.toLowerCase() === color.toLowerCase() }"
                    :style="{ background: color }"
                    :title="`Set overlay to club color ${color}`"
                    @click="overlay.color = color"
                  />
                </div>
                <input
                  type="range" min="0" max="1" step="0.05"
                  :value="overlay.opacity"
                  class="overlay-opacity"
                  @input="overlay.opacity = Number($event.target.value)"
                />
                <span class="overlay-label">overlay</span>
              </template>
              <template v-else-if="patternTonedTypes.has(appBg)">
                <div class="tone-btns">
                  <button
                    v-for="t in patternTones"
                    :key="t"
                    class="tone-btn"
                    :class="{ active: patternTone === t }"
                    @click="patternTone = t"
                  >{{ t }}</button>
                </div>
                <span class="overlay-label">tone</span>
              </template>
            </div>
          </div>
          </Transition>
        </div>
      </section>

      <!-- Controls -->
      <aside class="controls-pane" ref="controlsPane">

        <div class="logo-row">
          <div class="logo-block">
            <LogoMark class="logo-mark-inline" />
            <div class="logo-text">
              <p class="logo"><span class="logo-title">Crest Foundry<i class="logo-ember e1" /><i class="logo-ember e2" /><i class="logo-ember e3" /><i class="logo-ember e4" /><i class="logo-ember e5" /></span></p>
              <a class="logo-byline" href="https://www.drinkingtheink.com/" target="_blank" rel="noopener">A project by Jason M Harrison</a>
            </div>
          </div>
          <div class="logo-actions">
            <button class="about-btn" title="About &amp; credits" @click="showAbout = true">ⓘ</button>
            <button class="randomize-btn" title="Forge a new crest" @click="randomizeAll">⚡</button>
          </div>
        </div>

        <!-- Shield / No Shield mode -->
        <div class="mode-switch" role="group" aria-label="Shield mode">
          <button
            class="mode-opt"
            :class="{ active: !config.noShield }"
            @click="setNoShield(false)"
          >Shield</button>
          <button
            class="mode-opt"
            :class="{ active: config.noShield }"
            @click="setNoShield(true)"
          >No Shield</button>
        </div>

        <!-- Club Colors / Palette -->
        <div class="control-group">
          <h3 class="control-label">Club Colors</h3>
          <ClubPicker @apply="applyClub" />
          <button class="random-colors-btn" @click="randomizeColors" title="Recast with a random club's colors">⚡ Recast Colors</button>
          <div v-if="activeClub" class="active-club">
            <span class="active-club-dot" />
            <span class="active-club-label">Showing</span>
            <span class="active-club-name">{{ activeClub.name }}</span>
            <span v-if="activeClubModified" class="modified-flag">modified</span>
          </div>
          <div class="palette-editor" style="margin-top: 10px;">
            <div
              v-for="(color, i) in config.palette"
              :key="i"
              class="palette-slot"
              :class="{ dragging: paletteDragIndex === i, 'drag-over': paletteOverIndex === i && paletteDragIndex !== i }"
              :style="{ background: color }"
              :title="`${color} — drag to reorder`"
              draggable="true"
              @dragstart="onPaletteDragStart(i, $event)"
              @dragover.prevent="onPaletteDragOver(i)"
              @drop.prevent="onPaletteDrop(i)"
              @dragend="onPaletteDragEnd"
              @click="openColorInput"
            >
              <input
                type="color"
                :value="color"
                class="palette-input-overlay"
                @input="setPaletteColor(i, $event.target.value)"
                @click.stop
              />
              <button
                class="palette-remove"
                title="Remove color"
                draggable="false"
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
          <p class="palette-hint">Click to change · drag to reorder · hover to remove · up to 6 colors</p>
        </div>

        <!-- Shape -->
        <div class="control-group" :class="{ 'group-disabled': config.noShield }">
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
        <div class="control-group" :class="{ 'group-disabled': config.noShield }">
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

          <!-- Gradient stops editor (gradient / radial types) -->
          <div v-if="config.background.type === 'gradient' || config.background.type === 'radial'" class="gradient-editor">
            <span class="color-label">Gradient stops</span>
            <div class="palette-editor" style="margin-top: 8px;">
              <div
                v-for="(color, i) in config.background.gradient"
                :key="i"
                class="palette-slot"
                :style="{ background: color }"
                :title="color"
                @click="openColorInput"
              >
                <input
                  type="color"
                  :value="color"
                  class="palette-input-overlay"
                  @input="setGradientStop(i, $event.target.value)"
                  @click.stop
                />
                <button
                  v-if="config.background.gradient.length > 2"
                  class="palette-remove"
                  title="Remove stop"
                  @click.stop="removeGradientStop(i)"
                >×</button>
              </div>
              <button
                v-if="config.background.gradient.length < 5"
                class="palette-add"
                title="Add stop"
                @click="addGradientStop"
              >+</button>
            </div>
            <div v-if="config.background.type === 'gradient'" class="range-row" style="margin-top: 8px;">
              <label>
                Angle <em>{{ config.background.gradientAngle }}°</em>
                <input
                  type="range" min="0" max="360" step="15"
                  :value="config.background.gradientAngle"
                  @input="setGradientAngle($event.target.value)"
                />
              </label>
            </div>
            <p class="palette-hint">2–5 stops · click to change · hover to remove</p>
          </div>

          <div v-if="stripeTypes.has(config.background.type)" class="stripe-count-row">
            <span class="color-label">{{ config.background.type === 'checkered' ? 'Columns' : 'Stripes' }}</span>
            <div class="stripe-stepper">
              <button class="stepper-btn" @click="setStripeCount(config.background.stripeCount - 1)">−</button>
              <span class="stepper-val">{{ config.background.stripeCount }}</span>
              <button class="stepper-btn" @click="setStripeCount(config.background.stripeCount + 1)">+</button>
            </div>
          </div>
          <div v-if="config.background.type === 'sunburst'" class="stripe-count-row">
            <span class="color-label">Rays</span>
            <div class="stripe-stepper">
              <button class="stepper-btn" @click="setSunburstRays(config.background.sunburstRays - 2)">−</button>
              <span class="stepper-val">{{ config.background.sunburstRays }}</span>
              <button class="stepper-btn" @click="setSunburstRays(config.background.sunburstRays + 2)">+</button>
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

        <!-- Border -->
        <div class="control-group" :class="{ 'group-disabled': config.noShield }">
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

        <!-- Text -->
        <div class="control-group">
          <h3 class="control-label">Text</h3>
          <TextEditor
            :texts="config.texts"
            :selected-text-id="selectedTextId"
            :selected-text-ids="selection.filter(s => s.type === 'text').map(s => s.id)"
            :shape-fit="currentShapeFit"
            @add-text="addText"
            @remove-text="removeText"
            @update-text="updateText"
            @select-text="onSelectText"
            @fit-arc="fitArcToShape"
          />
        </div>

        <!-- Symbol Gallery -->
        <div class="control-group">
          <h3 class="control-label">Add Symbol</h3>
          <IconPicker :placed-counts="placedIconCounts" @add-icon="onPickIcon" />
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
              :class="{ selected: isSelected('symbol', sym.instanceId) }"
              @click="onSelectSymbol(sym.instanceId, $event.shiftKey || $event.metaKey)"
            >
              <div class="sym-row">
                <svg :viewBox="symPreviewVB(sym.iconId)" width="28" height="28" class="sym-preview">
                  <path
                    v-for="(p, i) in iconsById[sym.iconId]?.paths"
                    :key="i"
                    :d="p"
                    :fill="sym.color"
                    :stroke="sym.strokeWidth > 0 ? sym.strokeColor : 'none'"
                    :stroke-width="symPreviewStroke(sym)"
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
                <div class="sym-field">
                  <span>Rotation</span>
                  <input
                    type="range" min="-180" max="180"
                    :value="sym.rotation ?? 0"
                    @input="updateSymbol(sym.instanceId, { rotation: Number($event.target.value) })"
                  />
                  <button
                    class="rotation-reset"
                    title="Reset rotation to 0°"
                    @click.stop="updateSymbol(sym.instanceId, { rotation: 0 })"
                  >⟲</button>
                  <span>{{ sym.rotation ?? 0 }}°</span>
                </div>
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
                <div class="sym-field sym-clip-row">
                  <span>Flip</span>
                  <button
                    class="sym-clip-toggle"
                    :class="{ free: sym.flipH }"
                    @click.stop="updateSymbol(sym.instanceId, { flipH: !sym.flipH })"
                    title="Flip symbol horizontally"
                  >{{ sym.flipH ? 'Flipped ⇋' : 'Normal ⇋' }}</button>
                </div>
                <div class="sym-field sym-stroke-row">
                  <span>Border</span>
                  <ColorPicker
                    :value="sym.strokeColor || '#000000'"
                    @change="updateSymbol(sym.instanceId, { strokeColor: $event })"
                  />
                  <input
                    type="range" min="0" max="20" step="0.5"
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

    <AboutModal :open="showAbout" @close="showAbout = false" />
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

.logo-block {
  display: flex;
  align-items: center;
  gap: 9px;
}
.logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.logo-byline {
  font-size: 10px;
  color: #888;
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 0.15s;
}
.logo-byline:hover { color: #e8c84a; }

/* Embers drifting up off the "Crest Foundry" logotype */
.logo-title {
  position: relative;
  display: inline-block;
}
.logo-ember {
  position: absolute;
  bottom: 3px;
  width: 2.5px;
  height: 2.5px;
  border-radius: 50%;
  background: #ffd98a;
  box-shadow: 0 0 5px 1px rgba(255, 140, 40, 0.85);
  opacity: 0;
  pointer-events: none;
  animation: logo-ember-rise 3.4s ease-out infinite;
}
.logo-ember.e1 { left: 12%; --dx: -3px; animation-duration: 3.6s; animation-delay: -0.3s; }
.logo-ember.e2 { left: 33%; --dx: 4px;  animation-duration: 4.4s; animation-delay: -1.7s; }
.logo-ember.e3 { left: 52%; --dx: -2px; animation-duration: 3.9s; animation-delay: -2.9s; }
.logo-ember.e4 { left: 71%; --dx: 5px;  animation-duration: 4.7s; animation-delay: -1.0s; }
.logo-ember.e5 { left: 89%; --dx: -4px; animation-duration: 4.1s; animation-delay: -3.3s; }
@keyframes logo-ember-rise {
  0%   { transform: translate(0, 0) scale(1);            opacity: 0; }
  8%   { opacity: 0.95; }
  55%  { opacity: 0.5; }
  100% { transform: translate(var(--dx), -22px) scale(0.35); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .logo-ember { display: none; }
}

.mode-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #13131a;
  border: 1px solid #2a2a35;
  border-radius: 8px;
}
.mode-opt {
  flex: 1;
  padding: 7px 0;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #888;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mode-opt:hover { color: #ccc; }
.mode-opt.active {
  background: #e8c84a;
  color: #111;
}

.group-disabled {
  opacity: 0.4;
  pointer-events: none;
}

.logo {
  font-family: 'Yeseva One', Georgia, serif;
  font-size: 23px;
  font-weight: 400;
  letter-spacing: 0.3px;
  line-height: 1.05;
  color: #e8c84a;
  margin: 0;
}

.logo-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.randomize-btn,
.about-btn {
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
.randomize-btn:hover,
.about-btn:hover {
  border-color: #e8c84a;
  color: #e8c84a;
}

.about-btn { font-size: 15px; }

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

/* Searing-hot cursor glow that trails the pointer over the stage */
.hot-cursor {
  position: absolute;
  z-index: 4;
  width: 54px;
  height: 54px;
  margin: -27px 0 0 -27px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle,
    rgba(255, 172, 62, 0.55) 0%,
    rgba(255, 120, 26, 0.30) 34%,
    rgba(255, 90, 10, 0) 70%);
  mix-blend-mode: screen;
  filter: blur(3px);
  animation: hot-cursor-pulse 1.6s ease-in-out infinite;
  will-change: left, top;
}
@keyframes hot-cursor-pulse {
  0%, 100% { opacity: 0.82; transform: scale(0.94); }
  50%      { opacity: 1;    transform: scale(1.06); }
}

/* Warm coal-glow at the base of the crest stage — subtle, breathing */
.forge-glow {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 180px;
  pointer-events: none;
  background:
    radial-gradient(70% 85% at 32% 118%, rgba(255, 145, 48, 0.42), transparent 60%),
    radial-gradient(70% 85% at 68% 122%, rgba(255, 88, 20, 0.42), transparent 60%),
    radial-gradient(150% 115% at 50% 128%, rgba(255, 120, 30, 0.34), transparent 64%);
  filter: blur(7px);
  animation: forge-breathe 5s ease-in-out infinite;
}
@keyframes forge-breathe {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

/* Align toolbar */
.align-bar {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  gap: 3px;
  padding: 4px;
  border-radius: 9px;
  background: rgba(12, 12, 20, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.align-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #cfcfd6;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.align-btn:hover { background: rgba(232, 200, 74, 0.14); color: #fff; }
.align-btn :deep(svg) { display: block; }

.align-fade-enter-active,
.align-fade-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.align-fade-enter-from,
.align-fade-leave-to { opacity: 0; transform: translate(-50%, -6px); }

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
  0%   { transform: scale(1);    filter: drop-shadow(0 0 0px  rgba(232,200,74,0));    }
  30%  { transform: scale(1.015); filter: drop-shadow(0 0 9px rgba(232,200,74,0.38)); }
  100% { transform: scale(1);    filter: drop-shadow(0 0 0px  rgba(232,200,74,0));    }
}

.badge-float-wrap {
  position: relative;
  perspective: 1100px;
  animation: badge-float 3.4s ease-in-out infinite alternate;
}
.badge-float-wrap.active {
  animation-play-state: paused;
}

/* Pointer-driven 3D tilt layer */
.badge-tilt {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.2s ease-out;
  will-change: transform;
}

.badge-wrap {
  display: inline-flex;
}
.badge-wrap.pulsing {
  animation: badge-pulse 0.35s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .badge-float-wrap { animation: none; }
  .badge-tilt { transition: none; }
  .badge-wrap.pulsing { animation: none; }
  .forge-glow { animation: none; opacity: 0.8; }
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

.scene-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.start-over-btn,
.swap-colors-btn,
.export-png-btn,
.scene-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: #cdb24a;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(232, 200, 74, 0.4);
  border-radius: 6px;
  padding: 5px 9px;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.start-over-btn:hover,
.swap-colors-btn:hover,
.export-png-btn:hover,
.scene-toggle:hover {
  color: #111;
  background: rgba(232, 200, 74, 0.9);
  border-color: #e8c84a;
}
.export-png-btn:disabled {
  opacity: 0.55;
  cursor: default;
  color: #cdb24a;
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(232, 200, 74, 0.4);
}

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
  z-index: 1;
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

.overlay-swatches {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.overlay-swatch {
  width: 16px;
  height: 16px;
  padding: 0;
  border: 1px solid #3a3a48;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.overlay-swatch:hover { transform: scale(1.15); }

.overlay-swatch.active {
  border-color: #e8c84a;
  box-shadow: 0 0 0 1px #e8c84a;
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

.tone-btns {
  flex: 1;
  display: flex;
  gap: 4px;
}
.tone-btn {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.03);
  color: #999;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.tone-btn:hover { border-color: rgba(232, 200, 74, 0.5); color: #ccc; }
.tone-btn.active {
  border-color: #e8c84a;
  color: #e8c84a;
  background: rgba(232, 200, 74, 0.08);
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
  pointer-events: none;
}

.palette-slot.dragging {
  opacity: 0.4;
}
.palette-slot.drag-over {
  border-color: #e8c84a;
  transform: translateY(-2px);
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

.active-club {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 10px 0 0;
  padding: 7px 10px;
  background: rgba(232, 200, 74, 0.1);
  border: 1px solid rgba(232, 200, 74, 0.35);
  border-radius: 6px;
}
.active-club-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e8c84a;
  box-shadow: 0 0 6px rgba(232, 200, 74, 0.8);
  flex-shrink: 0;
}
.active-club-label {
  font-size: 10px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  flex-shrink: 0;
}
.active-club-name {
  font-size: 13px;
  font-weight: 600;
  color: #e8c84a;
  margin-right: auto;
}
.modified-flag {
  font-size: 9px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid #3a3a45;
  border-radius: 3px;
  padding: 1px 5px;
  flex-shrink: 0;
}

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
