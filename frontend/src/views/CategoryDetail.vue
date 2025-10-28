<script setup>
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCategoryProducts } from '@/js/composables/useCategoryProducts.js'
import { useModal } from '@/js/composables/useModal.js'

// Definir props para recibir el ID
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const { 
  category, 
  products, 
  pagination,
  filters,
  appliedFilters,
  loading, 
  error, 
  categoryName, 
  categoryDescription,
  fetchCategoryProducts,
  formatPrice,
  calculateDiscountedPrice,
  getProductImage,
  applyFilters,
  clearFilters,
  changePage
} = useCategoryProducts()

const { isModalOpen, abrirVentana, cerrarVentana } = useModal()

// Estados locales para los filtros
const selectedSizes = ref([])
const selectedColors = ref([])
const minPrice = ref('')
const maxPrice = ref('')

onMounted(() => {
  fetchCategoryProducts(props.id)
})

// Observar cambios en el prop id para recargar datos
watch(() => props.id, (newId) => {
  if (newId) {
    resetFilters()
    fetchCategoryProducts(newId)
  }
})

const resetFilters = () => {
  selectedSizes.value = []
  selectedColors.value = []
  minPrice.value = ''
  maxPrice.value = ''
}

const handleApplyFilters = async () => {
  const filterParams = {
    sizes: selectedSizes.value,
    colors: selectedColors.value,
    minPrice: minPrice.value || null,
    maxPrice: maxPrice.value || null
  }
  await applyFilters(filterParams, props.id)
  cerrarVentana()
}

const handleClearFilters = async () => {
  resetFilters()
  await clearFilters(props.id)
  cerrarVentana()
}

const toggleSize = (sizeId) => {
  const index = selectedSizes.value.indexOf(sizeId)
  if (index > -1) {
    selectedSizes.value.splice(index, 1)
  } else {
    selectedSizes.value.push(sizeId)
  }
}

const toggleColor = (colorId) => {
  const index = selectedColors.value.indexOf(colorId)
  if (index > -1) {
    selectedColors.value.splice(index, 1)
  } else {
    selectedColors.value.push(colorId)
  }
}
</script>

