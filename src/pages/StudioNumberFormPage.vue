<template>
  <AppLayout>
    <PageHeader :back="`/home/${studioUuid}`" backLabel="Kembali ke studio" :eyebrow="isEdit ? 'Edit ruangan' : 'Ruangan baru'"
      :title="isEdit ? `Edit Studio ${detail?.studio_number ?? ''}` : 'Daftarkan nomor studio'"
      subtitle="Atur alat, harga, jam operasional, dan foto ruangan." />

    <div v-if="loading" class="space-y-6"><div v-for="n in 3" :key="n" class="card h-48 animate-pulse" /></div>

    <form v-else class="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start" @submit.prevent="submit">
      <div class="min-w-0 space-y-6">
        <!-- 1. Equipment -->
        <section class="card p-5 sm:p-6">
          <h2 class="font-bold">1 · Alat musik</h2>
          <p class="mt-1 text-sm text-ink-400">Atur jumlah tiap alat di ruangan ini. Biarkan 0 kalau tidak ada.</p>
          <ul class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <li v-for="item in equipmentList" :key="item.id" class="flex items-center justify-between gap-3 rounded-xl border p-3 transition"
              :class="quantities[item.id] > 0 ? 'border-brand-500/50 bg-brand-500/5' : 'border-ink-600/70 bg-ink-900/60'">
              <span class="flex min-w-0 items-center gap-2 text-sm font-semibold capitalize"><span class="text-lg">{{ equipmentIcon(item.name) }}</span><span class="truncate">{{ item.name }}</span></span>
              <span class="flex shrink-0 items-center gap-1">
                <button type="button" class="h-8 w-8 rounded-lg bg-ink-700 font-bold disabled:opacity-40" :disabled="!quantities[item.id]" @click="quantities[item.id]--">−</button>
                <span class="w-7 text-center font-bold tabular-nums">{{ quantities[item.id] || 0 }}</span>
                <button type="button" class="h-8 w-8 rounded-lg bg-ink-700 font-bold" @click="quantities[item.id] = (quantities[item.id] || 0) + 1">+</button>
              </span>
            </li>
          </ul>
          <p v-if="touched && !selectedEquipments.length" class="mt-3 text-sm text-rose-400">Pilih minimal 1 alat.</p>
        </section>

        <!-- 2. Prices -->
        <section class="card p-5 sm:p-6">
          <h2 class="font-bold">2 · Harga sewa per jam</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            <BaseInput v-model="prices.weekday" label="Senin – Jumat" placeholder="50000" icon="Rp" inputmode="numeric"
              :error="touched && !(Number(prices.weekday) > 0) ? 'Isi harga weekday.' : ''" @input="prices.weekday = digitsOnly(prices.weekday)" />
            <BaseInput v-model="prices.weekend" label="Sabtu – Minggu" placeholder="60000" icon="Rp" inputmode="numeric"
              :error="touched && !(Number(prices.weekend) > 0) ? 'Isi harga weekend.' : ''" @input="prices.weekend = digitsOnly(prices.weekend)" />
          </div>
        </section>

        <!-- 3. Operational hours -->
        <section class="card p-5 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-bold">3 · Jam operasional</h2>
              <p class="mt-1 text-sm text-ink-400">Disewakan per 1 jam. Contoh buka 09:00 tutup 18:00 → 9 slot.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <BaseButton size="sm" variant="secondary" @click="downloadTemplate">📥 Template Excel</BaseButton>
              <label class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink-600 bg-ink-700/80 px-3 py-2 text-sm font-semibold hover:border-ink-400">
                <input type="file" accept=".xlsx" class="sr-only" @change="importExcel" />
                {{ importing ? 'Membaca…' : '📤 Upload Excel' }}
              </label>
            </div>
          </div>

          <ul class="mt-5 space-y-3">
            <li v-for="(row, index) in rows" :key="row.uid" class="rounded-2xl border border-ink-600/70 bg-ink-900/60 p-4">
              <div class="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
                <FieldSelect v-model="row.date" label="Tanggal" placeholder="Pilih tanggal" :disabled="!row.editable" :options="dateOptionsFor(index)" />
                <FieldSelect v-model="row.open" label="Jam buka" placeholder="Buka" :disabled="!row.editable" :options="hourOptions" />
                <FieldSelect v-model="row.close" label="Jam tutup" placeholder="Tutup" :disabled="!row.editable" :options="hourOptions" />
                <button v-if="row.editable" type="button" class="h-10 rounded-xl px-3 text-sm font-semibold text-rose-300 hover:bg-rose-500/10" @click="rows.splice(index, 1)">Hapus</button>
              </div>
              <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p v-if="rowError(row)" class="text-xs text-rose-400">{{ rowError(row) }}</p>
                <p v-else-if="!row.editable" class="text-xs text-ink-400">🔒 Sudah ada booking / hari ini, jadwal tidak bisa diubah.</p>
                <span v-else />
                <label v-if="isEdit" class="flex cursor-pointer items-center gap-2 text-sm">
                  <input v-model="row.is_operational" type="checkbox" class="peer sr-only" />
                  <span class="relative h-6 w-11 rounded-full bg-ink-600 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
                  {{ row.is_operational ? 'Beroperasi' : 'Tutup' }}
                </label>
              </div>
            </li>
          </ul>

          <BaseButton class="mt-4" variant="secondary" block :disabled="!canAddRow" @click="addRow">＋ Tambah tanggal</BaseButton>
          <p v-if="touched && !rows.length" class="mt-3 text-sm text-rose-400">Tambahkan minimal 1 jadwal operasional.</p>
        </section>

        <!-- 4. Photo -->
        <section class="card p-5 sm:p-6">
          <h2 class="font-bold">4 · Foto ruangan</h2>
          <div v-if="isEdit" class="mt-5 max-w-md">
            <ImageUpload label="Klik untuk mengganti foto" :initial-url="uploadUrl(detail?.file_name)" @selected="(file) => (newPhoto = file)" />
          </div>
          <template v-else>
            <p class="mt-1 text-sm text-ink-400">Pilih salah satu foto dari pengajuan studio.</p>
            <EmptyState v-if="!photos.length" class="mt-5" icon="🖼️" title="Tidak ada foto tersisa" description="Semua foto pengajuan sudah dipakai ruangan lain." />
            <div v-else class="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
              <button v-for="photo in photos" :key="photo.id" type="button" class="relative overflow-hidden rounded-2xl border-2 transition"
                :class="photo.id === selectedPhotoId ? 'border-brand-500 shadow-lg shadow-brand-500/20' : 'border-transparent opacity-80 hover:opacity-100'"
                @click="selectedPhotoId = photo.id">
                <AppImage :src="uploadUrl(photo.file_name)" class="aspect-[4/3]" />
                <span v-if="photo.id === selectedPhotoId" class="bg-brand-gradient absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white">✓ Dipilih</span>
              </button>
            </div>
            <p v-if="touched && !selectedPhotoId && photos.length" class="mt-3 text-sm text-rose-400">Pilih 1 foto.</p>
          </template>
        </section>
      </div>

      <!-- Summary + save: sidebar on desktop, sticky bar on phones -->
      <aside class="card hidden space-y-4 p-5 lg:sticky lg:top-24 lg:block">
        <h2 class="font-bold">Ringkasan</h2>
        <dl class="space-y-2 text-sm">
          <div class="flex justify-between"><dt class="text-ink-400">Alat</dt><dd>{{ selectedEquipments.length }} jenis</dd></div>
          <div class="flex justify-between"><dt class="text-ink-400">Weekday</dt><dd>{{ formatPrice(prices.weekday) }}</dd></div>
          <div class="flex justify-between"><dt class="text-ink-400">Weekend</dt><dd>{{ formatPrice(prices.weekend) }}</dd></div>
          <div class="flex justify-between"><dt class="text-ink-400">Jadwal</dt><dd>{{ rows.length }} tanggal</dd></div>
        </dl>
        <BaseButton type="submit" size="lg" block :loading="saving">💾 Simpan</BaseButton>
      </aside>
      <div class="fixed inset-x-0 bottom-0 z-40 border-t border-ink-600/60 bg-ink-950/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <BaseButton type="submit" size="lg" block :loading="saving">💾 Simpan ruangan</BaseButton>
      </div>
    </form>

    <BaseModal :open="created" icon="🎉" title="Nomor studio berhasil dibuat!" :dismissible="false">
      Ruangan baru sudah tersimpan beserta alat, harga, dan jadwalnya.
      <template #actions><BaseButton block :to="`/home/${studioUuid}`">Kembali ke studio</BaseButton></template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import AppLayout from '../components/layout/AppLayout.vue'
