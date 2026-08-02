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

const emit = defineEmits(['update-text-position', 'update-symbol-position', 'update-text', 'update-symbol', 'select-symbol', 'select-text', 'deselect', 'symbol-outside-bounds'])

function arcPathId(textId) { return `arcpath-${props.uid}-${textId}` }

const shape = computed(() => shapesById[props.config.shapeId])
const clipId = computed(() => `clip-${props.uid}`)

function symPaths(sym) {
  const icon = iconsById[sym.iconId]
  if (!icon?.supportsRing || sym.ringThickness == null) return icon?.paths ?? []
  const cx = 50, cy = 50, outerR = 44
  const outer = `M ${cx - outerR},${cy} A ${outerR},${outerR} 0 1 1 ${cx + outerR},${cy} A ${outerR},${outerR} 0 1 1 ${cx - outerR},${cy} Z`
  const innerR = outerR - sym.ringThickness
  if (innerR <= 0) return [outer]
  const inner = `M ${cx - innerR},${cy} A ${innerR},${innerR} 0 1 0 ${cx + innerR},${cy} A ${innerR},${innerR} 0 1 0 ${cx - innerR},${cy} Z`
  return [`${outer} ${inner}`]
}

function symbolTransform(sym) {
  const icon = iconsById[sym.iconId]
  const vw = icon?.viewBox?.[0] ?? 100
  const vh = icon?.viewBox?.[1] ?? 100
  const scale = sym.size / Math.max(vw, vh)
  const offX = (sym.size - vw * scale) / 2
  const offY = (sym.size - vh * scale) / 2
  const rot = sym.rotation ? `rotate(${sym.rotation}, ${sym.x}, ${sym.y}) ` : ''
  return `${rot}translate(${sym.x - sym.size / 2 + offX}, ${sym.y - sym.size / 2 + offY}) scale(${scale})`
}

// ── Unified drag (text or symbol) ──────────────────────────────────────────
const drag = ref(null)
const shapePathEl = ref(null)
const outsidePromptedId = ref(null)

// ── Alignment guides (show-only, badge centre) ─────────────────────────────
const BADGE_CX = VIEWBOX_W / 2
const BADGE_CY = VIEWBOX_H / 2
const GUIDE_TOL = 2                 // viewBox units the centre must be within
const guides = ref({ x: false, y: false })

function updateGuides(cx, cy) {
  guides.value = {
    x: Math.abs(cx - BADGE_CX) <= GUIDE_TOL,
    y: Math.abs(cy - BADGE_CY) <= GUIDE_TOL,
  }
}

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
  if (text.arc) {
    drag.value = { type: 'text', id: textId, sx: pt.x, sy: pt.y, ox: text.arcX ?? 100, oy: text.arcY ?? 120, isArc: true }
  } else {
    drag.value = { type: 'text', id: textId, sx: pt.x, sy: pt.y, ox: text.x, oy: text.y, isArc: false }
  }
  e.preventDefault()
}

function startSymbolDrag(e, instanceId) {
  const svgEl = e.currentTarget.closest('svg')
  const pt = toSVGPoint(svgEl, e.clientX, e.clientY)
  const sym = props.config.symbols.find(s => s.instanceId === instanceId)
  drag.value = { type: 'symbol', instanceId, sx: pt.x, sy: pt.y, ox: sym.x, oy: sym.y }
  outsidePromptedId.value = null
  emit('select-symbol', instanceId)
  e.preventDefault()
}