<template>
  <section class="contenedorGeneralDeseos gap1rem">
    <h3 v-if="!loading && categoryName">{{ categoryName.toUpperCase() }}</h3>
    <h4 v-else-if="loading">CARGANDO...</h4>
    <h4 v-else>CATEGORÍA</h4>
    
    <p v-if="categoryDescription" class="categoryDescription">{{ categoryDescription }}</p>
    
    <!-- Botón de filtros para móvil y tablet -->
    <div class="filterButtonContainer mobile-tablet-only">
      <button @click="abrirVentana" class="filterButton">
        <span>Filtrar</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"></polygon>
        </svg>
      </button>
    </div>
    
    <div v-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!loading" class="contentContainer">
      <!-- Sidebar de filtros para desktop -->
      <aside class="filterSidebar desktop-only">
        <div class="filterSection">
          <h5>Filtros</h5>
          
          <!-- Filtro por tallas -->
          <div v-if="filters.availableSizes?.length > 0" class="filterGroup">
            <h6>Talla</h6>
            <div class="sizeGrid">
              <button 
                v-for="size in filters.availableSizes" 
                :key="size.id" 
                class="sizeButton"
                :class="{ 'selected': selectedSizes.includes(size.id) }"
                @click="toggleSize(size.id)"
              >
                {{ size.name }}
              </button>
            </div>
          </div>
          
          <!-- Filtro por colores -->
          <div v-if="filters.availableColors?.length > 0" class="filterGroup">
            <h6>Color</h6>
            <div class="colorCheckboxes">
              <label 
                v-for="color in filters.availableColors" 
                :key="color.id" 
                class="colorCheckboxOption"
                :title="color.name"
                @click="toggleColor(color.id)"
              >
                <input 
                  type="checkbox" 
                  :value="color.id" 
                  :checked="selectedColors.includes(color.id)"
                  class="colorCheckbox"
                  readonly
                >
                <span class="checkboxLabel">{{ color.name }}</span>
              </label>
            </div>
          </div>
          
          <!-- Filtro por precio -->
          <div class="filterGroup">
            <h6>Precio</h6>
            <div class="priceInputs">
              <input 
                v-model="minPrice" 
                type="number" 
                placeholder="Mín" 
                class="priceInput"
              >
              <span>-</span>
              <input 
                v-model="maxPrice" 
                type="number" 
                placeholder="Máx" 
                class="priceInput"
              >
            </div>
          </div>
          
          <!-- Botones de acción -->
          <div class="filterActions">
            <button @click="handleApplyFilters" class="btnAplicar">Aplicar</button>
            <button @click="handleClearFilters" class="btnLimpiar">Limpiar</button>
          </div>
        </div>
      </aside>
      
      <!-- Contenido principal -->
      <main class="mainContent">
        <div v-if="products.length === 0" class="noProductsMessage">
          <div class="emptyState">
            <i class="fas fa-search" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
            <h4 style="color: #666; margin-bottom: 0.5rem;">No hay productos disponibles</h4>
            <p style="color: #999; margin-bottom: 1.5rem;">
              {{ appliedFilters && Object.keys(appliedFilters).length > 0 
                ? 'No se encontraron productos con los filtros aplicados. Intenta ajustar los filtros o limpiarlos.' 
                : 'No hay productos disponibles en esta categoría en este momento.' }}
            </p>
            <button v-if="appliedFilters && Object.keys(appliedFilters).length > 0" @click="handleClearFilters" class="btnLimpiar">
              <i class="fas fa-refresh" style="margin-right: 0.5rem;"></i>
              Limpiar filtros
            </button>
          </div>
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
          
          <!-- Paginación -->
          <div v-if="pagination && pagination.totalPages > 1" class="pagination">
            <button 
              v-for="page in pagination.totalPages" 
              :key="page"
              @click="changePage(page, props.id)"
              class="pageButton"
              :class="{ active: page === pagination.currentPage }"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </main>
    </div>
    
    <!-- Modal de filtros para móvil y tablet -->
    <div v-if="isModalOpen" class="filterModal mobile-tablet-only">
      <div class="modalOverlay" @click="cerrarVentana"></div>
      <div class="modalContent">
        <div class="modalHeader">
          <h5>Filtros</h5>
          <button @click="cerrarVentana" class="closeButton">×</button>
        </div>
        
        <div class="modalBody">
          <!-- Filtro por tallas -->
          <div v-if="filters.availableSizes?.length > 0" class="filterGroup">
            <h6>Talla</h6>
            <div class="sizeGrid">
              <button 
                v-for="size in filters.availableSizes" 
                :key="size.id" 
                class="sizeButton"
                :class="{ 'selected': selectedSizes.includes(size.id) }"
                @click="toggleSize(size.id)"
              >
                {{ size.name }}
              </button>
            </div>
          </div>
          
          <!-- Filtro por colores -->
          <div v-if="filters.availableColors?.length > 0" class="filterGroup">
            <h6>Color</h6>
            <div class="colorCheckboxes">
              <label 
                v-for="color in filters.availableColors" 
                :key="color.id" 
                class="colorCheckboxOption"
                :title="color.name"
                @click="toggleColor(color.id)"
              >
                <input 
                  type="checkbox" 
                  :value="color.id" 
                  :checked="selectedColors.includes(color.id)"
                  class="colorCheckbox"
                  readonly
                >
                <span class="checkboxLabel">{{ color.name }}</span>
              </label>
            </div>
          </div>
          
          <!-- Filtro por precio -->
          <div class="filterGroup">
            <h6>Precio</h6>
            <div class="priceInputs">
              <input 
                v-model="minPrice" 
                type="number" 
                placeholder="Mín" 
                class="priceInput"
              >
              <span>-</span>
              <input 
                v-model="maxPrice" 
                type="number" 
                placeholder="Máx" 
                class="priceInput"
              >
            </div>
          </div>
        </div>
        
        <!-- Botones de acción del modal -->
        <div class="modalFooter">
          <button @click="handleClearFilters" class="btnLimpiar">Limpiar</button>
          <button @click="handleApplyFilters" class="btnAplicar">Aplicar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

.contenedorGeneralDeseos h4{
  margin: 0 !important;
}

/* Responsive display utilities */
.desktop-only {
  display: block;
}

.gap1rem {
  gap: 1rem;
  padding: 2rem 0;
}

.mobile-tablet-only {
  display: none;
}

.desktop-only {
  display: none;
}
  
.mobile-tablet-only {
  display: block;
}

/* Filter button for mobile/tablet */
.filterButtonContainer {
  text-align: center;
  margin: 1rem 0;
}

.filterButton {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #333;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.filterButton:hover {
  background: #555;
}

