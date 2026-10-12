const priceFormatter = new Intl.NumberFormat('id-ID')

export const formatPrice = (value) => `Rp ${priceFormatter.format(Number(value) || 0)}`

// Backend epochs are seconds
export const formatEpoch = (epoch, options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) =>
  epoch ? new Date(epoch * 1000).toLocaleString('id-ID', options) : '-'

export const formatDate = (value, options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  value ? new Date(value).toLocaleDateString('id-ID', options) : '-'

// "2026-10-19" from an <input type="date"> -> epoch seconds at the start (or end) of that local day
export function dayToEpoch(day, endOfDay = false) {
  if (!day) return undefined
  const date = new Date(`${day}T00:00:00`)
  if (endOfDay) date.setHours(23, 59, 59, 999)
  return Math.floor(date.getTime() / 1000)
}

// Every status the owner sees, mapped to a label and a colour tone
export const STATUS = {
  active: { label: 'Aktif', tone: 'success' },
  inactive: { label: 'Tidak aktif', tone: 'danger' },
  freezed: { label: 'Dibekukan', tone: 'neutral' },
  booked: { label: 'Lunas', tone: 'success' },
  success: { label: 'Sukses', tone: 'success' },
  pending: { label: 'Menunggu', tone: 'warning' },
  cancelled: { label: 'Dibatalkan', tone: 'danger' },
  failed: { label: 'Gagal', tone: 'danger' },
  submission: { label: 'Diproses', tone: 'warning' },
  accepted: { label: 'Diterima', tone: 'success' },
  rejected: { label: 'Ditolak', tone: 'danger' },
}

const EQUIPMENT_ICONS = [
  [['microphone', 'mic'], '🎤'],
  [['drum'], '🥁'],
  [['bass'], '🎸'],
  [['guitar', 'gitar'], '🎸'],
  [['keyboard', 'piano'], '🎹'],
  [['ampli'], '🔊'],
  [['cable', 'kabel'], '🔌'],
]

export function equipmentIcon(name = '') {
  const lower = name.toLowerCase()
  return EQUIPMENT_ICONS.find(([keys]) => keys.some((key) => lower.includes(key)))?.[1] ?? '🎚️'
}

export const titleCase = (value) => value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '')
