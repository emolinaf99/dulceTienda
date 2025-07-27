<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';
import { useBanner } from '@/js/composables/useBanner.js';
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js';

const {
  loading,
  error
} = useAdminApi();

// Usar el composable del banner para reactividad
const { updateBanner } = useBanner();

// Estado
const currentBanner = ref(null);
const selectedFile = ref(null);
const previewUrl = ref('');
const isUploading = ref(false);

// Referencias del DOM
const fileInputRef = ref(null);

// Cargar banner actual
const loadCurrentBanner = async () => {
  try {
    const response = await fetch('/api/admin/banner', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      currentBanner.value = data.banner;
    }
  } catch (err) {
    console.error('Error loading banner:', err);
  }
};

// Manejar selección de archivo
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    mostrarNotificacion('Solo se permiten archivos JPEG, PNG o WebP', 0);
    return;
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    mostrarNotificacion('El archivo no puede ser mayor a 5MB', 0);
    return;
  }

  selectedFile.value = file;
  
  // Crear preview
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Subir nueva imagen del banner
const uploadBanner = async () => {
  if (!selectedFile.value) {
    mostrarNotificacion('Por favor selecciona una imagen', 0);
    return;
  }

  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append('banner', selectedFile.value);

    const response = await fetch('/api/admin/banner', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      currentBanner.value = data.banner;
      selectedFile.value = null;
      previewUrl.value = '';
      if (fileInputRef.value) {
        fileInputRef.value.value = '';
      }
      
      // Actualizar el banner reactivamente en toda la aplicación
      updateBanner(data.banner);
      
      mostrarNotificacion('Banner actualizado exitosamente', 1);
    } else {
      mostrarNotificacion(data.message || 'Error al subir la imagen', 0);
    }
  } catch (err) {
    console.error('Error uploading banner:', err);
    mostrarNotificacion('Error al subir la imagen', 0);
  } finally {
    isUploading.value = false;
  }
};

// Cancelar selección
const cancelSelection = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

// Lifecycle
onMounted(() => {
  loadCurrentBanner();
});
</script>

<template>
  <div class="adminBanner">
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-image" style="margin-right: 0.5rem;"></i>
          Gestión del Banner Principal
        </h3>
        <p style="color: #666; font-size: 0.9rem; margin: 0.5rem 0 0;">
          Administra la imagen del banner que aparece en la página principal de la tienda.
        </p>
      </div>

      <div style="display: grid; gap: 2rem;">
        <!-- Banner Actual -->
        <div>
          <h4 style="margin-bottom: 1rem;">Banner Actual</h4>
          <div class="bannerPreview">
            <img 
              v-if="currentBanner" 
              :src="currentBanner" 
              alt="Banner actual"
              style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
            />
            <div v-else class="emptyBanner">
              <i class="fas fa-image" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
              <p style="color: #666;">No hay banner configurado</p>
            </div>
          </div>
        </div>

        <!-- Subir Nueva Imagen -->
        <div>
          <h4 style="margin-bottom: 1rem;">Subir Nueva Imagen</h4>
          
          <div class="adminFormGroup">
            <label>Seleccionar imagen</label>
            <input 
              ref="fileInputRef"
              type="file" 
              accept="image/jpeg,image/png,image/webp"
              @change="handleFileSelect"
              style="margin-bottom: 1rem;"
            />
            <small style="color: #666; display: block;">
              Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB.
              Recomendación: 1920x600px o proporciones similares para mejor visualización.
            </small>
          </div>

          <!-- Preview de la nueva imagen -->
          <div v-if="previewUrl" class="newBannerPreview" style="margin: 1rem 0;">
            <h5 style="margin-bottom: 0.5rem;">Vista previa:</h5>
            <img 
              :src="previewUrl" 
              alt="Vista previa"
              style="width: 100%; max-width: 600px; height: auto; border-radius: 8px; border: 2px solid #e9ecef;"
            />
          </div>

          <!-- Acciones -->
          <div class="adminModalActions" v-if="selectedFile">
            <button 
              @click="cancelSelection" 
              class="adminBtn adminBtnSecondary"
              :disabled="isUploading"
            >
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button 
              @click="uploadBanner" 
              class="adminBtn adminBtnPrimary"
              :disabled="isUploading"
            >
              <i class="fas" :class="isUploading ? 'fa-spinner fa-spin' : 'fa-upload'"></i>
              {{ isUploading ? 'Subiendo...' : 'Actualizar Banner' }}
            </button>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="adminCard" style="background: #f8f9fa; margin: 0; padding: 1.5rem;">
          <h4 style="color: #495057; margin-bottom: 1rem;">
            <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
            Recomendaciones
          </h4>
          <ul style="color: #666; margin: 0; padding-left: 1.5rem;">
            <li>Utiliza imágenes con resolución alta para mejor calidad en dispositivos de alta densidad</li>
            <li>Las dimensiones recomendadas son 1920x600px (ratio 16:5) para óptima visualización</li>
            <li>Asegúrate de que el texto en la imagen sea legible en dispositivos móviles</li>
            <li>Evita incluir texto importante en los bordes, ya que puede ser cortado en pantallas pequeñas</li>
            <li>El banner se muestra en la página principal y debe ser atractivo para los visitantes</li>
          </ul>
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

<style scoped>
.emptyBanner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #f8f9fa;
}

.bannerPreview img {
  transition: transform 0.3s ease;
}

.bannerPreview img:hover {
  transform: scale(1.02);
}

.newBannerPreview {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}
</style>