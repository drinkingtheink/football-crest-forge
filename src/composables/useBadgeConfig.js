import { reactive, ref } from 'vue'
import { clubs } from '../data/clubs.js'
import { icons } from '../data/icons.js'

const _randomClub = clubs[Math.floor(Math.random() * clubs.length)]
const _randomIcon = icons[Math.floor(Math.random() * icons.length)]
const _addInitialSymbol = Math.random() < 1/3
function _contrastColor(fill, palette) {
  const alt = palette.find(c => c.toLowerCase() !== fill.toLowerCase())
  return alt ?? (fill.toLowerCase() === '#000000' ? '#ffffff' : '#000000')
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
  letterSpacing: 0,
  arc: null,
  arcRadius: 78,
  arcX: 100,
  arcY: 120,
  x: 100,
  y: 120,
})

// ── Singleton state (module-level so any component gets the same instance) ──
const config = reactive({
  shapeId: 'traditional-english',
  palette: _randomClub.colors.map(c => c.hex),
  background: {
    type: _randomBgType,
    stripeCount: 4,
    sashWidth: 80,
  },
  symbols: _addInitialSymbol ? (() => {
    const fill = _randomClub.colors[0]?.hex || '#ffffff'
    const palette = _randomClub.colors.map(c => c.hex)
    return [{ instanceId: 'sym-init', iconId: _randomIcon.id, color: fill, x: 100, y: 120, size: 72, strokeColor: _contrastColor(fill, palette), strokeWidth: 8 }]
  })() : [],
  texts: [
    {
      ...DEFAULT_TEXT(),
      id: 'club-name',
      content: 'FC CREST FORGE',
      fontSize: 15,
      fontWeight: 'bold',
      letterSpacing: 2,
      x: 100,
      y: 55,
    },
    {
      ...DEFAULT_TEXT(),
      id: 'year',
      content: String(new Date().getFullYear()),
      fontSize: 11,
      fontWeight: 'normal',
      letterSpacing: 3,
      x: 100,
      y: 185,
    },
  ],
  border: _defaultBorder,
})

const selectedSymbolId = ref(null)
const selectedTextId = ref(null)
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
  function addPaletteColor() { if (config.palette.length < 6) config.palette.push('#cccccc') }
  function removePaletteColor(index) { if (config.palette.length > 1) config.palette.splice(index, 1) }
  function setPalette(hexArray) {
    const oldPalette = [...config.palette]
    const newPalette = hexArray.slice(0, 6)
    for (const text of config.texts)   text.color = '#ffffff'
    for (const sym of config.symbols) {
      sym.color = remapColor(sym.color, oldPalette, newPalette)
      if (sym.strokeWidth > 0) {
        const strokeInPalette = newPalette.some(c => c.toLowerCase() === sym.strokeColor.toLowerCase())
        if (!strokeInPalette) sym.strokeColor = remapColor(sym.strokeColor, oldPalette, newPalette)
      }
    }
    const borderInPalette = newPalette.some(c => c.toLowerCase() === config.border.color.toLowerCase())
    if (!borderInPalette) config.border.color = remapColor(config.border.color, oldPalette, newPalette)
    config.palette.splice(0, config.palette.length, ...newPalette)
  }

  // ── Shape ─────────────────────────────────────────────────────────────────
  function setShape(shapeId) { config.shapeId = shapeId }

  // ── Background ────────────────────────────────────────────────────────────
  function setBackgroundType(type) { config.background.type = type }
  function setStripeCount(n) { config.background.stripeCount = Math.min(16, Math.max(2, n)) }
  function setSashWidth(n) { config.background.sashWidth = Math.min(280, Math.max(68, n)) }

  // ── Border ────────────────────────────────────────────────────────────────
  function setBorderColor(color) { config.border.color = color }
  function setBorderWidth(width) { config.border.width = Number(width) }

  // ── Symbols ───────────────────────────────────────────────────────────────
  function addSymbol(iconId) {
    const instanceId = `sym-${nextId++}`
    const color = config.palette[Math.floor(Math.random() * config.palette.length)] || '#ffffff'
    config.symbols.push({ instanceId, iconId, color, x: 100, y: 105, size: 72, strokeColor: '#000000', strokeWidth: 0 })
    selectedSymbolId.value = instanceId
  }

  function removeSymbol(instanceId) {
    const idx = config.symbols.findIndex(s => s.instanceId === instanceId)
    if (idx !== -1) config.symbols.splice(idx, 1)
    if (selectedSymbolId.value === instanceId) selectedSymbolId.value = null
  }

  function updateSymbol(instanceId, updates) {
    const sym = config.symbols.find(s => s.instanceId === instanceId)
    if (sym) Object.assign(sym, updates)
  }

  function updateSymbolPosition(instanceId, x, y) {
    const sym = config.symbols.find(s => s.instanceId === instanceId)
    if (sym) { sym.x = x; sym.y = y }
  }

  function selectSymbol(instanceId) { selectedSymbolId.value = instanceId }

  // ── Text ──────────────────────────────────────────────────────────────────
  function addText() {
    const id = `text-${nextId++}`
    config.texts.push({ ...DEFAULT_TEXT(), id, content: 'New Text' })
    selectedTextId.value = id
  }

  function removeText(id) {
    const idx = config.texts.findIndex(t => t.id === id)
    if (idx !== -1) config.texts.splice(idx, 1)
    if (selectedTextId.value === id) selectedTextId.value = null
  }

  function updateText(id, updates) {
    const text = config.texts.find(t => t.id === id)
    if (text) Object.assign(text, updates)
  }

  function updateTextPosition(id, x, y) {
    const text = config.texts.find(t => t.id === id)
    if (text) { text.x = x; text.y = y }
  }

  function selectText(id) { selectedTextId.value = id }

  return {
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
  }
}
