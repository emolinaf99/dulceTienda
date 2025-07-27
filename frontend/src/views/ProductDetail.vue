<script setup>
    import { ref, onMounted, computed, nextTick, watch } from 'vue'
    import Nuevo from '../components/Nuevo.vue'
    import { useProducts } from '../js/composables/useProducts.js'
    import { useFavorites } from '../js/composables/useFavorites.js'
    import { useUserStore } from '../js/stores/userLogged.js'
    import { checkOverflow } from '../js/overflow.js'

    const props = defineProps({
        id: String
    })

    // Composables
    const { loading, error, getProductById, getImagesByColor, getAvailableColors, getAvailableSizes, getVariantStock } = useProducts();
    const { loading: favLoading, error: favError, isProductInFavorites, toggleFavorite } = useFavorites();
    const userStore = useUserStore();

    // Estado reactivo
    const product = ref(null);
    const selectedColor = ref(null);
    const selectedSize = ref(null);
    const quantity = ref(1);
    const selectedImageIndex = ref(0);
    const isFavorite = ref(false);

    // Refs for DOM elements
    const mainImageContainerRef = ref(null);
    const thumbnailContainerRef = ref(null);

    // Computed properties
    const availableColors = computed(() => {
        return product.value ? getAvailableColors(product.value) : [];
    });

    const availableSizes = computed(() => {
        return product.value && selectedColor.value 
            ? getAvailableSizes(product.value, selectedColor.value.id) 
            : [];
    });

    const currentImages = computed(() => {
        if (!product.value || !selectedColor.value) return [];
        return getImagesByColor(product.value, selectedColor.value.id);
    });

    // Imágenes para el carrusel infinito (replicación masiva para scroll imperceptible)
    const infiniteImages = computed(() => {
        const images = currentImages.value;
        if (images.length <= 1) return images;
        
        // Crear múltiples copias para asegurar scroll infinito imperceptible
        // 5 copias de cada lado proporcionan buffer masivo
        const copies = 5;
        const result = [];
        
        // Agregar múltiples copias al inicio
        for (let i = 0; i < copies; i++) {
            result.push(...images);
        }
        
        // Agregar las imágenes originales (centro)
        result.push(...images);
        
        // Agregar múltiples copias al final
        for (let i = 0; i < copies; i++) {
            result.push(...images);
        }
        
        return result;
    });

    const currentStock = computed(() => {
        if (!product.value || !selectedSize.value || !selectedColor.value) return 0;
        return getVariantStock(product.value, selectedSize.value.id, selectedColor.value.id);
    });

    // Métodos
    const loadProduct = async () => {
        if (!props.id) {
            console.error('No product ID provided');
            return;
        }
        
        try {
            const productData = await getProductById(props.id);
            
            if (productData) {
                product.value = productData;
                const colors = getAvailableColors(productData);
                
                if (colors.length > 0) {
                    selectColor(colors[0]);
                }
                
                // Verificar si el producto está en favoritos
                await checkFavoriteStatus();
            } else {
                console.error('Product not found');
            }
        } catch (err) {
            console.error('Error loading product:', err);
        }
    };

    const checkFavoriteStatus = async () => {
        if (!props.id) {
            isFavorite.value = false;
            return;
        }

        // Solo verificar si el usuario está autenticado según el store
        if (!userStore.isLoggedIn) {
            isFavorite.value = false;
            return;
        }
        
        try {
            isFavorite.value = await isProductInFavorites(props.id);
        } catch (err) {
            console.error('Error checking favorite status:', err);
            isFavorite.value = false;
        }
    };

    const handleFavoriteToggle = async () => {
        if (!props.id) return;
        
        // Verificar si el usuario está autenticado
        if (!userStore.isLoggedIn) {
            // Redirigir al login o mostrar mensaje
            alert('Debes iniciar sesión para agregar productos a favoritos');
            return;
        }
        
        try {
            const success = await toggleFavorite(props.id);
            if (success) {
                isFavorite.value = !isFavorite.value;
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
            // Mostrar mensaje de error al usuario
            alert('Error al actualizar favoritos. Inténtalo de nuevo.');
        }
    };

    const selectColor = (color) => {
        selectedColor.value = color;
        selectedSize.value = null; // Reset size when color changes
        selectImage(0); // Reset to the first image of the new color
    };

    const selectSize = (size) => {
        selectedSize.value = size;
    };

    const selectImage = (index) => {
        if (currentImages.value.length === 0) return;
        
        // Manejar índices negativos y fuera de rango para slide infinito
        let normalizedIndex = index;
        if (index < 0) {
            normalizedIndex = currentImages.value.length - 1;
        } else if (index >= currentImages.value.length) {
            normalizedIndex = 0;
        }
        
        selectedImageIndex.value = normalizedIndex;
        
        // Marcar como selección manual para evitar auto-corrección inmediata
        isManualSelection = true;

        nextTick(() => {
            // Scroll main image con animación suave para carrusel infinito
            const container = mainImageContainerRef.value;
            if (container) {
                const imageElements = Array.from(container.children).filter(c => c.tagName === 'IMG');
                
                // Encontrar todas las copias de la imagen deseada
                const targetImageCopies = [];
                imageElements.forEach((img, index) => {
                    if (index % currentImages.value.length === normalizedIndex) {
                        targetImageCopies.push({
                            index: index,
                            element: img,
                            left: img.offsetLeft
                        });
                    }
                });
                
                // Encontrar la copia más cercana a la posición actual
                const currentScrollLeft = container.scrollLeft;
                let closestCopy = targetImageCopies[0];
                let minDistance = Math.abs(currentScrollLeft - closestCopy.left);
                
                targetImageCopies.forEach(copy => {
                    const distance = Math.abs(currentScrollLeft - copy.left);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCopy = copy;
                    }
                });
                
                // Hacer scroll a la copia más cercana
                if (closestCopy) {
                    container.scrollTo({
                        left: closestCopy.left,
                        behavior: 'smooth'
                    });
                }
            }

            // Scroll thumbnail into view
            const thumbContainer = thumbnailContainerRef.value;
            if (thumbContainer && thumbContainer.children[normalizedIndex]) {
                const thumbEl = thumbContainer.children[normalizedIndex];
                thumbEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        });
    };

    const nextImage = () => {
        const container = mainImageContainerRef.value;
        if (!container || currentImages.value.length <= 1) return;
        
        // Cambiar a la siguiente imagen lógica
        const currentRealIndex = selectedImageIndex.value;
        const nextRealIndex = (currentRealIndex + 1) % currentImages.value.length;
        
        // Actualizar el índice seleccionado
        selectedImageIndex.value = nextRealIndex;
        
        // Detectar cuántas imágenes se muestran por pantalla para mejor posicionamiento
        const containerWidth = container.clientWidth;
        const imageElements = Array.from(container.children).filter(c => c.tagName === 'IMG');
        const imageWidth = imageElements.length > 0 ? imageElements[0].offsetWidth : 0;
        const imagesPerView = Math.floor(containerWidth / imageWidth);
        
        // Buscar la imagen correspondiente en el DOM
        const totalImages = currentImages.value.length;
        const currentScrollLeft = container.scrollLeft;
        
        let bestTarget = null;
        let minDistance = Infinity;
        
        // Para mejor comportamiento en vistas con 2 imágenes, priorizar posiciones óptimas
        imageElements.forEach((img, index) => {
            const imageRealIndex = index % totalImages;
            if (imageRealIndex === nextRealIndex) {
                const imgLeft = img.offsetLeft;
                
                // Si mostramos 2 imágenes, calcular distancia considerando el ancho de 2 imágenes
                let targetScrollPosition;
                if (imagesPerView >= 2) {
                    // Para 2+ imágenes visibles, posicionar para mostrar la imagen seleccionada y la siguiente
                    targetScrollPosition = imgLeft;
                } else {
                    // Para 1 imagen visible, centrar la imagen
                    targetScrollPosition = imgLeft - (containerWidth - imageWidth) / 2;
                }
                
                const distance = Math.abs(currentScrollLeft - targetScrollPosition);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestTarget = { element: img, index, targetScrollPosition };
                }
            }
        });
        
        if (bestTarget) {
            container.scrollTo({
                left: bestTarget.targetScrollPosition,
                behavior: 'smooth'
            });
            
            // Sincronizar thumbnail
            nextTick(() => {
                const thumbContainer = thumbnailContainerRef.value;
                if (thumbContainer && thumbContainer.children[nextRealIndex]) {
                    const thumbEl = thumbContainer.children[nextRealIndex];
                    thumbEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            });
            
            // Auto-reposicionamiento si estamos cerca de los límites
            if (bestTarget.index > imageElements.length - 15 || bestTarget.index < 15) {
                setTimeout(() => {
                    const centerStart = Math.floor(imageElements.length / 2);
                    let repositionTarget = null;
                    
                    // Buscar una copia de la misma imagen cerca del centro
                    for (let i = centerStart - 10; i < centerStart + 10; i++) {
                        if (i >= 0 && i < imageElements.length) {
                            const imageRealIndex = i % totalImages;
                            if (imageRealIndex === nextRealIndex) {
                                repositionTarget = imageElements[i];
                                break;
                            }
                        }
                    }
                    
                    if (repositionTarget) {
                        let targetScroll;
                        if (imagesPerView >= 2) {
                            targetScroll = repositionTarget.offsetLeft;
                        } else {
                            targetScroll = repositionTarget.offsetLeft - (containerWidth - imageWidth) / 2;
                        }
                        
                        container.scrollTo({
                            left: targetScroll,
                            behavior: 'auto' // Sin animación
                        });
                    }
                }, 600);
            }
        }
    };

    const prevImage = () => {
        const container = mainImageContainerRef.value;
        if (!container || currentImages.value.length <= 1) return;
        
        // Cambiar a la imagen anterior lógica
        const currentRealIndex = selectedImageIndex.value;
        const prevRealIndex = currentRealIndex === 0 
            ? currentImages.value.length - 1 
            : currentRealIndex - 1;
        
        // Actualizar el índice seleccionado
        selectedImageIndex.value = prevRealIndex;
        
        // Detectar cuántas imágenes se muestran por pantalla para mejor posicionamiento
        const containerWidth = container.clientWidth;
        const imageElements = Array.from(container.children).filter(c => c.tagName === 'IMG');
        const imageWidth = imageElements.length > 0 ? imageElements[0].offsetWidth : 0;
        const imagesPerView = Math.floor(containerWidth / imageWidth);
        
        // Buscar la imagen correspondiente en el DOM
        const totalImages = currentImages.value.length;
        const currentScrollLeft = container.scrollLeft;
        
        let bestTarget = null;
        let minDistance = Infinity;
        
        // Para mejor comportamiento en vistas con 2 imágenes, priorizar posiciones óptimas
        imageElements.forEach((img, index) => {
            const imageRealIndex = index % totalImages;
            if (imageRealIndex === prevRealIndex) {
                const imgLeft = img.offsetLeft;
                
                // Si mostramos 2 imágenes, calcular distancia considerando el ancho de 2 imágenes
                let targetScrollPosition;
                if (imagesPerView >= 2) {
                    // Para 2+ imágenes visibles, posicionar para mostrar la imagen seleccionada y la siguiente
                    targetScrollPosition = imgLeft;
                } else {
                    // Para 1 imagen visible, centrar la imagen
                    targetScrollPosition = imgLeft - (containerWidth - imageWidth) / 2;
                }
                
                const distance = Math.abs(currentScrollLeft - targetScrollPosition);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    bestTarget = { element: img, index, targetScrollPosition };
                }
            }
        });
        
        if (bestTarget) {
            container.scrollTo({
                left: bestTarget.targetScrollPosition,
                behavior: 'smooth'
            });
            
            // Sincronizar thumbnail
            nextTick(() => {
                const thumbContainer = thumbnailContainerRef.value;
                if (thumbContainer && thumbContainer.children[prevRealIndex]) {
                    const thumbEl = thumbContainer.children[prevRealIndex];
                    thumbEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            });
            
            // Auto-reposicionamiento si estamos cerca de los límites
            if (bestTarget.index > imageElements.length - 15 || bestTarget.index < 15) {
                setTimeout(() => {
                    const centerStart = Math.floor(imageElements.length / 2);
                    let repositionTarget = null;
                    
                    // Buscar una copia de la misma imagen cerca del centro
                    for (let i = centerStart - 10; i < centerStart + 10; i++) {
                        if (i >= 0 && i < imageElements.length) {
                            const imageRealIndex = i % totalImages;
                            if (imageRealIndex === prevRealIndex) {
                                repositionTarget = imageElements[i];
                                break;
                            }
                        }
                    }
                    
                    if (repositionTarget) {
                        let targetScroll;
                        if (imagesPerView >= 2) {
                            targetScroll = repositionTarget.offsetLeft;
                        } else {
                            targetScroll = repositionTarget.offsetLeft - (containerWidth - imageWidth) / 2;
                        }
                        
                        container.scrollTo({
                            left: targetScroll,
                            behavior: 'auto' // Sin animación
                        });
                    }
                }, 600);
            }
        }
    };

    const changeQuantity = (delta) => {
        const newQuantity = quantity.value + delta;
        if (newQuantity >= 1 && newQuantity <= currentStock.value) {
            quantity.value = newQuantity;
        }
    };

    // Sync thumbnail selection on manual scroll of main image
    let scrollTimeout = null;
    let isManualSelection = false; // Flag para prevenir auto-corrección después de selección manual
    
    const handleMainImageScroll = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        
        // Si es una selección manual, esperar más tiempo antes de auto-detectar
        const debounceTime = isManualSelection ? 500 : 50;
        
        scrollTimeout = setTimeout(() => {
            // Reset flag después del debounce
            isManualSelection = false;
            const container = mainImageContainerRef.value;
            if (!container || container.children.length === 0) return;

            const imageElements = Array.from(container.children).filter(c => c.tagName === 'IMG');
            if(imageElements.length === 0) return;

            // Para el carrusel infinito, verificar si estamos en los extremos
            const scrollLeft = container.scrollLeft;
            const containerWidth = container.clientWidth;
            const totalWidth = container.scrollWidth;

            // Si hay imágenes duplicadas (más de 1 imagen original)
            if (currentImages.value.length > 1) {
                const copies = 5;
                const originalLength = currentImages.value.length;
                
                // Definir las zonas de operación
                const centerStart = copies * originalLength;
                const centerEnd = centerStart + originalLength - 1;
                
                // Encontrar la imagen actual basada en la posición de scroll
                const containerCenter = scrollLeft + containerWidth / 2;
                let currentVisualIndex = -1;
                let minDistance = Infinity;
                
                imageElements.forEach((img, index) => {
                    const imgCenter = img.offsetLeft + img.offsetWidth / 2;
                    const distance = Math.abs(imgCenter - containerCenter);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        currentVisualIndex = index;
                    }
                });
                
                // Si estamos en las primeras 2 copias, saltar hacia el centro-final
                if (currentVisualIndex < 2 * originalLength) {
                    const equivalentCenterIndex = centerStart + (currentVisualIndex % originalLength);
                    if (imageElements[equivalentCenterIndex]) {
                        container.scrollTo({
                            left: imageElements[equivalentCenterIndex].offsetLeft,
                            behavior: 'auto'
                        });
                        return;
                    }
                }
                
                // Si estamos en las últimas 2 copias, saltar hacia el centro-inicio
                if (currentVisualIndex >= (copies + 1 + 2) * originalLength) {
                    const equivalentCenterIndex = centerStart + (currentVisualIndex % originalLength);
                    if (imageElements[equivalentCenterIndex]) {
                        container.scrollTo({
                            left: imageElements[equivalentCenterIndex].offsetLeft,
                            behavior: 'auto'
                        });
                        return;
                    }
                }
            }

            // Lógica mejorada para detectar imagen actual en desktop
            const containerLeft = scrollLeft;
            const containerRight = scrollLeft + containerWidth;
            let bestIndex = -1;
            let bestVisibility = 0;

            imageElements.forEach((img, index) => {
                const imgLeft = img.offsetLeft;
                const imgRight = img.offsetLeft + img.offsetWidth;
                
                // Calcular qué porcentaje de la imagen está visible
                const visibleLeft = Math.max(containerLeft, imgLeft);
                const visibleRight = Math.min(containerRight, imgRight);
                const visibleWidth = Math.max(0, visibleRight - visibleLeft);
                const visibilityPercentage = visibleWidth / img.offsetWidth;
                
                // Lógica más conservadora para evitar cambios constantes
                if (visibilityPercentage > 0.4) { // Aumentar umbral a 40% para más estabilidad
                    // Solo cambiar si hay una diferencia significativa de visibilidad (>20%)
                    if (visibilityPercentage > bestVisibility + 0.2 || 
                        (bestIndex === -1 && visibilityPercentage > 0.5)) {
                        bestVisibility = visibilityPercentage;
                        bestIndex = index;
                    }
                }
            });

            if (bestIndex !== -1) {
                // Convertir índice visual a índice real usando módulo
                let realIndex = bestIndex % currentImages.value.length;
                
                // Asegurar que el índice esté en rango válido
                if (realIndex < 0) realIndex = 0;
                if (realIndex >= currentImages.value.length) realIndex = currentImages.value.length - 1;

                if (selectedImageIndex.value !== realIndex) {
                    selectedImageIndex.value = realIndex;
                    
                    // Scroll thumbnail into view
                    const thumbContainer = thumbnailContainerRef.value;
                    if (thumbContainer && thumbContainer.children[realIndex]) {
                        const thumbEl = thumbContainer.children[realIndex];
                        thumbEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'nearest'
                        });
                    }
                }
            }
        }, debounceTime); // Debounce scroll event
    };

    onMounted(async () => {
        // Cargar usuario verificando autenticación con el backend
        await userStore.loadUserFromStorage();
        
        await loadProduct();

        nextTick(() => {
            const mainImageContainer = mainImageContainerRef.value;
            const leftButton = document.querySelector('.scrollIzquierdaDetalle');
            const rightButton = document.querySelector('.scrollDerechaDetalle');

            checkOverflow(mainImageContainer, leftButton, rightButton);
            window.addEventListener('resize', () => checkOverflow(mainImageContainer, leftButton, rightButton));
            
            // Inicializar carrusel infinito
            initInfiniteCarousel();
        });
    });

    // Inicializar posición del carrusel infinito
    const initInfiniteCarousel = () => {
        nextTick(() => {
            const container = mainImageContainerRef.value;
            if (container && currentImages.value.length > 1) {
                // Posicionar en el centro del carrusel (después de 5 copias)
                const copies = 5;
                const originalLength = currentImages.value.length;
                const centerStartIndex = copies * originalLength;
                const imageElements = Array.from(container.children).filter(c => c.tagName === 'IMG');
                
                if (imageElements[centerStartIndex]) {
                    container.scrollTo({
                        left: imageElements[centerStartIndex].offsetLeft,
                        behavior: 'auto'
                    });
                }
            }
        });
    };

    watch(currentImages, () => {
        nextTick(() => {
            const mainImageContainer = mainImageContainerRef.value;
            const leftButton = document.querySelector('.scrollIzquierdaDetalle');
            const rightButton = document.querySelector('.scrollDerechaDetalle');

            checkOverflow(mainImageContainer, leftButton, rightButton);
            
            // Inicializar carrusel infinito cuando cambien las imágenes
            initInfiniteCarousel();
        });
    });

