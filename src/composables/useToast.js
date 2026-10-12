import { reactive } from 'vue'

const toasts = reactive([])
let nextId = 1

function push(type, message, timeout = 4000) {
  const id = nextId++
  toasts.push({ id, type, message })
  if (timeout) setTimeout(() => dismiss(id), timeout)
  return id
}

export function dismiss(id) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index > -1) toasts.splice(index, 1)
}

export const toast = {
  success: (message, timeout) => push('success', message, timeout),
  error: (message, timeout) => push('error', message, timeout ?? 5000),
  info: (message, timeout) => push('info', message, timeout),
}

export function useToasts() {
  return { toasts, dismiss }
}
