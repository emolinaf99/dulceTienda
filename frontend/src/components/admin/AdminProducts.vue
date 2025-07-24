<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js';

const {
  getAdminProducts,
  getAdminCategories,
  getAdminSizes,
  getAdminColors,
  toggleProductStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  loading,
  error
} = useAdminApi();

// State
const products = ref([]);
const categories = ref([]);
const sizes = ref([]);
const colors = ref([]);
const pagination = ref({});
const searchTerm = ref('');
const selectedCategory = ref('all');
const selectedStatus = ref('all');
const sortBy = ref('id');
const sortOrder = ref('DESC');
const currentPage = ref(1);
const showModal = ref(false);
const modalMode = ref('create'); // create, edit, view
const selectedProduct = ref(null);
const showDeleteConfirm = ref(false);
const showDeactivateConfirm = ref(false);
const productToDelete = ref(null);

// Nuevos estados para colores y variantes
const selectedColors = ref([]);
const colorImages = ref({}); // Objeto para almacenar imágenes por color
const availableSizes = ref([]); // Tallas filtradas por categoría
const colorSizeConfig = ref({}); // Configuración de tallas por color: { colorId: { sizes: [], sku: '' } }

// Form data
const productForm = ref({
  name: '',
  description: '',
  price: '',
  discount_percentage: 0,
  category_id: '',
  sku: '',
  is_featured: false,
  is_active: true,
  variants: [], // Array de {size_id, color_id, stock}
  colorImages: [] // Array de {color_id, images}
});

