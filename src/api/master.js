import { request } from './http'

const ALL = { page: 1, limit: 10000 }

// Region lookups for the submission form; each level is filtered by its parent
export const regionApi = {
  provinces: (search) => request('post', 'owner/address/province-pagination', { ...ALL, search }).then((data) => data.data),
  cities: (search, provinceId) => request('post', 'owner/address/city-pagination', { ...ALL, search, province_id: provinceId }).then((data) => data.data),
  districts: (search, cityId) => request('post', 'owner/address/district-pagination', { ...ALL, search, city_id: cityId }).then((data) => data.data),
  villages: (search, districtId) => request('post', 'owner/address/village-pagination', { ...ALL, search, district_id: districtId }).then((data) => data.data),
  postalCodes: (search, ids) => request('post', 'owner/address/postal-code-pagination', { ...ALL, search, ...ids }).then((data) => data.data),
}

export const timeApi = {
  dates: () => request('get', 'user/time/date/list-three-months', undefined, 'Gagal memuat tanggal'),
  hours: () => request('get', 'user/time/hour/list', undefined, 'Gagal memuat jam'),
}

export const fileApi = {
  // module: 'studio.ktp' | 'studio.photo' -> file_id
  async uploadImage(file, module) {
    const form = new FormData()
    form.append('image', file)
    form.append('module', module)
    return (await request('post', 'owner/file/upload', form, 'Upload foto gagal')).file_id
  },

  // Photos from the submission that are not attached to a studio number yet
  studioPhotos: (studioUuid) => request('post', 'owner/file/images', { studio_uuid: studioUuid }, 'Gagal memuat foto studio'),

  // Parses the operational-time template -> [{ date, open, close }]
  async parseOperationalExcel(file) {
    const form = new FormData()
    form.append('excel_file', file)
    return (await request('post', 'owner/file/upload/excel', form, 'File template tidak bisa dibaca')).data
  },
}
