
<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useBanner } from '@/js/composables/useBanner.js'

// Usar el composable del banner
const { bannerUrl, loading, error, loadBanner, resetToDefault } = useBanner();

// Computed para mostrar estado de carga inicial
const isInitialLoad = computed(() => {
  return loading.value && bannerUrl.value === '/img/imgBanner.png';
});

// Manejo de eventos de la imagen
const handleImageError = (event) => {
  console.error('Error cargando imagen del banner:', bannerUrl.value);
  console.log('Fallback a imagen por defecto');
  resetToDefault();
};

const handleImageLoad = () => {
  console.log('Imagen del banner cargada exitosamente:', bannerUrl.value);
};

// Lifecycle
onMounted(() => {
  loadBanner();
});
</script>

<template>
    <RouterLink to="/" class="bannerBlock">
        <img 
          v-if="!isInitialLoad" 
          :src="bannerUrl" 
          alt="Banner principal"
          @error="handleImageError"
          @load="handleImageLoad"
        >
        <div v-else class="bannerLoading">
          <p>Cargando banner...</p>
        </div>
    </RouterLink>
</template>

<style scoped>
.bannerLoading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f8f9fa;
  color: #666;
}
</style>