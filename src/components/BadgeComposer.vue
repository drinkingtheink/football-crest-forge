<script setup>
import { ref, computed } from 'vue'
import { shapesById, VIEWBOX_W, VIEWBOX_H } from '../data/shapes.js'
import { iconsById } from '../data/icons.js'
import { arcPathD } from '../utils/arcPath.js'
import { useToast } from '../composables/useToast.js'

const { addToast } = useToast()
let resizeHintShown = false

const props = defineProps({
  config: { type: Object, required: true },
  selectedSymbolId: { type: String, default: null },
  size: { type: Number, default: 380 },
  uid: { type: String, default: 'b0' },
})

const emit = defineEmits(['update-text-position', 'update-symbol-position', 'update-text', 'select-symbol', 'select-text'])

function arcPathId(textId) { return `arcpath-${props.uid}-${textId}` }

const shape = computed(() => shapesById[props.config.shapeId])
const clipId = computed(() => `clip-${props.uid}`)

function symbolTransform(sym) {
  const scale = sym.size / 100
  return `translate(${sym.x - sym.size / 2}, ${sym.y - sym.size / 2}) scale(${scale})`
}

// ── Unified drag (text or symbol) ──────────────────────────────────────────
const drag = ref(null)

function toSVGPoint(svgEl, clientX, clientY) {
  const pt = svgEl.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  return pt.matrixTransform(svgEl.getScreenCTM().inverse())
}

function startTextDrag(e, textId) {
  const svgEl = e.currentTarget.closest('svg')
  const pt = toSVGPoint(svgEl, e.clientX, e.clientY)
  const text = props.config.texts.find(t => t.id === textId)
  drag.value = { type: 'text', id: textId, sx: pt.x, sy: pt.y, ox: text.x, oy: text.y }
  e.preventDefault()
}

function startSymbolDrag(e, instanceId) {
  const svgEl = e.currentTarget.closest('svg')
  const pt = toSVGPoint(svgEl, e.clientX, e.clientY)
  const sym = props.config.symbols.find(s => s.instanceId === instanceId)
  drag.value = { type: 'symbol', instanceId, sx: pt.x, sy: pt.y, ox: sym.x, oy: sym.y }
  emit('select-symbol', instanceId)
  e.preventDefault()
}

function onMove(e) {
  if (!drag.value) return
  const pt = toSVGPoint(e.currentTarget, e.clientX, e.clientY)
  const dx = pt.x - drag.value.sx
  const dy = pt.y - drag.value.sy
  if (drag.value.type === 'text') {
    emit('update-text-position', drag.value.id, drag.value.ox + dx, drag.value.oy + dy)
  } else {
    emit('update-symbol-position', drag.value.instanceId, drag.value.ox + dx, drag.value.oy + dy)
  }
}

function stopDrag() { drag.value = null }

// ── Hover highlight ────────────────────────────────────────────────────────
const hoveredSymbolId = ref(null)
const hoveredTextId   = ref(null)

// ── Text hover tooltip ─────────────────────────────────────────────────────
const textTooltip = ref(null) // { x, y } screen coords

function onTextEnter(e, textId) {
  hoveredTextId.value = textId
  if (drag.value) return
  textTooltip.value = { x: e.clientX, y: e.clientY }
  if (!resizeHintShown) {
    resizeHintShown = true
    addToast('Scroll over text to resize it', { type: 'tip', duration: 4000 })
  }
}

function onTextLeave() {
  hoveredTextId.value = null
  textTooltip.value = null
}

// ── Scroll-to-resize text ──────────────────────────────────────────────────
const sizeHint = ref(null)
let sizeHintTimer = null

function onTextWheel(e, textId) {
  textTooltip.value = null
  const text = props.config.texts.find(t => t.id === textId)
  if (!text) return
  const delta = e.deltaY > 0 ? -1 : 1
  const newSize = Math.min(80, Math.max(6, text.fontSize + delta))
  emit('update-text', textId, { fontSize: newSize })

  const hx = text.arc ? (text.arcX ?? 100) : text.x
  const hy = text.arc ? (text.arcY ?? 120) - (text.arcRadius ?? 78) - 10 : text.y - newSize / 2 - 8
  sizeHint.value = { x: hx, y: hy, size: newSize }
  clearTimeout(sizeHintTimer)
  sizeHintTimer = setTimeout(() => { sizeHint.value = null }, 900)
}

// ── Background ─────────────────────────────────────────────────────────────
const bgElements = computed(() => {
  const { type } = props.config.background
  const palette = props.config.palette
  const c0 = palette[0] || '#000000'
  const c1 = palette[1] || c0
  const W = VIEWBOX_W
  const H = VIEWBOX_H

  switch (type) {
    case 'solid':
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: c0 }], polys: [] }
    case 'halved-v':
      return { rects: [{ x: 0, y: 0, w: W/2, h: H, fill: c0 }, { x: W/2, y: 0, w: W/2, h: H, fill: c1 }], polys: [] }
    case 'halved-h':
      return { rects: [{ x: 0, y: 0, w: W, h: H/2, fill: c0 }, { x: 0, y: H/2, w: W, h: H/2, fill: c1 }], polys: [] }
    case 'quartered':
      return { rects: [
        { x: 0,   y: 0,   w: W/2, h: H/2, fill: c0 },
        { x: W/2, y: 0,   w: W/2, h: H/2, fill: c1 },
        { x: 0,   y: H/2, w: W/2, h: H/2, fill: c1 },
        { x: W/2, y: H/2, w: W/2, h: H/2, fill: c0 },
      ], polys: [] }
    case 'diagonal':
      return { rects: [], polys: [
        { points: `0,0 ${W},0 0,${H}`, fill: c0 },
        { points: `${W},0 ${W},${H} 0,${H}`, fill: c1 },
      ]}
    case 'striped-v': {
      const n = 4; const sw = W / n
      return { rects: Array.from({ length: n }, (_, i) => ({ x: i*sw, y: 0, w: sw, h: H, fill: i%2===0?c0:c1 })), polys: [] }
    }
    case 'striped-h': {
      const n = 4; const sh = H / n
      return { rects: Array.from({ length: n }, (_, i) => ({ x: 0, y: i*sh, w: W, h: sh, fill: i%2===0?c0:c1 })), polys: [] }
    }
    default:
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: c0 }], polys: [] }
  }
})
</script>

