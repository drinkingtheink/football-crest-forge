<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useBadgeConfig } from '../composables/useBadgeConfig.js'
import { drawBokeh } from '../utils/bokeh.js'

const props = defineProps({
  type: { type: String, default: 'dark' },
})

const { config } = useBadgeConfig()
const bokehCanvas = ref(null)

const imageMap = {
  grass:  '/backgrounds/grass.jpg',
  fabric: '/backgrounds/fabric.png',
  brick:  '/backgrounds/brick.jpg',
}

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

onMounted(() => {
  redraw()
  window.addEventListener('resize', redraw)
})
onUnmounted(() => window.removeEventListener('resize', redraw))
</script>

<template>
  <div
    class="app-bg"
    :class="`app-bg--${type}`"
    :style="imageMap[type] ? { backgroundImage: `url(${imageMap[type]})` } : {}"
  >
    <canvas v-if="type === 'bokeh'" ref="bokehCanvas" class="bokeh-canvas" />
  </div>
</template>

<style scoped>
.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
}

.app-bg--dark   { background: #07070e; }
.app-bg--grass  { }
.app-bg--fabric { }
.app-bg--brick  { }
.app-bg--bokeh  { background: #07070e; }

.bokeh-canvas {
  width: 100%;
  height: 100%;
  filter: blur(28px);
  transform: scale(1.08); /* hide blur edge clipping */
}
</style>
