// Funciones para interactuar con la API del backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Función auxiliar para realizar peticiones HTTP
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Agregar token de autenticación si existe
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en fetchAPI:', error);
    throw error;
  }
};

// Función para enviar correo de contacto
export const enviarCorreoContacto = async (datosContacto) => {
  try {
    const response = await fetchAPI('/enviarCorreo', {
      method: 'POST',
      body: JSON.stringify(datosContacto),
    });

    return response;
  } catch (error) {
    console.error('Error enviando correo de contacto:', error);
    throw error;
  }
};

// Funciones de autenticación
export const auth = {
  // Registro de usuario
  register: async (userData) => {
    return await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Inicio de sesión
  login: async (credentials) => {
    const response = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Guardar token en localStorage
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    return await fetchAPI('/auth/profile');
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    return await fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Funciones de productos
export const products = {
  // Obtener todos los productos
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return await fetchAPI(`/products?${queryParams}`);
  },

  // Obtener producto por ID
  getById: async (id) => {
    return await fetchAPI(`/products/${id}`);
  },

  // Obtener productos nuevos
  getNew: async () => {
    return await fetchAPI('/products/nuevo');
  },

  // Obtener productos en rebaja
  getSale: async () => {
    return await fetchAPI('/products/rebajas');
  },
};

// Funciones del carrito
export const cart = {
  // Obtener carrito
  get: async () => {
    return await fetchAPI('/cart');
  },

  // Agregar al carrito
  add: async (item) => {
    return await fetchAPI('/cart', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Actualizar cantidad
  update: async (itemId, quantity) => {
    return await fetchAPI(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  // Eliminar del carrito
  remove: async (itemId) => {
    return await fetchAPI(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Vaciar carrito
  clear: async () => {
    return await fetchAPI('/cart', {
      method: 'DELETE',
    });
  },
};

// Funciones de favoritos
export const favorites = {
  // Obtener favoritos
  get: async () => {
    return await fetchAPI('/favorites');
  },

  // Agregar a favoritos
  add: async (productId) => {
    return await fetchAPI('/favorites', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  // Eliminar de favoritos
  remove: async (favoriteId) => {
    return await fetchAPI(`/favorites/${favoriteId}`, {
      method: 'DELETE',
    });
  },

  // Verificar si un producto está en favoritos
  check: async (productId) => {
    return await fetchAPI(`/favorites/check/${productId}`);
  },
};

// Funciones de categorías
export const categories = {
  // Obtener todas las categorías
  getAll: async (includeProducts = false) => {
    return await fetchAPI(`/categories?includeProducts=${includeProducts}`);
  },

  // Obtener categoría por ID
  getById: async (id) => {
    return await fetchAPI(`/categories/${id}`);
  },
};