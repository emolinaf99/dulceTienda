<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import InfoAdicional from '../components/InfoAdicional.vue'
import { useCart } from '@/js/composables/useCart.js'
import { useUserStore } from '@/js/stores/userLogged.js'
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js'
import '@/assets/css/views/Bag.css'

// Composables
const {
  cartItems,
  cartTotal,
  loading,
  error,
  loadCart,
  updateCartItem,
  removeFromCart
} = useCart()

const userStore = useUserStore()

// Estados locales
const isUpdating = ref({}) // Para trackear qué items se están actualizando

// Computed para verificar si el usuario está autenticado
const isAuthenticated = computed(() => userStore.isLoggedIn)

// Computed para contar items
const itemCount = computed(() => cartItems.value.length)

// Función para formatear precio
const formatPrice = (price) => {
  const numericPrice = parseFloat(price)
  if (isNaN(numericPrice) || numericPrice < 0) {
    return '$0'
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(numericPrice)
}

// Función para obtener imagen principal del producto
const getMainImage = (item) => {
  // Estructura del backend (usuario autenticado)
  if (item?.product?.colorImages && item.product.colorImages.length > 0) {
    return `/uploads/products/${item.product.colorImages[0].img}`
  }

  // Estructura de localStorage (usuario invitado)
  if (item?.colorImages) {
    const colorImagesArray = Array.isArray(item.colorImages)
      ? item.colorImages
      : Object.values(item.colorImages)

    if (colorImagesArray.length > 0) {
      // Buscar la imagen del color seleccionado
      const colorImage = colorImagesArray.find(ci => ci.color_id === item.color_id)

      if (colorImage && colorImage.img) {
        return `/uploads/products/${colorImage.img}`
      }

      // Si no se encuentra por color_id, usar la primera imagen disponible
      const firstColorImage = colorImagesArray[0]
      if (firstColorImage && firstColorImage.img) {
        return `/uploads/products/${firstColorImage.img}`
      }
    }
  }

  return '/img/placeholder.jpg'
}

// Función para incrementar cantidad
const incrementQuantity = async (itemId, currentQuantity) => {
  isUpdating.value[itemId] = true

  try {
    const result = await updateCartItem(itemId, currentQuantity + 1)
    if (result.success) {
      mostrarNotificacion('Cantidad actualizada', 1)
    } else {
      mostrarNotificacion(result.message, 0)
    }
  } catch (error) {
    console.error('Error incrementing quantity:', error)
    mostrarNotificacion('Error al actualizar cantidad', 0)
  } finally {
    isUpdating.value[itemId] = false
  }
}

// Función para decrementar cantidad (mínimo 1)
const decrementQuantity = async (itemId, currentQuantity) => {
  if (currentQuantity <= 1) {
    mostrarNotificacion('La cantidad mínima es 1', 0)
    return
  }

  isUpdating.value[itemId] = true

  try {
    const result = await updateCartItem(itemId, currentQuantity - 1)
    if (result.success) {
      mostrarNotificacion('Cantidad actualizada', 1)
    } else {
      mostrarNotificacion(result.message, 0)
    }
  } catch (error) {
    console.error('Error decrementing quantity:', error)
    mostrarNotificacion('Error al actualizar cantidad', 0)
  } finally {
    isUpdating.value[itemId] = false
  }
}

// Función para eliminar item del carrito
const handleRemoveItem = async (itemId) => {
  if (confirm('¿Estás seguro de que quieres eliminar este producto de tu bolsa?')) {
    isUpdating.value[itemId] = true

    try {
      const result = await removeFromCart(itemId)
      if (result.success) {
        mostrarNotificacion('Producto eliminado de tu bolsa', 1)
      } else {
        mostrarNotificacion(result.message, 0)
      }
    } catch (error) {
      console.error('Error removing item:', error)
      mostrarNotificacion('Error al eliminar producto', 0)
    } finally {
      isUpdating.value[itemId] = false
    }
  }
}

// Cargar carrito al montar el componente
onMounted(async () => {
  await userStore.loadUserFromStorage()
  await loadCart()
})
</script>

<template>
  <section class="bagSection">
    <div class="bagContainer">
      <!-- Header con icono de bolsa -->
      <div class="bagHeader">
        <i class="fa-solid fa-bag-shopping headerIcon"></i>
        <h1>Mi Bolsa de Compras</h1>
        <p class="itemCount" v-if="!loading && cartItems.length > 0">
          {{ itemCount }} {{ itemCount === 1 ? 'producto' : 'productos' }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loadingState">
        <div class="spinner"></div>
        <p>Cargando tu bolsa...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="errorState">
        <i class="fa-solid fa-exclamation-circle errorIcon"></i>
        <h3>¡Oops! Algo salió mal</h3>
        <p>{{ error }}</p>
        <button @click="loadCart" class="retryButton">
          <i class="fa-solid fa-rotate-right"></i>
          Reintentar
        </button>
      </div>

      <!-- Empty bag -->
      <div v-else-if="cartItems.length === 0" class="emptyBagState">
        <div class="emptyIcon">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <h3>Tu bolsa está vacía</h3>
        <p>Descubre nuestros productos y empieza a llenar tu bolsa</p>
        <RouterLink to="/" class="exploreButton">
          <i class="fa-solid fa-compass"></i>
          Explorar productos
        </RouterLink>
      </div>

      <!-- Bag with items -->
      <div v-else class="bagContent">
        <div class="bagGrid">
          <!-- Items list -->
          <div class="bagItems">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="bagItem"
              :class="{ 'updating': isUpdating[item.id] }"
            >
              <!-- Producto image -->
              <div class="itemImage">
                <img
                  :src="getMainImage(item)"
                  :alt="item.product?.name || item.name"
                >
              </div>

              <!-- Producto info -->
              <div class="itemInfo">
                <h3 class="itemName">{{ item.product?.name || item.name }}</h3>

                <div class="itemVariants">
                  <span class="variantBadge">
                    <i class="fa-solid fa-palette"></i>
                    {{ item.color?.name || item.color_name }}
                  </span>
                  <span class="variantBadge">
                    <i class="fa-solid fa-ruler"></i>
                    Talla {{ item.size?.name || item.size_name }}
                  </span>
                </div>

                <div class="itemPrice">
                  <span class="priceLabel">Precio unitario:</span>
                  <span class="price">{{ formatPrice(item.unit_price || item.final_price || item.price) }}</span>
                </div>
              </div>

              <!-- Cantidad y acciones -->
              <div class="itemActions">
                <div class="quantityControl">
                  <button
                    class="quantityBtn"
                    @click="decrementQuantity(item.id, item.quantity)"
                    :disabled="item.quantity <= 1 || isUpdating[item.id]"
                    :class="{ 'disabled': item.quantity <= 1 || isUpdating[item.id] }"
                  >
                    <i class="fa-solid fa-minus"></i>
                  </button>

                  <input
                    class="quantityInput"
                    readonly
                    :value="item.quantity"
                  >

                  <button
                    class="quantityBtn"
                    @click="incrementQuantity(item.id, item.quantity)"
                    :disabled="isUpdating[item.id]"
                    :class="{ 'disabled': isUpdating[item.id] }"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>

                <div class="itemTotal">
                  <span class="totalLabel">Total:</span>
                  <span class="totalPrice">{{ formatPrice(item.total_price || (item.final_price || item.price) * item.quantity) }}</span>
                </div>

                <button
                  class="removeBtn"
                  @click="handleRemoveItem(item.id)"
                  :disabled="isUpdating[item.id]"
                  title="Eliminar de la bolsa"
                >
                  <i class="fa-solid fa-trash-can"></i>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Summary sidebar -->
          <div class="bagSummary">
            <div class="summaryCard">
              <h3 class="summaryTitle">
                <i class="fa-solid fa-file-invoice"></i>
                Resumen del pedido
              </h3>

              <div class="summaryRow">
                <span>Subtotal ({{ itemCount }} {{ itemCount === 1 ? 'producto' : 'productos' }})</span>
                <span class="summaryValue">{{ formatPrice(cartTotal) }}</span>
              </div>

              <div class="summaryRow">
                <span>Envío</span>
                <span class="summaryValue free">Calculado en checkout</span>
              </div>

              <div class="summaryDivider"></div>

              <div class="summaryRow total">
                <span>Total</span>
                <span class="summaryValue">{{ formatPrice(cartTotal) }}</span>
              </div>

              <RouterLink class="checkoutBtn" to="/checkouts">
                <i class="fa-solid fa-lock"></i>
                Proceder al pago
              </RouterLink>

              <RouterLink to="/" class="continueShopping">
                <i class="fa-solid fa-arrow-left"></i>
                Continuar comprando
              </RouterLink>
            </div>

            <!-- Trust badges -->
            <div class="trustBadges">
              <div class="trustItem">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Compra segura</span>
              </div>
              <div class="trustItem">
                <i class="fa-solid fa-truck-fast"></i>
                <span>Envío rápido</span>
              </div>
              <div class="trustItem">
                <i class="fa-solid fa-rotate-left"></i>
                <span>Devoluciones fáciles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <InfoAdicional></InfoAdicional>
</template>
