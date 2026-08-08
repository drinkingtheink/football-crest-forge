<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBadgeConfig } from '../composables/useBadgeConfig.js'
import { startBokeh } from '../utils/bokeh.js'
import { wavesBg, crisscrossBg, pinstripeBg, diamondsBg, dotsBg, gridBg, zigzagBg } from '../utils/patterns.js'

const props = defineProps({
  type: { type: String, default: 'none' },
  tone: { type: String, default: 'dark' },
})

const { config } = useBadgeConfig()

const imageMap = {
  grass:   '/backgrounds/grass.jpg',
  fabric:  '/backgrounds/fabric.png',
  brick:   '/backgrounds/brick.jpg',
  stadium: '/backgrounds/stadium.jpg',
  pitch:   '/backgrounds/pitch.png',
}

// Per-image focal anchor for `cover` cropping. The stadium photo is 4:3 with the
// pitch low in frame, so a plain center crop drops the pitch below screen-centre;
// anchor lower to bring the field into the middle. Others stay neutrally centred.
const imagePos = {
  stadium: 'center 62%',
}

function hexRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

const AURORA_DEFS = [
  { ci: 0, yPct:  6, hPct: 38, a: 0.72 },
  { ci: 1, yPct: 28, hPct: 28, a: 0.62 },
  { ci: 2, yPct: 52, hPct: 32, a: 0.58 },
  { ci: 0, yPct: 16, hPct: 22, a: 0.46 },
  { ci: 1, yPct: 64, hPct: 26, a: 0.52 },
]

function auroraRibbonsFor(palette) {
  return AURORA_DEFS.map(({ ci, yPct, hPct, a }) => ({
    top:        `${yPct}%`,
    height:     `${hPct}%`,
    background: hexRgba(palette[ci % palette.length] || '#888888', a),
  }))
}