function onMove(e) {
  if (!drag.value) return
  const pt = toSVGPoint(e.currentTarget, e.clientX, e.clientY)
  const dx = pt.x - drag.value.sx
  const dy = pt.y - drag.value.sy
  updateGuides(drag.value.ox + dx, drag.value.oy + dy)
  if (drag.value.type === 'text') {
    if (drag.value.isArc) {
      emit('update-text', drag.value.id, { arcX: drag.value.ox + dx, arcY: drag.value.oy + dy })
    } else {
      emit('update-text-position', drag.value.id, drag.value.ox + dx, drag.value.oy + dy)
    }
  } else {
    const newX = drag.value.ox + dx
    const newY = drag.value.oy + dy
    emit('update-symbol-position', drag.value.instanceId, newX, newY)
    const sym = props.config.symbols.find(s => s.instanceId === drag.value.instanceId)
    if (sym?.clipped !== false && shapePathEl.value && outsidePromptedId.value !== drag.value.instanceId) {
      if (!shapePathEl.value.isPointInFill(new DOMPoint(newX, newY))) {
        outsidePromptedId.value = drag.value.instanceId
        emit('symbol-outside-bounds', drag.value.instanceId)
      }
    }
  }
}

function stopDrag() { drag.value = null; guides.value = { x: false, y: false } }

// ── Hover highlight ────────────────────────────────────────────────────────
const hoveredSymbolId = ref(null)
const hoveredTextId   = ref(null)

// ── Text hover tooltip ─────────────────────────────────────────────────────
const textTooltip = ref(null) // { x, y } screen coords

function onSymbolWheel(e, instanceId) {
  const sym = props.config.symbols.find(s => s.instanceId === instanceId)
  if (!sym) return
  const delta = e.deltaY > 0 ? -3 : 3
  const newSize = Math.min(240, Math.max(16, sym.size + delta))
  emit('update-symbol', instanceId, { size: newSize })
  sizeHint.value = { x: sym.x, y: sym.y - newSize / 2 - 8, size: newSize }
  clearTimeout(sizeHintTimer)
  sizeHintTimer = setTimeout(() => { sizeHint.value = null }, 900)
}

