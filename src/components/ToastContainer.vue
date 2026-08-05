<script setup>
import { useToast } from '../composables/useToast.js'
const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
        >
          <span class="toast-msg">{{ toast.message }}</span>
          <button v-if="toast.action" class="toast-action" @click="toast.action.fn(); dismiss(toast.id)">{{ toast.action.label }}</button>
          <button class="toast-close" @click="dismiss(toast.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
/* Centered over the crest edit pane (viewport minus the right controls pane),
   so the offset tracks the responsive sidebar width. */
.toast-stack {
  position: fixed;
  top: 24px;
  left: calc(50% - 150px);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
}

@media (min-width: 1440px) {
  .toast-stack { left: calc(50% - 180px); }
}

@media (min-width: 1920px) {
  .toast-stack { left: calc(50% - 210px); }
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #1e1e28;
  border: 1px solid #2a2a35;
  border-left: 3px solid transparent;
  border-radius: 6px;
  padding: 10px 12px 10px 14px;
  min-width: 220px;
  max-width: 340px;
  pointer-events: all;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.toast--info    { border-left-color: #4a9eff; }
.toast--success { border-left-color: #4caf50; }
.toast--error   { border-left-color: #e05555; }
.toast--tip     { border-left-color: #e8c84a; }

.toast-msg {
  flex: 1;
  color: #e8e8ec;
  font-size: 13px;
  font-family: system-ui, sans-serif;
  line-height: 1.4;
}

.toast-action {
  background: none;
  border: 1px solid #e8c84a55;
  border-radius: 4px;
  color: #e8c84a;
  cursor: pointer;
  font-size: 11px;
  padding: 3px 8px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.toast-action:hover { background: rgba(232, 200, 74, 0.1); }

.toast-close {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;
}
.toast-close:hover { color: #aaa; }

.toast-enter-active { transition: opacity 0.25s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: opacity 0.2s ease, transform 0.22s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(-20px); }
.toast-leave-to     { opacity: 0; transform: translateY(-16px); }
</style>