<template>
  <svg
    :width="size"
    :viewBox="`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`"
    xmlns="http://www.w3.org/2000/svg"
    style="user-select: none; display: block; overflow: visible; filter: drop-shadow(0 12px 32px rgba(0,0,0,0.65));"
    @mousemove="onMove"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
  >
    <defs>
      <clipPath :id="clipId">
        <path v-if="shape" :d="shape.path" />
      </clipPath>
      <!-- Arc paths for textPath elements -->
      <path
        v-for="text in config.texts.filter(t => t.arc)"
        :key="arcPathId(text.id)"
        :id="arcPathId(text.id)"
        :d="arcPathD(text)"
        fill="none"
      />
    </defs>

    <!-- Background -->
    <g :clip-path="`url(#${clipId})`">
      <rect
        v-for="(r, i) in bgElements.rects" :key="`r${i}`"
        :x="r.x" :y="r.y" :width="r.w" :height="r.h" :fill="r.fill"
      />
      <polygon
        v-for="(p, i) in bgElements.polys" :key="`p${i}`"
        :points="p.points" :fill="p.fill"
      />
    </g>

    <!-- Symbols (clipped, each independently draggable) -->
    <g
      v-for="sym in config.symbols"
      :key="sym.instanceId"
      :clip-path="`url(#${clipId})`"
      :style="{
        cursor: drag?.instanceId === sym.instanceId ? 'grabbing' : 'grab',
        filter: hoveredSymbolId === sym.instanceId ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
        transition: 'filter 0.15s ease',
      }"
      @mousedown="startSymbolDrag($event, sym.instanceId)"
      @mouseenter="hoveredSymbolId = sym.instanceId"
      @mouseleave="hoveredSymbolId = null"
    >
      <g :transform="symbolTransform(sym)">
        <path
          v-for="(p, i) in iconsById[sym.iconId]?.paths"
          :key="i"
          :d="p"
          :fill="sym.color"
        />
      </g>
    </g>

    <!-- Border -->
    <path
      v-if="shape"
      :d="shape.path"
      fill="none"
      :stroke="config.border.color"
      :stroke-width="config.border.width"
      stroke-linejoin="round"
    />

    <!-- Straight text (draggable, scroll to resize) -->
    <text
      v-for="text in config.texts.filter(t => !t.arc)"
      :key="text.id"
      :x="text.x"
      :y="text.y"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :fill="text.color"
      :letter-spacing="text.letterSpacing ?? 0"
      text-anchor="middle"
      dominant-baseline="middle"
      :style="{
        cursor: drag?.id === text.id ? 'grabbing' : 'grab',
        filter: hoveredTextId === text.id ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : 'none',
        transition: 'filter 0.15s ease',
      }"
      @mousedown="startTextDrag($event, text.id)"
      @click="$emit('select-text', text.id)"
      @mouseenter="onTextEnter($event, text.id)"
      @mouseleave="onTextLeave"
      @wheel.stop.prevent="onTextWheel($event, text.id)"
    >{{ text.content }}</text>

    <!-- Arc text (follows circular path, scroll to resize) -->
    <text
      v-for="text in config.texts.filter(t => t.arc)"
      :key="text.id"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :fill="text.color"
      :letter-spacing="text.letterSpacing ?? 0"
      :style="{
        filter: hoveredTextId === text.id ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : 'none',
        transition: 'filter 0.15s ease',
      }"
      @click="$emit('select-text', text.id)"
      @mouseenter="onTextEnter($event, text.id)"
      @mouseleave="onTextLeave"
      @wheel.stop.prevent="onTextWheel($event, text.id)"
    >
      <textPath
        :href="`#${arcPathId(text.id)}`"
        start-offset="50%"
        text-anchor="middle"
      >{{ text.content }}</textPath>
    </text>

    <!-- Size hint bubble (shown while scroll-resizing) -->
    <g v-if="sizeHint" :transform="`translate(${sizeHint.x}, ${sizeHint.y})`" style="pointer-events:none">
      <rect x="-14" y="-9" width="28" height="13" rx="3" fill="#000000" fill-opacity="0.65" />
      <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="7" font-family="system-ui,sans-serif" font-weight="600">{{ sizeHint.size }}px</text>
    </g>
  </svg>

  <Teleport to="body">
    <div
      v-if="textTooltip && !sizeHint"
      class="text-resize-tooltip"
      :style="{ left: textTooltip.x + 14 + 'px', top: textTooltip.y - 36 + 'px' }"
    >↕ Scroll to resize</div>
  </Teleport>
</template>

<style>
.text-resize-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.75);
  color: #e8e8ec;
  font-size: 11px;
  font-family: system-ui, sans-serif;
  letter-spacing: 0.02em;
  padding: 4px 9px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
}
</style>
