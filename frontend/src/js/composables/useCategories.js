import { ref, onMounted } from 'vue'
import { useApi } from './useFetch.js'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useApi('/api/categories', 'GET')
      
      if (fetchError.value) {
        error.value = fetchError.value
      } else if (data.value && data.value.success) {
        categories.value = data.value.data.categories
      }
    } catch (err) {
      error.value = 'Error al cargar categorías'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchCategories()
  })

  return {
    categories,
    loading,
    error,
    fetchCategories
  }
}