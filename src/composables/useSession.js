import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

// Same localStorage keys as before, so existing sessions keep working
const TOKEN_KEY = 'token'
const DEVICE_KEY = 'device_id'

const token = ref(localStorage.getItem(TOKEN_KEY))

// Minted once per browser and kept; the backend limits failed logins per device
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_KEY)
  if (!deviceId) {
    deviceId = uuidv4()
    localStorage.setItem(DEVICE_KEY, deviceId)
  }
  return deviceId
}

export function setToken(value) {
  token.value = value
  localStorage.setItem(TOKEN_KEY, value)
}

export function clearSession() {
  token.value = null
  localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return token.value
}

export function useSession() {
  return { token, isLoggedIn: computed(() => !!token.value), setToken, clearSession }
}
