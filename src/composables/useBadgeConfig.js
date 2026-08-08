import { reactive, ref, computed } from 'vue'
import { clubs } from '../data/clubs.js'
import { icons } from '../data/icons.js'

const _randomClub = clubs[Math.floor(Math.random() * clubs.length)]
const _randomIcon = icons[Math.floor(Math.random() * icons.length)]
function _contrastColor(fill, palette) {
  const alt = palette.find(c => c.toLowerCase() !== fill.toLowerCase())
  return alt ?? (fill.toLowerCase() === '#000000' ? '#ffffff' : '#000000')
}

function _lum(hex) {
  const h = hex.replace('#', '')
  return 0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)
}

// Guarantee a light neutral is always on hand: append white as the last colour
// when the palette has no near-white and there's room (6-colour cap). Text
// defaults to white and strokes/borders/backgrounds all pull from these swatches.
function withNeutral(hexes) {
  const arr = hexes.slice(0, 6)
  if (arr.length < 6 && !arr.some(c => _lum(c) > 225)) arr.push('#ffffff')
  return arr
}

const _BG_TYPES = ['solid', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'chevron', 'sash', 'striped-v', 'striped-h', 'striped-diagonal']
const _randomBgType = _BG_TYPES[Math.floor(Math.random() * _BG_TYPES.length)]

const _thirdColor = _randomClub.colors[2]?.hex
const _defaultBorder = _thirdColor
  ? { color: _thirdColor, width: Math.floor(Math.random() * 5) + 4 }
  : { color: '#ffffff', width: 0 }

const DEFAULT_TEXT = () => ({
  fontFamily: 'EB Garamond',
  fontWeight: 'normal',
  fontSize: 14,
  color: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 0,
  letterSpacing: 0,
  rotation: 0,
  arc: null,
  arcRx: 78,
  arcRy: 78,
  arcX: 100,
  arcY: 120,
  archHeight: 40,
  x: 100,
  y: 120,
})

// ── Singleton state (module-level so any component gets the same instance) ──
const config = reactive({
  shapeId: 'traditional-english',
  noShield: false,
  palette: withNeutral(_randomClub.colors.map(c => c.hex)),
  background: {
    type: _randomBgType,
    stripeCount: 4,
    sashWidth: 174,
    sunburstRays: 12,
    // Editable color stops for the gradient/radial background fills.
    gradient: _randomClub.colors.slice(0, 2).map(c => c.hex),
    gradientAngle: 45, // degrees, for the linear gradient direction
  },
  // Always start with a random symbol on app boot.
  symbols: (() => {
    const fill = _randomClub.colors[0]?.hex || '#ffffff'
    const palette = _randomClub.colors.map(c => c.hex)
    const size = 90 + Math.floor(Math.random() * 45) // 90–134, larger than a manual add
    return [{ instanceId: 'sym-init', iconId: _randomIcon.id, color: fill, x: 100, y: 120, size, strokeColor: _contrastColor(fill, palette), strokeWidth: 3 }]
  })(),
  texts: [
    {
      ...DEFAULT_TEXT(),
      id: 'club-name',
      content: 'CREST FOUNDRY',
      fontSize: 13,
      fontWeight: 'bold',
      letterSpacing: 2,
      x: 100,
      y: 55,
    },
    {
      ...DEFAULT_TEXT(),
      id: 'monogram',
      content: 'FC',
      fontSize: 22,
      fontWeight: 'bold',
      letterSpacing: 3,
      x: 100,
      y: 185,
    },
  ],
  border: _defaultBorder,
})

// Unified selection: an ordered list of { type: 'symbol'|'text', id }. The
// single-id refs below are read-only shims that resolve only when exactly one
// element of that type is selected, so all the existing single-select consumers
// (expanded editors, keyboard, symbol controls) behave exactly as before.
const selection = ref([])
const selectedSymbolId = computed(() =>
  selection.value.length === 1 && selection.value[0].type === 'symbol' ? selection.value[0].id : null)
const selectedTextId = computed(() =>
  selection.value.length === 1 && selection.value[0].type === 'text' ? selection.value[0].id : null)

function isSelected(type, id) {
  return selection.value.some(s => s.type === type && s.id === id)
}
function setSelection(type, id) { selection.value = [{ type, id }] }
function toggleSelection(type, id) {
  const i = selection.value.findIndex(s => s.type === type && s.id === id)
  if (i === -1) selection.value = [...selection.value, { type, id }]
  else selection.value = selection.value.filter((_, idx) => idx !== i)
}
function clearSelection() { selection.value = [] }
function removeFromSelection(type, id) {
  selection.value = selection.value.filter(s => !(s.type === type && s.id === id))
}

let nextId = 1

