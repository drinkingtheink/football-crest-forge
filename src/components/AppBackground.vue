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

// Each entry: offset position (%), palette color index, opacity
const AURORA_DEFS = [
  { x: -15, y: -20, ci: 0, a: 0.60 },
  { x:  45, y:  -5, ci: 1, a: 0.52 },
  { x:  28, y:  35, ci: 2, a: 0.46 },
  { x: -10, y:  55, ci: 0, a: 0.38 },
  { x:  60, y:  22, ci: 1, a: 0.34 },
]

const auroraBlobs = computed(() => {
  if (props.type !== 'aurora') return []
  return AURORA_DEFS.map(({ x, y, ci, a }) => {
    const color = hexRgba(config.palette[ci % config.palette.length] || '#888888', a)
    return {
      background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${color} 0%, transparent 70%)`,
      left: `${x}%`,
      top:  `${y}%`,
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
        v-for="(b, i) in auroraBlobs"
        :key="i"
        class="aurora-blob"
        :class="`drift-${i}`"
        :style="b"
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
  filter: blur(32px);
  transform: scale(1.1);
}

/* ── Aurora ──────────────────────────────────────────────────────────────── */
.aurora-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.aurora-blob {
  position: absolute;
  width: 150%;
  height: 150%;
  pointer-events: none;
  will-change: transform;
}

.drift-0 { animation: aurora-drift-0 18s ease-in-out infinite;       animation-delay: -3s;  }
.drift-1 { animation: aurora-drift-1 23s ease-in-out infinite;       animation-delay: -9s;  }
.drift-2 { animation: aurora-drift-2 15s ease-in-out infinite;       animation-delay: -5s;  }
.drift-3 { animation: aurora-drift-3 21s ease-in-out infinite;       animation-delay: -13s; }
.drift-4 { animation: aurora-drift-4 27s ease-in-out infinite;       animation-delay: -7s;  }

@keyframes aurora-drift-0 {
  0%   { transform: translate(0%,   0%)   scale(1);    }
  30%  { transform: translate(4%,  -3%)   scale(1.04); }
  65%  { transform: translate(-2%,  5%)   scale(0.97); }
  100% { transform: translate(0%,   0%)   scale(1);    }
}
@keyframes aurora-drift-1 {
  0%   { transform: translate(0%,   0%)   scale(1);    }
  40%  { transform: translate(-5%,  4%)   scale(1.06); }
  72%  { transform: translate(3%,  -3%)   scale(0.96); }
  100% { transform: translate(0%,   0%)   scale(1);    }
}
@keyframes aurora-drift-2 {
  0%   { transform: translate(0%,   0%)   scale(1);    }
  25%  { transform: translate(3%,   6%)   scale(1.03); }
  60%  { transform: translate(-4%, -2%)   scale(1.07); }
  85%  { transform: translate(2%,  -4%)   scale(0.95); }
  100% { transform: translate(0%,   0%)   scale(1);    }
}
@keyframes aurora-drift-3 {
  0%   { transform: translate(0%,   0%)   scale(1);    }
  45%  { transform: translate(-4%, -5%)   scale(1.05); }
  80%  { transform: translate(5%,   2%)   scale(0.98); }
  100% { transform: translate(0%,   0%)   scale(1);    }
}
@keyframes aurora-drift-4 {
  0%   { transform: translate(0%,   0%)   scale(1);    }
  35%  { transform: translate(6%,   3%)   scale(1.04); }
  55%  { transform: translate(2%,  -5%)   scale(0.96); }
  80%  { transform: translate(-3%,  4%)   scale(1.02); }
  100% { transform: translate(0%,   0%)   scale(1);    }
}
</style>
