import { ref } from 'vue';
import { useApi } from './useFetch.js';

// Cache simple para evitar peticiones repetitivas
const cache = {
  colors: null,
  sizes: null,
  typeSizes: null,
  categories: null,
  cacheTime: {},
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
};

// Composable para operaciones admin
export function useAdminApi() {
  const loading = ref(false);
  const error = ref(null);

  const clearError = () => {
    error.value = null;
  };

  const clearCache = (key) => {
    if (cache[key]) {
      cache[key] = null;
      delete cache.cacheTime[key];
    }
  };

  const isCacheValid = (key) => {
    if (!cache[key] || !cache.cacheTime[key]) return false;
    return Date.now() - cache.cacheTime[key] < cache.CACHE_DURATION;
  };

  // Dashboard
  const getDashboardStats = async () => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/dashboard/stats');
      if (apiError.value) {
        error.value = 'Error al obtener estadísticas del dashboard';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Products
  const getAdminProducts = async (params = {}) => {
    loading.value = true;
    clearError();
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/admin/products${queryString ? `?${queryString}` : ''}`;
      const { data, error: apiError } = await useApi(url);
      if (apiError.value) {
        error.value = 'Error al obtener productos';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const toggleProductStatus = async (productId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/admin/products/${productId}/toggle-status`, 'PATCH');
      if (apiError.value) {
        error.value = 'Error al cambiar estado del producto';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Categories
  const getAdminCategories = async (params = {}) => {
    loading.value = true;
    clearError();
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/admin/categories${queryString ? `?${queryString}` : ''}`;
      const { data, error: apiError } = await useApi(url);
      if (apiError.value) {
        error.value = 'Error al obtener categorías';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const toggleCategoryStatus = async (categoryId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/admin/categories/${categoryId}/toggle-status`, 'PATCH');
      if (apiError.value) {
        error.value = 'Error al cambiar estado de la categoría';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Users
  const getAdminUsers = async (params = {}) => {
    loading.value = true;
    clearError();
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`;
      const { data, error: apiError } = await useApi(url);
      if (apiError.value) {
        error.value = 'Error al obtener usuarios';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const toggleUserStatus = async (userId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/admin/users/${userId}/toggle-status`, 'PATCH');
      if (apiError.value) {
        error.value = 'Error al cambiar estado del usuario';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Sizes and Colors
  const getAdminSizes = async () => {
    // Verificar cache primero
    if (isCacheValid('sizes')) {
      return cache.sizes;
    }

    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/sizes');
      if (apiError.value) {
        error.value = 'Error al obtener tallas';
        return null;
      }
      
      // Guardar en cache
      cache.sizes = data.value;
      cache.cacheTime.sizes = Date.now();
      
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getAdminTypeSizes = async () => {
    // Verificar cache primero
    if (isCacheValid('typeSizes')) {
      return cache.typeSizes;
    }

    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/type-sizes');
      if (apiError.value) {
        error.value = 'Error al obtener tipos de talla';
        return null;
      }
      
      // Guardar en cache
      cache.typeSizes = data.value;
      cache.cacheTime.typeSizes = Date.now();
      
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getAdminColors = async () => {
    // Verificar cache primero
    if (isCacheValid('colors')) {
      return cache.colors;
    }

    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/colors');
      if (apiError.value) {
        error.value = 'Error al obtener colores';
        return null;
      }
      
      // Guardar en cache
      cache.colors = data.value;
      cache.cacheTime.colors = Date.now();
      
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // CRUD Operations using existing endpoints
  const createProduct = async (productData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/products', 'POST', productData);
      if (apiError.value) {
        // Usar el mensaje específico del backend si está disponible
        error.value = apiError.value.message || 'Error al crear producto';
        console.error('Product creation error:', apiError.value);
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      console.error('Connection error:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateProduct = async (productId, productData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/products/${productId}`, 'PUT', productData);
      if (apiError.value) {
        error.value = 'Error al actualizar producto';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteProduct = async (productId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/products/${productId}`, 'DELETE');
      if (apiError.value) {
        // Si el producto no puede ser eliminado y solo puede ser desactivado
        if (apiError.value.canOnlyDeactivate) {
          error.value = apiError.value.message;
          return { canOnlyDeactivate: true, message: apiError.value.message };
        }
        error.value = 'Error al eliminar producto';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deactivateProduct = async (productId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/products/${productId}/deactivate`, 'PATCH');
      if (apiError.value) {
        error.value = 'Error al desactivar producto';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/categories', 'POST', categoryData);
      if (apiError.value) {
        error.value = 'Error al crear categoría';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (categoryId, categoryData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/categories/${categoryId}`, 'PUT', categoryData);
      if (apiError.value) {
        error.value = 'Error al actualizar categoría';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (categoryId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/admin/categories/${categoryId}`, 'DELETE');
      if (apiError.value) {
        error.value = 'Error al eliminar categoría';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createSize = async (sizeData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/sizes', 'POST', sizeData);
      if (apiError.value) {
        error.value = 'Error al crear talla';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createTypeSize = async (typeSizeData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/type-sizes', 'POST', typeSizeData);
      if (apiError.value) {
        error.value = 'Error al crear tipo de talla';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateTypeSize = async (typeSizeId, typeSizeData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/type-sizes/${typeSizeId}`, 'PUT', typeSizeData);
      if (apiError.value) {
        error.value = 'Error al actualizar tipo de talla';
        return null;
      }
      
      // Limpiar cache relacionado después de actualizar
      clearCache('typeSizes');
      clearCache('sizes');
      
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateSize = async (sizeId, sizeData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/sizes/${sizeId}`, 'PUT', sizeData);
      if (apiError.value) {
        error.value = 'Error al actualizar talla';
        return null;
      }
      
      // Limpiar cache relacionado después de actualizar
      clearCache('sizes');
      clearCache('typeSizes');
      
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const createColor = async (colorData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/colors', 'POST', colorData);
      if (apiError.value) {
        error.value = 'Error al crear color';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateColor = async (colorId, colorData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/colors/${colorId}`, 'PUT', colorData);
      if (apiError.value) {
        error.value = 'Error al actualizar color';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteColor = async (colorId) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi(`/api/colors/${colorId}`, 'DELETE');
      if (apiError.value) {
        error.value = 'Error al eliminar color';
        return null;
      }
      return data.value;
    } catch (err) {
      error.value = 'Error de conexión';
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    clearError,
    clearCache,
    // Dashboard
    getDashboardStats,
    // Products
    getAdminProducts,
    toggleProductStatus,
    createProduct,
    updateProduct,
    deleteProduct,
    deactivateProduct,
    // Categories
    getAdminCategories,
    toggleCategoryStatus,
    createCategory,
    updateCategory,
    deleteCategory,
    // Users
    getAdminUsers,
    toggleUserStatus,
    // Sizes and Colors
    getAdminSizes,
    getAdminTypeSizes,
    getAdminColors,
    createSize,
    updateSize,
    createTypeSize,
    updateTypeSize,
    createColor,
    updateColor,
    deleteColor
  };
}