import PageHeader from '../components/ui/PageHeader.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import FieldSelect from '../components/ui/FieldSelect.vue'
import ImageUpload from '../components/ui/ImageUpload.vue'
import AppImage from '../components/ui/AppImage.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { BE_BASE_URL, uploadUrl } from '../api/http'
import { studioApi } from '../api/studio'
import { fileApi, timeApi } from '../api/master'
import { digitsOnly, equipmentIcon, formatPrice } from '../utils/format'
import { toast } from '../composables/useToast'

const route = useRoute()
const router = useRouter()
const studioUuid = route.params.studio_uuid
const studioNumberUuid = route.params.studio_number_uuid
const isEdit = !!studioNumberUuid

const loading = ref(true)
const saving = ref(false)
const touched = ref(false)
const created = ref(false)

const equipmentList = ref([]) // [{ id, name }]
const quantities = reactive({}) // equipment id -> quantity
const prices = reactive({ weekday: '', weekend: '' })
const dates = ref([])
const hours = ref([])
const rows = ref([]) // [{ uid, date, open, close, is_operational, editable }]
const photos = ref([])
const selectedPhotoId = ref(null)
const detail = ref(null)
const newPhoto = ref(null)

const hourOptions = computed(() => hours.value.map((hour) => ({ value: hour.hour_time, label: hour.hour_time })))
const selectedEquipments = computed(() => Object.entries(quantities).filter(([, qty]) => qty > 0).map(([id, qty]) => ({ equipment_id: Number(id), quantity: qty })))