</script>

<template>
    <section class="sectionDetailProduct">
        <!-- Loading State -->
        <div v-if="loading" style="text-align: center; padding: 2rem;">
            <p>Cargando producto...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" style="text-align: center; padding: 2rem; color: red;">
            <p>Error: {{ error }}</p>
        </div>

        <!-- Product Content -->
        <div v-else-if="product && product.name" class="contenedorDetalleProducto">
           
            <div class="contenedorImagenesMini" ref="thumbnailContainerRef">
                <img 
                    v-for="(image, index) in currentImages" 
                    :key="index"
                    :src="image" 
                    :alt="product.name || 'Producto'"
                    :style="{ border: index === selectedImageIndex ? '2px solid #333333' : '0', cursor: 'pointer' }"
                    @click="selectImage(index)"
                >
                <div v-if="currentImages.length === 0" style="text-align: center; padding: 1rem; color: #666;">
                    Sin imágenes disponibles
                </div>
            </div>
            <div class="sectionSlide" id="sectionSlideDetail">
                <div class="botonesSlide">
                    <i class="fa-solid fa-chevron-left scrollIzquierdaDetalle" @click="prevImage"></i>
                    <i class="fa-solid fa-chevron-right scrollDerechaDetalle" @click="nextImage"></i>
                </div>
                <div class="contenedorImagenesDetalle">
                    <div class="vitrinaSlide" ref="mainImageContainerRef" @scroll="handleMainImageScroll">
                        <img 
                            v-for="(image, index) in infiniteImages" 
                            :key="`infinite-${index}`"
                            :src="image" 
                            :alt="product.name || 'Producto'"
                        >
                        <div v-if="infiniteImages.length === 0" style="display: flex; align-items: center; justify-content: center; min-height: 400px; color: #666;">
                            Sin imágenes disponibles para este color
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="contenedorInfoDetalleProd">
                <h3>{{ product.name ? product.name.toUpperCase() : 'Cargando...' }}</h3>
                <div class="precioDetalleProd">
                    <p class="preDetText">Precio</p>
                    <p class="preDet">
                        <span v-if="product.discount_percentage > 0 && product.price" style="text-decoration: line-through; color: #999; font-size: 0.9rem;">
                            ${{ Math.floor(product.price).toLocaleString('es-CO') }}
                        </span>
                        <span v-if="product.final_price">
                           ${{ Math.floor(product.final_price).toLocaleString('es-CO') }}
                        </span>
                        <span v-else-if="product.price">
                            ${{ Math.floor(product.price).toLocaleString('es-CO') }}
                        </span>
                        <span v-else>Precio no disponible</span>
                        <span v-if="product.discount_percentage > 0" style="color: #28a745; font-size: 0.8rem; margin-left: 0.5rem;">
                            (-{{ Math.floor(product.discount_percentage) }}%)
                        </span>
                    </p>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText">Color</p>
                    <div class="contColorDet">
                        <div 
                            v-for="color in availableColors" 
                            :key="color.id"
                            class="cuadroColor"
                            :style="{ 
                                backgroundColor: color.hex_code,
                                border: selectedColor && selectedColor.id === color.id ? '3px solid #333' : '1px solid #ddd',
                                cursor: 'pointer'
                            }"
                            @click="selectColor(color)"
                            :title="color.name"
                        ></div>
                    </div>
                </div>
                <div class="precioDetalleProd" v-if="availableSizes.length > 0">
                    <p class="preDetText">Talla</p>
                    <div class="contColorDet">
                        <div 
                            v-for="size in availableSizes" 
                            :key="size.id"
                            class="cuadroColor cuadroTalla"
                            :class="{ active: selectedSize && selectedSize.id === size.id }"
                            :style="{ 
                                border: selectedSize && selectedSize.id === size.id ? '2px solid #333' : '1px solid #ddd',
                                backgroundColor: selectedSize && selectedSize.id === size.id ? '#333' : 'transparent',
                                color: selectedSize && selectedSize.id === size.id ? 'white' : '#333',
                                cursor: 'pointer'
                            }"
                            @click="selectSize(size)"
                        >
                            {{ size.name }}
                        </div>
                    </div>
                </div>
                <div class="precioDetalleProd" v-if="selectedSize && selectedColor">
                    <div class="contColorDet">
                        <div class="flechasCantidad">
                            <i class="fa-solid fa-chevron-up" @click="changeQuantity(1)" style="cursor: pointer;"></i>
                            <i class="fa-solid fa-chevron-down" @click="changeQuantity(-1)" style="cursor: pointer;"></i>
                        </div>
                        <div class="cuadroColor cuadroCantidad">{{ quantity }}</div>
                        <button 
                            class="btnAddToCartDetail"
                            :disabled="currentStock === 0"
                            :style="{ opacity: currentStock === 0 ? 0.5 : 1 }"
                        >
                            {{ currentStock === 0 ? 'SIN STOCK' : 'AGREGAR A LA BOLSA' }}
                        </button>
                    </div>
                    <p v-if="currentStock > 0" style="font-size: 0.8rem; color: #666; margin-top: 0.5rem;">
                        Stock disponible: {{ currentStock }} unidades
                    </p>
                </div>
                <div class="precioDetalleProd addFavDet">
                    <div class="contColorDet">
                        <p 
                            class="addFavText" 
                            @click="handleFavoriteToggle" 
                            :class="{ 
                                'favorite-active': isFavorite,
                                'loading': favLoading 
                            }"
                            :style="{ 
                                cursor: favLoading ? 'wait' : 'pointer',
                                opacity: favLoading ? 0.7 : 1 
                            }"
                        >
                            <i 
                                class="fa-solid fa-heart" 
                                :style="{ 
                                    color: isFavorite ? '#ff69b4' : '#666',
                                    marginRight: '8px'
                                }"
                            ></i>
                            {{ favLoading ? 'PROCESANDO...' : (isFavorite ? 'EN FAVORITOS' : 'AGREGAR A MIS FAVORITOS') }}
                        </p>
                    </div>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText addFavText"><i class="fa-regular fa-file-lines"></i>Descripción</p>
                    <div class="contColorDet">
                        <p>{{ product.description || 'Sin descripción disponible' }}</p>
                    </div>
                </div>
                <div class="precioDetalleProd">
                    <p class="preDetText addFavText"><i class="fa-solid fa-truck-fast"></i>Envíos a todo Colombia</p>
                    <div class="contColorDet" style="flex-direction: column !important;">
                        <p>- Ciudades principales de 1 a 4 días hábiles.</p>
                        <p>- Resto del país de 3 a 8 días hábiles.</p>
                    </div>
                </div>

            </div>
        </div>

        <!-- Estado cuando no hay producto -->
        <div v-else style="text-align: center; padding: 2rem;">
            <p>Producto no encontrado</p>
        </div>
    </section>

    <Nuevo :current-product-id="props.id"></Nuevo>
</template>