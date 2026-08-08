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
  selection: { type: Array, default: () => [] },
  edgeSparks: { type: Boolean, default: false },
  size: { type: Number, default: 380 },
  uid: { type: String, default: 'b0' },
})

// Sparks orbiting the crest outline on long hover. Fixed varied radii/colours
// so each fleck reads as its own hot ember.
const edgePathId = computed(() => `edge-path-${props.uid}`)
const EDGE_SPARKS = [
  { r: 1.8, fill: '#ffe6a6' }, { r: 1.2, fill: '#ff9130' }, { r: 2.0, fill: '#ffd47a' },
  { r: 1.4, fill: '#ffb347' }, { r: 1.7, fill: '#ffe6a6' }, { r: 1.2, fill: '#ff7a2e' },
  { r: 1.9, fill: '#ffd47a' }, { r: 1.4, fill: '#ffb347' },
]
const EDGE_SPARK_DUR = 3.6

const selectedSyms  = computed(() => new Set(props.selection.filter(s => s.type === 'symbol').map(s => s.id)))
const selectedTexts = computed(() => new Set(props.selection.filter(s => s.type === 'text').map(s => s.id)))
const SELECT_GLOW = 'drop-shadow(0 0 2.5px #00e5ff) drop-shadow(0 0 7px rgba(0,229,255,0.75))'

const emit = defineEmits(['update-text-position', 'update-symbol-position', 'update-text', 'update-symbol', 'select-symbol', 'select-text', 'deselect', 'symbol-outside-bounds', 'ember', 'drag-start', 'drag-end'])

function arcPathId(textId) { return `arcpath-${props.uid}-${textId}` }

const shape = computed(() => shapesById[props.config.shapeId])
const clipId = computed(() => `clip-${props.uid}`)
const elementsClipId = computed(() => `elements-clip-${props.uid}`)

function chevronPath(t) {
  // Down-pointing chevron band; t = thickness (apex gap). Inner edges kept
  // parallel to the outer edges so the band stays constant-width.
  const apexY = 72, topY = 28, halfW = 36, span = apexY - topY
  const s = Math.max(0, (span - t) / span)
  const irx = 50 + halfW * s
  const ilx = 50 - halfW * s
  return `M 50,${apexY} L ${50 + halfW},${topY} L ${irx},${topY} L 50,${apexY - t} L ${ilx},${topY} L ${50 - halfW},${topY} Z`
}

function symPaths(sym) {
  const icon = iconsById[sym.iconId]
  if (!icon?.supportsRing || sym.ringThickness == null) return icon?.paths ?? []
  if (icon.thicknessShape === 'chevron') return [chevronPath(sym.ringThickness)]
  const cx = 50, cy = 50, outerR = 44
  const outer = `M ${cx - outerR},${cy} A ${outerR},${outerR} 0 1 1 ${cx + outerR},${cy} A ${outerR},${outerR} 0 1 1 ${cx - outerR},${cy} Z`
  const innerR = outerR - sym.ringThickness
  if (innerR <= 0) return [outer]
  const inner = `M ${cx - innerR},${cy} A ${innerR},${innerR} 0 1 0 ${cx + innerR},${cy} A ${innerR},${innerR} 0 1 0 ${cx - innerR},${cy} Z`
  return [`${outer} ${inner}`]
}

// Symbol paths are scaled by size/max(vw,vh), and stroke-width is in the icon's
// own viewBox coords — so a fixed strokeWidth renders thin on big-viewBox icons
// (e.g. 512) and thick on small ones (100). Author strokeWidth in 100-unit space
// and scale it to the icon's viewBox here, so on-badge thickness stays consistent.
function symbolStroke(sym) {
  const icon = iconsById[sym.iconId]
  const vw = icon?.viewBox?.[0] ?? 100
  const vh = icon?.viewBox?.[1] ?? 100
  return sym.strokeWidth * Math.max(vw, vh) / 100
}

