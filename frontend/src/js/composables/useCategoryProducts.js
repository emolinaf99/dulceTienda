import { ref, computed } from 'vue'
import { useApi } from './useFetch.js'

export function useCategoryProducts(categoryId) {
  const category = ref(null)
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  const categoryName = computed(() => category.value?.name || '')
  const categoryDescription = computed(() => category.value?.description || '')

  const fetchCategoryProducts = async (id) => {
    if (!id) return
    
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await useApi(`/api/categories/${id}?includeProducts=true`, 'GET')
      
      if (fetchError.value) {
        error.value = fetchError.value
      } else if (data.value && data.value.success) {
        category.value = data.value.data.category
        products.value = data.value.data.category.products || []
      }
    } catch (err) {
      error.value = 'Error al cargar los productos de la categoría'
    } finally {
      loading.value = false
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (!discountPercentage) return price
    return price - (price * discountPercentage / 100)
  }

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `/uploads/products/${product.images[0]}`
    }
    return '/img/buzosMuestra.jpg'
  }

  return {
    category,
    products,
    loading,
    error,
    categoryName,
    categoryDescription,
    fetchCategoryProducts,
    formatPrice,
    calculateDiscountedPrice,
    getProductImage
  }
}