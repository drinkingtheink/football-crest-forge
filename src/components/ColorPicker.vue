<script setup>
import { useBadgeConfig } from '../composables/useBadgeConfig.js'

const props = defineProps({
  value: { type: String, required: true },
})

const emit = defineEmits(['change'])

const { config } = useBadgeConfig()
</script>

<template>
  <div class="color-picker">
    <button
      v-for="(swatch, i) in config.palette"
      :key="i"
      class="cp-swatch"
      :class="{ active: swatch.toLowerCase() === value.toLowerCase() }"
      :style="{ background: swatch }"
      :title="swatch"
      @click="emit('change', swatch)"
    />
    <input
      type="color"
      :value="value"
      class="cp-input"
      title="Custom color"
      @input="emit('change', $event.target.value)"
    />
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cp-swatch {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
  outline: none;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  transition: box-shadow 0.12s, border-color 0.12s, transform 0.1s;
}

.cp-swatch:hover {
  transform: scale(1.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.cp-swatch.active {
  border-color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5), 0 0 0 1px rgba(255,255,255,0.2);
}

.cp-input {
  width: 28px;
  height: 22px;
  padding: 1px;
  border: 1px solid #3a3a48;
  border-radius: 4px;
  background: #1e1e28;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
