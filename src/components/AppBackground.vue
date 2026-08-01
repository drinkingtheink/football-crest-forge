<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBadgeConfig } from '../composables/useBadgeConfig.js'
import { drawBokeh } from '../utils/bokeh.js'
import { hexagonsBg, topographyBg } from '../utils/patterns.js'

const props = defineProps({
  type: { type: String, default: 'none' },
})

const { config } = useBadgeConfig()
const bokehCanvas = ref(null)

const imageMap = {
  grass:  '/backgrounds/grass.jpg',
  fabric: '/backgrounds/fabric.png',
  brick:  '/backgrounds/brick.jpg',
  stadium:  '/backgrounds/stadium.png',
  pitch:  '/backgrounds/pitch.png',
}

const patternStyle = computed(() => {
  if (props.type === 'hexagons')   return hexagonsBg(config.palette)
  if (props.type === 'topography') return topographyBg(config.palette)
  if (imageMap[props.type])        return { backgroundImage: `url(${imageMap[props.type]})` }
  return {}
})

function redraw() {
  if (props.type !== 'bokeh' || !bokehCanvas.value) return
  const canvas = bokehCanvas.value
  canvas.width  = window.innerWidth
  canvas.height = window.innerHeight
  drawBokeh(canvas, config.palette)
}

watch(() => props.type, async (t) => {
  if (t === 'bokeh') { await nextTick(); redraw() }
})

watch(() => config.palette.join(), () => {
  if (props.type === 'bokeh') redraw()
})

onMounted(() => { redraw(); window.addEventListener('resize', redraw) })
onUnmounted(() => window.removeEventListener('resize', redraw))
</script>

<template>
  <div class="app-bg" :style="patternStyle">
    <canvas v-if="type === 'bokeh'" ref="bokehCanvas" class="bokeh-canvas" />
  </div>
</template>

<style scoped>
.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-color: #07070e;
  background-size: cover;
  background-position: center;
}

.bokeh-canvas {
  width: 100%;
  height: 100%;
  filter: blur(28px);
  transform: scale(1.08);
}
</style>
