<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { useFavorites } from '@/js/composables/useFavorites.js'
import { useProducts } from '@/js/composables/useProducts.js'
import { useCart } from '@/js/composables/useCart.js'
import { useUserStore } from '@/js/stores/userLogged.js'
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js'

// Composables
const { loading: favLoading, error: favError, getFavorites, removeFromFavorites } = useFavorites()
const { getAvailableColors, getAvailableSizes, getVariantStock } = useProducts()
const { loading: cartLoading, addToCart } = useCart()
const userStore = useUserStore()

// Estado reactivo
const favorites = ref([])
const loading = ref(true)
const error = ref(null)

// Estados de selección para cada producto
const productSelections = ref({})

// Computed para verificar si el usuario está autenticado
const isAuthenticated = computed(() => userStore.isLoggedIn)

// Función para cargar favoritos
const loadFavorites = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('🔄 [WISHLIST] Iniciando carga de favoritos...', {
      isAuthenticated: isAuthenticated.value,
      hasToken: !!localStorage.getItem('token')
    });

    const favoritesData = await getFavorites()
    console.log('📦 [WISHLIST] Datos recibidos de getFavorites:', favoritesData);

    // Si no está autenticado, getFavorites devuelve solo IDs
    // Necesitamos cargar los datos completos de los productos
    if (!isAuthenticated.value && Array.isArray(favoritesData) && favoritesData.length > 0 && typeof favoritesData[0] === 'number') {
      console.log('👤 [WISHLIST] Usuario no autenticado, cargando productos por IDs...');
      // Son solo IDs, necesitamos cargar los productos
      const { getProductById } = useProducts()
      const productsPromises = favoritesData.map(id => getProductById(id))
      const products = await Promise.all(productsPromises)
      favorites.value = products.filter(p => p !== null) || []
      console.log('✅ [WISHLIST] Productos cargados:', favorites.value.length);
    } else {
      console.log('🔐 [WISHLIST] Usuario autenticado, usando datos completos del backend');
      favorites.value = favoritesData || []
      console.log('✅ [WISHLIST] Favoritos asignados:', favorites.value.length);
    }

    // Inicializar selecciones para cada producto
    initializeProductSelections()

  } catch (err) {
    console.error('❌ [WISHLIST] Error loading favorites:', err)
    error.value = 'Error al cargar la lista de favoritos'
  } finally {
    loading.value = false
  }
}

// Inicializar selecciones de productos
const initializeProductSelections = () => {
  const selections = {}
  favorites.value.forEach(product => {
    selections[product.id] = {
      selectedColor: null,
      selectedSize: null,
      quantity: 1,
      availableColors: getAvailableColors(product),
      availableSizes: []
    }
    
    // NO seleccionar automáticamente - el usuario debe elegir
    // Solo cargar los colores disponibles para que el usuario pueda elegir
    if (selections[product.id].availableColors.length > 0) {
      // Dejar que el usuario seleccione manualmente
      selections[product.id].availableSizes = []
    }
  })
  productSelections.value = selections
}

// Función para manejar cambio de color
const handleColorChange = (productId, colorId) => {
  const product = favorites.value.find(p => p.id === productId)
  if (!product) return

  const color = getAvailableColors(product).find(c => c.id === parseInt(colorId))
  if (!color) return

  // Actualizar el color seleccionado
  productSelections.value[productId].selectedColor = color
  
  // RESETEAR la talla seleccionada cuando cambia el color
  productSelections.value[productId].selectedSize = null
  
  // Cargar las tallas disponibles para este color específico
  productSelections.value[productId].availableSizes = getAvailableSizes(product, color.id)
  
  console.log(`🎨 Color seleccionado para producto ${productId}:`, color.name)
  console.log(`👕 Tallas disponibles para este color:`, productSelections.value[productId].availableSizes)
}

// Función para manejar cambio de talla
const handleSizeChange = async (productId, sizeId) => {
  const product = favorites.value.find(p => p.id === productId)
  if (!product) return

  // Si sizeId es vacío, resetear la selección
  if (!sizeId || sizeId === '') {
    productSelections.value[productId].selectedSize = null
    console.log(`👕 Talla deseleccionada para producto ${productId}`)
    return
  }

  const size = productSelections.value[productId].availableSizes.find(s => s.id === parseInt(sizeId))
  if (!size) {
    console.log(`👕 Talla no encontrada para producto ${productId}, sizeId:`, sizeId)
    console.log(`👕 Tallas disponibles:`, productSelections.value[productId].availableSizes)
    return
  }

  // Actualizar la selección
  productSelections.value[productId].selectedSize = size
  
  // Forzar actualización de la vista
  await nextTick()
  
  console.log(`👕 Talla seleccionada para producto ${productId}:`, size.name, 'ID:', size.id)
  console.log(`👕 Valor actual del select:`, productSelections.value[productId].selectedSize?.id)
  console.log(`📦 Stock disponible:`, getCurrentStock(productId))
}

