import { request } from './http'

// Drops empty filters so the backend validators only see what the user actually set
const compact = (payload) => Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined))

export const fundingApi = {
  // Balance overview + payout bank
  summary: (studioUuid) => request('post', 'owner/funding/transaction/detail', { studio_uuid: studioUuid }, 'Gagal memuat ringkasan dana'),

  recon: (studioUuid) => request('post', 'owner/funding/recon', { studio_id: studioUuid }, 'Rekonsiliasi gagal'),

  transferFee: async () => (await request('get', 'owner/funding/transfer/fee', undefined, 'Gagal memuat biaya transfer')).admin_transfer,

  inquiry: (payload) => request('post', 'owner/funding/inquiry', payload, 'Rekening tidak bisa diverifikasi'),

  transfer: (payload) => request('post', 'owner/funding/transfer', payload, 'Penarikan gagal'),

  banks: (search = '') => request('post', 'owner/funding/bank-list', { search }, 'Gagal memuat daftar bank'),

  editBankAccount: (payload) => request('post', 'owner/funding/bank-account/edit', payload, 'Gagal mengganti rekening'),

  // { page, limit, totalData, maxPage, data }
  rentals: (payload) => request('post', 'owner/funding/transaction/list', compact(payload), 'Gagal memuat transaksi sewa'),
  disbursements: (payload) => request('post', 'owner/funding/disbursement/list', compact(payload), 'Gagal memuat riwayat penarikan'),
  // { total, page, limit, data }
  subscriptions: (payload) => request('post', 'owner/funding/subscription/list', compact(payload), 'Gagal memuat riwayat langganan'),
}
