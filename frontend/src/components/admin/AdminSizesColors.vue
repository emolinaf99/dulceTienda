<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js';
import { validateForm } from '@/js/composables/useValidateForm.js';

const {
  getAdminSizes,
  getAdminTypeSizes,
  getAdminColors,
  createSize,
  updateSize,
  createTypeSize,
  updateTypeSize,
  createColor,
  updateColor,
  deleteColor,
  clearCache,
  loading,
  error
} = useAdminApi();

// State
const sizesGroupedByType = ref([]);
const typeSizes = ref([]);
const colors = ref([]);
const showSizeModal = ref(false);
const showTypeSizeModal = ref(false);
const showColorModal = ref(false);
const showDeleteConfirm = ref(false);
const colorToDelete = ref(null);
const colorModalMode = ref('create'); // create, edit
const typeSizeModalMode = ref('create'); // create, edit
const sizeModalMode = ref('create'); // create, edit
const selectedTypeSize = ref(null);
const selectedSize = ref(null);

// Estado de validaciones
const sizeFormErrors = ref({});
const typeSizeFormErrors = ref({});
const colorFormErrors = ref({});

// Form data
const sizeForm = ref({
  name: '',
  type_size_id: ''
});

const typeSizeForm = ref({
  description: ''
});

const colorForm = ref({
  name: '',
  hex_code: '#000000'
});

// Reglas de validación
const sizeValidationRules = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 10
  },
  type_size_id: {
    required: true
  }
};

const typeSizeValidationRules = {
  description: {
    required: true,
    minLength: 2,
    maxLength: 50
  }
};

const colorValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 30
  },
  hex_code: {
    required: true
  }
};

// Funciones de validación
const validateSizeForm = () => {
  sizeFormErrors.value = validateForm(sizeForm.value, sizeValidationRules);
  return Object.keys(sizeFormErrors.value).length === 0;
};

const validateTypeSizeForm = () => {
  typeSizeFormErrors.value = validateForm(typeSizeForm.value, typeSizeValidationRules);
  return Object.keys(typeSizeFormErrors.value).length === 0;
};

const validateColorForm = () => {
  colorFormErrors.value = validateForm(colorForm.value, colorValidationRules);
  return Object.keys(colorFormErrors.value).length === 0;
};

// Methods
const loadSizes = async () => {
  const result = await getAdminSizes();
  if (result) {
    // Ordenar tipos de talla por ID y dentro de cada tipo ordenar tallas por ID
    const sortedData = result.data
      .sort((a, b) => a.id - b.id) // Ordenar tipos por ID ascendente
      .map(typeSize => ({
        ...typeSize,
        sizes: typeSize.sizes ? typeSize.sizes.sort((a, b) => a.id - b.id) : [] // Ordenar tallas por ID ascendente
      }));
    sizesGroupedByType.value = sortedData;
  }
};

const loadTypeSizes = async () => {
  const result = await getAdminTypeSizes();
  if (result) {
    // Ordenar tipos de talla por ID ascendente
    typeSizes.value = result.data.sort((a, b) => a.id - b.id);
  }
};

const loadColors = async () => {
  const result = await getAdminColors();
  if (result) {
    // Ordenar colores por ID ascendente
    colors.value = result.data.sort((a, b) => a.id - b.id);
  }
};

const openSizeModal = (mode = 'create', size = null) => {
  sizeModalMode.value = mode;
  selectedSize.value = size;
  
  if (mode === 'edit' && size) {
    sizeForm.value = {
      name: size.name || '',
      type_size_id: size.type_size_id || ''
    };
  } else {
    resetSizeForm();
  }
  
  showSizeModal.value = true;
};

const closeSizeModal = () => {
  showSizeModal.value = false;
  selectedSize.value = null;
  resetSizeForm();
};

const resetSizeForm = () => {
  sizeForm.value = {
    name: '',
    type_size_id: ''
  };
  sizeFormErrors.value = {}; // Limpiar errores
};

const openTypeSizeModal = (mode = 'create', typeSize = null) => {
  typeSizeModalMode.value = mode;
  selectedTypeSize.value = typeSize;
  
  if (mode === 'edit' && typeSize) {
    typeSizeForm.value = {
      description: typeSize.description || ''
    };
  } else {
    resetTypeSizeForm();
  }
  
  showTypeSizeModal.value = true;
};

const closeTypeSizeModal = () => {
  showTypeSizeModal.value = false;
  selectedTypeSize.value = null;
  resetTypeSizeForm();
};

