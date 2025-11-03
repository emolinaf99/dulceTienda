import { ref, readonly } from 'vue';

// Estado global del carrito
const cartItems = ref([]);
const loading = ref(false);
const error = ref(null);
const cartTotal = ref(0);

const CART_STORAGE_KEY = 'guest_cart';

// Helper: Verificar si el usuario está autenticado
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper: Cargar carrito desde localStorage
const loadCartFromLocalStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
    return [];
  }
};

// Helper: Guardar carrito en localStorage
const saveCartToLocalStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
};

// Helper: Calcular total del carrito
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const price = parseFloat(item.final_price || item.price || 0);
    return total + (price * item.quantity);
  }, 0);
};

// Función para cargar el carrito (backend o localStorage)
const loadCart = async () => {
  loading.value = true;
  error.value = null;

  try {
    if (isAuthenticated()) {
      // Usuario autenticado - cargar desde backend
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
        // Token inválido - cambiar a modo invitado
        cartItems.value = loadCartFromLocalStorage();
        cartTotal.value = calculateTotal(cartItems.value);
      } else {
        const errorData = await response.json();
        error.value = errorData.message || 'Error al cargar el carrito';
      }
    } else {
      // Usuario invitado - cargar desde localStorage
      cartItems.value = loadCartFromLocalStorage();
      cartTotal.value = calculateTotal(cartItems.value);
    }
  } catch (err) {
    console.error('Error loading cart:', err);
    // En caso de error, cargar desde localStorage como fallback
    cartItems.value = loadCartFromLocalStorage();
    cartTotal.value = calculateTotal(cartItems.value);
  } finally {
    loading.value = false;
  }
};

// Función para agregar producto al carrito
const addToCart = async (productData) => {
  loading.value = true;
  error.value = null;

  try {
    const requestData = {
      product_id: productData.product_id,
      quantity: productData.quantity,
      size_id: productData.size_id,
      color_id: productData.color_id
    };

    if (isAuthenticated()) {
      // Usuario autenticado - agregar al backend
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        await loadCart();
        return {
          success: true,
          message: data.message || 'Producto agregado al carrito',
          data: data.data
        };
      } else {
        if (response.status === 401 || response.status === 403) {
          // Token inválido - cambiar a modo invitado
          localStorage.removeItem('token');
          return await addToCart(productData); // Reintentar como invitado
        }

        error.value = data.message || 'Error al agregar al carrito';
        return {
          success: false,
          message: error.value,
          status: response.status
        };
      }
    } else {
      // Usuario invitado - agregar a localStorage
      const currentCart = loadCartFromLocalStorage();

      // Verificar si ya existe el producto con la misma variante
      const existingItemIndex = currentCart.findIndex(item =>
        item.product_id === requestData.product_id &&
        item.size_id === requestData.size_id &&
        item.color_id === requestData.color_id
      );

      if (existingItemIndex !== -1) {
        // Actualizar cantidad
        currentCart[existingItemIndex].quantity += requestData.quantity;
      } else {
        // Agregar nuevo item con ID temporal
        const newItem = {
          id: Date.now(), // ID temporal para invitados
          ...requestData,
          ...productData // Incluir price, final_price, name, image, etc.
        };
        currentCart.push(newItem);
      }

      saveCartToLocalStorage(currentCart);
      await loadCart();

      return {
        success: true,
        message: 'Producto agregado al carrito'
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
    if (isAuthenticated()) {
      // Usuario autenticado - actualizar en backend
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
    } else {
      // Usuario invitado - actualizar en localStorage
      const currentCart = loadCartFromLocalStorage();
      const itemIndex = currentCart.findIndex(item => item.id === itemId);

      if (itemIndex !== -1) {
        if (quantity > 0) {
          currentCart[itemIndex].quantity = quantity;
        } else {
          currentCart.splice(itemIndex, 1);
        }
        saveCartToLocalStorage(currentCart);
        await loadCart();
        return {
          success: true,
          message: 'Cantidad actualizada'
        };
      }

      return {
        success: false,
        message: 'Item no encontrado'
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
    if (isAuthenticated()) {
      // Usuario autenticado - eliminar del backend
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
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
    } else {
      // Usuario invitado - eliminar de localStorage
      const currentCart = loadCartFromLocalStorage();
      const filteredCart = currentCart.filter(item => item.id !== itemId);
      saveCartToLocalStorage(filteredCart);
      await loadCart();
      return {
        success: true,
        message: 'Producto eliminado del carrito'
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
    if (isAuthenticated()) {
      // Usuario autenticado - vaciar en backend
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
    } else {
      // Usuario invitado - vaciar localStorage
      localStorage.removeItem(CART_STORAGE_KEY);
      cartItems.value = [];
      cartTotal.value = 0;
      return {
        success: true,
        message: 'Carrito vacío'
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
