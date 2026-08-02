import { reactive, ref } from 'vue'
import { clubs } from '../data/clubs.js'

const _randomClub = clubs[Math.floor(Math.random() * clubs.length)]

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
    type: 'halved-v',
    stripeCount: 4,
  },
  symbols: [],
  texts: [
    {
      ...DEFAULT_TEXT(),
      id: 'club-name',
      content: 'FC CREST FORGE',
      fontSize: 15,
      fontWeight: 'bold',
      letterSpacing: 2,
      x: 100,
      y: 110,
    },
    {
      ...DEFAULT_TEXT(),
      id: 'year',
      content: String(new Date().getFullYear()),
      fontSize: 11,
      fontWeight: 'normal',
      letterSpacing: 3,
      x: 100,
      y: 158,
    },
  ],
  border: {
    color: '#ffffff',
    width: 0,
  },
})

const selectedSymbolId = ref(null)
const selectedTextId = ref(null)
let nextId = 1

export function useBadgeConfig() {
  // ── Palette ───────────────────────────────────────────────────────────────
  function setPaletteColor(index, color) { config.palette[index] = color }
  function addPaletteColor() { if (config.palette.length < 6) config.palette.push('#cccccc') }
  function removePaletteColor(index) { if (config.palette.length > 1) config.palette.splice(index, 1) }
  function setPalette(hexArray) { config.palette.splice(0, config.palette.length, ...hexArray.slice(0, 6)) }

  // ── Shape ─────────────────────────────────────────────────────────────────
  function setShape(shapeId) { config.shapeId = shapeId }

  // ── Background ────────────────────────────────────────────────────────────
  function setBackgroundType(type) { config.background.type = type }
  function setStripeCount(n) { config.background.stripeCount = Math.min(12, Math.max(2, n)) }

  // ── Border ────────────────────────────────────────────────────────────────
  function setBorderColor(color) { config.border.color = color }
  function setBorderWidth(width) { config.border.width = Number(width) }

  // ── Symbols ───────────────────────────────────────────────────────────────
  function addSymbol(iconId) {
    const instanceId = `sym-${nextId++}`
    config.symbols.push({ instanceId, iconId, color: '#ffd700', x: 100, y: 105, size: 72 })
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

  function selectSymbol(instanceId) {
    selectedSymbolId.value = instanceId === selectedSymbolId.value ? null : instanceId
  }

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
