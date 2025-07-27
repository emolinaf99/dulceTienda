<script setup>
import { ref, onMounted } from 'vue';

// Estado
const content = ref({
  title: 'Dulce Basicas', // Título por defecto
  content: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.' // Contenido por defecto
});
const loading = ref(true);

// Cargar contenido desde el backend
const loadContent = async () => {
  try {
    const response = await fetch('/api/about-us');
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.content) {
        content.value = data.content;
      }
    }
  } catch (error) {
    console.error('Error loading about us content:', error);
    // Mantener contenido por defecto en caso de error
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadContent();
});
</script>

<template>
    <section class="quienesSomosReviewContenedor">
        <div class="bloqueQuienesSomos">
            <h4 v-if="!loading">{{ content.title }}</h4>
            <h4 v-else>Cargando...</h4>
            
            <p v-if="!loading && content.content" v-html="content.content.replace(/\n/g, '<br>')"></p>
            <p v-else-if="!loading">Sin contenido disponible</p>
            <p v-else>Cargando contenido...</p>
        </div>
    </section>
</template>