function symbolTransform(sym) {
  const icon = iconsById[sym.iconId]
  const vw = icon?.viewBox?.[0] ?? 100
  const vh = icon?.viewBox?.[1] ?? 100
  const scale = sym.size / Math.max(vw, vh)
  const offX = (sym.size - vw * scale) / 2
  const offY = (sym.size - vh * scale) / 2
  const rot = sym.rotation ? `rotate(${sym.rotation}, ${sym.x}, ${sym.y}) ` : ''
  const flip = sym.flipH ? `translate(${sym.x * 2}, 0) scale(-1, 1) ` : ''
  return `${flip}${rot}translate(${sym.x - sym.size / 2 + offX}, ${sym.y - sym.size / 2 + offY}) scale(${scale})`
}

// ── Unified drag (text or symbol) ──────────────────────────────────────────
const drag = ref(null)
const svgRootEl = ref(null)
const shapePathEl = ref(null)

defineExpose({ svgRootEl })
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

function inSelection(type, id) { return props.selection.some(s => s.type === type && s.id === id) }

// A movable target with its start position: symbols carry x/y (centre), straight
// text x/y, arc text arcX/arcY.
function targetFor(type, id) {
  if (type === 'symbol') {
    const sym = props.config.symbols.find(s => s.instanceId === id)
    return sym ? { type: 'symbol', id, ox: sym.x, oy: sym.y } : null
  }
  const t = props.config.texts.find(x => x.id === id)
  if (!t) return null
  return t.arc
    ? { type: 'text', id, isArc: true, ox: t.arcX ?? 100, oy: t.arcY ?? 120 }
    : { type: 'text', id, isArc: false, ox: t.x ?? 100, oy: t.y ?? 120 }
}

// Shared mousedown handler for symbols and text. Decides whether this drag moves
// a single element or the whole multi-selection, and defers a "collapse to just
// this one" until mouseup if the group was clicked (not dragged).
function beginDrag(e, type, id) {
  const svgEl = e.currentTarget.closest('svg')
  const pt = toSVGPoint(svgEl, e.clientX, e.clientY)
  const additive = e.shiftKey || e.metaKey
  const selectEvt = type === 'symbol' ? 'select-symbol' : 'select-text'

  let targets, collapse = null
  if (additive) {
    emit(selectEvt, id, true)                 // toggle membership; drag this one
    targets = [targetFor(type, id)].filter(Boolean)
  } else if (inSelection(type, id) && props.selection.length > 1) {
    targets = props.selection.map(s => targetFor(s.type, s.id)).filter(Boolean)
    collapse = { type, id }                   // collapse to this one if not dragged
  } else {
    emit(selectEvt, id, false)                // replace → single
    targets = [targetFor(type, id)].filter(Boolean)
  }

  const primary = targetFor(type, id)
  if (type === 'symbol') outsidePromptedId.value = null
  drag.value = {
    type, id, instanceId: type === 'symbol' ? id : undefined,
    sx: pt.x, sy: pt.y, px: primary.ox, py: primary.oy,
    targets, collapse, moved: false,
  }
  emit('drag-start')
  e.preventDefault()
}

function startTextDrag(e, textId)   { beginDrag(e, 'text', textId) }
function startSymbolDrag(e, instanceId) { beginDrag(e, 'symbol', instanceId) }