const resetTypeSizeForm = () => {
  typeSizeForm.value = {
    description: ''
  };
  typeSizeFormErrors.value = {}; // Limpiar errores
};

const handleSizeSubmit = async () => {
  // Validar formulario antes de enviar
  if (!validateSizeForm()) {
    mostrarNotificacion('Por favor corrige los errores en el formulario', 0);
    return;
  }

  let result;
  
  if (sizeModalMode.value === 'create') {
    result = await createSize(sizeForm.value);
  } else if (sizeModalMode.value === 'edit') {
    result = await updateSize(selectedSize.value.id, sizeForm.value);
  }
  
  if (result) {
    const successMessage = sizeModalMode.value === 'create' ? 'Talla creada exitosamente' : 'Talla actualizada exitosamente';
    mostrarNotificacion(successMessage, 1);
    
    // Limpiar cache para asegurar datos frescos
    clearCache('sizes');
    clearCache('typeSizes');
    
    closeSizeModal();
    // Recargar datos para mostrar los cambios
    await loadSizes();
    await loadTypeSizes();
  } else {
    mostrarNotificacion(error.value || 'Error al procesar la talla', 0);
  }
};

const handleTypeSizeSubmit = async () => {
  // Validar formulario antes de enviar
  if (!validateTypeSizeForm()) {
    mostrarNotificacion('Por favor corrige los errores en el formulario', 0);
    return;
  }

  console.log('=== HANDLE TYPE SIZE SUBMIT START ===');
  console.log('Mode:', typeSizeModalMode.value);
  console.log('Selected TypeSize:', selectedTypeSize.value);
  console.log('Form data:', typeSizeForm.value);
  
  let result;
  
  if (typeSizeModalMode.value === 'create') {
    console.log('Creating new type size...');
    result = await createTypeSize(typeSizeForm.value);
  } else if (typeSizeModalMode.value === 'edit') {
    console.log('Updating type size with ID:', selectedTypeSize.value?.id);
    result = await updateTypeSize(selectedTypeSize.value.id, typeSizeForm.value);
  }
  
  console.log('API result:', result);
  
  if (result) {
    const successMessage = typeSizeModalMode.value === 'create' ? 'Tipo de talla creado exitosamente' : 'Tipo de talla actualizado exitosamente';
    mostrarNotificacion(successMessage, 1);
    
    console.log('Type size operation successful, clearing cache and reloading data...');
    
    // Limpiar cache manualmente para asegurar datos frescos
    clearCache('typeSizes');
    clearCache('sizes');
    
    console.log('Cache cleared, closing modal...');
    closeTypeSizeModal();
    
    console.log('Modal closed, reloading data...');
    // Recargar datos de forma secuencial para asegurar la actualización
    await loadTypeSizes();
    await loadSizes();
    console.log('Data reloaded successfully');
  } else {
    console.error('Type size operation failed');
    mostrarNotificacion(error.value || 'Error al procesar el tipo de talla', 0);
  }
  
  console.log('=== HANDLE TYPE SIZE SUBMIT END ===');
};

const openColorModal = (mode = 'create', color = null) => {
  colorModalMode.value = mode;
  resetColorForm();
  
  if (mode === 'edit' && color) {
    colorForm.value = {
      name: color.name,
      hex_code: color.hex_code
    };
  }
  
  showColorModal.value = true;
};

const closeColorModal = () => {
  showColorModal.value = false;
  resetColorForm();
};

const resetColorForm = () => {
  colorForm.value = {
    name: '',
    hex_code: '#000000'
  };
  colorFormErrors.value = {}; // Limpiar errores
};

const handleColorSubmit = async () => {
  // Validar formulario antes de enviar
  if (!validateColorForm()) {
    mostrarNotificacion('Por favor corrige los errores en el formulario', 0);
    return;
  }

  let result;
  
  if (colorModalMode.value === 'create') {
    result = await createColor(colorForm.value);
  } else if (colorModalMode.value === 'edit') {
    result = await updateColor(selectedColor.value.id, colorForm.value);
  }
  
  if (result) {
    const successMessage = colorModalMode.value === 'create' ? 'Color creado exitosamente' : 'Color actualizado exitosamente';
    mostrarNotificacion(successMessage, 1);
    closeColorModal();
    loadColors();
  } else {
    mostrarNotificacion(error.value || 'Error al procesar el color', 0);
  }
};

// Agregar selectedColor para edición
const selectedColor = ref(null);

