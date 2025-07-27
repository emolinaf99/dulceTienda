<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';
import mostrarNotificacion from '@/js/mensajeNotificacionFront.js';
import { validateForm } from '@/js/composables/useValidateForm.js';

const {
  loading,
  error
} = useAdminApi();

// Estado
const currentContent = ref({
  title: '',
  content: ''
});
const isEditing = ref(false);
const isSaving = ref(false);

// Estado de validaciones
const formErrors = ref({});

// Form data
const contentForm = ref({
  title: '',
  content: ''
});

// Reglas de validación
const contentValidationRules = {
  title: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 2000
  }
};

// Función de validación
const validateContentForm = () => {
  formErrors.value = validateForm(contentForm.value, contentValidationRules);
  return Object.keys(formErrors.value).length === 0;
};

// Cargar contenido actual
const loadCurrentContent = async () => {
  try {
    const response = await fetch('/api/admin/about-us', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        currentContent.value = data.content;
      }
    }
  } catch (err) {
    console.error('Error loading about us content:', err);
  }
};

// Iniciar edición
const startEditing = () => {
  contentForm.value = {
    title: currentContent.value.title || '',
    content: currentContent.value.content || ''
  };
  formErrors.value = {};
  isEditing.value = true;
};

// Cancelar edición
const cancelEditing = () => {
  isEditing.value = false;
  contentForm.value = {
    title: '',
    content: ''
  };
  formErrors.value = {};
};

// Guardar contenido
const saveContent = async () => {
  // Validar formulario antes de enviar
  if (!validateContentForm()) {
    mostrarNotificacion('Por favor corrige los errores en el formulario', 0);
    return;
  }

  isSaving.value = true;

  try {
    const response = await fetch('/api/admin/about-us', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(contentForm.value)
    });

    const data = await response.json();

    if (response.ok) {
      currentContent.value = data.content;
      isEditing.value = false;
      contentForm.value = {
        title: '',
        content: ''
      };
      formErrors.value = {};
      mostrarNotificacion('Contenido actualizado exitosamente', 1);
    } else {
      mostrarNotificacion(data.message || 'Error al guardar el contenido', 0);
    }
  } catch (err) {
    console.error('Error saving about us content:', err);
    mostrarNotificacion('Error al guardar el contenido', 0);
  } finally {
    isSaving.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadCurrentContent();
});
</script>

<template>
  <div class="adminAboutUs">
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
          Gestión de "Quienes Somos"
        </h3>
        <p style="color: #666; font-size: 0.9rem; margin: 0.5rem 0 0;">
          Administra el título y contenido de la sección "Quienes Somos" que aparece en la página principal.
        </p>
      </div>

      <!-- Vista de Contenido Actual -->
      <div v-if="!isEditing" style="display: grid; gap: 2rem;">
        <div>
          <h4 style="margin-bottom: 1rem;">Contenido Actual</h4>
          
          <div class="contentPreview">
            <div class="previewSection">
              <label><strong>Título:</strong></label>
              <div class="currentTitle">
                {{ currentContent.title || 'Sin título configurado' }}
              </div>
            </div>
            
            <div class="previewSection">
              <label><strong>Contenido:</strong></label>
              <div class="currentContent">
                <p v-if="currentContent.content" v-html="currentContent.content.replace(/\n/g, '<br>')"></p>
                <p v-else style="color: #666; font-style: italic;">Sin contenido configurado</p>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 2rem;">
            <button @click="startEditing" class="adminBtn adminBtnPrimary">
              <i class="fas fa-edit"></i>
              Editar Contenido
            </button>
          </div>
        </div>

        <!-- Vista Previa del Componente -->
        <div class="adminCard" style="background: #f8f9fa; margin: 0; padding: 1.5rem;">
          <h4 style="color: #495057; margin-bottom: 1rem;">
            <i class="fas fa-eye" style="margin-right: 0.5rem;"></i>
            Vista Previa en el Sitio Web
          </h4>
          <div class="websitePreview">
            <div class="bloqueQuienesSomos" style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e9ecef;">
              <h4 style="margin: 0 0 1rem 0; color: #333;">{{ currentContent.title || 'Sin título' }}</h4>
              <p style="margin: 0; color: #666; line-height: 1.6;" v-if="currentContent.content" v-html="currentContent.content.replace(/\n/g, '<br>')"></p>
              <p v-else style="margin: 0; color: #999; font-style: italic;">Sin contenido configurado</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario de Edición -->
      <div v-else>
        <h4 style="margin-bottom: 1.5rem;">Editar Contenido</h4>
        
        <form @submit.prevent="saveContent">
          <div class="adminFormGroup">
            <label>Título *</label>
            <input 
              v-model="contentForm.title" 
              type="text" 
              placeholder="Ej: Dulce Basicas, Nuestra Historia, etc."
              @blur="validateContentForm"
              :disabled="isSaving"
            />
            <div class="error" v-if="formErrors.title">
              <p>{{ formErrors.title }}</p>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Título principal que aparecerá en la sección (máximo 100 caracteres)
            </small>
          </div>

          <div class="adminFormGroup">
            <label>Contenido *</label>
            <textarea 
              v-model="contentForm.content" 
              rows="8" 
              placeholder="Escribe aquí el contenido de la sección 'Quienes Somos'. Puedes usar saltos de línea para separar párrafos."
              @blur="validateContentForm"
              :disabled="isSaving"
              style="resize: vertical; min-height: 150px;"
            ></textarea>
            <div class="error" v-if="formErrors.content">
              <p>{{ formErrors.content }}</p>
            </div>
            <small style="color: #666; display: block; margin-top: 0.5rem;">
              Contenido principal de la sección. Los saltos de línea se convertirán en párrafos (máximo 2000 caracteres)
            </small>
          </div>

          <div class="adminModalActions">
            <button 
              type="button" 
              @click="cancelEditing" 
              class="adminBtn adminBtnSecondary"
              :disabled="isSaving"
            >
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button 
              type="submit" 
              class="adminBtn adminBtnPrimary"
              :disabled="isSaving"
            >
              <i class="fas" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Información adicional -->
    <div class="adminCard" style="background: #f8f9fa; margin-top: 2rem; padding: 1.5rem;">
      <h4 style="color: #495057; margin-bottom: 1rem;">
        <i class="fas fa-lightbulb" style="margin-right: 0.5rem;"></i>
        Consejos para un Buen Contenido
      </h4>
      <ul style="color: #666; margin: 0; padding-left: 1.5rem;">
        <li>Mantén el título corto y descriptivo</li>
        <li>Utiliza un lenguaje claro y cercano a tus clientes</li>
        <li>Separa el contenido en párrafos para mejor legibilidad</li>
        <li>Incluye información relevante sobre tu marca, historia o valores</li>
        <li>Evita texto demasiado largo que pueda abrumar al lector</li>
        <li>Revisa la vista previa antes de guardar los cambios</li>
      </ul>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="adminAlert adminAlertError">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>

<style scoped>
.contentPreview {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.previewSection {
  margin-bottom: 1.5rem;
}

.previewSection:last-child {
  margin-bottom: 0;
}

.previewSection label {
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: 500;
}

.currentTitle {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.currentContent {
  color: #666;
  line-height: 1.6;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #28a745;
}

.websitePreview .bloqueQuienesSomos h4 {
  font-family: inherit;
  font-size: 1.5rem;
  font-weight: 600;
}

.websitePreview .bloqueQuienesSomos p {
  font-family: inherit;
  font-size: 1rem;
}

.adminFormGroup textarea {
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>