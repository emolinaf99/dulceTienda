
<script setup>
    import {reactive,ref,onMounted, watch, computed, nextTick} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'
    import { useApi } from '/src/js/composables/useFetch.js'
    import { checkOverflow } from '/src/js/overflow.js'

    // Props para recibir el ID del producto actual (cuando esté en ProductDetail)
    const props = defineProps({
        currentProductId: {
            type: [String, Number],
            default: null
        }
    })

    const route = useRoute()
    const titulo = route.name === 'ProductDetail' ? 'TAMBIÉN TE PUEDE INTERESAR' : 'LO NUEVO'
    
    const products = ref([])
    const loading = ref(true)
    const error = ref(null)
    
    // Computed para determinar si se debe mostrar la sección
    const shouldShowSection = computed(() => {
        return !loading.value && !error.value && products.value.length > 0
    })

    const fetchProducts = async () => {
        try {
            let apiUrl = '/api/products/nuevo'
            let excludeProductId = null
            
            // Si estamos en ProductDetail, obtener productos destacados y excluir el actual
            if (route.name === 'ProductDetail') {
                apiUrl = '/api/products'
                excludeProductId = props.currentProductId
                console.log('🔍 Frontend - Current product ID to exclude:', excludeProductId)
            }
            
            const params = new URLSearchParams()
            if (route.name === 'ProductDetail') {
                params.append('featured', 'true')
                params.append('limit', '8')
                if (excludeProductId) {
                    params.append('exclude', excludeProductId)
                }
            }
            
            const finalUrl = route.name === 'ProductDetail' ? `${apiUrl}?${params}` : apiUrl
            console.log('🔍 Frontend - Final URL:', finalUrl)
            
            const { data, error: fetchError } = await useApi(finalUrl)
            if (fetchError.value) {
                error.value = fetchError.value
            } else if (data.value && data.value.success) {
                products.value = data.value.data.products
                
                // Si estamos en ProductDetail y no hay productos destacados suficientes, 
                // obtener productos recientes como fallback
                if (route.name === 'ProductDetail' && products.value.length < 4) {
                    try {
                        const fallbackUrl = excludeProductId 
                            ? `/api/products/nuevo?exclude=${excludeProductId}&limit=8`
                            : '/api/products/nuevo?limit=8'
                            
                        const { data: fallbackData } = await useApi(fallbackUrl)
                        if (fallbackData.value && fallbackData.value.success) {
                            // Combinar productos destacados con productos nuevos, evitando duplicados
                            const currentIds = products.value.map(p => p.id)
                            const newProducts = fallbackData.value.data.products.filter(p => !currentIds.includes(p.id))
                            products.value = [...products.value, ...newProducts].slice(0, 8)
                        }
                    } catch (fallbackError) {
                        console.warn('Error obteniendo productos de fallback:', fallbackError)
                    }
                }
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price)
    }

    const getDiscountedPrice = (product) => {
        if (product.discount_percentage > 0) {
            const discountedPrice = product.price - (product.price * product.discount_percentage / 100)
            return discountedPrice
        }
        return product.price
    }

    const getMainImage = (product) => {
        if (product.colorImages && product.colorImages.length > 0) {
            return `/uploads/products/${product.colorImages[0].img}`
        }
        return '/img/placeholder.jpg'
    }

    // Watcher para recargar productos cuando cambie el currentProductId
    watch(() => props.currentProductId, () => {
        if (route.name === 'ProductDetail') {
            fetchProducts()
        }
    })

    onMounted(async () => {
        await fetchProducts()

        // Esperar a que Vue actualice el DOM después de cargar los productos
        await nextTick()

        let contenedorScrollNuevos = document.querySelector('.vitrinaSlideNuevos')
        let itemIntoScroll = document.querySelector('.cajaElemento')

        let scrollDerechaNuevo = document.querySelector('.scrollDerechaNuevo')
        let scrollIzquierdaNuevo = document.querySelector('.scrollIzquierdaNuevo')

        if (scrollDerechaNuevo && scrollIzquierdaNuevo) {
            scrollDerechaNuevo.addEventListener('click',() => {
                scrollearConClick(contenedorScrollNuevos,itemIntoScroll,0)
            })

            scrollIzquierdaNuevo.addEventListener('click',() => {
                scrollearConClick(contenedorScrollNuevos,itemIntoScroll,1)
            })
        }

        checkOverflow(contenedorScrollNuevos, scrollIzquierdaNuevo, scrollDerechaNuevo, products.value.length)
        window.addEventListener('resize', () => checkOverflow(contenedorScrollNuevos, scrollIzquierdaNuevo, scrollDerechaNuevo, products.value.length))
    })

    // Watch para actualizar overflow cuando cambie la cantidad de productos
    watch(() => products.value.length, async () => {
        await nextTick() // Esperar a que el DOM se actualice
        const contenedorScrollNuevos = document.querySelector('.vitrinaSlideNuevos')
        const scrollIzquierdaNuevo = document.querySelector('.scrollIzquierdaNuevo')
        const scrollDerechaNuevo = document.querySelector('.scrollDerechaNuevo')
        if (contenedorScrollNuevos) {
            checkOverflow(contenedorScrollNuevos, scrollIzquierdaNuevo, scrollDerechaNuevo, products.value.length)
        }
    })

    // Watch para recargar productos cuando cambia la ruta
    watch(() => route.params.id, async (newId, oldId) => {
        if (newId !== oldId && route.name === 'ProductDetail') {
            loading.value = true
            await fetchProducts()
        }
    })
</script>

<template>
    <section v-if="shouldShowSection" class="seccionElementos">
        <h4>{{titulo}}</h4>
        <div class="sectionSlide">
            <div class="botonesSlide">
                <i class="fa-solid fa-chevron-left scrollIzquierdaNuevo"></i>
                <i class="fa-solid fa-chevron-right scrollDerechaNuevo"></i>
            </div>
            <div class="vitrinaSlide vitrinaSlideNuevos">
                <RouterLink 
                    v-for="product in products" 
                    :key="product.id" 
                    :to="`/products/${product.id}`" 
                    class="cajaElemento"
                >
                    <img :src="getMainImage(product)" :alt="product.name">
                    <div class="itemData">
                        <div class="nameItem">{{ product.name }}</div>
                        <div class="priceItem">
                            <span v-if="product.discount_percentage > 0" class="original-price">{{ formatPrice(product.price) }}</span>
                            <span class="discounted-price">{{ formatPrice(getDiscountedPrice(product)) }}</span>
                            <span v-if="product.discount_percentage > 0" class="discount-badge">-{{ Math.floor(product.discount_percentage) }}%</span>
                        </div>
                    </div>
                </RouterLink>
            </div>
        </div>
        
    </section>
    
</template>