const confirmDeleteColor = (color) => {
  colorToDelete.value = color;
  showDeleteConfirm.value = true;
};

const handleDeleteColor = async () => {
  if (colorToDelete.value) {
    const result = await deleteColor(colorToDelete.value.id);
    if (result) {
      mostrarNotificacion('Color eliminado exitosamente', 1);
      showDeleteConfirm.value = false;
      colorToDelete.value = null;
      loadColors();
    } else {
      mostrarNotificacion(error.value || 'Error al eliminar el color', 0);
    }
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  colorToDelete.value = null;
};

const editColor = (color) => {
  selectedColor.value = color;
  openColorModal('edit', color);
};

// Lifecycle
onMounted(() => {
  loadSizes();
  loadTypeSizes();
  loadColors();
});
</script>

<template>
  <div class="adminSizesColors">
    <!-- Type Sizes Section -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-layer-group" style="margin-right: 0.5rem;"></i>
          Tipos de Tallas
        </h3>
        <button @click="openTypeSizeModal" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Nuevo Tipo
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="adminLoading">
        <div class="adminSpinner"></div>
      </div>

      <!-- Type Sizes Grid -->
      <div v-else-if="typeSizes.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <div
          v-for="typeSize in typeSizes"
          :key="typeSize.id"
          style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #e0e0e0; position: relative;"
        >
          <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
            {{ typeSize.description }}
          </div>
          <div style="font-size: 0.8rem; color: #999; margin-bottom: 1rem;">
            ID: {{ typeSize.id }}
          </div>
          
          <!-- Botones de acción -->
          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button 
              @click="openTypeSizeModal('edit', typeSize)"
              class="adminBtn adminBtnWarning adminBtnSmall"
              title="Editar tipo de talla"
            >
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State for Type Sizes -->
      <div v-else style="text-align: center; padding: 2rem;">
        <i class="fas fa-layer-group" style="font-size: 2rem; color: #ddd; margin-bottom: 1rem;"></i>
        <h4 style="color: #666; margin-bottom: 1rem;">No hay tipos de talla registrados</h4>
        <button @click="openTypeSizeModal" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Crear Primer Tipo
        </button>
      </div>
    </div>

    <!-- Sizes by Type Section -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-ruler" style="margin-right: 0.5rem;"></i>
          Tallas por Tipo
        </h3>
        <button @click="openSizeModal" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Nueva Talla
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="adminLoading">
        <div class="adminSpinner"></div>
      </div>

      <!-- Sizes Grouped by Type -->
      <div v-else-if="sizesGroupedByType.length > 0" style="margin-top: 1rem;">
        <div 
          v-for="typeSize in sizesGroupedByType"
          :key="typeSize.id"
          style="margin-bottom: 2rem; background: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;"
        >
          <!-- Type Header -->
          <div style="background: #333; color: white; padding: 1rem; font-weight: bold; font-size: 1.1rem;">
            <i class="fas fa-layer-group" style="margin-right: 0.5rem;"></i>
            {{ typeSize.description }}
            <span style="font-size: 0.8rem; opacity: 0.8; margin-left: 1rem;">
              {{ typeSize.sizes ? typeSize.sizes.length : 0 }} tallas
            </span>
          </div>
          
          <!-- Sizes Grid for this Type -->
          <div v-if="typeSize.sizes && typeSize.sizes.length > 0" style="padding: 1rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
              <div
                v-for="size in typeSize.sizes"
                :key="size.id"
                style="background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center; border: 1px solid #e0e0e0; transition: transform 0.2s ease; position: relative;"
              >
                <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                  {{ size.name }}
                </div>
                <div style="font-size: 0.7rem; color: #999; margin-bottom: 0.75rem;">
                  ID: {{ size.id }}
                </div>
                
                <!-- Botón de editar -->
                <div style="display: flex; justify-content: center;">
                  <button 
                    @click="openSizeModal('edit', size)"
                    class="adminBtn adminBtnWarning adminBtnSmall"
                    title="Editar talla"
                    style="font-size: 0.7rem; padding: 0.25rem 0.5rem;"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Empty State for Type -->
          <div v-else style="padding: 2rem; text-align: center; color: #666;">
            <i class="fas fa-ruler" style="font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
            <p style="margin: 0; font-size: 0.9rem;">No hay tallas para este tipo</p>
          </div>
        </div>
      </div>

      <!-- Empty State for All Sizes -->
      <div v-else style="text-align: center; padding: 2rem;">
        <i class="fas fa-ruler" style="font-size: 2rem; color: #ddd; margin-bottom: 1rem;"></i>
        <h4 style="color: #666; margin-bottom: 1rem;">No hay tallas registradas</h4>
        <p style="color: #999; margin-bottom: 1.5rem;">Primero crea tipos de talla, luego podrás añadir tallas específicas</p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button @click="openTypeSizeModal" class="adminBtn adminBtnSecondary">
            <i class="fas fa-layer-group"></i>
            Crear Tipo de Talla
          </button>
          <button @click="openSizeModal" class="adminBtn adminBtnPrimary" :disabled="typeSizes.length === 0">
            <i class="fas fa-plus"></i>
            Crear Talla
          </button>
        </div>
      </div>
    </div>

    <!-- Colors Section -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-palette" style="margin-right: 0.5rem;"></i>
          Gestión de Colores
        </h3>
        <button @click="openColorModal" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Nuevo Color
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="adminLoading">
        <div class="adminSpinner"></div>
      </div>

      <!-- Colors Grid -->
      <div v-else-if="colors.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <div
          v-for="color in colors"
          :key="color.id"
          style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid #e0e0e0;"
        >
          <div style="margin-bottom: 1rem;">
            <div
              :style="{
                width: '60px',
                height: '60px',
                backgroundColor: color.hex_code,
                margin: '0 auto',
                borderRadius: '50%',
                border: '2px solid #ddd'
              }"
            ></div>
          </div>
          <div style="font-weight: bold; margin-bottom: 0.5rem;">
            {{ color.name }}
          </div>
          <div style="font-size: 0.9rem; color: #666; font-family: monospace;">
            {{ color.hex_code }}
          </div>
          <div style="font-size: 0.8rem; color: #999; margin-top: 0.5rem;">
            ID: {{ color.id }}
          </div>
          
          <!-- Botones de acción -->
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
            <button 
              @click="editColor(color)"
              class="adminBtn adminBtnWarning adminBtnSmall"
              title="Editar color"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              @click="confirmDeleteColor(color)"
              class="adminBtn adminBtnDanger adminBtnSmall"
              title="Eliminar color"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State for Colors -->
      <div v-else style="text-align: center; padding: 2rem;">
        <i class="fas fa-palette" style="font-size: 2rem; color: #ddd; margin-bottom: 1rem;"></i>
        <h4 style="color: #666; margin-bottom: 1rem;">No hay colores registrados</h4>
        <button @click="openColorModal" class="adminBtn adminBtnPrimary">
          <i class="fas fa-plus"></i>
          Crear Primer Color
        </button>
      </div>
    </div>

    <!-- Information Card -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
          Información y Guía de Uso
        </h3>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
        <div>
          <h4 style="color: #333; margin-bottom: 1rem;">
            <i class="fas fa-layer-group" style="margin-right: 0.5rem; color: #6f42c1;"></i>
            Tipos de Talla
          </h4>
          <ul style="color: #666; margin: 0; padding-left: 1.5rem; font-size: 0.9rem;">
            <li>Organizan las tallas por categorías (Ropa, Calzado, etc.)</li>
            <li>Permiten mayor flexibilidad en la gestión</li>
            <li>Facilitan la selección de tallas apropiadas por producto</li>
            <li><strong>Ejemplos comunes:</strong> Ropa, Calzado, Accesorios, Tallas Infantiles</li>
          </ul>
        </div>

        <div>
          <h4 style="color: #333; margin-bottom: 1rem;">
            <i class="fas fa-ruler" style="margin-right: 0.5rem; color: #007bff;"></i>
            Tallas
          </h4>
          <ul style="color: #666; margin: 0; padding-left: 1.5rem; font-size: 0.9rem;">
            <li>Cada talla debe pertenecer a un tipo específico</li>
            <li>Se ordenan automáticamente dentro de cada tipo</li>
            <li>Se asignan a productos durante su creación/edición</li>
            <li><strong>Ejemplos:</strong> XS, S, M, L, XL (Ropa) | 38, 40, 42 (Calzado)</li>
          </ul>
        </div>
        
        <div>
          <h4 style="color: #333; margin-bottom: 1rem;">
            <i class="fas fa-palette" style="margin-right: 0.5rem; color: #28a745;"></i>
            Colores
          </h4>
          <ul style="color: #666; margin: 0; padding-left: 1.5rem; font-size: 0.9rem;">
            <li>Se asignan a productos y sus variantes</li>
            <li>Usan códigos hexadecimales para precisión</li>
            <li>Ayudan a los clientes a identificar opciones</li>
            <li><strong>Tip:</strong> Usa nombres descriptivos como "Azul Marino" o "Rojo Carmín"</li>
          </ul>
        </div>
      </div>

      <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #007bff;">
        <h5 style="color: #333; margin: 0 0 0.5rem; display: flex; align-items: center;">
          <i class="fas fa-lightbulb" style="margin-right: 0.5rem; color: #ffc107;"></i>
          Flujo Recomendado
        </h5>
        <ol style="color: #666; margin: 0; padding-left: 1.5rem; font-size: 0.9rem;">
          <li>Crear <strong>Tipos de Talla</strong> según las categorías de productos</li>
          <li>Añadir <strong>Tallas específicas</strong> a cada tipo creado</li>
          <li>Crear <strong>Colores</strong> con nombres descriptivos y códigos precisos</li>
          <li>Asignar tallas y colores al crear/editar productos</li>
        </ol>
      </div>
    </div>

    <!-- Type Size Modal -->
    <div v-if="showTypeSizeModal" class="adminModal" @click.self="closeTypeSizeModal">
      <div class="adminModalContent">
        <div class="adminModalHeader">
          <h3>
            <i class="fas" :class="typeSizeModalMode === 'create' ? 'fa-plus' : 'fa-edit'"></i>
            {{ typeSizeModalMode === 'create' ? 'Nuevo Tipo de Talla' : 'Editar Tipo de Talla' }}
          </h3>
          <button @click="closeTypeSizeModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleTypeSizeSubmit">
          <div class="adminFormGroup">
            <label>Descripción del Tipo *</label>
            <input v-model="typeSizeForm.description" type="text" placeholder="ej. Ropa, Calzado, Accesorios" @blur="validateTypeSizeForm" />
            <div class="error" v-if="typeSizeFormErrors.description">
              <p>{{ typeSizeFormErrors.description }}</p>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Ejemplos: "Ropa", "Calzado", "Accesorios", "Tallas Infantiles", etc.
            </small>
          </div>

          <div class="adminModalActions">
            <button type="button" @click="closeTypeSizeModal" class="adminBtn adminBtnSecondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="adminBtn adminBtnPrimary" :disabled="loading">
              <i class="fas" :class="typeSizeModalMode === 'create' ? 'fa-plus' : 'fa-save'"></i>
              {{ loading ? (typeSizeModalMode === 'create' ? 'Creando...' : 'Actualizando...') : 
                 (typeSizeModalMode === 'create' ? 'Crear Tipo' : 'Actualizar Tipo') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Size Modal -->
    <div v-if="showSizeModal" class="adminModal" @click.self="closeSizeModal">
      <div class="adminModalContent">
        <div class="adminModalHeader">
          <h3>
            <i class="fas" :class="sizeModalMode === 'create' ? 'fa-plus' : 'fa-edit'"></i>
            {{ sizeModalMode === 'create' ? 'Nueva Talla' : 'Editar Talla' }}
          </h3>
          <button @click="closeSizeModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSizeSubmit">
          <div class="adminFormGroup">
            <label>Tipo de Talla *</label>
            <select v-model="sizeForm.type_size_id" @change="validateSizeForm">
              <option value="">Selecciona un tipo de talla</option>
              <option v-for="typeSize in typeSizes" :key="typeSize.id" :value="typeSize.id">
                {{ typeSize.description }}
              </option>
            </select>
            <div class="error" v-if="sizeFormErrors.type_size_id">
              <p>{{ sizeFormErrors.type_size_id }}</p>
            </div>
            <small v-if="typeSizes.length === 0" style="color: #dc3545; display: block; margin-top: 0.5rem;">
              Primero debes crear al menos un tipo de talla.
            </small>
          </div>

          <div class="adminFormGroup">
            <label>Nombre de la Talla *</label>
            <input v-model="sizeForm.name" type="text" placeholder="ej. XL, 42, Talla Única" @blur="validateSizeForm" />
            <div class="error" v-if="sizeFormErrors.name">
              <p>{{ sizeFormErrors.name }}</p>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Ejemplos: "XS", "S", "M", "L", "XL", "38", "40", "42", "Talla Única", etc.
            </small>
          </div>

          <div class="adminModalActions">
            <button type="button" @click="closeSizeModal" class="adminBtn adminBtnSecondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="adminBtn adminBtnPrimary" :disabled="loading || typeSizes.length === 0">
              <i class="fas" :class="sizeModalMode === 'create' ? 'fa-plus' : 'fa-save'"></i>
              {{ loading ? (sizeModalMode === 'create' ? 'Creando...' : 'Actualizando...') : 
                 (sizeModalMode === 'create' ? 'Crear Talla' : 'Actualizar Talla') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Color Modal -->
    <div v-if="showColorModal" class="adminModal" @click.self="closeColorModal">
      <div class="adminModalContent">
        <div class="adminModalHeader">
          <h3>
            <i :class="colorModalMode === 'edit' ? 'fas fa-edit' : 'fas fa-plus'"></i>
            {{ colorModalMode === 'edit' ? 'Editar Color' : 'Nuevo Color' }}
          </h3>
          <button @click="closeColorModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleColorSubmit">
          <div class="adminFormGroup">
            <label>Nombre del Color *</label>
            <input v-model="colorForm.name" type="text" placeholder="ej. Rojo Carmín" @blur="validateColorForm" />
            <div class="error" v-if="colorFormErrors.name">
              <p>{{ colorFormErrors.name }}</p>
            </div>
          </div>

          <div class="adminFormGroup">
            <label>Código de Color *</label>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <input v-model="colorForm.hex_code" type="color" style="width: 60px; height: 40px; border: none; padding: 0;" @change="validateColorForm" />
              <input v-model="colorForm.hex_code" type="text" placeholder="#FF0000" style="flex: 1;" @blur="validateColorForm" />
            </div>
            <div class="error" v-if="colorFormErrors.hex_code">
              <p>{{ colorFormErrors.hex_code }}</p>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Selecciona el color usando el selector o ingresa un código hexadecimal.
            </small>
          </div>

          <!-- Color Preview -->
          <div class="adminFormGroup">
            <label>Vista Previa</label>
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
              <div
                :style="{
                  width: '40px',
                  height: '40px',
                  backgroundColor: colorForm.hex_code,
                  borderRadius: '50%',
                  border: '2px solid #ddd'
                }"
              ></div>
              <div>
                <div style="font-weight: bold;">{{ colorForm.name || 'Nombre del color' }}</div>
                <div style="font-family: monospace; color: #666; font-size: 0.9rem;">
                  {{ colorForm.hex_code }}
                </div>
              </div>
            </div>
          </div>

          <div class="adminModalActions">
            <button type="button" @click="closeColorModal" class="adminBtn adminBtnSecondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" class="adminBtn adminBtnPrimary" :disabled="loading">
              <i :class="colorModalMode === 'edit' ? 'fas fa-save' : 'fas fa-plus'"></i>
              {{ loading ? (colorModalMode === 'edit' ? 'Actualizando...' : 'Creando...') : (colorModalMode === 'edit' ? 'Actualizar Color' : 'Crear Color') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="adminModal" @click.self="cancelDelete">
      <div class="adminModalContent" style="max-width: 400px;">
        <div class="adminModalHeader">
          <h3 style="color: #dc3545;">
            <i class="fas fa-exclamation-triangle"></i>
            Confirmar Eliminación
          </h3>
          <button @click="cancelDelete" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="adminModalBody">
          <p style="margin: 0 0 1rem; color: #666;">
            ¿Estás seguro de que deseas eliminar el color 
            <strong>{{ colorToDelete?.name }}</strong>?
          </p>
          <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 6px; margin-bottom: 1rem;">
            <div
              :style="{
                width: '40px',
                height: '40px',
                backgroundColor: colorToDelete?.hex_code,
                borderRadius: '50%',
                border: '2px solid #ddd'
              }"
            ></div>
            <div>
              <div style="font-weight: bold;">{{ colorToDelete?.name }}</div>
              <div style="font-size: 0.9rem; color: #666; font-family: monospace;">
                {{ colorToDelete?.hex_code }}
              </div>
            </div>
          </div>
          <p style="margin: 0; color: #dc3545; font-size: 0.9rem;">
            <i class="fas fa-exclamation-triangle"></i>
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div class="adminModalActions">
          <button type="button" @click="cancelDelete" class="adminBtn adminBtnSecondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button type="button" @click="handleDeleteColor" class="adminBtn adminBtnDanger" :disabled="loading">
            <i class="fas fa-trash"></i>
            {{ loading ? 'Eliminando...' : 'Eliminar Color' }}
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