// Computed
const filteredProductsCount = computed(() => pagination.value.totalItems || 0);
const apiBaseUrl = computed(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');

// Methods
const loadProducts = async () => {
  const params = {
    page: currentPage.value,
    limit: 10,
    search: searchTerm.value,
    category: selectedCategory.value,
    status: selectedStatus.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value
  };

  console.log('📤 Frontend sending params:', params);
  const result = await getAdminProducts(params);
  if (result) {
    products.value = result.data;
    pagination.value = result.pagination;
    console.log('📥 Frontend received products:', result.data.length, 'items');
  }
};

const loadCategories = async () => {
  // Cargar todas las categorías sin paginación para el formulario
  const result = await getAdminCategories({ limit: 1000 });
  if (result) {
    categories.value = result.data;
    console.log('Loaded categories:', categories.value);
  }
};

const loadSizes = async () => {
  const result = await getAdminSizes();
  if (result) {
    // El backend devuelve TypeSizes con sizes anidadas, necesitamos aplanar
    const flatSizes = [];
    result.data.forEach(typeSize => {
      if (typeSize.sizes && typeSize.sizes.length > 0) {
        typeSize.sizes.forEach(size => {
          flatSizes.push({
            id: size.id,
            name: size.name,
            type_size_id: size.type_size_id
          });
        });
      }
    });
    // Ordenar por ID ascendente
    sizes.value = flatSizes.sort((a, b) => a.id - b.id);
    console.log('Loaded and sorted sizes:', sizes.value);
  }
};

const loadColors = async () => {
  const result = await getAdminColors();
  if (result) {
    colors.value = result.data;
  }
};

const searchProducts = () => {
  console.log('🔍 Frontend searching for:', searchTerm.value);
  currentPage.value = 1;
  loadProducts();
};

const resetFilters = () => {
  searchTerm.value = '';
  selectedCategory.value = 'all';
  selectedStatus.value = 'all';
  sortBy.value = 'id';
  sortOrder.value = 'DESC';
  currentPage.value = 1;
  loadProducts();
};

const changePage = (page) => {
  currentPage.value = page;
  loadProducts();
};

const openModal = (mode, product = null) => {
  modalMode.value = mode;
  selectedProduct.value = product;
  
  if (mode === 'create') {
    resetForm();
  } else if (mode === 'edit' && product) {
    populateForm(product);
  } else if (mode === 'view' && product) {
    // Just display the product data
  }
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedProduct.value = null;
  resetForm();
};

const resetForm = () => {
  productForm.value = {
    name: '',
    description: '',
    price: '',
    discount_percentage: 0,
    category_id: '',
    is_featured: false,
    is_active: true,
    variants: [],
    colorImages: []
  };
  selectedColors.value = [];
  colorImages.value = {};
  availableSizes.value = [];
  colorSizeConfig.value = {};
};

const populateForm = (product) => {
  productForm.value = {
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    discount_percentage: product.discount_percentage || 0,
    category_id: product.category_id || '',
    is_featured: product.is_featured || false,
    is_active: product.is_active !== false,
    variants: product.variants || [],
    colorImages: product.colorImages || []
  };
  
  // Reconstruir configuración por color desde variantes existentes
  if (product.variants && product.variants.length > 0) {
    selectedColors.value = [...new Set(product.variants.map(v => v.color_id))];
    
    // Agrupar variantes por color
    const colorConfig = {};
    product.variants.forEach(variant => {
      if (!colorConfig[variant.color_id]) {
        colorConfig[variant.color_id] = {
          sizes: []
        };
      }
      colorConfig[variant.color_id].sizes.push(variant.size_id);
    });
    colorSizeConfig.value = colorConfig;
  }
  
  // Filtrar tallas por categoria al editar
  if (product.category_id) {
    filterSizesByCategory();
  }
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    
    // Validar que hay colores seleccionados
    if (selectedColors.value.length === 0) {
      mostrarNotificacion('Por favor selecciona al menos un color', 0);
      return;
    }
    
    // Preparar variantes basadas en colorSizeConfig
    const variants = [];
    let hasValidVariants = false;
    
    selectedColors.value.forEach(colorId => {
      const colorConfig = colorSizeConfig.value[colorId];
      
      if (!colorConfig?.sizes || colorConfig.sizes.length === 0) {
        mostrarNotificacion(`Por favor selecciona al menos una talla para el color ${getColorName(colorId)}`, 0);
        return;
      }
      
      colorConfig.sizes.forEach(sizeId => {
        const stockValue = document.querySelector(`#stock_${colorId}_${sizeId}`)?.value || 0;
        
        variants.push({
          size_id: sizeId,
          color_id: colorId,
          stock: parseInt(stockValue)
          // SKU se genera automáticamente en el backend
        });
        hasValidVariants = true;
      });
    });
    
    if (!hasValidVariants) {
      mostrarNotificacion('Por favor configura al menos una variante válida', 0);
      return;
    }
    
    console.log('Prepared variants:', variants);
    
    // Preparar imágenes por color
    const colorImagesData = [];
    console.log('ColorImages object:', colorImages.value);
    
    selectedColors.value.forEach(colorId => {
      if (colorImages.value[colorId] && colorImages.value[colorId].length > 0) {
        colorImagesData.push({
          color_id: colorId,
          images: colorImages.value[colorId]
        });
      }
    });
    
    console.log('Prepared color images data:', colorImagesData);
    
    // Add basic fields
    console.log('Adding basic fields to FormData:');
    Object.keys(productForm.value).forEach(key => {
      if (key !== 'variants' && key !== 'colorImages') {
        console.log(`${key}:`, productForm.value[key]);
        formData.append(key, productForm.value[key]);
      }
    });
    
    // Add variants and colorImages as JSON
    console.log('Adding variants as JSON:', JSON.stringify(variants));
    console.log('Adding colorImages as JSON:', JSON.stringify(colorImagesData));
    formData.append('variants', JSON.stringify(variants));
    formData.append('colorImages', JSON.stringify(colorImagesData));
    
    // Add images
    selectedColors.value.forEach(colorId => {
      if (colorImages.value[colorId]) {
        colorImages.value[colorId].forEach((file, index) => {
          formData.append(`images`, file);
        });
      }
    });

    let result;
    if (modalMode.value === 'create') {
      result = await createProduct(formData);
    } else if (modalMode.value === 'edit') {
      result = await updateProduct(selectedProduct.value.id, formData);
    }

    if (result) {
      const successMessage = modalMode.value === 'create' ? 'Producto creado exitosamente' : 'Producto actualizado exitosamente';
      mostrarNotificacion(successMessage, 1);
      closeModal();
      loadProducts();
    } else {
      // Si hay error en la API, mostrar notificación de error
      mostrarNotificacion(error.value || 'Error al procesar la operación', 0);
      console.error('Failed to submit product form');
    }
  } catch (err) {
    console.error('Error submitting form:', err);
    mostrarNotificacion('Error al enviar el formulario: ' + err.message, 0);
  }
};

