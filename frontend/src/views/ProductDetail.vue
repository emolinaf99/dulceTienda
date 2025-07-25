<script setup>
    import { ref, onMounted, computed, nextTick, watch } from 'vue'
    import Nuevo from '../components/Nuevo.vue'
    import { useProducts } from '../js/composables/useProducts.js'
    import { checkOverflow } from '../js/overflow.js'

    const props = defineProps({
        id: String
    })

    // Composable para productos
    const { loading, error, getProductById, getImagesByColor, getAvailableColors, getAvailableSizes, getVariantStock } = useProducts();

    // Estado reactivo
    const product = ref(null);
    const selectedColor = ref(null);
    const selectedSize = ref(null);
    const quantity = ref(1);
    const selectedImageIndex = ref(0);

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
            } else {
                console.error('Product not found');
            }
        } catch (err) {
            console.error('Error loading product:', err);
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
        if (index < 0 || index >= currentImages.value.length) return;
        
        selectedImageIndex.value = index;

        nextTick(() => {
            // Scroll main image
            const container = mainImageContainerRef.value;
            if (container) {
                const imageEl = Array.from(container.children).filter(c => c.tagName === 'IMG')[index];
                if(imageEl){
                    container.scrollTo({
                        left: imageEl.offsetLeft,
                        behavior: 'smooth'
                    });
                }
            }

            // Scroll thumbnail into view
            const thumbContainer = thumbnailContainerRef.value;
            if (thumbContainer && thumbContainer.children[index]) {
                const thumbEl = thumbContainer.children[index];
                thumbEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        });
    };

    const nextImage = () => {
        selectImage(selectedImageIndex.value + 1);
    };

    const prevImage = () => {
        selectImage(selectedImageIndex.value - 1);
    };

    const changeQuantity = (delta) => {
        const newQuantity = quantity.value + delta;
        if (newQuantity >= 1 && newQuantity <= currentStock.value) {
            quantity.value = newQuantity;
        }
    };

    // Sync thumbnail selection on manual scroll of main image
    let scrollTimeout = null;
    const handleMainImageScroll = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const container = mainImageContainerRef.value;
            if (!container || container.children.length === 0) return;

            const imageElements = Array.from(container.children).filter(c => c.tagName === 'IMG');
            if(imageElements.length === 0) return;

            const containerCenter = container.scrollLeft + container.clientWidth / 2;
            let closestIndex = -1;
            let minDistance = Infinity;

            imageElements.forEach((img, index) => {
                const imgCenter = img.offsetLeft + img.offsetWidth / 2;
                const distance = Math.abs(imgCenter - containerCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex !== -1 && selectedImageIndex.value !== closestIndex) {
                selectedImageIndex.value = closestIndex;
                 // Scroll thumbnail into view
                const thumbContainer = thumbnailContainerRef.value;
                if (thumbContainer && thumbContainer.children[closestIndex]) {
                    const thumbEl = thumbContainer.children[closestIndex];
                    thumbEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }
            }
        }, 150); // Debounce scroll event
    };

    onMounted(async () => {
        await loadProduct();

        nextTick(() => {
            const mainImageContainer = mainImageContainerRef.value;
            const leftButton = document.querySelector('.scrollIzquierdaDetalle');
            const rightButton = document.querySelector('.scrollDerechaDetalle');

            checkOverflow(mainImageContainer, leftButton, rightButton);
            window.addEventListener('resize', () => checkOverflow(mainImageContainer, leftButton, rightButton));
        });
    });

    watch(currentImages, () => {
        nextTick(() => {
            const mainImageContainer = mainImageContainerRef.value;
            const leftButton = document.querySelector('.scrollIzquierdaDetalle');
            const rightButton = document.querySelector('.scrollDerechaDetalle');

            checkOverflow(mainImageContainer, leftButton, rightButton);
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
                            v-for="(image, index) in currentImages" 
                            :key="index"
                            :src="image" 
                            :alt="product.name || 'Producto'"
                        >
                        <div v-if="currentImages.length === 0" style="display: flex; align-items: center; justify-content: center; min-height: 400px; color: #666;">
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
                            ${{ product.price.toLocaleString('es-CO') }}
                        </span>
                        <span v-if="product.final_price">
                            ${{ product.final_price.toLocaleString('es-CO') }}
                        </span>
                        <span v-else-if="product.price">
                            ${{ product.price.toLocaleString('es-CO') }}
                        </span>
                        <span v-else>Precio no disponible</span>
                        <span v-if="product.discount_percentage > 0" style="color: #28a745; font-size: 0.8rem; margin-left: 0.5rem;">
                            (-{{ product.discount_percentage }}%)
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
                        <p class="addFavText"><img src="/img/heartIcon.png" alt=""> AGREGAR A MIS FAVORITOS</p>
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

    <Nuevo></Nuevo>
</template>