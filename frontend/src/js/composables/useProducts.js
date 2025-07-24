import { ref } from 'vue';
import { useApi } from './useFetch.js';

export const useProducts = () => {
  const loading = ref(false);
  const error = ref(null);

  const getProductById = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || 'Error al obtener el producto');
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching product:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getImagesByColor = (product, colorId) => {
    console.log('Getting images for product:', product, 'colorId:', colorId);
    
    if (!product || !product.colorImages || !Array.isArray(product.colorImages)) {
      console.log('No color images found for product');
      return [];
    }
    
    console.log('Product color images:', product.colorImages);
    
    const filteredImages = product.colorImages
      .filter(img => img.color_id === colorId)
      .map(img => `/uploads/products/${img.img}`);
      
    console.log('Filtered images for color', colorId, ':', filteredImages);
    return filteredImages;
  };

  const getAvailableColors = (product) => {
    console.log('Getting available colors for product:', product);
    
    if (!product || !product.variants || !Array.isArray(product.variants)) {
      console.log('No variants found for product');
      return [];
    }
    
    console.log('Product variants:', product.variants);
    
    // Obtener colores únicos de las variantes
    const uniqueColors = [];
    const seenColorIds = new Set();
    
    product.variants.forEach(variant => {
      console.log('Processing variant:', variant);
      if (variant.color && !seenColorIds.has(variant.color_id)) {
        seenColorIds.add(variant.color_id);
        uniqueColors.push(variant.color);
      }
    });
    
    console.log('Unique colors found:', uniqueColors);
    return uniqueColors;
  };

  const getAvailableSizes = (product, colorId = null) => {
    if (!product || !product.variants) return [];
    
    let filteredVariants = product.variants;
    
    // Filtrar por color si se especifica
    if (colorId) {
      filteredVariants = product.variants.filter(variant => variant.color_id === colorId);
    }
    
    // Obtener tallas únicas
    const uniqueSizes = [];
    const seenSizeIds = new Set();
    
    filteredVariants.forEach(variant => {
      if (!seenSizeIds.has(variant.size_id) && variant.stock > 0) {
        seenSizeIds.add(variant.size_id);
        uniqueSizes.push(variant.size);
      }
    });
    
    return uniqueSizes;
  };

  const getVariantStock = (product, sizeId, colorId) => {
    if (!product || !product.variants) return 0;
    
    const variant = product.variants.find(v => 
      v.size_id === sizeId && v.color_id === colorId
    );
    
    return variant ? variant.stock : 0;
  };

  return {
    loading,
    error,
    getProductById,
    getImagesByColor,
    getAvailableColors,
    getAvailableSizes,
    getVariantStock
  };
};