import { request, send } from './http'

export const studioApi = {
  // { page, limit, totalData, maxPage, data: [{ studio_id (uuid), studio_name, studio_city, ... }] }
  list: (page, search = '', limit = 6) => request('post', 'owner/studio/list', { page, limit, search }, 'Gagal memuat daftar studio'),

  // Envelope as-is: status false simply means "no submission yet"
  latestSubmission: () => send('post', 'owner/studio/submission/check', {}),

  submit: (payload) => request('post', 'owner/studio/submission', payload, 'Gagal mengirim pengajuan'),

  detail: (studioUuid) => request('post', 'owner/studio/detail', { studio_uuid: studioUuid }, 'Gagal memuat data studio'),

  equipments: () => request('get', 'owner/studio/equipment/list', undefined, 'Gagal memuat daftar alat'),

  rooms: (studioUuid) => request('post', 'owner/studio/studio-number/list', { page: 1, limit: 10000, studio_uuid: studioUuid }, 'Gagal memuat nomor studio'),

  roomDetail: (studioUuid, studioNumberUuid) => request('post', 'owner/studio/studio-number/detail', { studio_uuid: studioUuid, studio_number_uuid: studioNumberUuid }, 'Gagal memuat detail nomor studio'),

  createRoom: (payload) => request('post', 'owner/studio/studio-number/create', payload, 'Gagal menyimpan nomor studio'),

  editRoom: (payload) => request('post', 'owner/studio/studio-number/edit', payload, 'Gagal menyimpan perubahan'),
}

export const subscriptionApi = {
  // { subscriptionPrice, subscriptionDuration (days) }
  price: () => request('post', 'owner/studio/subscription/price', {}, 'Gagal memuat harga langganan'),
  // { checkQr, qrContent?, transaction_uuid?, totalPayment?, expiredQris? } — a still-valid pending QR, if any
  pendingQr: (studioUuid) => request('post', 'owner/studio/subscription/qr/check', { studio_id: studioUuid }, 'Gagal memuat QR'),
  create: (studioUuid) => request('post', 'owner/studio/subscription', { studio_id: studioUuid }, 'Gagal membuat pembayaran'),
  isPaid: async (studioUuid, transactionId) =>
    (await request('post', 'owner/funding/subscription/status', { studio_id: studioUuid, transaction_id: transactionId })).payment_status === true,
}
