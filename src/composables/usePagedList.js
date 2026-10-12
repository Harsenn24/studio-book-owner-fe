import { computed, reactive, ref, watch } from 'vue'
import { toast } from './useToast'

/**
 * Filterable, paginated list shared by the transaction tabs.
 * fetcher(page, filters) -> { rows, total }. Filter changes reset to page 1 (text filters are debounced).
 */
export function usePagedList(fetcher, initialFilters) {
  const filters = reactive({ ...initialFilters })
  const rows = ref([])
  const total = ref(0)
  const page = ref(1)
  const loading = ref(true)
  let timer = null
  let requestId = 0

  const maxPage = computed(() => Math.max(1, Math.ceil(total.value / (Number(filters.limit) || 10))))
  const activeCount = computed(() => Object.entries(filters).filter(([key, value]) => key !== 'limit' && value !== '' && value !== initialFilters[key]).length)

  async function load() {
    const id = ++requestId
    loading.value = true
    try {
      const result = await fetcher(page.value, filters)
      if (id !== requestId) return
      rows.value = result.rows ?? []
      total.value = Number(result.total) || 0
    } catch (error) {
      if (id === requestId) toast.error(error.message)
    } finally {
      if (id === requestId) loading.value = false
    }
  }

  function goTo(target) {
    page.value = target
    load()
  }

  function reset() {
    Object.assign(filters, initialFilters)
  }

  watch(filters, () => {
    clearTimeout(timer)
    timer = setTimeout(() => goTo(1), 350)
  })

  load()

  return { filters, rows, total, page, maxPage, loading, activeCount, goTo, reset, reload: load }
}

export const LIMIT_OPTIONS = [10, 25, 50, 100].map((value) => ({ value, label: `${value} per halaman` }))
