import { ref } from 'vue';
import { useApi } from './useFetch.js';

// Composable para operaciones admin
export function useAdminApi() {
  const loading = ref(false);
  const error = ref(null);

  const clearError = () => {
    error.value = null;
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
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/sizes');
      if (apiError.value) {
        error.value = 'Error al obtener tallas';
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

  const getAdminTypeSizes = async () => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/type-sizes');
      if (apiError.value) {
        error.value = 'Error al obtener tipos de talla';
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

  const getAdminColors = async () => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/admin/colors');
      if (apiError.value) {
        error.value = 'Error al obtener colores';
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

  // CRUD Operations using existing endpoints
  const createProduct = async (productData) => {
    loading.value = true;
    clearError();
    try {
      const { data, error: apiError } = await useApi('/api/products', 'POST', productData);
      if (apiError.value) {
        error.value = 'Error al crear producto';
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
      const { data, error: apiError } = await useApi(`/api/categories/${categoryId}`, 'DELETE');
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

  return {
    loading,
    error,
    clearError,
    // Dashboard
    getDashboardStats,
    // Products
    getAdminProducts,
    toggleProductStatus,
    createProduct,
    updateProduct,
    deleteProduct,
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
    createTypeSize,
    createColor
  };
}