// Función para obtener stock actual
const getCurrentStock = (productId) => {
  const product = favorites.value.find(p => p.id === productId)
  const selection = productSelections.value[productId]
  
  if (!product || !selection?.selectedSize || !selection?.selectedColor) return 0
  
  return getVariantStock(product, selection.selectedSize.id, selection.selectedColor.id)
}

// Función para obtener imagen principal del producto
const getMainImage = (product) => {
  if (product && product.colorImages && product.colorImages.length > 0) {
    return `/uploads/products/${product.colorImages[0].img}`
  }
  return '/img/placeholder.jpg'
}

// Función para formatear precio
const formatPrice = (price) => {
  // Validar que el precio sea un número válido
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

// Función para obtener el precio final (usa final_price del backend si existe)
const getFinalPrice = (product) => {
  if (!product) return 0

  // Usar final_price del backend si existe, de lo contrario usar price
  return product.final_price || product.price || 0
}

// Función para remover de favoritos
const handleRemoveFromFavorites = async (productId) => {
  try {
    const success = await removeFromFavorites(productId)
    if (success) {
      // Remover de la lista local
      favorites.value = favorites.value.filter(product => product.id !== productId)
      // Limpiar selección del producto
      delete productSelections.value[productId]
      mostrarNotificacion('Producto eliminado de favoritos', 1)
    } else {
      mostrarNotificacion('Error al eliminar de favoritos', 0)
    }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    mostrarNotificacion('Error al eliminar de favoritos', 0)
  }
}

// Función para agregar al carrito
const handleAddToCart = async (productId) => {
  const selection = productSelections.value[productId]
  
  // Validación estricta: color es OBLIGATORIO
  if (!selection || !selection.selectedColor || !selection.selectedColor.id) {
    mostrarNotificacion('Por favor selecciona un color', 0)
    return
  }
  
  // Validación estricta: talla es OBLIGATORIA
  if (!selection.selectedSize || !selection.selectedSize.id) {
    mostrarNotificacion('Por favor selecciona una talla', 0)
    return
  }
  
  // Validación de stock
  const stock = getCurrentStock(productId)
  if (stock === 0) {
    mostrarNotificacion('Esta combinación de color y talla no tiene stock disponible', 0)
    return
  }
  
  if (selection.quantity > stock) {
    mostrarNotificacion(`Solo hay ${stock} unidades disponibles para esta combinación`, 0)
    return
  }

  try {
    // Encontrar el producto completo
    const product = favorites.value.find(p => p.id === productId)

    if (!product) {
      mostrarNotificacion('Producto no encontrado', 0)
      return
    }

    const cartData = {
      product_id: productId,
      quantity: selection.quantity,
      size_id: selection.selectedSize.id,
      color_id: selection.selectedColor.id,
      // Datos adicionales para localStorage
      name: product.name,
      price: product.price,
      final_price: product.final_price,
      discount_percentage: product.discount_percentage,
      colorImages: product.colorImages,
      size_name: selection.selectedSize.name,
      color_name: selection.selectedColor.name,
      color_hex: selection.selectedColor.hex_code
    }

    console.log('🛒 Datos del carrito enviados desde WishList:', cartData)
    console.log('🛒 Selección completa:', selection)

    const result = await addToCart(cartData)
    
    console.log('🛒 Respuesta del servidor:', result)

    if (result.success) {
      mostrarNotificacion(result.message, 1)
    } else {
      mostrarNotificacion(result.message, 0)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    mostrarNotificacion('Error al agregar al carrito', 0)
  }
}

// Cargar favoritos al montar el componente
onMounted(async () => {
  await userStore.loadUserFromStorage()
  await loadFavorites()
})
</script>

<template>
  <section class="contenedorGeneralDeseos">
    <div class="contenedorDeseos">
      <!-- Header con icono -->
      <div class="wishListHeader">
        <i class="fa-solid fa-heart headerIcon"></i>
        <h1>Mis Favoritos</h1>
        <p class="itemCount" v-if="!loading && favorites.length > 0">
          {{ favorites.length }} {{ favorites.length === 1 ? 'producto' : 'productos' }}
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loadingState">
        <div class="spinner"></div>
        <p>Cargando tus favoritos...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="errorState">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="loadFavorites" class="retryButton">Reintentar</button>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="favorites.length === 0" class="emptyState">
        <div class="emptyIcon">
          <i class="fas fa-heart"></i>
        </div>
        <h3>Tu lista de favoritos está vacía</h3>
        <p>Explora nuestros productos y agrega tus favoritos para verlos aquí</p>
        <RouterLink to="/" class="exploreButton">
          <i class="fa-solid fa-compass"></i>
          Explorar productos
        </RouterLink>
      </div>
      
      <!-- Lista de productos favoritos -->
      <div v-else class="contenedorDeProductosLista">
        <div 
          v-for="product in favorites" 
          :key="product.id" 
          class="cajaProductoDeseo"
        >
          <!-- Botón eliminar -->
          <button 
            class="equisProductList" 
            @click="handleRemoveFromFavorites(product.id)"
            title="Eliminar de favoritos"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <!-- Imagen del producto (clickeable para ir al detalle) -->
          <RouterLink :to="`/products/${product.id}`" class="productImageLink">
            <img :src="getMainImage(product)" :alt="product.name">
          </RouterLink>
          
          <div class="bloqueInformacionProductoLista">
            <!-- Información del producto (clickeable para ir al detalle) -->
            <RouterLink :to="`/products/${product.id}`" class="productInfo">
              <p class="nameProduct">{{ product.name }}</p>
              <div class="priceContainer">
                <!-- Precio original tachado si hay descuento -->
                <p
                  v-if="product.discount_percentage > 0"
                  class="priceProduct original-price"
                >
                  {{ formatPrice(product.price) }}
                </p>
                <!-- Precio final (con descuento aplicado si existe) -->
                <p class="priceProduct" :class="{ 'discounted': product.discount_percentage > 0 }">
                  {{ formatPrice(getFinalPrice(product)) }}
                </p>
                <!-- Badge de descuento -->
                <span v-if="product.discount_percentage > 0" class="discount-badge">
                  -{{ Math.floor(product.discount_percentage) }}%
                </span>
              </div>
            </RouterLink>
            
            <!-- Selección de color -->
            <div v-if="productSelections[product.id]?.availableColors.length > 0" class="colorSelection">
              <label class="selectionLabel">
                Color: 
                <span v-if="productSelections[product.id]?.selectedColor" class="selectedValue">
                  {{ productSelections[product.id].selectedColor.name }}
                </span>
                <span v-else class="requiredField">*Requerido</span>
              </label>
              <div class="colorOptions">
                <button
                  v-for="color in productSelections[product.id].availableColors"
                  :key="color.id"
                  class="colorOption"
                  :class="{ 'selected': productSelections[product.id]?.selectedColor?.id === color.id }"
                  :style="{ backgroundColor: color.hex_code }"
                  :title="color.name"
                  @click="handleColorChange(product.id, color.id)"
                ></button>
              </div>
            </div>
            
            <!-- Selección de talla -->
            <div v-if="productSelections[product.id]?.selectedColor" class="sizeSelection">
              <label class="selectionLabel">
                Talla:
                <span v-if="productSelections[product.id]?.selectedSize" class="selectedValue">
                  {{ productSelections[product.id].selectedSize.name }}
                </span>
                <span v-else class="requiredField">*Requerido</span>
              </label>
              <select 
                :key="`size-select-${product.id}-${productSelections[product.id]?.selectedColor?.id || 'no-color'}`"
                class="selectPresentation"
                :value="productSelections[product.id]?.selectedSize?.id || ''"
                @change="handleSizeChange(product.id, $event.target.value)"
                :disabled="!productSelections[product.id]?.selectedColor"
              >
                <option value="">
                  {{ productSelections[product.id]?.availableSizes.length > 0 ? 'Selecciona talla' : 'No hay tallas disponibles para este color' }}
                </option>
                <option 
                  v-for="size in productSelections[product.id].availableSizes" 
                  :key="size.id"
                  :value="size.id"
                >
                  {{ size.name }}
                </option>
              </select>
            </div>
            
            <!-- Mensaje si no se ha seleccionado color -->
            <div v-else-if="productSelections[product.id]?.availableColors.length > 0" class="sizeSelection">
              <label class="selectionLabel">Talla:</label>
              <div class="disabledMessage">
                Primero selecciona un color
              </div>
            </div>
            
            <!-- Stock info -->
            <div v-if="productSelections[product.id]?.selectedSize && productSelections[product.id]?.selectedColor" class="stockInfo">
              <span v-if="getCurrentStock(product.id) > 0" class="inStock">
                <i class="fas fa-check-circle"></i>
                {{ getCurrentStock(product.id) }} disponibles
              </span>
              <span v-else class="outOfStock">
                <i class="fas fa-times-circle"></i>
                Sin stock
              </span>
            </div>
            
            <!-- Botón agregar al carrito -->
            <button 
              class="btnAddToCartList"
              :disabled="!productSelections[product.id]?.selectedSize || 
                         !productSelections[product.id]?.selectedColor || 
                         getCurrentStock(product.id) === 0 || 
                         cartLoading"
              @click="handleAddToCart(product.id)"
            >
              <span v-if="cartLoading">
                <i class="fas fa-spinner fa-spin"></i>
                Agregando...
              </span>
              <span v-else-if="!productSelections[product.id]?.selectedColor && !productSelections[product.id]?.selectedSize">
                Selecciona color y talla
              </span>
              <span v-else-if="!productSelections[product.id]?.selectedColor">
                Selecciona un color
              </span>
              <span v-else-if="!productSelections[product.id]?.selectedSize">
                Selecciona una talla
              </span>
              <span v-else-if="getCurrentStock(product.id) === 0">
                Sin stock para esta combinación
              </span>
              <span v-else>
                <i class="fas fa-shopping-cart"></i>
                Agregar al carrito
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>