const newRow = (values = {}) => ({ uid: uuidv4(), date: '', open: '', close: '', is_operational: true, editable: true, ...values })
const toMinutes = (time) => { const [h, m] = time.split(':').map(Number); return h * 60 + m }

// A date can only be used once
function dateOptionsFor(index) {
  const taken = new Set(rows.value.filter((_, i) => i !== index).map((row) => row.date))
  const current = rows.value[index].date
  const options = dates.value.filter((d) => !taken.has(d.date)).map((d) => ({ value: d.date, label: new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }))
  // keep a stored date that is outside the 3-month list visible
  if (current && !options.some((o) => o.value === current)) options.unshift({ value: current, label: current })
  return options
}

function rowError(row) {
  if (!row.editable) return ''
  if (!row.date || !row.open || !row.close) return touched.value ? 'Lengkapi tanggal, jam buka, dan jam tutup.' : ''
  if (toMinutes(row.open) >= toMinutes(row.close)) return 'Jam buka harus lebih awal dari jam tutup.'
  return ''
}

const canAddRow = computed(() => {
  const last = rows.value[rows.value.length - 1]
  return !last || (last.date && last.open && last.close && !rowError(last))
})
const addRow = () => rows.value.push(newRow())

const downloadTemplate = () => window.open(`${BE_BASE_URL}owner/file/operation-time/download`, '_blank')

const importing = ref(false)
async function importExcel(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  importing.value = true
  try {
    const items = await fileApi.parseOperationalExcel(file)
    // Excel dates may come back as ISO timestamps; keep YYYY-MM-DD
    const normalize = (value) => (typeof value === 'string' ? value.slice(0, 10) : value ? new Date(value).toISOString().slice(0, 10) : '')
    const imported = items.map((item) => newRow({ date: normalize(item.date), open: String(item.open ?? ''), close: String(item.close ?? '') }))
    rows.value = [...rows.value.filter((row) => !row.editable), ...imported]
    toast.success(`${imported.length} jadwal dari Excel dimuat. Cek lagi sebelum menyimpan.`)
  } catch (error) {
    toast.error(error.message)
  } finally {
    importing.value = false
  }
}