function onTextEnter(e, textId) {
  hoveredTextId.value = textId
  if (drag.value) return
  textTooltip.value = { x: e.clientX, y: e.clientY }
  if (!resizeHintShown) {
    resizeHintShown = true
    addToast('Scroll over text or symbols to resize', { type: 'tip', duration: 4000 })
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
  const hy = text.arc ? (text.arcY ?? 120) - (text.arcRy ?? text.arcRadius ?? 78) - 10 : text.y - newSize / 2 - 8
  sizeHint.value = { x: hx, y: hy, size: newSize }
  clearTimeout(sizeHintTimer)
  sizeHintTimer = setTimeout(() => { sizeHint.value = null }, 900)
}

// ── Background ─────────────────────────────────────────────────────────────
const bgElements = computed(() => {
  const { type, stripeCount = 4 } = props.config.background
  const palette = props.config.palette
  const c0 = palette[0] || '#000000'
  const c1 = palette[1] || c0
  const W = VIEWBOX_W
  const H = VIEWBOX_H
  const n = stripeCount

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
    case 'chevron':
      return { rects: [], polys: [
        { points: `0,0 ${W},0 ${W},${H*0.38} ${W/2},${H*0.54} 0,${H*0.38}`, fill: c0 },
        { points: `0,${H*0.38} ${W/2},${H*0.54} ${W},${H*0.38} ${W},${H} 0,${H}`, fill: c1 },
      ]}
    case 'sash': {
      const hw = (props.config.background.sashWidth ?? 80) / 2
      // perpendicular unit vector to the / diagonal (upper-right → lower-left)
      const px = 0.768, py = 0.640
      // extend band endpoints 60 units past the badge edges so the clip is always clean
      const ex = 60
      const x1 = 200 + ex, y1 = -ex
      const x2 = -ex,  y2 = 240 + ex
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: c0 }], polys: [
        { points: `${x1+hw*px},${y1-hw*py} ${x1-hw*px},${y1+hw*py} ${x2-hw*px},${y2+hw*py} ${x2+hw*px},${y2-hw*py}`, fill: c1 },
      ]}
    }
    case 'striped-v': {
      const sw = W / n
      return { rects: Array.from({ length: n }, (_, i) => ({ x: i*sw, y: 0, w: sw, h: H, fill: i%2===0?c0:c1 })), polys: [] }
    }
    case 'striped-h': {
      const sh = H / n
      return { rects: Array.from({ length: n }, (_, i) => ({ x: 0, y: i*sh, w: W, h: sh, fill: i%2===0?c0:c1 })), polys: [] }
    }
    case 'striped-diagonal': {
      // Parallelogram stripes at 45°. Each stripe i: points where the diagonal offset c = x + y ranges over [i*sw, (i+1)*sw]
      const sw = (W + H) / n
      return { rects: [], polys: Array.from({ length: n }, (_, i) => {
        const cs = i * sw
        const ce = cs + sw
        return { points: `${cs},0 ${ce},0 ${ce-H},${H} ${cs-H},${H}`, fill: i%2===0?c0:c1 }
      })}
    }
    case 'checkered': {
      // Square cells sized to fit n columns across; rows overflow past H and clip
      const cell = W / n
      const rows = Math.ceil(H / cell)
      const rects = []
      for (let r = 0; r < rows; r++)
        for (let col = 0; col < n; col++)
          rects.push({ x: col*cell, y: r*cell, w: cell, h: cell, fill: (r+col)%2===0 ? c0 : c1 })
      return { rects, polys: [] }
    }
    case 'saltire': {
      // Per-saltire: two diagonals split the field into 4 triangles from the centre
      const cx = W/2, cy = H/2
      return { rects: [], polys: [
        { points: `0,0 ${W},0 ${cx},${cy}`,      fill: c0 },  // top
        { points: `${W},0 ${W},${H} ${cx},${cy}`, fill: c1 },  // right
        { points: `0,${H} ${W},${H} ${cx},${cy}`, fill: c0 },  // bottom
        { points: `0,0 0,${H} ${cx},${cy}`,       fill: c1 },  // left
      ]}
    }
    case 'sunburst': {
      // Alternating wedges radiating from the centre; count from sunburstRays (even)
      const rays = props.config.background.sunburstRays ?? 12
      const cx = W/2, cy = H/2
      const R = Math.hypot(W, H)
      const polys = Array.from({ length: rays }, (_, i) => {
        const a0 = (i / rays) * Math.PI * 2 - Math.PI/2
        const a1 = ((i+1) / rays) * Math.PI * 2 - Math.PI/2
        return {
          points: `${cx},${cy} ${cx + Math.cos(a0)*R},${cy + Math.sin(a0)*R} ${cx + Math.cos(a1)*R},${cy + Math.sin(a1)*R}`,
          fill: i%2===0 ? c0 : c1,
        }
      })
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: c0 }], polys }
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
    style="user-select: none; display: block; overflow: visible; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.38)) drop-shadow(0 10px 28px rgba(0,0,0,0.42)) drop-shadow(0 22px 48px rgba(0,0,0,0.22));"
    @mousemove="onMove"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @click="emit('deselect')"
  >
    <!-- Hidden path used for isPointInFill hit-testing (must be in main SVG tree, not defs) -->
    <path v-if="shape" ref="shapePathEl" :d="shape.path" style="visibility:hidden;pointer-events:none;" />

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
      <!-- Shimmer gradient: narrow white band, feathered edges -->
      <linearGradient :id="`shimmer-grad-${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="white" stop-opacity="0" />
        <stop offset="20%"  stop-color="white" stop-opacity="0.1" />
        <stop offset="50%"  stop-color="white" stop-opacity="0.38" />
        <stop offset="80%"  stop-color="white" stop-opacity="0.1" />
        <stop offset="100%" stop-color="white" stop-opacity="0" />
      </linearGradient>

      <!-- 3D depth gradients (presentation only — not exported) -->
      <radialGradient :id="`depth-radial-${uid}`" gradientUnits="userSpaceOnUse" cx="100" cy="90" r="135" fx="100" fy="68">
        <stop offset="0%"   stop-color="white" stop-opacity="0.06" />
        <stop offset="42%"  stop-color="black" stop-opacity="0"    />
        <stop offset="100%" stop-color="black" stop-opacity="0.44" />
      </radialGradient>
      <linearGradient :id="`depth-left-${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="black" stop-opacity="0.36" />
        <stop offset="30%"  stop-color="black" stop-opacity="0"    />
      </linearGradient>
      <linearGradient :id="`depth-right-${uid}`" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%"   stop-color="black" stop-opacity="0.36" />
        <stop offset="30%"  stop-color="black" stop-opacity="0"    />
      </linearGradient>
      <linearGradient :id="`depth-top-${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stop-color="white" stop-opacity="0.14" />
        <stop offset="38%"  stop-color="white" stop-opacity="0"    />
      </linearGradient>
      <linearGradient :id="`depth-bottom-${uid}`" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%"   stop-color="black" stop-opacity="0.28" />
        <stop offset="30%"  stop-color="black" stop-opacity="0"    />
      </linearGradient>
    </defs>

    <!-- Background -->
    <g :clip-path="`url(#${clipId})`">
      <rect
        v-for="(r, i) in bgElements.rects" :key="`r${i}`"
        :x="r.x" :y="r.y" :width="r.w" :height="r.h"
        :style="{ fill: r.fill, transition: 'fill 0.4s ease' }"
      />
      <polygon
        v-for="(p, i) in bgElements.polys" :key="`p${i}`"
        :points="p.points"
        :style="{ fill: p.fill, transition: 'fill 0.4s ease' }"
      />
    </g>

    <!-- Symbols clipped to badge shape -->
    <g
      v-for="sym in config.symbols.filter(s => s.clipped !== false)"
      :key="sym.instanceId"
      :clip-path="`url(#${clipId})`"
      :style="{
        cursor: drag?.instanceId === sym.instanceId ? 'grabbing' : 'grab',
        filter: hoveredSymbolId === sym.instanceId ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
        transition: 'filter 0.15s ease',
      }"
      @click.stop
      @mousedown="startSymbolDrag($event, sym.instanceId)"
      @mouseenter="hoveredSymbolId = sym.instanceId"
      @mouseleave="hoveredSymbolId = null"
      @wheel.stop.prevent="onSymbolWheel($event, sym.instanceId)"
    >
      <g :transform="symbolTransform(sym)">
        <path
          v-for="(p, i) in symPaths(sym)"
          :key="i"
          :d="p"
          :stroke-width="sym.strokeWidth"
          paint-order="stroke fill"
          :style="{
            fill: sym.color,
            stroke: sym.strokeWidth > 0 ? sym.strokeColor : 'none',
            transition: 'fill 0.35s ease, stroke 0.35s ease',
          }"
        />
      </g>
    </g>

    <!-- Border -->
    <path
      v-if="shape"
      :d="shape.path"
      fill="none"
      stroke-linejoin="round"
      :style="{
        stroke: config.border.color,
        strokeWidth: config.border.width,
        transition: 'stroke 0.4s ease, stroke-width 0.3s ease',
      }"
    />

    <!-- Shimmer (decorative sheen sweep, clipped to shield) -->
    <g :clip-path="`url(#${clipId})`" style="pointer-events:none">
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="-100,0; 340,0; 340,0"
          keyTimes="0; 0.16; 1"
          dur="7s"
          repeatCount="indefinite"
        />
        <rect
          x="0" y="-10"
          width="90" height="260"
          :fill="`url(#shimmer-grad-${uid})`"
          transform="skewX(-14)"
        />
      </g>
    </g>

    <!-- 3D depth overlay (presentation only — excluded from export) -->
    <g :clip-path="`url(#${clipId})`" style="pointer-events:none">
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-radial-${uid})`" />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-left-${uid})`"   />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-right-${uid})`"  />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-top-${uid})`"    />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-bottom-${uid})`" />
    </g>

    <!-- Straight text (draggable, scroll to resize) — above depth overlay -->
    <text
      v-for="text in config.texts.filter(t => !t.arc)"
      :key="text.id"
      :x="text.x"
      :y="text.y"
      :transform="text.rotation ? `rotate(${text.rotation}, ${text.x}, ${text.y})` : null"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :letter-spacing="text.letterSpacing ?? 0"
      text-anchor="middle"
      dominant-baseline="middle"
      :style="{
        fill: text.color,
        cursor: drag?.id === text.id ? 'grabbing' : 'grab',
        filter: hoveredTextId === text.id ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : 'none',
        transition: 'fill 0.35s ease, filter 0.15s ease',
      }"
      @mousedown="startTextDrag($event, text.id)"
      @click.stop="$emit('select-text', text.id)"
      @mouseenter="onTextEnter($event, text.id)"
      @mouseleave="onTextLeave"
      @wheel.stop.prevent="onTextWheel($event, text.id)"
    >{{ text.content }}</text>

    <!-- Arc text (follows circular path, scroll to resize) — above depth overlay -->
    <text
      v-for="text in config.texts.filter(t => t.arc)"
      :key="text.id"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :letter-spacing="text.letterSpacing ?? 0"
      text-anchor="middle"
      :style="{
        fill: text.color,
        cursor: drag?.id === text.id ? 'grabbing' : 'grab',
        filter: hoveredTextId === text.id ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : 'none',
        transition: 'fill 0.35s ease, filter 0.15s ease',
      }"
      @mousedown="startTextDrag($event, text.id)"
      @click.stop="$emit('select-text', text.id)"
      @mouseenter="onTextEnter($event, text.id)"
      @mouseleave="onTextLeave"
      @wheel.stop.prevent="onTextWheel($event, text.id)"
    >
      <textPath
        :href="`#${arcPathId(text.id)}`"
        startOffset="50%"
      >{{ text.content }}</textPath>
    </text>

    <!-- Free symbols (unclipped — may extend outside badge bounds) -->
    <g
      v-for="sym in config.symbols.filter(s => s.clipped === false)"
      :key="sym.instanceId"
      :style="{
        cursor: drag?.instanceId === sym.instanceId ? 'grabbing' : 'grab',
        filter: hoveredSymbolId === sym.instanceId ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
        transition: 'filter 0.15s ease',
      }"
      @click.stop
      @mousedown="startSymbolDrag($event, sym.instanceId)"
      @mouseenter="hoveredSymbolId = sym.instanceId"
      @mouseleave="hoveredSymbolId = null"
      @wheel.stop.prevent="onSymbolWheel($event, sym.instanceId)"
    >
      <g :transform="symbolTransform(sym)">
        <path
          v-for="(p, i) in symPaths(sym)"
          :key="i"
          :d="p"
          :stroke-width="sym.strokeWidth"
          paint-order="stroke fill"
          :style="{
            fill: sym.color,
            stroke: sym.strokeWidth > 0 ? sym.strokeColor : 'none',
            transition: 'fill 0.35s ease, stroke 0.35s ease',
          }"
        />
      </g>
    </g>

    <!-- Size hint bubble (shown while scroll-resizing) -->
    <g v-if="sizeHint" :transform="`translate(${sizeHint.x}, ${sizeHint.y})`" style="pointer-events:none">
      <rect x="-14" y="-9" width="28" height="13" rx="3" fill="#000000" fill-opacity="0.65" />
      <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="7" font-family="system-ui,sans-serif" font-weight="600">{{ sizeHint.size }}px</text>
    </g>

    <!-- Alignment guides (shown while dragging near badge centre) -->
    <g style="pointer-events:none">
      <line v-if="guides.x" :x1="BADGE_CX" y1="-8" :x2="BADGE_CX" :y2="VIEWBOX_H + 8" class="align-guide" />
      <line v-if="guides.y" x1="-8" :y1="BADGE_CY" :x2="VIEWBOX_W + 8" :y2="BADGE_CY" class="align-guide" />
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
.align-guide {
  stroke: #00e5ff;
  stroke-width: 0.75;
  stroke-dasharray: 4 3;
  opacity: 0.95;
  filter: drop-shadow(0 0 2px #00e5ff) drop-shadow(0 0 5px rgba(0, 229, 255, 0.7));
}

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
