import { ref, computed } from 'vue'
import { useApi } from './useFetch.js'

export function useCategoryProducts() {
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
      let url
      
      // Manejar casos especiales para "new" y "discount"
      if (id === 'new') {
        url = '/api/products/nuevo'
        // Para productos nuevos, crear una categoría ficticia
        category.value = {
          id: 'new',
          name: 'Lo Nuevo',
          description: 'Los últimos productos agregados',
          type: 'special'
        }
      } else if (id === 'discount') {
        url = '/api/products/rebajas'
        // Para productos con descuento, crear una categoría ficticia
        category.value = {
          id: 'discount',
          name: 'Descuentos',
          description: 'Productos con descuentos especiales',
          type: 'special'
        }
      } else {
        // Caso normal de categoría por ID
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
        url = `/api/categories/${id}${queryString ? `?${queryString}` : ''}`
      }
      
      const { data, error: fetchError } = await useApi(url, 'GET')
      
      if (fetchError.value) {
        error.value = fetchError.value
      } else if (data.value && data.value.success) {
        if (id === 'new' || id === 'discount') {
          // Para casos especiales, los productos vienen directamente
          products.value = data.value.data.products || []
          // No hay paginación ni filtros para productos especiales
          pagination.value = null
          filters.value = { availableSizes: [], availableColors: [] }
        } else {
          // Caso normal de categoría
          category.value = data.value.data.category
          products.value = data.value.data.category.products || []
          pagination.value = data.value.data.pagination
          filters.value = data.value.data.filters
        }
      }
    } catch (err) {
      error.value = 'Error al cargar los productos'
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

  const applyFilters = async (newFilters, currentCategoryId) => {
    // Los filtros no se aplican a productos especiales (new/discount)
    if (category.value?.type === 'special') {
      return
    }
    
    appliedFilters.value = { ...appliedFilters.value, ...newFilters }
    await fetchCategoryProducts(currentCategoryId, { 
      ...appliedFilters.value, 
      page: 1 
    })
  }

  const clearFilters = async (currentCategoryId) => {
    // Los filtros no se aplican a productos especiales (new/discount)
    if (category.value?.type === 'special') {
      return
    }
    
    appliedFilters.value = {
      sizes: [],
      colors: [],
      minPrice: null,
      maxPrice: null
    }
    await fetchCategoryProducts(currentCategoryId, { page: 1 })
  }

  const changePage = async (page, currentCategoryId) => {
    // La paginación no se aplica a productos especiales (new/discount)
    if (category.value?.type === 'special') {
      return
    }
    
    await fetchCategoryProducts(currentCategoryId, { 
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