function validate() {
  touched.value = true
  if (!selectedEquipments.value.length) return 'Pilih minimal 1 alat.'
  if (!(Number(prices.weekday) > 0) || !(Number(prices.weekend) > 0)) return 'Isi harga weekday dan weekend.'
  if (!rows.value.length) return 'Tambahkan minimal 1 jadwal operasional.'
  if (rows.value.some((row) => row.editable && (!row.date || !row.open || !row.close || rowError(row)))) return 'Ada jadwal yang belum benar.'
  if (rows.value.some((row) => !dates.value.some((d) => d.date === row.date))) return 'Ada tanggal di luar rentang 3 bulan ke depan.'
  if (!isEdit && !selectedPhotoId.value) return 'Pilih foto ruangan.'
  return ''
}

const operationalTimes = () => rows.value.map((row) => ({
  date_id: dates.value.find((d) => d.date === row.date).id,
  open_hour: row.open,
  close_hour: row.close,
  is_operational: row.is_operational,
}))

async function submit() {
  const problem = validate()
  if (problem) return toast.error(problem)

  saving.value = true
  try {
    const priceList = [{ day_type: 'weekday', price: Number(prices.weekday) }, { day_type: 'weekend', price: Number(prices.weekend) }]

    if (isEdit) {
      // Upload the replacement photo only when one was picked (the old code always uploaded)
      const documentId = newPhoto.value ? await fileApi.uploadImage(newPhoto.value, 'studio.photo') : undefined
      await studioApi.editRoom({
        studio_uuid: studioUuid,
        studio_number_uuid: studioNumberUuid,
        weekday_price: Number(prices.weekday),
        weekend_price: Number(prices.weekend),
        equipments: selectedEquipments.value,
        operational_times: operationalTimes(),
        ...(documentId ? { document_id: documentId } : {}),
      })
      toast.success('Perubahan ruangan disimpan.')
      return router.push(`/home/${studioUuid}`)
    }

    // Creating a room used to be missing entirely: the form never called the API
    await studioApi.createRoom({
      studio_uuid: studioUuid,
      equipments: selectedEquipments.value,
      prices: priceList,
      operational_times: operationalTimes(),
      document_photo_id: selectedPhotoId.value,
    })
    created.value = true
  } catch (error) {
    toast.error(error.message)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [dateList, hourList] = await Promise.all([timeApi.dates(), timeApi.hours()])
    dates.value = dateList
    hours.value = [...hourList].sort((a, b) => a.id - b.id)

    if (isEdit) {
      const data = await studioApi.roomDetail(studioUuid, studioNumberUuid)
      detail.value = data
      // The detail already lists every equipment (unused ones with quantity 0)
      equipmentList.value = data.studio_equipment.map((item) => ({ id: item.equipment_id, name: item.name }))
      data.studio_equipment.forEach((item) => { quantities[item.equipment_id] = item.quantity })
      prices.weekday = digitsOnly(Math.round(Number(data.price_weekday)))
      prices.weekend = digitsOnly(Math.round(Number(data.price_weekend)))
      rows.value = data.operational_data
        .filter((item) => item.date) // the API sends one empty placeholder when there is no schedule
        .map((item) => newRow({ date: String(item.date).slice(0, 10), open: item.open, close: item.close, is_operational: !!item.is_operational, editable: item.delete_able }))
    } else {
      const [equipments, studioPhotos] = await Promise.all([studioApi.equipments(), fileApi.studioPhotos(studioUuid)])
      equipmentList.value = equipments.map((item) => ({ id: item.equipment_id, name: item.equipment_name.toLowerCase() }))
      equipmentList.value.forEach((item) => { quantities[item.id] = 0 })
      photos.value = studioPhotos
    }
    if (!rows.value.length) rows.value = [newRow()]
  } catch (error) {
    toast.error(error.message)
  } finally {
    loading.value = false
  }
})
</script>
