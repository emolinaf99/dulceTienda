import { ref } from 'vue'
import { useApi } from './useFetch.js'

const FAVORITES_STORAGE_KEY = 'guest_favorites';

// Helper: Verificar si el usuario está autenticado
// IMPORTANTE: El token está en cookies httpOnly, NO en localStorage
// Usamos 'authToken' como indicador de sesión activa
const isAuthenticated = () => {
  const authToken = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  return !!(authToken && user);
};

// Helper: Cargar favoritos desde localStorage
const loadFavoritesFromLocalStorage = () => {
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  } catch (err) {
    console.error('Error loading favorites from localStorage:', err);
    return [];
  }
};

// Helper: Guardar favoritos en localStorage
const saveFavoritesToLocalStorage = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Error saving favorites to localStorage:', err);
  }
};

export function useFavorites() {
  const loading = ref(false)
  const error = ref(null)

  // Verificar si un producto está en favoritos
  const isProductInFavorites = async (productId) => {
    loading.value = true
    error.value = null

    try {
      if (isAuthenticated()) {
        // Usuario autenticado - verificar en backend
        const { data, error: fetchError } = await useApi(`/api/favorites/check/${productId}`, 'GET')

        if (fetchError.value) {
          // Si es error 401 o 403, cambiar a modo invitado
          if (fetchError.value.includes('401') || fetchError.value.includes('403')) {
            console.log('Usuario no autenticado, verificando en localStorage')
            const localFavorites = loadFavoritesFromLocalStorage();
            return localFavorites.includes(parseInt(productId));
          }
          error.value = fetchError.value
          return false
        }

        return data.value?.success && data.value?.data?.is_favorite
      } else {
        // Usuario invitado - verificar en localStorage
        const localFavorites = loadFavoritesFromLocalStorage();
        return localFavorites.includes(parseInt(productId));
      }
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
      if (isAuthenticated()) {
        // Usuario autenticado - agregar al backend
        const { data, error: fetchError } = await useApi('/api/favorites', 'POST', {
          product_id: productId
        })

        if (fetchError.value) {
          // Si es error de autenticación, cambiar a modo invitado
          if (fetchError.value.includes('401') || fetchError.value.includes('403')) {
            localStorage.removeItem('token');
            return await addToFavorites(productId); // Reintentar como invitado
          }
          error.value = fetchError.value
          return false
        }

        return data.value?.success
      } else {
        // Usuario invitado - agregar a localStorage
        const localFavorites = loadFavoritesFromLocalStorage();
        if (!localFavorites.includes(parseInt(productId))) {
          localFavorites.push(parseInt(productId));
          saveFavoritesToLocalStorage(localFavorites);
        }
        return true;
      }
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
      if (isAuthenticated()) {
        // Usuario autenticado - eliminar del backend
        const { data, error: fetchError } = await useApi(`/api/favorites/product/${productId}`, 'DELETE')

        if (fetchError.value) {
          error.value = fetchError.value
          return false
        }

        return data.value?.success
      } else {
        // Usuario invitado - eliminar de localStorage
        const localFavorites = loadFavoritesFromLocalStorage();
        const filteredFavorites = localFavorites.filter(id => id !== parseInt(productId));
        saveFavoritesToLocalStorage(filteredFavorites);
        return true;
      }
    } catch (err) {
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  // Toggle favorito (agregar o quitar)
  const toggleFavorite = async (productId) => {
    const isFavorite = await isProductInFavorites(productId)

    if (isFavorite) {
      return await removeFromFavorites(productId)
    } else {
      return await addToFavorites(productId)
    }
  }

  // Obtener todos los favoritos
  const getFavorites = async () => {
    loading.value = true
    error.value = null

    try {
      if (isAuthenticated()) {
        // Usuario autenticado - obtener del backend
        console.log('🔍 [FAVORITES] Obteniendo favoritos del backend...');
        const { data, error: fetchError } = await useApi('/api/favorites', 'GET')

        if (fetchError.value) {
          console.error('❌ [FAVORITES] Error obteniendo favoritos:', fetchError.value);
          // Si es error de autenticación, usar localStorage
          if (fetchError.value.includes('401') || fetchError.value.includes('403')) {
            const localFavorites = loadFavoritesFromLocalStorage();
            console.log('📦 [FAVORITES] Fallback a localStorage:', localFavorites);
            return localFavorites;
          }
          error.value = fetchError.value
          return []
        }

        // El backend devuelve un array de objetos favorite con un campo product
        // Necesitamos extraer solo los productos
        const favoritesArray = data.value?.data?.favorites || []
        console.log('✅ [FAVORITES] Favoritos del backend:', favoritesArray.length, 'items');
        const products = favoritesArray.map(fav => fav.product)
        console.log('📦 [FAVORITES] Productos extraídos:', products);
        return products
      } else {
        // Usuario invitado - obtener de localStorage
        // Solo devolver los IDs, ya que no tenemos los detalles completos
        const localFavorites = loadFavoritesFromLocalStorage();
        return localFavorites;
      }
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
    getFavorites
  }
}