/* Content layout */
.contentContainer {
  display: flex;
  gap: 2rem;
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Filter sidebar for desktop */
.filterSidebar {
  width: 280px;
  flex-shrink: 0;
}

.filterSection {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  position: sticky;
  top: 1rem;
}

.filterSection h5 {
  margin: 0 0 1.5rem 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.filterGroup {
  margin-bottom: 1.5rem;
}

.filterGroup h6 {
  margin: 0 0 0.75rem 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilos para tallas en grid */
.sizeGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.sizeButton {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  transition: all 0.3s ease;
  color: #333;
}

.sizeButton:hover:not(.selected) {
  border-color: #333;
}

.sizeButton.selected {
  background: #333 !important;
  color: white !important;
  border-color: #333 !important;
}

.sizeButton:not(.selected) {
  background: white !important;
  color: #333 !important;
  border-color: #ddd !important;
}

.sizeButton:focus {
  outline: none;
}

.sizeButton:active:not(.selected) {
  background: white !important;
  border-color: #ddd !important;
}

/* Estilos para checkboxes de colores */
.colorCheckboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.colorCheckboxOption {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: none;
  background: transparent !important;
  outline: none;
}

.colorCheckboxOption:focus {
  background: transparent !important;
  outline: none;
}

.colorCheckboxOption:active {
  background: transparent !important;
}

.colorCheckboxOption * {
  background: transparent !important;
}

.colorCheckboxOption *:active {
  background: transparent !important;
}

.colorCheckboxOption *:focus {
  background: transparent !important;
}

.colorCheckboxOption:hover {
  background-color: transparent;
}

/* Estilos para checkboxes personalizados */
.colorCheckbox {
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.colorCheckbox:hover:not(:checked) {
  border-color: #333;
}

.colorCheckbox:checked {
  background: #333 !important;
  border-color: #333 !important;
}

.colorCheckbox:not(:checked) {
  background: white !important;
  border-color: #ddd !important;
}

.colorCheckbox:focus {
  outline: none;
}

.colorCheckbox:active:not(:checked) {
  background: white !important;
  border-color: #ddd !important;
}

/* Eliminar efectos nativos del navegador completamente */
.colorCheckbox::-webkit-appearance {
  display: none;
}

.colorCheckbox::-moz-appearance {
  display: none;
}

.colorCheckbox::before {
  display: none !important;
}

.colorCheckbox::after:not(.colorCheckbox:checked::after) {
  display: none !important;
}

/* Eliminar highlight azul de selección */
.colorCheckboxOption::selection {
  background: transparent;
}

.colorCheckboxOption::-moz-selection {
  background: transparent;
}

.colorCheckbox::selection {
  background: transparent;
}

.colorCheckbox::-moz-selection {
  background: transparent;
}

/* Eliminar tap highlight en móviles */
.colorCheckboxOption {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.colorCheckbox {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

.colorCheckbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.checkboxLabel {
  font-size: 14px;
  color: #333;
  text-transform: capitalize;
}

/* Estilos antiguos eliminados - ya no se usan */

.priceInputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.priceInput {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 50%;
}

.filterActions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btnAplicar, .btnLimpiar {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btnAplicar {
  background: #333;
  color: white;
}

.btnAplicar:hover {
  background: #555;
}

.btnLimpiar {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.btnLimpiar:hover {
  background: #e9ecef;
}

/* Main content */
.mainContent {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* Ajustar el contenido cuando no hay sidebar */
.contentContainer:not(:has(.filterSidebar)) .mainContent {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Estado vacío cuando no hay productos */
.noProductsMessage {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.emptyState {
  text-align: center;
  max-width: 400px;
}

.emptyState h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.emptyState p {
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.emptyState .btnLimpiar {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-size: 14px;
  font-weight: 500;
}

/* Filter modal for mobile/tablet */
.filterModal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modalOverlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modalContent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modalHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modalHeader h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.closeButton {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modalBody {
  padding: 1.5rem;
}

.modalFooter {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
}

.pageButton {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pageButton:hover {
  background: #f8f9fa;
}

.pageButton.active {
  background: #333;
  color: white;
  border-color: #333;
}

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
  grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

.cajaElemento {
  width: auto;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
  padding: 0;
}

.cajaElemento:hover {
  transform: translateY(-2px);
}

.cajaElemento img {
  width: 100%; /* La imagen ocupará todo el ancho del contenedor */ /* Define una altura estándar para todos los contenedores de imagen */
  object-fit: cover; /* Asegura que la imagen completa se ajuste dentro del contenedor */
  /* Si la imagen no tiene la misma relación de aspecto que el contenedor (por ejemplo, es más ancha o más alta),
  habrá espacio vacío (letterboxing) a los lados o arriba/abajo. */
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

.error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.modalContent {
  max-height: 90vh;
}

.modalFooter {
  flex-direction: column;
}

.pagination {
  flex-wrap: wrap;
}

@media screen and (min-width: 768px) { /* Antes max-width: 1024px  */
  .contentContainer {
    flex-direction: column;
    gap: 1rem;
  }

  .vitrinaSlide {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(33%, 1fr));
    gap: 1rem;
    padding: 1rem 0;
  }
}

@media screen and (min-width: 1280px) { /* max-width: 768px  */
  .contentContainer {
    flex-direction: row;
  }

  .vitrinaSlide {
    grid-template-columns: 33% 33% 33%;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .cajaElemento img {
    height: auto;
  }
  
  .itemData {
    padding: 0.5rem;
  }
  
  .contentContainer {
    padding: 0 0.5rem;
  }

  .mobile-tablet-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }
}

</style>