import { reactive } from 'vue'

export function useBadgeConfig() {
  const config = reactive({
    shapeId: 'traditional-english',
    background: {
      type: 'halved-v',
      colors: ['#1a3a6b', '#c8102e'],
    },
    symbol: null,
    texts: [
      {
        id: 'club-name',
        content: 'FC Crest Forge',
        fontFamily: 'Georgia, serif',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        x: 100,
        y: 192,
      },
      {
        id: 'year',
        content: 'EST. 1888',
        fontFamily: 'Georgia, serif',
        fontSize: 10,
        fontWeight: 'normal',
        color: '#ffd700',
        x: 100,
        y: 208,
      },
    ],
    border: {
      color: '#ffd700',
      width: 3,
    },
  })

  function updateTextPosition(id, x, y) {
    const text = config.texts.find(t => t.id === id)
    if (text) { text.x = x; text.y = y }
  }

  function setShape(shapeId) {
    config.shapeId = shapeId
  }

  function setBackgroundType(type) {
    config.background.type = type
  }

  function setBackgroundColor(index, color) {
    config.background.colors[index] = color
  }

  function setBorderColor(color) {
    config.border.color = color
  }

  function setBorderWidth(width) {
    config.border.width = width
  }

  function updateText(id, updates) {
    const text = config.texts.find(t => t.id === id)
    if (text) Object.assign(text, updates)
  }

  return {
    config,
    setShape,
    setBackgroundType,
    setBackgroundColor,
    setBorderColor,
    setBorderWidth,
    updateText,
    updateTextPosition,
  }
}
