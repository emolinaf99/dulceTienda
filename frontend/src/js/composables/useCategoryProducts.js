import { ref, computed } from 'vue'
import { useApi } from './useFetch.js'

export function useCategoryProducts(categoryId) {
  const category = ref(null)
  const products = ref([])
  const pagination = ref(null)
  const filters = ref({ availableSizes: [], availableColors: [] })
  const appliedFilters = ref({
    sizes: [],
    colors: [],
    minPrice: null,
    maxPrice: null
  })
  const loading = ref(false)
  const error = ref(null)

  const categoryName = computed(() => category.value?.name || '')
  const categoryDescription = computed(() => category.value?.description || '')

  const fetchCategoryProducts = async (id, queryParams = {}) => {
    if (!id) return
    
    loading.value = true
    error.value = null

    try {
      // Construir query string
      const params = new URLSearchParams()
      
      if (queryParams.sizes && queryParams.sizes.length > 0) {
        queryParams.sizes.forEach(size => params.append('sizes', size))
      }
      
      if (queryParams.colors && queryParams.colors.length > 0) {
        queryParams.colors.forEach(color => params.append('colors', color))
      }
      
      if (queryParams.minPrice) params.append('minPrice', queryParams.minPrice)
      if (queryParams.maxPrice) params.append('maxPrice', queryParams.maxPrice)
      if (queryParams.page) params.append('page', queryParams.page)
      if (queryParams.limit) params.append('limit', queryParams.limit)
      if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy)
      if (queryParams.sortOrder) params.append('sortOrder', queryParams.sortOrder)

      const queryString = params.toString()
      const url = `/api/categories/${id}${queryString ? `?${queryString}` : ''}`
      
      const { data, error: fetchError } = await useApi(url, 'GET')
      
      if (fetchError.value) {
        error.value = fetchError.value
      } else if (data.value && data.value.success) {
        category.value = data.value.data.category
        products.value = data.value.data.category.products || []
        pagination.value = data.value.data.pagination
        filters.value = data.value.data.filters
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
    if (product.colorImages && product.colorImages.length > 0) {
      return `/uploads/products/${product.colorImages[0].img}`
    }
    return '/img/buzosMuestra.jpg'
  }

  const applyFilters = async (newFilters) => {
    appliedFilters.value = { ...appliedFilters.value, ...newFilters }
    await fetchCategoryProducts(categoryId, { 
      ...appliedFilters.value, 
      page: 1 
    })
  }

  const clearFilters = async () => {
    appliedFilters.value = {
      sizes: [],
      colors: [],
      minPrice: null,
      maxPrice: null
    }
    await fetchCategoryProducts(categoryId, { page: 1 })
  }

  const changePage = async (page) => {
    await fetchCategoryProducts(categoryId, { 
      ...appliedFilters.value, 
      page 
    })
  }

  return {
    category,
    products,
    pagination,
    filters,
    appliedFilters,
    loading,
    error,
    categoryName,
    categoryDescription,
    fetchCategoryProducts,
    formatPrice,
    calculateDiscountedPrice,
    getProductImage,
    applyFilters,
    clearFilters,
    changePage
  }
}