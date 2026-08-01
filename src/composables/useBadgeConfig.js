import { reactive, ref } from 'vue'

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
  palette: ['#1a3a6b', '#c8102e', '#ffd700', '#ffffff'],
  background: {
    type: 'halved-v',
    colors: ['#1a3a6b', '#c8102e'],
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
      y: 120,
    },
  ],
  border: {
    color: '#ffd700',
    width: 3,
  },
})

const selectedSymbolId = ref(null)
const selectedTextId = ref(null)
let nextId = 1

export function useBadgeConfig() {
  // ── Palette ───────────────────────────────────────────────────────────────
  function setPaletteColor(index, color) { config.palette[index] = color }

  // ── Shape ─────────────────────────────────────────────────────────────────
  function setShape(shapeId) { config.shapeId = shapeId }

  // ── Background ────────────────────────────────────────────────────────────
  function setBackgroundType(type) { config.background.type = type }
  function setBackgroundColor(index, color) { config.background.colors[index] = color }

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
  }
}