function colorDist(a, b) {
  const p = hex => { const h = hex.replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)] }
  const [r1,g1,b1] = p(a), [r2,g2,b2] = p(b)
  return (r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2
}

function remapColor(color, oldPalette, newPalette) {
  let bestIdx = 0, bestDist = Infinity
  oldPalette.forEach((c, i) => { const d = colorDist(color, c); if (d < bestDist) { bestDist = d; bestIdx = i } })
  return newPalette[bestIdx % newPalette.length]
}

export function useBadgeConfig() {
  // ── Palette ───────────────────────────────────────────────────────────────
  function setPaletteColor(index, color) { config.palette[index] = color }
  function addPaletteColor() { if (config.palette.length < 6) config.palette.push('#ffffff') }
  function removePaletteColor(index) { if (config.palette.length > 1) config.palette.splice(index, 1) }
  function movePaletteColor(from, to) {
    if (from === to || from == null || to == null) return
    const [moved] = config.palette.splice(from, 1)
    config.palette.splice(to, 0, moved)
  }
  function setPalette(hexArray) {
    const oldPalette = [...config.palette]
    const newPalette = withNeutral(hexArray)
    const thirdColor = newPalette[2]
    for (const text of config.texts)   text.color = '#ffffff'
    for (const sym of config.symbols) {
      // With a third accent colour available, let symbols pick it up sometimes
      // instead of always mapping to the nearest fill — keeps crests varied.
      sym.color = (thirdColor && Math.random() < 0.4)
        ? thirdColor
        : remapColor(sym.color, oldPalette, newPalette)
      if (sym.strokeWidth > 0) {
        const strokeInPalette = newPalette.some(c => c.toLowerCase() === sym.strokeColor.toLowerCase())
        if (!strokeInPalette) sym.strokeColor = remapColor(sym.strokeColor, oldPalette, newPalette)
        // Avoid fill and stroke collapsing to the same colour
        if (sym.strokeColor.toLowerCase() === sym.color.toLowerCase()) {
          sym.strokeColor = newPalette.find(c => c.toLowerCase() !== sym.color.toLowerCase()) ?? sym.strokeColor
        }
      }
    }
    const borderInPalette = newPalette.some(c => c.toLowerCase() === config.border.color.toLowerCase())
    if (!borderInPalette) config.border.color = remapColor(config.border.color, oldPalette, newPalette)
    // Recolour gradient stops to the nearest new palette colour, like everything else.
    if (Array.isArray(config.background.gradient)) {
      config.background.gradient = config.background.gradient.map(c => remapColor(c, oldPalette, newPalette))
    }
    config.palette.splice(0, config.palette.length, ...newPalette)
  }

  // ── Shape ─────────────────────────────────────────────────────────────────
  function setShape(shapeId) { config.shapeId = shapeId }
  function setNoShield(on) { config.noShield = !!on }

  // ── Background ────────────────────────────────────────────────────────────
  function setBackgroundType(type) { config.background.type = type }
  function setStripeCount(n) { config.background.stripeCount = Math.min(16, Math.max(2, n)) }
  function setSashWidth(n) { config.background.sashWidth = Math.min(280, Math.max(68, n)) }
  function setSunburstRays(n) { config.background.sunburstRays = Math.min(48, Math.max(6, Math.round(n / 2) * 2)) }

  // Gradient stops — 2 to 5 colours, evenly spread across the fill.
  const GRADIENT_MAX = 5
  function setGradientStop(index, color) {
    if (config.background.gradient[index] != null) config.background.gradient[index] = color
  }
  function addGradientStop() {
    const g = config.background.gradient
    if (g.length < GRADIENT_MAX) g.push(g[g.length - 1] || '#ffffff')
  }
  function removeGradientStop(index) {
    const g = config.background.gradient
    if (g.length > 2) g.splice(index, 1)
  }
  function setGradientAngle(deg) {
    config.background.gradientAngle = ((Number(deg) % 360) + 360) % 360
  }

  // ── Border ────────────────────────────────────────────────────────────────
  function setBorderColor(color) { config.border.color = color }
  function setBorderWidth(width) { config.border.width = Number(width) }

  // ── Symbols ───────────────────────────────────────────────────────────────
  function addSymbol(iconId) {
    const instanceId = `sym-${nextId++}`
    const color = config.palette[Math.floor(Math.random() * config.palette.length)] || '#ffffff'
    const icon = icons.find(ic => ic.id === iconId)
    const ring = icon?.supportsRing ? { ringThickness: icon.defaultRingThickness ?? 44 } : {}
    const strokeColor = _contrastColor(color, config.palette)
    config.symbols.push({ instanceId, iconId, color, x: 100, y: 105, size: 72, rotation: 0, flipH: false, strokeColor, strokeWidth: 0, clipped: true, ...ring })
    setSelection('symbol', instanceId)
  }

  // A rectangle primitive — a symbol with kind 'rect' and independent w/h
  // (no icon/size). Reuses all the symbol placement/selection/align machinery.
  function addRect() {
    const instanceId = `sym-${nextId++}`
    const color = config.palette[Math.floor(Math.random() * config.palette.length)] || '#ffffff'
    const strokeColor = _contrastColor(color, config.palette)
    config.symbols.push({ instanceId, kind: 'rect', color, x: 100, y: 120, w: 90, h: 40, rotation: 0, strokeColor, strokeWidth: 0, clipped: true })
    setSelection('symbol', instanceId)
  }

  function removeSymbol(instanceId) {
    const idx = config.symbols.findIndex(s => s.instanceId === instanceId)
    if (idx !== -1) config.symbols.splice(idx, 1)
    removeFromSelection('symbol', instanceId)
  }

  function updateSymbol(instanceId, updates) {
    const sym = config.symbols.find(s => s.instanceId === instanceId)
    if (sym) Object.assign(sym, updates)
  }

  function updateSymbolPosition(instanceId, x, y) {
    const sym = config.symbols.find(s => s.instanceId === instanceId)
    if (sym) { sym.x = x; sym.y = y }
  }

  function selectSymbol(instanceId) { setSelection('symbol', instanceId) }

  // ── Text ──────────────────────────────────────────────────────────────────
  function addText() {
    const id = `text-${nextId++}`
    config.texts.push({ ...DEFAULT_TEXT(), id, content: 'New Text' })
    setSelection('text', id)
  }

  function removeText(id) {
    const idx = config.texts.findIndex(t => t.id === id)
    if (idx !== -1) config.texts.splice(idx, 1)
    removeFromSelection('text', id)
  }

  function updateText(id, updates) {
    const text = config.texts.find(t => t.id === id)
    if (text) Object.assign(text, updates)
  }

  function updateTextPosition(id, x, y) {
    const text = config.texts.find(t => t.id === id)
    if (text) { text.x = x; text.y = y }
  }

  function selectText(id) { setSelection('text', id) }

  function pasteSymbol(source) {
    const instanceId = `sym-${nextId++}`
    config.symbols.push({ ...source, instanceId, x: source.x + 8, y: source.y + 8 })
    setSelection('symbol', instanceId)
  }

  function pasteText(source) {
    const id = `text-${nextId++}`
    const pasted = { ...source, id }
    if (!source.arc) {
      pasted.x = (source.x ?? 100) + 8
      pasted.y = (source.y ?? 120) + 8
    }
    config.texts.push(pasted)
    setSelection('text', id)
  }

  function deselectAll() { clearSelection() }

  function resetConfig() {
    config.shapeId = 'traditional-english'
    config.noShield = false
    config.palette.splice(0, config.palette.length, '#1a3a6b', '#c8102e', '#ffffff')
    Object.assign(config.background, { type: 'solid', stripeCount: 4, sashWidth: 174, sunburstRays: 12, gradient: ['#1a3a6b', '#c8102e'], gradientAngle: 45 })
    config.symbols.splice(0, config.symbols.length)
    config.texts.splice(0, config.texts.length,
      { ...DEFAULT_TEXT(), id: 'club-name', content: 'CREST FOUNDRY', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, x: 100, y: 55 },
      { ...DEFAULT_TEXT(), id: 'monogram', content: 'FC', fontSize: 22, fontWeight: 'bold', letterSpacing: 3, x: 100, y: 185 },
    )
    Object.assign(config.border, { color: '#ffffff', width: 0 })
    clearSelection()
  }

  function loadConfig(saved) {
    config.shapeId = saved.shapeId
    config.noShield = saved.noShield ?? false
    config.palette.splice(0, config.palette.length, ...saved.palette)
    Object.assign(config.background, saved.background)
    // Older snapshots have no gradient — seed one so the editor still works.
    if (!Array.isArray(config.background.gradient) || config.background.gradient.length < 2) {
      config.background.gradient = config.palette.slice(0, 2)
    }
    if (config.background.gradientAngle == null) config.background.gradientAngle = 45
    config.symbols.splice(0, config.symbols.length, ...saved.symbols)
    config.texts.splice(0, config.texts.length, ...saved.texts)
    Object.assign(config.border, saved.border)
    clearSelection()
    // Advance nextId past any numeric IDs in the loaded config to avoid collisions
    const ids = [...saved.symbols.map(s => s.instanceId), ...saved.texts.map(t => t.id)]
    for (const id of ids) {
      const n = parseInt(id?.match(/\d+/)?.[0])
      if (!isNaN(n) && n >= nextId) nextId = n + 1
    }
  }

  return {
    config,
    initialClub: _randomClub,
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
    addRect,
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
  }
}