function onMove(e) {
  if (!drag.value) return
  emit('ember', e.clientX, e.clientY) // shed a hot-metal ember trail while dragging
  const pt = toSVGPoint(e.currentTarget, e.clientX, e.clientY)
  const dx = pt.x - drag.value.sx
  const dy = pt.y - drag.value.sy
  if (dx || dy) drag.value.moved = true
  updateGuides(drag.value.px + dx, drag.value.py + dy)

  for (const tg of drag.value.targets) {
    const nx = tg.ox + dx, ny = tg.oy + dy
    if (tg.type === 'symbol') emit('update-symbol-position', tg.id, nx, ny)
    else if (tg.isArc)       emit('update-text', tg.id, { arcX: nx, arcY: ny })
    else                     emit('update-text-position', tg.id, nx, ny)
  }

  // Out-of-bounds prompt only for a lone symbol drag (noisy for groups).
  if (drag.value.type === 'symbol' && drag.value.targets.length === 1) {
    const id = drag.value.id
    const newX = drag.value.px + dx, newY = drag.value.py + dy
    const sym = props.config.symbols.find(s => s.instanceId === id)
    if (!props.config.noShield && sym?.clipped !== false && shapePathEl.value && outsidePromptedId.value !== id) {
      if (!shapePathEl.value.isPointInFill(new DOMPoint(newX, newY))) {
        outsidePromptedId.value = id
        emit('symbol-outside-bounds', id)
      }
    }
  }
}

function stopDrag() {
  if (drag.value) {
    if (!drag.value.moved && drag.value.collapse) {
      const c = drag.value.collapse
      emit(c.type === 'symbol' ? 'select-symbol' : 'select-text', c.id, false)
    }
    emit('drag-end')
  }
  drag.value = null
  guides.value = { x: false, y: false }
}

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
    case 'gradient':
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: `url(#bg-grad-${props.uid})` }], polys: [] }
    case 'radial':
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: `url(#bg-radial-${props.uid})` }], polys: [] }
    default:
      return { rects: [{ x: 0, y: 0, w: W, h: H, fill: c0 }], polys: [] }
  }
})

// Gradient background stops — an editable list (config.background.gradient),
// spread evenly across the fill. Falls back to the palette if unset.
const gradientStops = computed(() => {
  const g = props.config.background.gradient
  const cols = (Array.isArray(g) && g.length >= 2)
    ? g
    : (props.config.palette.length ? props.config.palette : ['#000000'])
  if (cols.length === 1) return [{ offset: '0%', color: cols[0] }, { offset: '100%', color: cols[0] }]
  return cols.map((c, i) => ({ offset: `${Math.round((i / (cols.length - 1)) * 100)}%`, color: c }))
})

// Linear-gradient endpoints for the current angle, in badge user space so the
// axis spans the whole shield at any angle.
const gradLine = computed(() => {
  const rad = (props.config.background.gradientAngle ?? 45) * Math.PI / 180
  const cx = VIEWBOX_W / 2, cy = VIEWBOX_H / 2
  const c = Math.cos(rad), s = Math.sin(rad)
  const half = (Math.abs(VIEWBOX_W * c) + Math.abs(VIEWBOX_H * s)) / 2
  return { x1: cx - c * half, y1: cy - s * half, x2: cx + c * half, y2: cy + s * half }
})
</script>

