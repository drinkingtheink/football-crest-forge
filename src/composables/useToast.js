import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 1

export function useToast() {
  function addToast(message, { type = 'info', duration = 3500 } = {}) {
    const id = nextId++
    toasts.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return { toasts, addToast, dismiss }
}
