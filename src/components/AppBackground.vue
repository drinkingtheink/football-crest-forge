<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBadgeConfig } from '../composables/useBadgeConfig.js'
import { startBokeh } from '../utils/bokeh.js'
import { wavesBg, crisscrossBg } from '../utils/patterns.js'

const props = defineProps({
  type: { type: String, default: 'none' },
})

const { config } = useBadgeConfig()
const bokehCanvas = ref(null)
let bokehInstance = null

const imageMap = {
  grass:   '/backgrounds/grass.jpg',
  fabric:  '/backgrounds/fabric.png',
  brick:   '/backgrounds/brick.jpg',
  stadium: '/backgrounds/stadium.png',
  pitch:   '/backgrounds/pitch.png',
}

function hexRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// Horizontal ribbon bands — distinct from bokeh's floating circles
// Each ribbon is a wide oval that drifts vertically like a northern-lights curtain
const AURORA_DEFS = [
  { ci: 0, yPct:  6, hPct: 38, a: 0.72 },
  { ci: 1, yPct: 28, hPct: 28, a: 0.62 },
  { ci: 2, yPct: 52, hPct: 32, a: 0.58 },
  { ci: 0, yPct: 16, hPct: 22, a: 0.46 },
  { ci: 1, yPct: 64, hPct: 26, a: 0.52 },
]

const auroraRibbons = computed(() => {
  if (props.type !== 'aurora') return []
  return AURORA_DEFS.map(({ ci, yPct, hPct, a }) => {
    const color = hexRgba(config.palette[ci % config.palette.length] || '#888888', a)
    return {
      top:        `${yPct}%`,
      height:     `${hPct}%`,
      background: color,
    }
  })
})

const patternStyle = computed(() => {
  if (props.type === 'waves')      return wavesBg(config.palette)
  if (props.type === 'crisscross') return crisscrossBg(config.palette)
  if (imageMap[props.type])        return { backgroundImage: `url(${imageMap[props.type]})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }
  return {}
})

function initBokeh() {
  if (!bokehCanvas.value) return
  bokehInstance?.stop()
  bokehInstance = startBokeh(bokehCanvas.value, () => config.palette)
}

function stopBokeh() {
  bokehInstance?.stop()
  bokehInstance = null
}

watch(() => props.type, async (t) => {
  if (t === 'bokeh') { await nextTick(); initBokeh() }
  else stopBokeh()
})

onMounted(() => {
  if (props.type === 'bokeh') initBokeh()
  window.addEventListener('resize', () => bokehInstance?.resize())
})

onUnmounted(() => {
  stopBokeh()
  window.removeEventListener('resize', () => bokehInstance?.resize())
})
</script>

<template>
  <div class="app-bg" :style="patternStyle">
    <canvas v-if="type === 'bokeh'" ref="bokehCanvas" class="bokeh-canvas" />
    <div v-if="type === 'aurora'" class="aurora-layer">
      <div
        v-for="(r, i) in auroraRibbons"
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
  z-index: 0;
  background-color: #07070e;
  background-size: auto;
  background-repeat: repeat;
  background-position: top left;
}

.bokeh-canvas {
  width: 100%;
  height: 100%;
  filter: blur(24px);
  transform: scale(1.08);
}

/* Vignette: dark halo around every dynamic background for depth */
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

/* Wide oval ribbons — border-radius creates soft oval edges, blur feathers them further */
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
