<template>
  <BaseSheet :open="open" title="Form pengajuan studio" subtitle="Tim kami akan memverifikasi data ini sebelum studiomu tayang." @close="emit('close')">
    <form id="submission-form" class="space-y-8" @submit.prevent="submit">
      <!-- Studio -->
      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-wider text-brand-400">1 · Studio</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.name" label="Nama studio" placeholder="Contoh: Studio Suara Jakarta" icon="🎛️"
            maxlength="20" :error="touched ? errors.name : ''" @input="form.name = titleCase(form.name)" />
          <BaseInput v-model="form.estimatedStudioNumber" label="Jumlah ruangan / nomor studio" placeholder="1" icon="🚪" inputmode="numeric"
            :error="touched ? errors.estimatedStudioNumber : ''" hint="Kamu akan upload 1 foto untuk tiap ruangan."
            @input="form.estimatedStudioNumber = digitsOnly(form.estimatedStudioNumber).slice(0, 2)" />
        </div>
      </section>

      <!-- Address -->
      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-wider text-brand-400">2 · Lokasi</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <AutocompleteInput v-model="region.province" label="Provinsi" placeholder="Cari provinsi…" :search="regionApi.provinces"
            :error="touched && !region.province ? 'Pilih provinsi.' : ''" />
          <AutocompleteInput v-model="region.city" label="Kota / kabupaten" placeholder="Cari kota…" :disabled="!region.province"
            :search="(q) => regionApi.cities(q, region.province.id)" :error="touched && region.province && !region.city ? 'Pilih kota.' : ''" />
          <AutocompleteInput v-model="region.district" label="Kecamatan" placeholder="Cari kecamatan…" :disabled="!region.city"
            :search="(q) => regionApi.districts(q, region.city.id)" :error="touched && region.city && !region.district ? 'Pilih kecamatan.' : ''" />
          <AutocompleteInput v-model="region.village" label="Kelurahan" placeholder="Cari kelurahan…" :disabled="!region.district"
            :search="(q) => regionApi.villages(q, region.district.id)" :error="touched && region.district && !region.village ? 'Pilih kelurahan.' : ''" />
          <AutocompleteInput v-model="region.postalCode" label="Kode pos" placeholder="Cari kode pos…" label-key="postal_code" :disabled="!region.village"
            :search="(q) => regionApi.postalCodes(q, regionIds)" :error="touched && region.village && !region.postalCode ? 'Pilih kode pos.' : ''" />
          <BaseInput v-model="form.gmaps" label="Link Google Maps" placeholder="https://maps.app.goo.gl/…" icon="🗺️"
            :error="touched ? errors.gmaps : ''" @input="form.gmaps = form.gmaps.trim()" />
        </div>
        <label class="mt-4 block text-left">
          <span class="mb-1.5 block text-sm font-medium text-ink-300">Alamat lengkap</span>
          <textarea v-model="form.address" rows="3" placeholder="Contoh: Jalan Sukmajaya 1 No. 23, Depok"
            class="w-full resize-y rounded-xl border bg-ink-900/80 px-4 py-3 text-ink-100 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
            :class="touched && errors.address ? 'border-rose-500/70' : 'border-ink-600'" />
          <span v-if="touched && errors.address" class="mt-1.5 block text-xs text-rose-400">{{ errors.address }}</span>
        </label>
      </section>

      <!-- Contact & bank -->
      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-wider text-brand-400">3 · Kontak & rekening pencairan</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <BaseInput v-model="form.contactName" label="Nama contact person" placeholder="Contoh: Dhimas" icon="👤" maxlength="20"
            :error="touched ? errors.contactName : ''" @input="form.contactName = titleCase(form.contactName)" />
          <BaseInput v-model="form.contactPhone" label="No. HP contact person" placeholder="08xxxxxxxxxx" icon="📱" inputmode="numeric"
            maxlength="13" :error="(touched || form.contactPhone) ? errors.contactPhone : ''" @input="form.contactPhone = digitsOnly(form.contactPhone)" />
          <AutocompleteInput v-model="bank" label="Bank" placeholder="Cari nama bank…" :search="(q) => fundingApi.banks(q).then((d) => d.data)"
            :error="touched && !bank ? 'Pilih bank.' : ''" />
          <BaseInput v-model="form.bankAccount" label="Nomor rekening" placeholder="Contoh: 5544512536" icon="🏦" inputmode="numeric" maxlength="20"
            :error="touched ? errors.bankAccount : ''" @input="form.bankAccount = digitsOnly(form.bankAccount)" />
        </div>
      </section>

      <!-- Documents -->
      <section>
        <h3 class="mb-1 text-sm font-bold uppercase tracking-wider text-brand-400">4 · Dokumen & foto</h3>
        <p class="mb-4 text-sm text-ink-400">Foto KTP pemilik dan 1 foto untuk setiap ruangan.</p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ImageUpload v-for="slot in photoSlots" :key="slot.key" :label="slot.label" :icon="slot.key === 'ktp' ? '🪪' : '🎸'"
            :upload="(file) => uploadSlot(slot, file)" />
        </div>
        <p v-if="touched && errors.documents" class="mt-3 text-sm text-rose-400">{{ errors.documents }}</p>
      </section>
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="emit('close')">Batal</BaseButton>
      <BaseButton type="submit" form="submission-form" :loading="submitting">Kirim pengajuan</BaseButton>
    </template>
  </BaseSheet>

  <BaseModal :open="success" icon="🎉" title="Pengajuan berhasil dikirim" :dismissible="false">
    Tim kami akan segera memeriksa pengajuanmu. Status pengajuan bisa kamu pantau di dashboard.
    <template #actions>
      <BaseButton block @click="finish">Ke dashboard</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import BaseSheet from '../ui/BaseSheet.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'