const handleToggleStatus = async (product) => {
  const result = await toggleProductStatus(product.id);
  if (result) {
    const statusMessage = result.data.is_active ? 'Producto activado exitosamente' : 'Producto desactivado exitosamente';
    mostrarNotificacion(statusMessage, 1);
    loadProducts();
  } else {
    mostrarNotificacion(error.value || 'Error al cambiar el estado del producto', 0);
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (productToDelete.value) {
    const result = await deleteProduct(productToDelete.value.id);
    
    if (result && result.canOnlyDeactivate) {
      // Mostrar mensaje y ofrecer desactivación
      mostrarNotificacion(result.message, 0);
      
      // Cambiar de modal de eliminación a modal de desactivación
      showDeleteConfirm.value = false;
      showDeactivateConfirm.value = true;
      
    } else if (result) {
      // Eliminación exitosa
      mostrarNotificacion(result.message || 'Producto eliminado exitosamente', 1);
      showDeleteConfirm.value = false;
      productToDelete.value = null;
      loadProducts();
    }
  }
};

const handleDeactivate = async () => {
  if (productToDelete.value) {
    const deactivateResult = await deactivateProduct(productToDelete.value.id);
    if (deactivateResult) {
      mostrarNotificacion('Producto desactivado exitosamente', 1);
      showDeactivateConfirm.value = false;
      productToDelete.value = null;
      loadProducts();
    }
  }
};

const cancelDeactivate = () => {
  showDeactivateConfirm.value = false;
  productToDelete.value = null;
};

// Filtrar tallas por categoría
const filterSizesByCategory = () => {
  console.log('Filtering sizes by category...');
  console.log('Category ID:', productForm.value.category_id);
  console.log('Available categories:', categories.value);
  console.log('Available sizes:', sizes.value);
  
  if (productForm.value.category_id) {
    const category = categories.value.find(c => c.id == productForm.value.category_id);
    console.log('Selected category:', category);
    
    if (category && category.type_size_id) {
      console.log('Category type_size_id:', category.type_size_id);
      // Filtrar y mantener orden ascendente por ID
      availableSizes.value = sizes.value
        .filter(size => size.type_size_id === category.type_size_id)
        .sort((a, b) => a.id - b.id);
      console.log('Filtered and sorted sizes:', availableSizes.value);
    } else {
      console.log('No type_size_id found, showing all sizes');
      availableSizes.value = sizes.value.sort((a, b) => a.id - b.id);
    }
  } else {
    console.log('No category selected');
    availableSizes.value = [];
  }
};

// Manejar cambio de categoria
const handleCategoryChange = () => {
  filterSizesByCategory();
  // Limpiar configuración de colores ya que las tallas cambiarán
  colorSizeConfig.value = {};
};

// Manejar upload de imágenes por color
const handleColorImageChange = (colorId, event) => {
  const numericColorId = parseInt(colorId);
  const files = Array.from(event.target.files);
  colorImages.value[numericColorId] = files;
  console.log('Images selected for color:', numericColorId, 'Files:', files.length);
};

// Agregar o quitar color
const toggleColor = (colorId) => {
  const numericColorId = parseInt(colorId);
  const index = selectedColors.value.indexOf(numericColorId);
  if (index > -1) {
    selectedColors.value.splice(index, 1);
    delete colorImages.value[numericColorId];
    delete colorSizeConfig.value[numericColorId];
  } else {
    selectedColors.value.push(numericColorId);
    // Inicializar configuración para este color
    colorSizeConfig.value[numericColorId] = {
      sizes: []
    };
  }
  console.log('Toggled color:', numericColorId, 'Selected colors:', selectedColors.value);
};

// Agregar o quitar talla para un color específico
const toggleSizeForColor = (colorId, sizeId) => {
  const numericColorId = parseInt(colorId);
  const numericSizeId = parseInt(sizeId);
  
  if (!colorSizeConfig.value[numericColorId]) {
    colorSizeConfig.value[numericColorId] = { sizes: [] };
  }
  
  const sizes = colorSizeConfig.value[numericColorId].sizes;
  const index = sizes.indexOf(numericSizeId);
  
  if (index > -1) {
    sizes.splice(index, 1);
  } else {
    sizes.push(numericSizeId);
  }
  
  console.log(`Toggled size ${numericSizeId} for color ${numericColorId}:`, colorSizeConfig.value[numericColorId]);
};

// Obtener nombre del color
const getColorName = (colorId) => {
  const color = colors.value.find(c => c.id === colorId);
  return color ? color.name : 'Color';
};

// Obtener nombre de la talla
const getSizeName = (sizeId) => {
  const size = availableSizes.value.find(s => s.id === sizeId);
  return size ? size.name : 'Talla';
};

// Manejar error de carga de imagen
const handleImageError = (event) => {
  event.target.style.display = 'none';
  const container = event.target.parentNode;
  container.innerHTML = '<i class="fas fa-image" style="color: #ccc;"></i>';
};


const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(price);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES');
};

