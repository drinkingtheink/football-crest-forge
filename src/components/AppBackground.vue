<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBadgeConfig } from '../composables/useBadgeConfig.js'
import { startBokeh } from '../utils/bokeh.js'
import { hexagonsBg, topographyBg } from '../utils/patterns.js'

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

const patternStyle = computed(() => {
  if (props.type === 'hexagons')   return hexagonsBg(config.palette)
  if (props.type === 'topography') return topographyBg(config.palette)
  if (imageMap[props.type])        return { backgroundImage: `url(${imageMap[props.type]})` }
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
}

.bokeh-canvas {
  width: 100%;
  height: 100%;
  filter: blur(28px);
  transform: scale(1.08);
}
</style>
