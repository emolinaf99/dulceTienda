<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js';
import { validateForm } from '@/js/composables/useValidateForm.js';

const {
  getAdminCategories,
  getAdminTypeSizes,
  toggleCategoryStatus,
  createCategory,
  updateCategory,
  deleteCategory,
  loading,
  error
} = useAdminApi();

// State
const categories = ref([]);
const typeSizes = ref([]);
const pagination = ref({});
const searchTerm = ref('');
const selectedStatus = ref('all');
const currentPage = ref(1);
const showModal = ref(false);
const modalMode = ref('create');
const selectedCategory = ref(null);
const showDeleteConfirm = ref(false);
const categoryToDelete = ref(null);

// Estado de validaciones
const formErrors = ref({});

// Form data
const categoryForm = ref({
  name: '',
  description: '',
  type_size_id: '',
  is_active: true,
  image: null
});

// Estado para manejo de imagen
const selectedFile = ref(null);
const imagePreview = ref(null);
const fileInputRef = ref(null);

// Reglas de validación para categorías
const categoryValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  description: {
    maxLength: 255
  },
  type_size_id: {
    required: true
  }
};

// Función de validación
const validateCategoryForm = () => {
  formErrors.value = validateForm(categoryForm.value, categoryValidationRules);
  return Object.keys(formErrors.value).length === 0;
};

// Methods
const loadCategories = async () => {
  const params = {
    page: currentPage.value,
    limit: 10,
    search: searchTerm.value,
    status: selectedStatus.value,
    sortBy: 'id',
    sortOrder: 'DESC'
  };

  const result = await getAdminCategories(params);
  if (result) {
    categories.value = result.data;
    pagination.value = result.pagination;
  }
};

const searchCategories = () => {
  currentPage.value = 1;
  loadCategories();
};

const resetFilters = () => {
  searchTerm.value = '';
  selectedStatus.value = 'all';
  currentPage.value = 1;
  loadCategories();
};

const changePage = (page) => {
  currentPage.value = page;
  loadCategories();
};

const openModal = (mode, category = null) => {
  modalMode.value = mode;
  selectedCategory.value = category;
  
  if (mode === 'create') {
    resetForm();
  } else if (mode === 'edit' && category) {
    populateForm(category);
  }
  
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedCategory.value = null;
  resetForm();
};