function styleFor(type) {
  if (type === 'waves')      return wavesBg(config.palette, props.tone)
  if (type === 'crisscross') return crisscrossBg(config.palette, props.tone)
  if (type === 'pinstripe')  return pinstripeBg(config.palette, props.tone)
  if (type === 'diamonds')   return diamondsBg(config.palette, props.tone)
  if (type === 'dots')       return dotsBg(config.palette, props.tone)
  if (type === 'grid')       return gridBg(config.palette, props.tone)
  if (type === 'zigzag')     return zigzagBg(config.palette, props.tone)
  if (imageMap[type])        return { backgroundImage: `url(${imageMap[type]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: imagePos[type] || 'center' }
  return {}
}

// ── Two-layer cross-fade state ────────────────────────────────────────────────
// `current` is always rendered; `outgoing` is the previous type shown underneath
// while the current fades in.
const FADE_MS = 560

const current  = ref(props.type)
const outgoing = ref(null)       // null = no outgoing layer
const fading   = ref(false)      // true = current layer is fading in
let   fadeTimer = null

// ── Bokeh instances ───────────────────────────────────────────────────────────
const bokehCanvas    = ref(null)  // current layer
const bokehCanvasOut = ref(null)  // outgoing layer (only exists during cross-fade)
let bokehCurrent  = null
let bokehOutgoing = null

function initBokehOn(canvas, store) {
  if (!canvas) return null
  const inst = startBokeh(canvas, () => config.palette)
  return inst
}

function startCurrentBokeh() {
  bokehCurrent?.stop()
  bokehCurrent = null
  nextTick(() => {
    if (bokehCanvas.value) bokehCurrent = startBokeh(bokehCanvas.value, () => config.palette)
  })
}

function stopCurrentBokeh() {
  bokehCurrent?.stop()
  bokehCurrent = null
}

function stopOutgoingBokeh() {
  bokehOutgoing?.stop()
  bokehOutgoing = null
}

watch(() => props.type, async (newType) => {
  if (newType === current.value) return

  clearTimeout(fadeTimer)

  // Promote current to outgoing layer (it stays visible underneath)
  outgoing.value = current.value
  // If the outgoing was bokeh, its canvas ref moves to bokehCanvasOut —
  // we keep the instance running so it doesn't blank during the fade.
  // (bokehCanvas will be reassigned to the new canvas on next tick)
  bokehOutgoing = bokehCurrent
  bokehCurrent  = null

  // Mount the new current layer
  current.value = newType
  fading.value  = true

  if (newType === 'bokeh') {
    await nextTick()
    startCurrentBokeh()
  }

  // After the cross-fade completes, remove the outgoing layer
  fadeTimer = setTimeout(() => {
    stopOutgoingBokeh()
    outgoing.value = null
    fading.value   = false
  }, FADE_MS + 40)
})

onMounted(() => {
  if (props.type === 'bokeh') startCurrentBokeh()
  window.addEventListener('resize', () => {
    bokehCurrent?.resize()
    bokehOutgoing?.resize()
  })
})

onUnmounted(() => {
  clearTimeout(fadeTimer)
  stopCurrentBokeh()
  stopOutgoingBokeh()
  window.removeEventListener('resize', () => {
    bokehCurrent?.resize()
    bokehOutgoing?.resize()
  })
})
</script>

<template>
  <!-- Outgoing layer: stays put underneath during the cross-fade -->
  <div v-if="outgoing" class="app-bg app-bg-outgoing" :style="styleFor(outgoing)">
    <canvas v-if="outgoing === 'bokeh'" ref="bokehCanvasOut" class="bokeh-canvas" />
    <div v-if="outgoing === 'aurora'" class="aurora-layer">
      <div
        v-for="(r, i) in auroraRibbonsFor(config.palette)"
        :key="i"
        class="aurora-ribbon"
        :class="`ribbon-${i}`"
        :style="r"
      />
    </div>
  </div>

  <!-- Current layer: fades in on top, then stays -->
  <div class="app-bg" :class="{ 'app-bg-entering': fading }" :style="styleFor(current)">
    <canvas v-if="current === 'bokeh'" ref="bokehCanvas" class="bokeh-canvas" />
    <div v-if="current === 'aurora'" class="aurora-layer">
      <div
        v-for="(r, i) in auroraRibbonsFor(config.palette)"
        :key="i"
        class="aurora-ribbon"
        :class="`ribbon-${i}`"
        :style="r"
      />
    </div>
  </div>
</template>

<style scoped>
.app-bg {
  position: fixed;
  inset: 0;
  z-index: 1;
  background-color: #07070e;
  background-size: auto;
  background-repeat: repeat;
  background-position: top left;
}

/* Outgoing layer sits beneath the incoming one */
.app-bg-outgoing {
  z-index: 0;
}

/* Incoming layer fades in over the outgoing one */
.app-bg-entering {
  animation: bg-cross-fade v-bind('`${FADE_MS}ms`') cubic-bezier(0.33, 0, 0.2, 1) forwards;
  transform-origin: center;
  will-change: opacity, transform, filter;
}

@keyframes bg-cross-fade {
  from {
    opacity: 0;
    transform: scale(1.03);
    filter: blur(6px);
  }
  60% {
    opacity: 1;
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

.bokeh-canvas {
  width: 100%;
  height: 100%;
  filter: blur(24px);
  transform: scale(1.08);
}

.app-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 110% 100% at 50% 50%, transparent 30%, rgba(7, 7, 14, 0.72) 100%);
  pointer-events: none;
  z-index: 2;
}

/* ── Aurora ──────────────────────────────────────────────────────────────── */
.aurora-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.aurora-ribbon {
  position: absolute;
  left: -20%;
  width: 140%;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(42px);
  will-change: transform, opacity;
}

.ribbon-0 { animation: ribbon-0 26s ease-in-out infinite;       animation-delay:   0s; }
.ribbon-1 { animation: ribbon-1 33s ease-in-out infinite;       animation-delay:  -9s; }
.ribbon-2 { animation: ribbon-2 21s ease-in-out infinite;       animation-delay:  -5s; }
.ribbon-3 { animation: ribbon-3 29s ease-in-out infinite;       animation-delay: -16s; }
.ribbon-4 { animation: ribbon-4 24s ease-in-out infinite;       animation-delay:  -7s; }

@keyframes ribbon-0 {
  0%   { transform: translateY(0%)   scaleX(1.00); opacity: 0.80; }
  28%  { transform: translateY(-5%)  scaleX(1.07); opacity: 1.00; }
  62%  { transform: translateY(6%)   scaleX(0.94); opacity: 0.55; }
  100% { transform: translateY(0%)   scaleX(1.00); opacity: 0.80; }
}
@keyframes ribbon-1 {
  0%   { transform: translateY(0%)  scaleX(1.00); opacity: 0.75; }
  38%  { transform: translateY(6%)  scaleX(0.93); opacity: 1.00; }
  70%  { transform: translateY(-4%) scaleX(1.08); opacity: 0.50; }
  100% { transform: translateY(0%)  scaleX(1.00); opacity: 0.75; }
}
@keyframes ribbon-2 {
  0%   { transform: translateY(0%)  scaleX(1.00); opacity: 0.70; }
  22%  { transform: translateY(7%)  scaleX(1.05); opacity: 0.95; }
  55%  { transform: translateY(-5%) scaleX(0.96); opacity: 1.00; }
  82%  { transform: translateY(3%)  scaleX(0.92); opacity: 0.60; }
  100% { transform: translateY(0%)  scaleX(1.00); opacity: 0.70; }
}
@keyframes ribbon-3 {
  0%   { transform: translateY(0%)   scaleX(1.00); opacity: 0.65; }
  42%  { transform: translateY(-7%)  scaleX(1.06); opacity: 0.90; }
  78%  { transform: translateY(5%)   scaleX(0.95); opacity: 0.45; }
  100% { transform: translateY(0%)   scaleX(1.00); opacity: 0.65; }
}
@keyframes ribbon-4 {
  0%   { transform: translateY(0%)  scaleX(1.00); opacity: 0.78; }
  32%  { transform: translateY(4%)  scaleX(1.07); opacity: 0.55; }
  58%  { transform: translateY(-6%) scaleX(0.94); opacity: 1.00; }
  80%  { transform: translateY(5%)  scaleX(1.03); opacity: 0.70; }
  100% { transform: translateY(0%)  scaleX(1.00); opacity: 0.78; }
}
</style>
