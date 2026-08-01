<script setup>
import { ref, computed } from 'vue'
import { shapesById, VIEWBOX_W, VIEWBOX_H } from '../data/shapes.js'

const props = defineProps({
  config: { type: Object, required: true },
  size: { type: Number, default: 380 },
  uid: { type: String, default: 'b0' },
})

const emit = defineEmits(['update-text-position'])

const shape = computed(() => shapesById[props.config.shapeId])
const clipId = computed(() => `clip-${props.uid}`)

// --- Drag ---
const drag = ref(null)

function toSVGPoint(svgEl, clientX, clientY) {
  const pt = svgEl.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  return pt.matrixTransform(svgEl.getScreenCTM().inverse())
}

function startDrag(e, textId) {
  const svgEl = e.currentTarget.closest('svg')
  const pt = toSVGPoint(svgEl, e.clientX, e.clientY)
  const text = props.config.texts.find(t => t.id === textId)
  drag.value = { id: textId, sx: pt.x, sy: pt.y, ox: text.x, oy: text.y }
  e.preventDefault()
}

function onMove(e) {
  if (!drag.value) return
  const pt = toSVGPoint(e.currentTarget, e.clientX, e.clientY)
  emit('update-text-position', drag.value.id,
    drag.value.ox + (pt.x - drag.value.sx),
    drag.value.oy + (pt.y - drag.value.sy),
  )
}

function stopDrag() { drag.value = null }

// --- Background ---
const BG_TYPES = ['solid', 'halved-v', 'halved-h', 'quartered', 'diagonal', 'striped-v', 'striped-h']

const bgElements = computed(() => {
  const { type, colors } = props.config.background
  const c0 = colors[0] || '#000000'
  const c1 = colors[1] || '#ffffff'
  const W = VIEWBOX_W
  const H = VIEWBOX_H

  switch (type) {
    case 'solid':
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: c0 }], polys: [] }

    case 'halved-v':
      return {
        rects: [
          { x: 0, y: 0, w: W / 2, h: H, fill: c0 },
          { x: W / 2, y: 0, w: W / 2, h: H, fill: c1 },
        ],
        polys: [],
      }

    case 'halved-h':
      return {
        rects: [
          { x: 0, y: 0, w: W, h: H / 2, fill: c0 },
          { x: 0, y: H / 2, w: W, h: H / 2, fill: c1 },
        ],
        polys: [],
      }

    case 'quartered':
      return {
        rects: [
          { x: 0,     y: 0,     w: W / 2, h: H / 2, fill: c0 },
          { x: W / 2, y: 0,     w: W / 2, h: H / 2, fill: c1 },
          { x: 0,     y: H / 2, w: W / 2, h: H / 2, fill: c1 },
          { x: W / 2, y: H / 2, w: W / 2, h: H / 2, fill: c0 },
        ],
        polys: [],
      }

    case 'diagonal':
      return {
        rects: [],
        polys: [
          { points: `0,0 ${W},0 0,${H}`, fill: c0 },
          { points: `${W},0 ${W},${H} 0,${H}`, fill: c1 },
        ],
      }

    case 'striped-v': {
      const n = 4
      const sw = W / n
      return {
        rects: Array.from({ length: n }, (_, i) => ({
          x: i * sw, y: 0, w: sw, h: H, fill: i % 2 === 0 ? c0 : c1,
        })),
        polys: [],
      }
    }

    case 'striped-h': {
      const n = 4
      const sh = H / n
      return {
        rects: Array.from({ length: n }, (_, i) => ({
          x: 0, y: i * sh, w: W, h: sh, fill: i % 2 === 0 ? c0 : c1,
        })),
        polys: [],
      }
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
    style="user-select: none; display: block;"
    @mousemove="onMove"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
  >
    <defs>
      <clipPath :id="clipId">
        <path v-if="shape" :d="shape.path" />
      </clipPath>
    </defs>

    <!-- Background (clipped) -->
    <g :clip-path="`url(#${clipId})`">
      <rect
        v-for="(r, i) in bgElements.rects"
        :key="`r${i}`"
        :x="r.x" :y="r.y" :width="r.w" :height="r.h" :fill="r.fill"
      />
      <polygon
        v-for="(p, i) in bgElements.polys"
        :key="`p${i}`"
        :points="p.points" :fill="p.fill"
      />
    </g>

    <!-- Symbol layer (clipped) — placeholder for Phase 1b -->
    <g v-if="config.symbol" :clip-path="`url(#${clipId})`">
      <!-- heraldic symbols go here -->
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

    <!-- Draggable text -->
    <text
      v-for="text in config.texts"
      :key="text.id"
      :x="text.x"
      :y="text.y"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :fill="text.color"
      text-anchor="middle"
      dominant-baseline="middle"
      :style="{ cursor: drag?.id === text.id ? 'grabbing' : 'grab' }"
      @mousedown="startDrag($event, text.id)"
    >{{ text.content }}</text>
  </svg>
</template>