<template>
  <svg
    ref="svgRootEl"
    :width="size"
    :viewBox="`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ userSelect: 'none', display: 'block', overflow: 'visible', filter: config.noShield ? 'none' : 'drop-shadow(0 2px 6px rgba(0,0,0,0.38)) drop-shadow(0 10px 28px rgba(0,0,0,0.42)) drop-shadow(0 22px 48px rgba(0,0,0,0.22))' }"
    @mousemove="onMove"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @click="emit('deselect')"
  >
    <!-- Hidden path used for isPointInFill hit-testing (must be in main SVG tree, not defs) -->
    <path v-if="shape" ref="shapePathEl" :d="shape.path" style="visibility:hidden;pointer-events:none;" data-export-hide />

    <defs>
      <clipPath :id="clipId">
        <path v-if="shape" :d="shape.path" />
      </clipPath>
      <!-- Symbol silhouettes — used to clip the shimmer over elements in No Shield mode -->
      <clipPath :id="elementsClipId">
        <template v-for="sym in config.symbols" :key="sym.instanceId">
          <path
            v-for="(p, i) in symPaths(sym)"
            :key="`${sym.instanceId}-${i}`"
            :d="p"
            :transform="symbolTransform(sym)"
          />
        </template>
      </clipPath>
      <!-- Arc paths for textPath elements -->
      <path
        v-for="text in config.texts.filter(t => t.arc)"
        :key="arcPathId(text.id)"
        :id="arcPathId(text.id)"
        :d="arcPathD(text)"
        fill="none"
      />
      <!-- Motion path for the long-hover edge sparks -->
      <path v-if="shape" :id="edgePathId" :d="shape.path" fill="none" />
      <!-- Palette background gradients (linear diagonal + radial) -->
      <linearGradient v-if="config.background.type === 'gradient'" :id="`bg-grad-${uid}`" gradientUnits="userSpaceOnUse" :x1="gradLine.x1" :y1="gradLine.y1" :x2="gradLine.x2" :y2="gradLine.y2">
        <stop v-for="(s, i) in gradientStops" :key="i" :offset="s.offset" :stop-color="s.color" />
      </linearGradient>
      <radialGradient v-if="config.background.type === 'radial'" :id="`bg-radial-${uid}`" cx="50%" cy="42%" r="72%">
        <stop v-for="(s, i) in gradientStops" :key="i" :offset="s.offset" :stop-color="s.color" />
      </radialGradient>

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
    <g v-if="!config.noShield" :clip-path="`url(#${clipId})`">
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

    <!-- Symbols clipped to badge shape (unclipped in No Badge mode) -->
    <g
      v-for="sym in config.symbols.filter(s => s.clipped !== false)"
      :key="sym.instanceId"
      :clip-path="config.noShield ? null : `url(#${clipId})`"
      :style="{
        cursor: drag?.instanceId === sym.instanceId ? 'grabbing' : 'grab',
        filter: selectedSyms.has(sym.instanceId) ? SELECT_GLOW : (hoveredSymbolId === sym.instanceId ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none'),
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
          :stroke-width="symbolStroke(sym)"
          stroke-linejoin="round"
          stroke-linecap="round"
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
      v-if="shape && !config.noShield"
      :d="shape.path"
      fill="none"
      stroke-linejoin="round"
      :style="{
        stroke: config.border.color,
        strokeWidth: config.border.width,
        transition: 'stroke 0.4s ease, stroke-width 0.3s ease',
      }"
    />

    <!-- Shimmer (decorative sheen sweep) — clipped to the shield, or to the
         symbol silhouettes in No Shield mode -->
    <g :clip-path="`url(#${config.noShield ? elementsClipId : clipId})`" style="pointer-events:none" data-export-hide>
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
    <g v-if="!config.noShield" :clip-path="`url(#${clipId})`" style="pointer-events:none" data-export-hide>
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-radial-${uid})`" />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-left-${uid})`"   />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-right-${uid})`"  />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-top-${uid})`"    />
      <rect x="0" y="0" width="200" height="240" :fill="`url(#depth-bottom-${uid})`" />
    </g>

    <!-- Free symbols (unclipped — may extend outside badge bounds) -->
    <g
      v-for="sym in config.symbols.filter(s => s.clipped === false)"
      :key="sym.instanceId"
      :style="{
        cursor: drag?.instanceId === sym.instanceId ? 'grabbing' : 'grab',
        filter: selectedSyms.has(sym.instanceId) ? SELECT_GLOW : (hoveredSymbolId === sym.instanceId ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none'),
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
          :stroke-width="symbolStroke(sym)"
          stroke-linejoin="round"
          stroke-linecap="round"
          paint-order="stroke fill"
          :style="{
            fill: sym.color,
            stroke: sym.strokeWidth > 0 ? sym.strokeColor : 'none',
            transition: 'fill 0.35s ease, stroke 0.35s ease',
          }"
        />
      </g>
    </g>

    <!-- Text renders last so it always sits above every badge element -->
    <!-- Straight text (draggable, scroll to resize) -->
    <text
      v-for="text in config.texts.filter(t => !t.arc)"
      :key="text.id"
      :data-text-id="text.id"
      :x="text.x"
      :y="text.y"
      :transform="text.rotation ? `rotate(${text.rotation}, ${text.x}, ${text.y})` : null"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :letter-spacing="text.letterSpacing ?? 0"
      text-anchor="middle"
      dominant-baseline="middle"
      :stroke-width="text.strokeWidth || 0"
      stroke-linejoin="round"
      paint-order="stroke fill"
      :style="{
        fill: text.color,
        stroke: text.strokeWidth > 0 ? text.strokeColor : 'none',
        cursor: drag?.id === text.id ? 'grabbing' : 'grab',
        filter: selectedTexts.has(text.id) ? SELECT_GLOW : (hoveredTextId === text.id ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : 'none'),
        transition: 'fill 0.35s ease, stroke 0.35s ease, filter 0.15s ease',
      }"
      @mousedown="startTextDrag($event, text.id)"
      @click.stop
      @mouseenter="onTextEnter($event, text.id)"
      @mouseleave="onTextLeave"
      @wheel.stop.prevent="onTextWheel($event, text.id)"
    >{{ text.content }}</text>

    <!-- Arc text (follows circular path, scroll to resize) — above depth overlay -->
    <text
      v-for="text in config.texts.filter(t => t.arc)"
      :key="text.id"
      :data-text-id="text.id"
      :font-family="text.fontFamily"
      :font-size="text.fontSize"
      :font-weight="text.fontWeight"
      :letter-spacing="text.letterSpacing ?? 0"
      text-anchor="middle"
      :stroke-width="text.strokeWidth || 0"
      stroke-linejoin="round"
      paint-order="stroke fill"
      :style="{
        fill: text.color,
        stroke: text.strokeWidth > 0 ? text.strokeColor : 'none',
        cursor: drag?.id === text.id ? 'grabbing' : 'grab',
        filter: selectedTexts.has(text.id) ? SELECT_GLOW : (hoveredTextId === text.id ? 'drop-shadow(0 0 5px rgba(255,255,255,0.35))' : 'none'),
        transition: 'fill 0.35s ease, stroke 0.35s ease, filter 0.15s ease',
      }"
      @mousedown="startTextDrag($event, text.id)"
      @click.stop
      @mouseenter="onTextEnter($event, text.id)"
      @mouseleave="onTextLeave"
      @wheel.stop.prevent="onTextWheel($event, text.id)"
    >
      <textPath
        :href="`#${arcPathId(text.id)}`"
        startOffset="50%"
      >{{ text.content }}</textPath>
    </text>

    <!-- Edge sparks — orbit the crest outline after a sustained hover -->
    <g v-if="edgeSparks && shape && !config.noShield" class="edge-sparks" data-export-hide style="pointer-events:none">
      <circle v-for="(sp, i) in EDGE_SPARKS" :key="i" :r="sp.r" :fill="sp.fill">
        <animateMotion
          :dur="`${EDGE_SPARK_DUR}s`"
          repeatCount="indefinite"
          rotate="auto"
          :begin="`${-i * EDGE_SPARK_DUR / EDGE_SPARKS.length}s`"
        >
          <mpath :href="`#${edgePathId}`" />
        </animateMotion>
      </circle>
    </g>

    <!-- Size hint bubble (shown while scroll-resizing) -->
    <g v-if="sizeHint" :transform="`translate(${sizeHint.x}, ${sizeHint.y})`" style="pointer-events:none" data-export-hide>
      <rect x="-14" y="-9" width="28" height="13" rx="3" fill="#000000" fill-opacity="0.65" />
      <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="7" font-family="system-ui,sans-serif" font-weight="600">{{ sizeHint.size }}px</text>
    </g>

    <!-- Alignment guides (shown while dragging near badge centre) -->
    <g style="pointer-events:none" data-export-hide>
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
.edge-sparks {
  filter: drop-shadow(0 0 1.5px #ffb347) drop-shadow(0 0 3px rgba(255, 120, 30, 0.7));
  animation: edge-sparks-in 0.45s ease both;
}
@keyframes edge-sparks-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

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
