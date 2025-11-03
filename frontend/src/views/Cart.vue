

<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import InfoAdicional from '../components/InfoAdicional.vue'
import { useCart } from '@/js/composables/useCart.js'
import { useUserStore } from '@/js/stores/userLogged.js'
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js'

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
  console.log('🖼️ Cart - Getting image for item:', item)
  console.log('🖼️ Cart - colorImages:', item?.colorImages)
  console.log('🖼️ Cart - product:', item?.product)

  // Estructura del backend (usuario autenticado)
  if (item?.product?.colorImages && item.product.colorImages.length > 0) {
    const imagePath = `/uploads/products/${item.product.colorImages[0].img}`
    console.log('🖼️ Cart - Backend image path:', imagePath)
    return imagePath
  }

  // Estructura de localStorage (usuario invitado)
  if (item?.colorImages) {
    console.log('🖼️ Cart - Searching for color_id:', item.color_id)

    // colorImages puede ser un array o un objeto
    const colorImagesArray = Array.isArray(item.colorImages)
      ? item.colorImages
      : Object.values(item.colorImages)

    if (colorImagesArray.length > 0) {
      // Buscar la imagen del color seleccionado
      const colorImage = colorImagesArray.find(ci => ci.color_id === item.color_id)
      console.log('🖼️ Cart - Found colorImage:', colorImage)

      // El backend guarda la imagen en el campo 'img' directamente
      if (colorImage && colorImage.img) {
        const imagePath = `/uploads/products/${colorImage.img}`
        console.log('🖼️ Cart - LocalStorage image path:', imagePath)
        return imagePath
      }

      // Si no se encuentra por color_id, usar la primera imagen disponible
      const firstColorImage = colorImagesArray[0]
      if (firstColorImage && firstColorImage.img) {
        const imagePath = `/uploads/products/${firstColorImage.img}`
        console.log('🖼️ Cart - Using first available image:', imagePath)
        return imagePath
      }
    }
  }

  console.log('🖼️ Cart - Using placeholder image')
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
  if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
    isUpdating.value[itemId] = true
    
    try {
      const result = await removeFromCart(itemId)
      if (result.success) {
        mostrarNotificacion('Producto eliminado del carrito', 1)
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
  <section class="sectionBolsaDeCompras">
    <div class="contenedorBolsaDeCompras">
      <h4>BOLSA DE COMPRAS</h4>
      
      <!-- Loading state -->
      <div v-if="loading" class="loadingState">
        <div class="spinner"></div>
        <p>Cargando tu carrito...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="errorState">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="loadCart" class="retryButton">Reintentar</button>
      </div>
      
      <!-- Empty cart -->
      <div v-else-if="cartItems.length === 0" class="emptyCartState">
        <div class="emptyIcon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos a tu carrito para verlos aquí</p>
        <RouterLink to="/" class="exploreButton">Explorar productos</RouterLink>
      </div>
      
      <!-- Cart with items -->
      <div v-else class="cartWidth">
        <!-- Header -->
         
        <div class="sectionProdsCart">
          <div class="productBoxCart" id="encabezadoCart">
            <div style=" width: 80px"></div>
            <div class="infoProdCartBlock">
              <div class="prodCartColumn">
                <p class="nameProdCart">Producto</p>
              </div>
              
              <div class="infoProdCart">
                <div class="cantidadProductosBlock" id="cantProdColumn">
                  <p class="precioProdCart">Cantidad</p>
                </div>
                <p class="precioProdCart precioProd">Precio</p>
                <p class="precioProdCart totalProd">Total</p>
                <div class="equisProdCart"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Cart Items -->
        <div class="sectionProdsCart" id="cajaDeProductos">
          <div 
            v-for="item in cartItems" 
            :key="item.id" 
            class="productBoxCart"
            :class="{ 'updating': isUpdating[item.id] }"
          >
            <img
              :src="getMainImage(item)"
              :alt="item.product?.name || item.name"
            >
            <div class="infoProdCartBlock">
              <div class="prodCartColumn">
                <p class="nameProdCart">{{ item.product?.name || item.name }}</p>
                <div class="variantInfo" style="margin-top: 1rem">
                  <span class="variantLabel">Color: {{ item.color?.name || item.color_name }}</span>

                </div>
                <span class="variantLabel">Talla: {{ item.size?.name || item.size_name }}</span>
              </div>
              
              <div class="infoProdCart">
                <div class="cantidadProductosBlock">
                  <div 
                    class="minusCant"
                    @click="decrementQuantity(item.id, item.quantity)"
                    :class="{ 'disabled': item.quantity <= 1 || isUpdating[item.id] }"
                  >
                    <i class="fa-solid fa-minus"></i>
                  </div>
                  <input 
                    class="cantProd" 
                    readonly 
                    :value="item.quantity"
                  >
                  <div 
                    class="plusCant"
                    @click="incrementQuantity(item.id, item.quantity)"
                    :class="{ 'disabled': isUpdating[item.id] }"
                  >
                    <i class="fa-solid fa-plus"></i>
                  </div>
                </div>
                <p class="precioProdCart precioProd">{{ formatPrice(item.unit_price || item.final_price || item.price) }}</p>
                <p class="precioProdCart totalProd">{{ formatPrice(item.total_price || (item.final_price || item.price) * item.quantity) }}</p>
                <i 
                  class="fa-solid fa-xmark equisProdCart"
                  @click="handleRemoveItem(item.id)"
                  :class="{ 'disabled': isUpdating[item.id] }"
                  title="Eliminar producto"
                ></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Subtotal -->
        <div class="sectionProdsCart" id="subtotalSection">
          <div class="subtotalBlock">
            Subtotal <span class="subtotal">{{ formatPrice(cartTotal) }}</span>
          </div>
          <RouterLink class="btnComprar" to="/checkouts">
            <div>Comprar</div>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
  <InfoAdicional></InfoAdicional>
</template>