// Lifecycle
onMounted(() => {
  loadProducts();
  loadCategories();
  loadSizes();
  loadColors();
});
</script>

<template>
  <div class="adminProducts">
    <!-- Header Actions -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-box" style="margin-right: 0.5rem;"></i>
          Gestión de Productos
        </h3>
        <button @click="openModal('create')" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Nuevo Producto
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="adminSearchBar">
        <input
          v-model="searchTerm"
          @input="searchProducts"
          type="text"
          placeholder="Buscar productos por nombre, descripción o SKU..."
        />
        
        <select v-model="selectedCategory" @change="searchProducts">
          <option value="all">Todas las categorías</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        
        <select v-model="selectedStatus" @change="searchProducts">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        
        <select v-model="sortBy" @change="searchProducts">
          <option value="created_at">Fecha de creación</option>
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
          <option value="stock">Stock</option>
        </select>
        
        <select v-model="sortOrder" @change="searchProducts">
          <option value="DESC">Descendente</option>
          <option value="ASC">Ascendente</option>
        </select>
        
        <button @click="resetFilters" class="adminBtn adminBtnSecondary">
          <i class="fas fa-undo"></i>
          Limpiar
        </button>
      </div>

      <p style="color: #666; margin: 1rem 0 0;">
        Mostrando {{ products.length }} de {{ filteredProductsCount }} productos
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="adminLoading">
      <div class="adminSpinner"></div>
    </div>

    <!-- Products Table -->
    <div v-else-if="products.length > 0" class="adminCard">
      <div class="adminTableWrapper">
        <table class="adminTable">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td>
                <div style="width: 60px; height: 60px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <img 
                    v-if="product.main_image" 
                    :src="`${apiBaseUrl}${product.main_image}`"
                    :alt="product.name"
                    style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; cursor: pointer; transition: transform 0.2s ease;"
                    @mouseover="$event.target.style.transform = 'scale(1.05)'"
                    @mouseout="$event.target.style.transform = 'scale(1)'"
                    @error="handleImageError"
                  />
                  <i v-else class="fas fa-image" style="color: #ccc;"></i>
                </div>
              </td>
              <td>
                <strong>{{ product.name }}</strong>
                <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                  {{ product.description?.substring(0, 50) }}...
                </div>
                <div v-if="product.is_featured" style="margin-top: 0.25rem;">
                  <span style="background: #ffc107; color: #000; padding: 0.2rem 0.5rem; font-size: 0.7rem; border-radius: 3px;">
                    DESTACADO
                  </span>
                </div>
              </td>
              <td>{{ product.category?.name || 'Sin categoría' }}</td>
              <td>
                <div>{{ formatPrice(product.price) }}</div>
                <div v-if="product.discount_percentage > 0" style="color: #28a745; font-size: 0.8rem;">
                  -{{ product.discount_percentage }}%
                </div>
              </td>
              <td>
                <span :style="{ color: product.total_stock <= 0 ? '#dc3545' : product.total_stock <= 10 ? '#ffc107' : '#28a745' }">
                  {{ product.total_stock || 0 }}
                </span>
              </td>
              <td>
                <span :style="{ 
                  background: product.is_active ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem'
                }">
                  {{ product.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ formatDate(product.created_at) }}</td>
              <td>
                <div class="adminTableActions">
                  <button
                    @click="openModal('view', product)"
                    class="adminBtn adminBtnSecondary adminBtnSmall"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  
                  <button
                    @click="openModal('edit', product)"
                    class="adminBtn adminBtnWarning adminBtnSmall"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  
                  <button
                    @click="handleToggleStatus(product)"
                    :class="[
                      'adminBtn', 'adminBtnSmall',
                      product.is_active ? 'adminBtnDanger' : 'adminBtnSuccess'
                    ]"
                    :title="product.is_active ? 'Desactivar' : 'Activar'"
                  >
                    <i :class="product.is_active ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                  
                  <button
                    @click="confirmDelete(product)"
                    class="adminBtn adminBtnDanger adminBtnSmall"
                    title="Eliminar"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="adminPagination" v-if="pagination.totalPages > 1">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="adminPaginationBtn"
        >
          <i class="fas fa-chevron-left"></i>
          Anterior
        </button>
        
        <span style="margin: 0 1rem; color: #666;">
          Página {{ currentPage }} de {{ pagination.totalPages }}
        </span>
        
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= pagination.totalPages"
          class="adminPaginationBtn"
        >
          Siguiente
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="adminCard" style="text-align: center; padding: 3rem;">
      <i class="fas fa-box-open" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
      <h3 style="color: #666; margin-bottom: 1rem;">No hay productos</h3>
      <p style="color: #999; margin-bottom: 2rem;">
        {{ searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
           ? 'No se encontraron productos con los filtros aplicados.' 
           : 'Comienza creando tu primer producto.' }}
      </p>
      <button @click="openModal('create')" class="adminBtn adminBtnPrimary">
        <i class="fas fa-plus"></i>
        Crear Producto
      </button>
    </div>

    <!-- Product Modal -->
    <div v-if="showModal" class="adminModal" @click.self="closeModal">
      <div class="adminModalContent">
        <div class="adminModalHeader">
          <h3>
            <i class="fas" :class="{
              'fa-plus': modalMode === 'create',
              'fa-edit': modalMode === 'edit',
              'fa-eye': modalMode === 'view'
            }"></i>
            {{ modalMode === 'create' ? 'Nuevo Producto' : 
               modalMode === 'edit' ? 'Editar Producto' : 'Ver Producto' }}
          </h3>
          <button @click="closeModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" v-if="modalMode !== 'view'">
          <div class="adminFormGroup">
            <label>Nombre del Producto *</label>
            <input v-model="productForm.name" type="text" required />
          </div>

          <div class="adminFormGroup">
            <label>Descripción</label>
            <textarea v-model="productForm.description" rows="3"></textarea>
          </div>

          <div class="adminFormRow">
            <div class="adminFormGroup">
              <label>Precio *</label>
              <input v-model="productForm.price" type="number" step="0.01" required />
            </div>

            <div class="adminFormGroup">
              <label>Descuento (%)</label>
              <input v-model="productForm.discount_percentage" type="number" min="0" max="100" />
            </div>
          </div>


          <div class="adminFormGroup">
            <label>Categoría *</label>
            <select v-model="productForm.category_id" @change="handleCategoryChange" required>
              <option value="">Selecciona una categoría</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Configuración por Color -->
          <div class="adminFormGroup" v-if="colors.length > 0">
            <label>Configuración por Color *</label>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
              <label 
                v-for="color in colors" 
                :key="color.id" 
                style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9;"
                :style="{ 
                  background: selectedColors.includes(color.id) ? '#e3f2fd' : '#f9f9f9',
                  borderColor: selectedColors.includes(color.id) ? '#2196f3' : '#ddd'
                }"
              >
                <input 
                  type="checkbox" 
                  :checked="selectedColors.includes(color.id)"
                  @change="toggleColor(color.id)"
                />
                <div 
                  style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc;"
                  :style="{ backgroundColor: color.hex_code || '#ccc' }"
                ></div>
                {{ color.name }}
              </label>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Selecciona los colores disponibles para este producto
            </small>
          </div>

          <!-- Configuración Detallada por Color -->
          <div v-if="selectedColors.length > 0" style="margin-top: 1.5rem;">
            <div 
              v-for="colorId in selectedColors" 
              :key="colorId"
              style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; background: #fafafa;"
            >
              <!-- Encabezado del Color -->
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #ddd;">
                <div 
                  style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid #ccc;"
                  :style="{ backgroundColor: colors.find(c => c.id === colorId)?.hex_code || '#ccc' }"
                ></div>
                <h4 style="margin: 0; color: #333;">Configuración para {{ getColorName(colorId) }}</h4>
              </div>


              <!-- Tallas disponibles para este color -->
              <div class="adminFormGroup" v-if="availableSizes.length > 0" style="margin-bottom: 1rem;">
                <label>Tallas Disponibles para {{ getColorName(colorId) }} *</label>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                  <label 
                    v-for="size in availableSizes" 
                    :key="`${colorId}-${size.id}`" 
                    style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: white;"
                    :style="{ 
                      background: colorSizeConfig[colorId]?.sizes?.includes(size.id) ? '#e8f5e8' : 'white',
                      borderColor: colorSizeConfig[colorId]?.sizes?.includes(size.id) ? '#4caf50' : '#ddd'
                    }"
                  >
                    <input 
                      type="checkbox" 
                      :checked="colorSizeConfig[colorId]?.sizes?.includes(size.id) || false"
                      @change="toggleSizeForColor(colorId, size.id)"
                    />
                    {{ size.name }}
                  </label>
                </div>
                <small style="color: #666; display: block; margin-top: 0.5rem;">
                  Selecciona las tallas disponibles para este color específico
                </small>
              </div>

              <!-- Stock por talla para este color -->
              <div v-if="colorSizeConfig[colorId]?.sizes?.length > 0" class="adminFormGroup" style="margin-bottom: 1rem;">
                <label>Stock por Talla para {{ getColorName(colorId) }}</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin-top: 0.5rem;">
                  <div 
                    v-for="sizeId in colorSizeConfig[colorId].sizes" 
                    :key="`stock-${colorId}-${sizeId}`"
                    style="border: 1px solid #ddd; border-radius: 4px; padding: 0.75rem; background: white;"
                  >
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">
                      {{ getSizeName(sizeId) }}
                    </label>
                    <input 
                      :id="`stock_${colorId}_${sizeId}`"
                      type="number" 
                      min="0" 
                      placeholder="0"
                      style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 3px;"
                    />
                  </div>
                </div>
              </div>

              <!-- Imágenes para este color -->
              <div class="adminFormGroup">
                <label>Imágenes para {{ getColorName(colorId) }} *</label>
                <input 
                  @change="handleColorImageChange(colorId, $event)" 
                  type="file" 
                  multiple 
                  accept="image/*"
                  style="width: 100%; margin-top: 0.5rem;"
                />
                <small style="color: #666; display: block; margin-top: 0.25rem;">
                  Selecciona las imágenes para el color {{ getColorName(colorId) }} (JPG, PNG, WebP - máx. 5MB cada una)
                </small>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input v-model="productForm.is_featured" type="checkbox" />
              Producto destacado
            </label>

            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input v-model="productForm.is_active" type="checkbox" />
              Producto activo
            </label>
          </div>

          <div class="adminModalActions">
            <button type="button" @click="closeModal" class="adminBtn adminBtnSecondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="adminBtn adminBtnPrimary" :disabled="loading">
              <i class="fas" :class="modalMode === 'create' ? 'fa-plus' : 'fa-save'"></i>
              {{ loading ? 'Guardando...' : (modalMode === 'create' ? 'Crear Producto' : 'Actualizar Producto') }}
            </button>
          </div>
        </form>

        <!-- View Mode -->
        <div v-else-if="selectedProduct">
          <!-- Imagen del producto -->
          <div v-if="selectedProduct.main_image" style="text-align: center; margin-bottom: 1.5rem;">
            <img 
              :src="`${apiBaseUrl}${selectedProduct.main_image}`"
              :alt="selectedProduct.name"
              style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd;"
              @error="handleImageError"
            />
          </div>
          
          <div style="display: grid; gap: 1rem;">
            <div><strong>Nombre:</strong> {{ selectedProduct.name }}</div>
            <div><strong>Descripción:</strong> {{ selectedProduct.description }}</div>
            <div><strong>Precio:</strong> {{ formatPrice(selectedProduct.price) }}</div>
            <div><strong>Descuento:</strong> {{ selectedProduct.discount_percentage }}%</div>
            <div><strong>Stock Total:</strong> {{ selectedProduct.total_stock || 0 }}</div>
            <div v-if="selectedProduct.variants && selectedProduct.variants.length > 0" style="margin: 1rem 0;">
              <strong>Desglose por Variantes:</strong>
              <div style="margin-left: 1rem; font-size: 0.9rem;">
                <div v-for="variant in selectedProduct.variants" :key="variant.id" style="margin: 0.25rem 0;">
                  • SKU: {{ variant.sku }} - Stock: {{ variant.stock || 0 }}
                </div>
              </div>
            </div>
            <div><strong>Categoría:</strong> {{ selectedProduct.category?.name }}</div>
            <div><strong>Estado:</strong> 
              <span :style="{ color: selectedProduct.is_active ? '#28a745' : '#dc3545' }">
                {{ selectedProduct.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div><strong>Destacado:</strong> {{ selectedProduct.is_featured ? 'Sí' : 'No' }}</div>
            <div><strong>Fecha de creación:</strong> {{ formatDate(selectedProduct.created_at) }}</div>
          </div>

          <div class="adminModalActions">
            <button @click="closeModal" class="adminBtn adminBtnSecondary">
              <i class="fas fa-times"></i>
              Cerrar
            </button>
            <button @click="openModal('edit', selectedProduct)" class="adminBtn adminBtnPrimary">
              <i class="fas fa-edit"></i>
              Editar Producto
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="adminModal" @click.self="showDeleteConfirm = false">
      <div class="adminModalContent" style="max-width: 400px;">
        <div class="adminModalHeader">
          <h3 style="color: #dc3545;">
            <i class="fas fa-exclamation-triangle"></i>
            Confirmar Eliminación
          </h3>
          <button @click="showDeleteConfirm = false" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div style="padding: 1rem 0;">
          <p>¿Estás seguro de que deseas eliminar el producto <strong>{{ productToDelete?.name }}</strong>?</p>
          <p style="color: #dc3545; font-size: 0.9rem; margin-top: 1rem;">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="adminModalActions">
          <button @click="showDeleteConfirm = false" class="adminBtn adminBtnSecondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="handleDelete" class="adminBtn adminBtnDanger" :disabled="loading">
            <i class="fas fa-trash"></i>
            {{ loading ? 'Eliminando...' : 'Eliminar Producto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Deactivate Confirmation Modal -->
    <div v-if="showDeactivateConfirm" class="adminModal" @click.self="cancelDeactivate">
      <div class="adminModalContent" style="max-width: 450px;">
        <div class="adminModalHeader">
          <h3 style="color: #ffc107;">
            <i class="fas fa-exclamation-triangle"></i>
            Desactivar Producto
          </h3>
          <button @click="cancelDeactivate" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div style="padding: 1rem 0;">
          <p>El producto <strong>{{ productToDelete?.name }}</strong> no puede ser eliminado porque tiene órdenes asociadas.</p>
          <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">
            ¿Deseas desactivar el producto en su lugar? El producto seguirá existiendo pero no será visible para los clientes.
          </p>
        </div>

        <div class="adminModalActions">
          <button @click="cancelDeactivate" class="adminBtn adminBtnSecondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button @click="handleDeactivate" class="adminBtn adminBtnWarning" :disabled="loading">
            <i class="fas fa-eye-slash"></i>
            {{ loading ? 'Desactivando...' : 'Desactivar Producto' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="adminAlert adminAlertError">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>