const resetForm = () => {
  categoryForm.value = {
    name: '',
    description: '',
    type_size_id: '',
    is_active: true,
    image: null
  };
  formErrors.value = {}; // Limpiar errores
  selectedFile.value = null;
  imagePreview.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const populateForm = (category) => {
  categoryForm.value = {
    name: category.name || '',
    description: category.description || '',
    type_size_id: category.type_size_id || '',
    is_active: category.is_active !== false,
    image: category.image || null
  };
  
  // Mostrar imagen existente
  if (category.image) {
    imagePreview.value = `/uploads/categories/${category.image}`;
  } else {
    imagePreview.value = null;
  }
  
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Función para manejar selección de archivo
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      mostrarNotificacion('Solo se permiten archivos de imagen (JPEG, PNG, WebP)', 0);
      event.target.value = '';
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      mostrarNotificacion('El archivo es demasiado grande. Máximo 5MB', 0);
      event.target.value = '';
      return;
    }

    selectedFile.value = file;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Función para eliminar imagen seleccionada
const removeImage = () => {
  selectedFile.value = null;
  imagePreview.value = null;
  categoryForm.value.image = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleSubmit = async () => {
  // Validar formulario antes de enviar
  if (!validateCategoryForm()) {
    mostrarNotificacion('Por favor corrige los errores en el formulario', 0);
    return;
  }

  // Crear FormData para enviar archivos
  const formData = new FormData();
  formData.append('name', categoryForm.value.name);
  formData.append('description', categoryForm.value.description || '');
  formData.append('type_size_id', categoryForm.value.type_size_id);
  formData.append('is_active', categoryForm.value.is_active);
  
  // Agregar imagen si se seleccionó una nueva
  if (selectedFile.value) {
    formData.append('image', selectedFile.value);
  } else if (categoryForm.value.image && modalMode.value === 'edit') {
    // Mantener imagen existente
    formData.append('image', categoryForm.value.image);
  }

  let result;
  if (modalMode.value === 'create') {
    result = await createCategory(formData);
  } else if (modalMode.value === 'edit') {
    result = await updateCategory(selectedCategory.value.id, formData);
  }

  if (result) {
    const successMessage = modalMode.value === 'create' ? 'Categoría creada exitosamente' : 'Categoría actualizada exitosamente';
    mostrarNotificacion(successMessage, 1);
    closeModal();
    loadCategories();
  } else {
    mostrarNotificacion(error.value || 'Error al procesar la categoría', 0);
  }
};

const handleToggleStatus = async (category) => {
  const result = await toggleCategoryStatus(category.id);
  if (result) {
    const statusMessage = result.data.is_active ? 'Categoría activada exitosamente' : 'Categoría desactivada exitosamente';
    mostrarNotificacion(statusMessage, 1);
    loadCategories();
  } else {
    mostrarNotificacion(error.value || 'Error al cambiar el estado de la categoría', 0);
  }
};

const confirmDelete = (category) => {
  categoryToDelete.value = category;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (categoryToDelete.value) {
    const result = await deleteCategory(categoryToDelete.value.id);
    if (result) {
      showDeleteConfirm.value = false;
      
      // Mostrar mensaje específico según la acción realizada
      if (result.action === 'deleted') {
        // Mostrar notificación de eliminación completa
        mostrarNotificacion('Categoría eliminada completamente', 1);
      } else if (result.action === 'deactivated') {
        // Mostrar notificación de desactivación
        mostrarNotificacion('Categoría desactivada debido a productos asociados', 1);
      } else {
        // Fallback para otros casos
        mostrarNotificacion(result.message || 'Operación realizada exitosamente', 1);
      }
      
      categoryToDelete.value = null;
      loadCategories();
    } else {
      mostrarNotificacion(error.value || 'Error al procesar la categoría', 0);
    }
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES');
};

const loadTypeSizes = async () => {
  const result = await getAdminTypeSizes();
  if (result) {
    typeSizes.value = result.data;
  }
};

// Lifecycle
onMounted(() => {
  loadCategories();
  loadTypeSizes();
});
</script>

<template>
  <div class="adminCategories">
    <!-- Header Actions -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-tags" style="margin-right: 0.5rem;"></i>
          Gestión de Categorías
        </h3>
        <button @click="openModal('create')" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Nueva Categoría
        </button>
      </div>

      <!-- Search and Filters -->
      <div class="adminSearchBar">
        <input
          v-model="searchTerm"
          @input="searchCategories"
          type="text"
          placeholder="Buscar categorías por nombre..."
        />
        
        <select v-model="selectedStatus" @change="searchCategories">
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>
        
        <button @click="resetFilters" class="adminBtn adminBtnSecondary">
          <i class="fas fa-undo"></i>
          Limpiar
        </button>
      </div>

      <p style="color: #666; margin: 1rem 0 0;">
        Mostrando {{ categories.length }} de {{ pagination.totalItems || 0 }} categorías
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="adminLoading">
      <div class="adminSpinner"></div>
    </div>

    <!-- Categories Table -->
    <div v-else-if="categories.length > 0" class="adminCard">
      <div class="adminTableWrapper">
        <table class="adminTable">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Tipo de Tallaje</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Fecha de creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>
              <strong>{{ category.name }}</strong>
            </td>
            <td>
              <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                {{ category.description || 'Sin descripción' }}
              </div>
            </td>
            <td>
              <span v-if="category.typeSize" style="background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem;">
                {{ category.typeSize.description }}
              </span>
              <span v-else style="color: #666; font-style: italic; font-size: 0.8rem;">
                Sin tallaje
              </span>
            </td>
            <td>
              <span style="background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem;">
                {{ category.productCount || 0 }} productos
              </span>
            </td>
            <td>
              <span :style="{ 
                background: category.is_active ? '#28a745' : '#dc3545',
                color: 'white',
                padding: '0.25rem 0.5rem',
                borderRadius: '3px',
                fontSize: '0.8rem'
              }">
                {{ category.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>{{ formatDate(category.created_at) }}</td>
            <td>
              <div class="adminTableActions">
                <button
                  @click="openModal('edit', category)"
                  class="adminBtn adminBtnWarning adminBtnSmall"
                  title="Editar"
                >
                  <i class="fas fa-edit"></i>
                </button>
                
                <button
                  @click="handleToggleStatus(category)"
                  :class="[
                    'adminBtn', 'adminBtnSmall',
                    category.is_active ? 'adminBtnDanger' : 'adminBtnSuccess'
                  ]"
                  :title="category.is_active ? 'Desactivar' : 'Activar'"
                >
                  <i :class="category.is_active ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
                
                <button
                  @click="confirmDelete(category)"
                  class="adminBtn adminBtnDanger adminBtnSmall"
                  title="Eliminar"
                  :disabled="category.productCount > 0"
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
      <i class="fas fa-tags" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
      <h3 style="color: #666; margin-bottom: 1rem;">No hay categorías</h3>
      <p style="color: #999; margin-bottom: 2rem;">
        {{ searchTerm || selectedStatus !== 'all' 
           ? 'No se encontraron categorías con los filtros aplicados.' 
           : 'Comienza creando tu primera categoría.' }}
      </p>
      <button @click="openModal('create')" class="adminBtn adminBtnPrimary">
        <i class="fas fa-plus"></i>
        Crear Categoría
      </button>
    </div>

    <!-- Category Modal -->
    <div v-if="showModal" class="adminModal" @click.self="closeModal">
      <div class="adminModalContent">
        <div class="adminModalHeader">
          <h3>
            <i class="fas" :class="modalMode === 'create' ? 'fa-plus' : 'fa-edit'"></i>
            {{ modalMode === 'create' ? 'Nueva Categoría' : 'Editar Categoría' }}
          </h3>
          <button @click="closeModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="adminFormGroup">
            <label>Nombre de la Categoría *</label>
            <input v-model="categoryForm.name" type="text" @blur="validateCategoryForm" />
            <div class="error" v-if="formErrors.name">
              <p>{{ formErrors.name }}</p>
            </div>
          </div>

          <div class="adminFormGroup">
            <label>Descripción</label>
            <textarea v-model="categoryForm.description" rows="3" placeholder="Descripción opcional de la categoría" @blur="validateCategoryForm"></textarea>
            <div class="error" v-if="formErrors.description">
              <p>{{ formErrors.description }}</p>
            </div>
          </div>

          <div class="adminFormGroup">
            <label>Tipo de Tallaje *</label>
            <select v-model="categoryForm.type_size_id" @change="validateCategoryForm">
              <option value="">Selecciona un tipo de tallaje</option>
              <option v-for="typeSize in typeSizes" :key="typeSize.id" :value="typeSize.id">
                {{ typeSize.description }}
              </option>
            </select>
            <div class="error" v-if="formErrors.type_size_id">
              <p>{{ formErrors.type_size_id }}</p>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Selecciona el tipo de tallaje que se utilizará para los productos de esta categoría
            </small>
          </div>

          <!-- Sección de imagen -->
          <div class="adminFormGroup">
            <label>Imagen de la Categoría</label>
            
            <!-- Preview de imagen -->
            <div v-if="imagePreview" class="imagePreviewContainer">
              <img :src="imagePreview" alt="Preview" class="imagePreview" />
              <button type="button" @click="removeImage" class="removeImageBtn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Input de archivo -->
            <div class="fileInputContainer">
              <input 
                ref="fileInputRef"
                type="file" 
                @change="handleFileSelect" 
                accept="image/jpeg,image/jpg,image/png,image/webp"
                class="fileInput"
                id="categoryImage"
              />
              <label for="categoryImage" class="fileInputLabel">
                <i class="fas fa-cloud-upload-alt"></i>
                {{ imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen' }}
              </label>
            </div>
            
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB
            </small>
          </div>

          <div style="margin: 1.5rem 0;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input v-model="categoryForm.is_active" type="checkbox" />
              Categoría activa
            </label>
          </div>

          <div class="adminModalActions">
            <button type="button" @click="closeModal" class="adminBtn adminBtnSecondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="adminBtn adminBtnPrimary" :disabled="loading">
              <i class="fas" :class="modalMode === 'create' ? 'fa-plus' : 'fa-save'"></i>
              {{ loading ? 'Guardando...' : (modalMode === 'create' ? 'Crear Categoría' : 'Actualizar Categoría') }}
            </button>
          </div>
        </form>
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
          <p>¿Qué deseas hacer con la categoría <strong>{{ categoryToDelete?.name }}</strong>?</p>
          
          <div v-if="categoryToDelete?.productCount > 0" style="background: #fff3cd; color: #856404; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
              <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
              <strong>Categoría con productos asociados</strong>
            </div>
            <p style="margin: 0; font-size: 0.9rem;">
              Esta categoría tiene <strong>{{ categoryToDelete.productCount }} producto(s)</strong> asociado(s).
              Al confirmar, la categoría será <strong>desactivada</strong> para preservar la integridad de los datos.
            </p>
          </div>
          
          <div v-else style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
              <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
              <strong>Eliminar categoría permanentemente</strong>
            </div>
            <p style="margin: 0; font-size: 0.9rem;">
              Esta categoría no tiene productos asociados y será <strong>eliminada completamente</strong>.
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div class="adminModalActions">
          <button @click="showDeleteConfirm = false" class="adminBtn adminBtnSecondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button 
            @click="handleDelete" 
            class="adminBtn adminBtnDanger" 
            :disabled="loading"
          >
            <i :class="categoryToDelete?.productCount > 0 ? 'fas fa-eye-slash' : 'fas fa-trash'"></i>
            {{ loading 
              ? (categoryToDelete?.productCount > 0 ? 'Desactivando...' : 'Eliminando...') 
              : (categoryToDelete?.productCount > 0 ? 'Desactivar Categoría' : 'Eliminar Categoría') 
            }}
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