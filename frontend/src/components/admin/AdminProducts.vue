<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';

const {
  getAdminProducts,
  getAdminCategories,
  getAdminSizes,
  getAdminColors,
  toggleProductStatus,
  createProduct,
  updateProduct,
  deleteProduct,
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
const sortBy = ref('created_at');
const sortOrder = ref('DESC');
const currentPage = ref(1);
const showModal = ref(false);
const modalMode = ref('create'); // create, edit, view
const selectedProduct = ref(null);
const showDeleteConfirm = ref(false);
const productToDelete = ref(null);

// Form data
const productForm = ref({
  name: '',
  description: '',
  price: '',
  discount_percentage: 0,
  stock: '',
  category_id: '',
  sku: '',
  is_featured: false,
  is_active: true,
  sizes: [],
  colors: [],
  images: []
});

// Computed
const filteredProductsCount = computed(() => pagination.value.totalItems || 0);

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

  const result = await getAdminProducts(params);
  if (result) {
    products.value = result.data;
    pagination.value = result.pagination;
  }
};

const loadCategories = async () => {
  const result = await getAdminCategories();
  if (result) {
    categories.value = result.data;
  }
};

const loadSizes = async () => {
  const result = await getAdminSizes();
  if (result) {
    sizes.value = result.data;
  }
};

const loadColors = async () => {
  const result = await getAdminColors();
  if (result) {
    colors.value = result.data;
  }
};

const searchProducts = () => {
  currentPage.value = 1;
  loadProducts();
};

const resetFilters = () => {
  searchTerm.value = '';
  selectedCategory.value = 'all';
  selectedStatus.value = 'all';
  sortBy.value = 'created_at';
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
    stock: '',
    category_id: '',
    sku: '',
    is_featured: false,
    is_active: true,
    sizes: [],
    colors: [],
    images: []
  };
};

const populateForm = (product) => {
  productForm.value = {
    name: product.name || '',
    description: product.description || '',
    price: product.price || '',
    discount_percentage: product.discount_percentage || 0,
    stock: product.stock || '',
    category_id: product.category_id || '',
    sku: product.sku || '',
    is_featured: product.is_featured || false,
    is_active: product.is_active !== false,
    sizes: product.sizes || [],
    colors: product.colors || [],
    images: []
  };
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(productForm.value).forEach(key => {
      if (key !== 'images' && key !== 'sizes' && key !== 'colors') {
        formData.append(key, productForm.value[key]);
      }
    });
    
    // Add arrays as JSON
    formData.append('sizes', JSON.stringify(productForm.value.sizes));
    formData.append('colors', JSON.stringify(productForm.value.colors));
    
    // Add images
    productForm.value.images.forEach((file, index) => {
      formData.append(`images`, file);
    });

    let result;
    if (modalMode.value === 'create') {
      result = await createProduct(formData);
    } else if (modalMode.value === 'edit') {
      result = await updateProduct(selectedProduct.value.id, formData);
    }

    if (result) {
      closeModal();
      loadProducts();
    }
  } catch (err) {
    console.error('Error submitting form:', err);
  }
};

const handleToggleStatus = async (product) => {
  const result = await toggleProductStatus(product.id);
  if (result) {
    loadProducts();
  }
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (productToDelete.value) {
    const result = await deleteProduct(productToDelete.value.id);
    if (result) {
      showDeleteConfirm.value = false;
      productToDelete.value = null;
      loadProducts();
    }
  }
};

const handleFileChange = (event) => {
  productForm.value.images = Array.from(event.target.files);
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
                <div style="width: 60px; height: 60px; background: #f5f5f5; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-image" style="color: #ccc;"></i>
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
                <span :style="{ color: product.stock <= 0 ? '#dc3545' : product.stock <= 10 ? '#ffc107' : '#28a745' }">
                  {{ product.stock }}
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

          <div class="adminFormRow">
            <div class="adminFormGroup">
              <label>Stock *</label>
              <input v-model="productForm.stock" type="number" min="0" required />
            </div>

            <div class="adminFormGroup">
              <label>SKU</label>
              <input v-model="productForm.sku" type="text" />
            </div>
          </div>

          <div class="adminFormGroup">
            <label>Categoría *</label>
            <select v-model="productForm.category_id" required>
              <option value="">Selecciona una categoría</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="adminFormGroup">
            <label>Imágenes del Producto</label>
            <input @change="handleFileChange" type="file" multiple accept="image/*" />
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Selecciona hasta 4 imágenes (JPG, PNG, WebP - máx. 5MB cada una)
            </small>
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
          <div style="display: grid; gap: 1rem;">
            <div><strong>Nombre:</strong> {{ selectedProduct.name }}</div>
            <div><strong>Descripción:</strong> {{ selectedProduct.description }}</div>
            <div><strong>Precio:</strong> {{ formatPrice(selectedProduct.price) }}</div>
            <div><strong>Descuento:</strong> {{ selectedProduct.discount_percentage }}%</div>
            <div><strong>Stock:</strong> {{ selectedProduct.stock }}</div>
            <div><strong>SKU:</strong> {{ selectedProduct.sku }}</div>
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

    <!-- Error Alert -->
    <div v-if="error" class="adminAlert adminAlertError">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>