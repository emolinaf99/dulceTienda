<script setup>
    import {reactive,ref,onMounted, watch, computed} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'
    import Nuevo from '../components/Nuevo.vue'
    import { useProducts } from '../js/composables/useProducts.js'

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
                
                // Seleccionar el primer color disponible por defecto
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
        
        // Reinicializar las imágenes después de cambiar color
        setTimeout(() => {
            initializeImageSlider();
        }, 100);
    };

    const selectSize = (size) => {
        selectedSize.value = size;
    };

    const changeQuantity = (delta) => {
        const newQuantity = quantity.value + delta;
        if (newQuantity >= 1 && newQuantity <= currentStock.value) {
            quantity.value = newQuantity;
        }
    };

    const initializeImageSlider = () => {
        setTimeout(() => {
            let contenedorScroll = document.querySelector('.vitrinaSlide')
            let itemIntoScroll = document.querySelector('.vitrinaSlide img')

            let scrollDerecha = document.querySelector('.scrollDerechaDetalle')
            let scrollIzquierda = document.querySelector('.scrollIzquierdaDetalle')

            let contenedorImagesMini = document.querySelector('.contenedorImagenesMini')
            let imagenesMini = document.querySelectorAll('.contenedorImagenesMini img')
            let imagenesGrandes = document.querySelectorAll('.vitrinaSlide img')

            if (!contenedorScroll || !scrollDerecha || !scrollIzquierda || !imagenesMini.length) {
                return;
            }

        function findVisibleImage(derechaOIzquierda) { // para encontrar la imagen visible
            const images = Array.from(imagenesMini);
            const contRect = contenedorImagesMini.getBoundingClientRect();

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const rect = img.getBoundingClientRect();

                if (
                    rect.top >= contRect.top &&
                    rect.left >= contRect.left &&
                    rect.bottom <= contRect.bottom &&
                    rect.right <= contRect.right
                ) {
                    // Si el scroll es hacia la derecha (0), devolver la siguiente imagen
                    if (derechaOIzquierda === 0 && i < images.length - 1) {
                        return images[i + 1];
                    }
                    // Si el scroll es hacia la izquierda (1), devolver la imagen anterior
                    if (derechaOIzquierda === 1 && i > 0) {
                        return images[i - 1];
                    }
                    return img; // Devuelve la imagen actual si no hay siguiente/anterior
                }
            }
            return null;
        }

        function selectImgMini(img) {
            let imagenMiniEncontrada = Array.from(imagenesMini).find(imagenP => imagenP.src == img.src)

            imagenesMini.forEach((imagen) => {
                imagen.style.border = '0'
            })

            img.style.border = '2px solid #333333' 
                
            // Desplazar el contenedor hasta la imagen encontrada
            imagenMiniEncontrada.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        
        scrollDerecha.addEventListener('click',() => {
            scrollearConClick(contenedorScroll,itemIntoScroll,0)
            const visibleImage = findVisibleImage(0)
            selectImgMini(visibleImage)
        })

        scrollIzquierda.addEventListener('click',() => {
            scrollearConClick(contenedorScroll,itemIntoScroll,1)
            
            const visibleImage = findVisibleImage(1)
            selectImgMini(visibleImage)
        })

        let previousScrollLeft = 0; // Almacena la posición anterior del scroll

        contenedorScroll.addEventListener('scroll', () => {
            const currentScrollLeft = contenedorScroll.scrollLeft; // Posición actual del scroll

            if (currentScrollLeft > previousScrollLeft) {
                const visibleImage = findVisibleImage(0)
                selectImgMini(visibleImage)
                
            } else if (currentScrollLeft < previousScrollLeft) {
                const visibleImage = findVisibleImage(1)
                selectImgMini(visibleImage)
            }

            // Actualiza la posición previa del scroll
            previousScrollLeft = currentScrollLeft;
        });


        imagenesMini.forEach(img => {
            img.addEventListener('click', () => { // cuando una imagen pequeña escucha click
                imagenesMini.forEach((imagen) => {
                    imagen.style.border = '0';
                });
                img.style.border = '2px solid #333333';
                
                // Encuentra la imagen grande correspondiente
                let imagenGrandeEncontrada = Array.from(imagenesGrandes).find(imagenG => imagenG.src === img.src);
                
                if (imagenGrandeEncontrada) {
                    // Calcula la posición horizontal para desplazar
                    const offsetLeft = imagenGrandeEncontrada.offsetLeft;
                    
                    // Desplazar el contenedor horizontalmente
                    contenedorScroll.scrollTo({
                        left: offsetLeft,
                        behavior: 'smooth'
                    });
                }
            });
        });
        }, 50); // Pequeño delay para asegurar que el DOM se ha actualizado
    };

    onMounted(async () => {
        // Cargar datos del producto
        await loadProduct();
        
        // Inicializar slider de imágenes
        initializeImageSlider();
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
        <div v-else-if="product && product.id" class="contenedorDetalleProducto">
            <div class="contenedorImagenesMini">
                <img 
                    v-for="(image, index) in currentImages" 
                    :key="index"
                    :src="image" 
                    :alt="product.name || 'Producto'"
                    :style="{ border: index === 0 ? '2px solid #333333' : '0' }"
                >
                <div v-if="currentImages.length === 0" style="text-align: center; padding: 1rem; color: #666;">
                    Sin imágenes disponibles
                </div>
            </div>
            <div class="sectionSlide" id="sectionSlideDetail">
                <div class="botonesSlide">
                    <i class="fa-solid fa-chevron-left scrollIzquierdaDetalle"></i>
                    <i class="fa-solid fa-chevron-right scrollDerechaDetalle"></i>
                </div>
                <div class="contenedorImagenesDetalle">
                    <div class="vitrinaSlide">
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
                        <div v-if="availableColors.length === 0" style="color: #666; font-style: italic;">
                            Sin colores configurados para este producto
                        </div>
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



