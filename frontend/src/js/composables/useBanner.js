import { ref, readonly } from 'vue';

// Estado global del banner
const bannerUrl = ref('/img/imgBanner.png'); // Imagen por defecto
const loading = ref(false);
const error = ref(null);

// Función para cargar banner desde el backend
const loadBanner = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Cargando banner desde:', '/api/banner');
    const response = await fetch('/api/banner');
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Banner data received:', data);
      
      if (data.success && data.banner) {
        console.log('Actualizando banner URL a:', data.banner);
        bannerUrl.value = data.banner;
      } else {
        console.log('No banner data found, using default');
        // No cambiamos el valor si no hay banner, mantenemos el actual
      }
    } else {
      console.error('Error response:', response.status, response.statusText);
      error.value = `Error ${response.status}: ${response.statusText}`;
    }
  } catch (err) {
    console.error('Error loading banner:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Función para actualizar el banner (reactiva)
const updateBanner = (newBannerUrl) => {
  console.log('Actualizando banner reactivamente a:', newBannerUrl);
  bannerUrl.value = newBannerUrl;
};

// Función para resetear a imagen por defecto
const resetToDefault = () => {
  bannerUrl.value = '/img/imgBanner.png';
};

// Hook principal
export const useBanner = () => {
  return {
    // Estado (readonly para evitar modificaciones externas)
    bannerUrl: readonly(bannerUrl),
    loading: readonly(loading),
    error: readonly(error),
    
    // Métodos
    loadBanner,
    updateBanner,
    resetToDefault
  };
};