import AutocompleteInput from '../ui/AutocompleteInput.vue'
import ImageUpload from '../ui/ImageUpload.vue'
import { regionApi, fileApi } from '../../api/master'
import { fundingApi } from '../../api/funding'
import { studioApi } from '../../api/studio'
import { digitsOnly, titleCase } from '../../utils/format'
import { toast } from '../../composables/useToast'

defineProps({ open: Boolean })
const emit = defineEmits(['close'])

const form = reactive({ name: '', estimatedStudioNumber: '1', gmaps: '', address: '', contactName: '', contactPhone: '', bankAccount: '' })
const region = reactive({ province: null, city: null, district: null, village: null, postalCode: null })
const bank = ref(null)
const fileIds = reactive({}) // slot key -> uploaded file_id (replacing a photo replaces its id)
const touched = ref(false)
const submitting = ref(false)
const success = ref(false)

// Picking a parent region clears everything below it
const LEVELS = ['province', 'city', 'district', 'village', 'postalCode']
LEVELS.slice(0, -1).forEach((level, index) => {
  watch(() => region[level], () => LEVELS.slice(index + 1).forEach((child) => { region[child] = null }))
})

const regionIds = computed(() => ({
  province_id: region.province?.id, city_id: region.city?.id, district_id: region.district?.id, village_id: region.village?.id,
}))

const roomCount = computed(() => Math.min(Math.max(Number(form.estimatedStudioNumber) || 0, 0), 20))
const photoSlots = computed(() => [
  { key: 'ktp', label: 'Foto KTP', module: 'studio.ktp' },
  ...Array.from({ length: roomCount.value }, (_, i) => ({ key: `studio${i + 1}`, label: `Foto studio ${i + 1}`, module: 'studio.photo' })),
])

async function uploadSlot(slot, file) {
  delete fileIds[slot.key]
  fileIds[slot.key] = await fileApi.uploadImage(file, slot.module)
}

const isUrl = (value) => { try { return !!new URL(value) } catch { return false } }

// Mirrors the backend submission validator
const errors = computed(() => ({
  name: form.name.trim().length < 5 ? 'Nama studio 5–20 karakter.' : '',
  estimatedStudioNumber: roomCount.value < 1 ? 'Minimal 1 ruangan.' : '',
  gmaps: !isUrl(form.gmaps) ? 'Masukkan link Google Maps yang valid.' : '',
  address: form.address.trim().length < 10 ? 'Alamat minimal 10 karakter.' : '',
  contactName: form.contactName.trim().length < 5 ? 'Nama contact person 5–20 karakter.' : '',
  contactPhone: !form.contactPhone.startsWith('08') ? 'Nomor harus diawali 08.' : form.contactPhone.length < 10 ? 'Nomor minimal 10 digit.' : '',
  bankAccount: form.bankAccount.length < 5 ? 'Nomor rekening minimal 5 digit.' : '',
  documents: photoSlots.value.some((slot) => !fileIds[slot.key]) ? 'Upload foto KTP dan semua foto studio dulu.' : '',
}))

const isValid = computed(() => Object.values(errors.value).every((message) => !message)
  && LEVELS.every((level) => region[level]) && !!bank.value)

async function submit() {
  touched.value = true
  if (!isValid.value) return toast.error('Masih ada data yang belum lengkap.')

  submitting.value = true
  try {
    await studioApi.submit({
      name: form.name.trim(),
      estimated_studio_number: roomCount.value,
      address_data: {
        ...regionIds.value,
        postal_code_id: region.postalCode.id,
        address: form.address.trim(),
        gmaps: form.gmaps,
      },
      contact_person_data: { name: form.contactName.trim(), phone: form.contactPhone },
      account_number_data: { bank_code: bank.value.prima_code, bank_account_number: form.bankAccount },
      // KTP first, then one photo per room: exactly estimated_studio_number + 1 ids
      document_ids: photoSlots.value.map((slot) => fileIds[slot.key]),
    })
    success.value = true
  } catch (error) {
    toast.error(error.message)
  } finally {
    submitting.value = false
  }
}

// Full reload, as before, so every screen reads the new submission
const finish = () => window.location.assign('/home')
</script>
