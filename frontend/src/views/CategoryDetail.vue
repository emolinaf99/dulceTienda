<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoryProducts } from '@/js/composables/useCategoryProducts.js'

const route = useRoute()
const { 
  category, 
  products, 
  loading, 
  error, 
  categoryName, 
  categoryDescription,
  fetchCategoryProducts,
  formatPrice,
  calculateDiscountedPrice,
  getProductImage
} = useCategoryProducts()

onMounted(() => {
  fetchCategoryProducts(route.params.id)
})

// Observar cambios en la ruta para recargar datos
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchCategoryProducts(newId)
  }
})
</script>

<template>
  <section class="seccionElementos">
    <h4 v-if="!loading && categoryName">{{ categoryName.toUpperCase() }}</h4>
    <h4 v-else-if="loading">CARGANDO...</h4>
    <h4 v-else>CATEGORÍA</h4>
    
    <p v-if="categoryDescription" class="categoryDescription">{{ categoryDescription }}</p>
    
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!loading && products.length === 0" class="error">
      <p>No hay productos disponibles en esta categoría</p>
    </div>
    
    <div v-else class="sectionSlide">
      <div class="vitrinaSlide vitrinaSlideNuevos">
        <RouterLink 
          v-for="product in products" 
          :key="product.id" 
          :to="`/products/${product.id}`" 
          class="cajaElemento"
        >
          <img :src="getProductImage(product)" :alt="product.name">
          <div class="itemData">
            <div class="nameItem">{{ product.name }}</div>
            <div class="priceContainer">
              <div v-if="product.discount_percentage" class="priceItem discounted">
                {{ formatPrice(calculateDiscountedPrice(product.price, product.discount_percentage)) }}
              </div>
              <div 
                class="priceItem" 
                :class="{ 'original-price': product.discount_percentage }"
              >
                {{ formatPrice(product.price) }}
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.categoryDescription {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
  padding: 0 1rem;
  font-size: 14px;
}

.priceContainer {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.priceItem.discounted {
  color: #e74c3c;
  font-weight: bold;
}

.priceItem.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.vitrinaSlide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.cajaElemento {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.cajaElemento:hover {
  transform: translateY(-2px);
}

.cajaElemento img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.itemData {
  padding: 1rem;
  background: white;
}

.nameItem {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
}

@media (max-width: 768px) {
  .vitrinaSlide {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0.5rem;
  }
  
  .cajaElemento img {
    height: 150px;
  }
  
  .itemData {
    padding: 0.5rem;
  }
}
</style>