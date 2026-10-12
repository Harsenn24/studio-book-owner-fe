import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { clearSession, getDeviceId, getToken } from '../composables/useSession'

export const BE_BASE_URL = import.meta.env.VITE_STUDIO_BAND_BE_BASE_URL

const IP_KEY = 'ip_address'
const FALLBACK_IP = '0.0.0.0'
let ipPromise = null

// Looked up once per tab (it used to be fetched before every request); a blocked ipify never breaks the app
function getIpAddress() {
  const cached = sessionStorage.getItem(IP_KEY)
  if (cached) return Promise.resolve(cached)

  ipPromise ??= axios
    .get('https://api.ipify.org/?format=json', { timeout: 3000 })
    .then((res) => {
      sessionStorage.setItem(IP_KEY, res.data.ip)
      return res.data.ip
    })
    .catch(() => FALLBACK_IP)
    .finally(() => { ipPromise = null })

  return ipPromise
}

const http = axios.create({
  baseURL: BE_BASE_URL,
  timeout: 20000,
  // 4xx answers carry the backend envelope { status, message, data }; only 5xx/network errors throw
  validateStatus: (status) => status < 500,
})

http.interceptors.request.use(async (config) => {
  config.headers['x-ip-address'] = await getIpAddress()
  config.headers['x-device-id'] = getDeviceId()
  config.headers['x-request-id'] = uuidv4()
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

http.interceptors.response.use((response) => {
  if (response.status === 401 && getToken()) {
    clearSession()
    onUnauthorized()
  }
  return response
})

const FRIENDLY_MESSAGES = {
  'Invalid password': 'Password salah.',
  'role is not match': 'Email ini belum terdaftar sebagai akun pemilik studio.',
  'Login has been limited': 'Terlalu banyak percobaan login. Coba lagi besok ya.',
  'Email already registered': 'Email sudah terdaftar, silakan login.',
  'Date must be greater than today': 'Ada tanggal operasional yang sudah lewat.',
  'Insufficient balance': 'Saldo tidak mencukupi untuk penarikan ini.',
  'transfer_failed': 'Transfer gagal diproses bank. Saldo tidak terpotong, silakan coba lagi.',
  'inquiry_failed': 'Rekening tidak bisa diverifikasi. Cek nomor rekening dan bank-nya.',
  'Bank account number not match': 'Nomor rekening berbeda dengan rekening terdaftar.',
  'Studio name already exist': 'Nama studio sudah dipakai, coba nama lain.',
  'Document has been used': 'Foto sudah dipakai di pengajuan lain. Upload ulang fotonya.',
  'Document ids must be equal to estimated studio number': 'Jumlah foto harus sama dengan jumlah studio (+ 1 foto KTP).',
  'submission only one studio': 'Masih ada pengajuan yang sedang diproses.',
  'Studio number has reached the estimated number': 'Jumlah nomor studio sudah mencapai batas pengajuan.',
  'Duplicate time range in same date is not allowed': 'Jam operasional di tanggal ini sudah pernah dibuat.',
  'Duplicate time range in same date_id is not allowed': 'Ada tanggal yang diisi dua kali.',
  'Invalid hour range': 'Jam tutup harus setelah jam buka.',
  'Document already used': 'Foto ini sudah dipakai. Pilih foto lain.',
  'photo cant be used here': 'File ini bukan foto studio.',
  'Studio status still active': 'Studio masih aktif.',
  'Too many requests': 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
  'Unauthorized': 'Sesi kamu sudah berakhir, silakan login lagi.',
}

export class ApiError extends Error {
  constructor(message, envelope) {
    super(message)
    this.envelope = envelope
  }
}

export function messageOf(envelope, fallback = 'Terjadi kesalahan, coba lagi.') {
  const raw = Array.isArray(envelope?.message) ? envelope.message.join(', ') : envelope?.message
  return FRIENDLY_MESSAGES[raw] ?? raw ?? fallback
}

// Returns the envelope as-is (callers that branch on message, e.g. login)
export async function send(method, url, data) {
  try {
    const response = await http.request({ method, url, data })
    return response.data ?? { status: false, message: null, data: null }
  } catch (error) {
    throw new ApiError(error.code === 'ECONNABORTED' ? 'Server tidak merespons, coba lagi.' : 'Tidak bisa terhubung ke server.', null)
  }
}

// Returns data, throws ApiError with a readable message when status is false
export async function request(method, url, data, fallback) {
  const envelope = await send(method, url, data)
  if (!envelope.status) throw new ApiError(messageOf(envelope, fallback), envelope)
  return envelope.data
}

export const uploadUrl = (fileName) => (fileName ? `${BE_BASE_URL}uploads/${fileName}` : null)
