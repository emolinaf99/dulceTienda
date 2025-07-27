import { ref, readonly } from 'vue';

// Estado global del carrito
const cartItems = ref([]);
const loading = ref(false);
const error = ref(null);
const cartTotal = ref(0);

// Función para cargar el carrito desde el backend
const loadCart = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        cartItems.value = data.data.cart_items || [];
        cartTotal.value = data.data.total || 0;
      }
    } else if (response.status === 401) {
      // Usuario no autenticado
      cartItems.value = [];
      cartTotal.value = 0;
    } else {
      const errorData = await response.json();
      error.value = errorData.message || 'Error al cargar el carrito';
    }
  } catch (err) {
    console.error('Error loading cart:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Función para agregar producto al carrito
const addToCart = async (productData) => {
  loading.value = true;
  error.value = null;
  
  try {
    const token = localStorage.getItem('token');
    
    const requestData = {
      product_id: productData.product_id,
      quantity: productData.quantity,
      size_id: productData.size_id,
      color_id: productData.color_id
    };
    
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Recargar el carrito después de agregar
      await loadCart();
      return {
        success: true,
        message: data.message || 'Producto agregado al carrito',
        data: data.data
      };
    } else {
      // Manejar errores específicos
      if (response.status === 403) {
        error.value = 'No tienes permisos para realizar esta acción. Por favor, inicia sesión nuevamente.';
        // Limpiar token si es inválido
        if (data.message && data.message.includes('token')) {
          localStorage.removeItem('token');
        }
      } else if (response.status === 401) {
        error.value = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        localStorage.removeItem('token');
      } else {
        error.value = data.message || 'Error al agregar al carrito';
      }
      
      return {
        success: false,
        message: error.value,
        status: response.status
      };
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    error.value = err.message;
    return {
      success: false,
      message: 'Error de conexión'
    };
  } finally {
    loading.value = false;
  }
};

// Función para actualizar cantidad de un item del carrito
const updateCartItem = async (itemId, quantity) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ quantity })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Recargar el carrito después de actualizar
      await loadCart();
      return {
        success: true,
        message: data.message || 'Cantidad actualizada'
      };
    } else {
      error.value = data.message || 'Error al actualizar cantidad';
      return {
        success: false,
        message: data.message || 'Error al actualizar cantidad'
      };
    }
  } catch (err) {
    console.error('Error updating cart item:', err);
    error.value = err.message;
    return {
      success: false,
      message: 'Error de conexión'
    };
  } finally {
    loading.value = false;
  }
};

// Función para eliminar un item del carrito
const removeFromCart = async (itemId) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch(`/api/cart/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Recargar el carrito después de eliminar
      await loadCart();
      return {
        success: true,
        message: data.message || 'Producto eliminado del carrito'
      };
    } else {
      error.value = data.message || 'Error al eliminar del carrito';
      return {
        success: false,
        message: data.message || 'Error al eliminar del carrito'
      };
    }
  } catch (err) {
    console.error('Error removing from cart:', err);
    error.value = err.message;
    return {
      success: false,
      message: 'Error de conexión'
    };
  } finally {
    loading.value = false;
  }
};

// Función para vaciar el carrito
const clearCart = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await fetch('/api/cart', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      cartItems.value = [];
      cartTotal.value = 0;
      return {
        success: true,
        message: data.message || 'Carrito vacío'
      };
    } else {
      error.value = data.message || 'Error al vaciar carrito';
      return {
        success: false,
        message: data.message || 'Error al vaciar carrito'
      };
    }
  } catch (err) {
    console.error('Error clearing cart:', err);
    error.value = err.message;
    return {
      success: false,
      message: 'Error de conexión'
    };
  } finally {
    loading.value = false;
  }
};

// Computed para obtener la cantidad total de items en el carrito
const cartItemCount = () => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0);
};

// Función para verificar si un producto con variante específica está en el carrito
const isProductInCart = (productId, sizeId, colorId) => {
  return cartItems.value.find(item => 
    item.product_id === parseInt(productId) && 
    item.size_id === parseInt(sizeId) && 
    item.color_id === parseInt(colorId)
  );
};

// Función para obtener la cantidad de un producto específico en el carrito
const getProductQuantityInCart = (productId, sizeId, colorId) => {
  const item = isProductInCart(productId, sizeId, colorId);
  return item ? item.quantity : 0;
};

// Función para obtener el ID del item en el carrito
const getCartItemId = (productId, sizeId, colorId) => {
  const item = isProductInCart(productId, sizeId, colorId);
  return item ? item.id : null;
};

// Hook principal
export const useCart = () => {
  return {
    // Estado (readonly para evitar modificaciones externas)
    cartItems: readonly(cartItems),
    cartTotal: readonly(cartTotal),
    loading: readonly(loading),
    error: readonly(error),
    
    // Métodos
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartItemCount,
    isProductInCart,
    getProductQuantityInCart,
    getCartItemId
  };
};