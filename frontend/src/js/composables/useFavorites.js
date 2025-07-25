import { ref } from 'vue'
import { useApi } from './useFetch.js'

export function useFavorites() {
  const loading = ref(false)
  const error = ref(null)

  // Verificar si un producto está en favoritos
  const isProductInFavorites = async (productId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useApi(`/api/favorites/check/${productId}`, 'GET')
      
      if (fetchError.value) {
        // Si es error 401 o 403, el usuario no está autenticado o no tiene permisos
        if (fetchError.value.includes('401') || fetchError.value.includes('403')) {
          console.log('Usuario no autenticado para verificar favoritos')
          return false
        }
        error.value = fetchError.value
        return false
      }
      
      return data.value?.success && data.value?.data?.is_favorite
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Agregar producto a favoritos
  const addToFavorites = async (productId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useApi('/api/favorites', 'POST', {
        product_id: productId
      })
      
      if (fetchError.value) {
        error.value = fetchError.value
        return false
      }
      
      return data.value?.success
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Quitar producto de favoritos
  const removeFromFavorites = async (productId) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useApi(`/api/favorites/product/${productId}`, 'DELETE')
      
      if (fetchError.value) {
        error.value = fetchError.value
        return false
      }
      
      return data.value?.success
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Toggle favorito (agregar/quitar)
  const toggleFavorite = async (productId) => {
    const isFavorite = await isProductInFavorites(productId)
    
    if (isFavorite) {
      return await removeFromFavorites(productId)
    } else {
      return await addToFavorites(productId)
    }
  }

  // Obtener todos los favoritos del usuario
  const getUserFavorites = async () => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await useApi('/api/favorites', 'GET')
      
      if (fetchError.value) {
        error.value = fetchError.value
        return []
      }
      
      return data.value?.success ? data.value.data.favorites : []
    } catch (err) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    isProductInFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getUserFavorites
  }
}