<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';

const {
  getAdminSizes,
  getAdminTypeSizes,
  getAdminColors,
  createSize,
  createTypeSize,
  createColor,
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

// Methods
const loadSizes = async () => {
  const result = await getAdminSizes();
  if (result) {
    sizesGroupedByType.value = result.data;
  }
};

const loadTypeSizes = async () => {
  const result = await getAdminTypeSizes();
  if (result) {
    typeSizes.value = result.data;
  }
};

const loadColors = async () => {
  const result = await getAdminColors();
  if (result) {
    colors.value = result.data;
  }
};

const openSizeModal = () => {
  resetSizeForm();
  showSizeModal.value = true;
};

const closeSizeModal = () => {
  showSizeModal.value = false;
  resetSizeForm();
};

const resetSizeForm = () => {
  sizeForm.value = {
    name: '',
    type_size_id: ''
  };
};

const openTypeSizeModal = () => {
  resetTypeSizeForm();
  showTypeSizeModal.value = true;
};

const closeTypeSizeModal = () => {
  showTypeSizeModal.value = false;
  resetTypeSizeForm();
};

const resetTypeSizeForm = () => {
  typeSizeForm.value = {
    description: ''
  };
};

const handleSizeSubmit = async () => {
  const result = await createSize(sizeForm.value);
  if (result) {
    closeSizeModal();
    loadSizes();
  }
};

const handleTypeSizeSubmit = async () => {
  const result = await createTypeSize(typeSizeForm.value);
  if (result) {
    closeTypeSizeModal();
    loadSizes();
    loadTypeSizes();
  }
};

const openColorModal = () => {
  resetColorForm();
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
};

const handleColorSubmit = async () => {
  const result = await createColor(colorForm.value);
  if (result) {
    closeColorModal();
    loadColors();
  }
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
          style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border: 1px solid #e0e0e0;"
        >
          <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
            {{ typeSize.description }}
          </div>
          <div style="font-size: 0.8rem; color: #999;">
            ID: {{ typeSize.id }}
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
                style="background: #f8f9fa; padding: 1rem; border-radius: 6px; text-align: center; border: 1px solid #e0e0e0; transition: transform 0.2s ease;"
              >
                <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem; color: #333;">
                  {{ size.name }}
                </div>
                <div style="font-size: 0.7rem; color: #999;">
                  ID: {{ size.id }}
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
            <i class="fas fa-plus"></i>
            Nuevo Tipo de Talla
          </h3>
          <button @click="closeTypeSizeModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleTypeSizeSubmit">
          <div class="adminFormGroup">
            <label>Descripción del Tipo *</label>
            <input v-model="typeSizeForm.description" type="text" required placeholder="ej. Ropa, Calzado, Accesorios" />
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
              <i class="fas fa-plus"></i>
              {{ loading ? 'Creando...' : 'Crear Tipo' }}
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
            <i class="fas fa-plus"></i>
            Nueva Talla
          </h3>
          <button @click="closeSizeModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleSizeSubmit">
          <div class="adminFormGroup">
            <label>Tipo de Talla *</label>
            <select v-model="sizeForm.type_size_id" required>
              <option value="">Selecciona un tipo de talla</option>
              <option v-for="typeSize in typeSizes" :key="typeSize.id" :value="typeSize.id">
                {{ typeSize.description }}
              </option>
            </select>
            <small v-if="typeSizes.length === 0" style="color: #dc3545; display: block; margin-top: 0.5rem;">
              Primero debes crear al menos un tipo de talla.
            </small>
          </div>

          <div class="adminFormGroup">
            <label>Nombre de la Talla *</label>
            <input v-model="sizeForm.name" type="text" required placeholder="ej. XL, 42, Talla Única" />
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
              <i class="fas fa-plus"></i>
              {{ loading ? 'Creando...' : 'Crear Talla' }}
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
            <i class="fas fa-plus"></i>
            Nuevo Color
          </h3>
          <button @click="closeColorModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="handleColorSubmit">
          <div class="adminFormGroup">
            <label>Nombre del Color *</label>
            <input v-model="colorForm.name" type="text" required placeholder="ej. Rojo Carmín" />
          </div>

          <div class="adminFormGroup">
            <label>Código de Color *</label>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <input v-model="colorForm.hex_code" type="color" style="width: 60px; height: 40px; border: none; padding: 0;" />
              <input v-model="colorForm.hex_code" type="text" placeholder="#FF0000" style="flex: 1;" />
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
              <i class="fas fa-plus"></i>
              {{ loading ? 'Creando...' : 'Crear Color' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="adminAlert adminAlertError">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>