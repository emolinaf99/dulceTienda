
<script setup>
    import {reactive,ref,onMounted, watch, computed, nextTick} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'
    import { useApi } from '/src/js/composables/useFetch.js'
    import { checkOverflow } from '/src/js/overflow.js'
    
    const products = ref([])
    const loading = ref(true)
    const error = ref(null)
    
    // Computed para determinar si se debe mostrar la sección
    const shouldShowSection = computed(() => {
        return !loading.value && !error.value && products.value.length > 0
    })

    const fetchSaleProducts = async () => {
        try {
            const { data, error: fetchError } = await useApi('/api/products/rebajas')
            if (fetchError.value) {
                error.value = fetchError.value
            } else if (data.value && data.value.success) {
                products.value = data.value.data.products
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

    onMounted(async () => {
        await fetchSaleProducts()

        // Esperar a que Vue actualice el DOM después de cargar los productos
        await nextTick()

        let contenedorScrollRebajas = document.querySelector('.vitrinaSlideRebajas')
        let itemIntoScroll = document.querySelector('.cajaElemento')

        let scrollDerechaRebajas = document.querySelector('.scrollDerechaRebajas')
        let scrollIzquierdaRebajas = document.querySelector('.scrollIzquierdaRebajas')

        if (scrollDerechaRebajas && scrollIzquierdaRebajas) {
            scrollDerechaRebajas.addEventListener('click',() => {
                scrollearConClick(contenedorScrollRebajas,itemIntoScroll,0)
            })

            scrollIzquierdaRebajas.addEventListener('click',() => {
                scrollearConClick(contenedorScrollRebajas,itemIntoScroll,1)
            })
        }

        checkOverflow(contenedorScrollRebajas, scrollIzquierdaRebajas, scrollDerechaRebajas, products.value.length)
        window.addEventListener('resize', () => checkOverflow(contenedorScrollRebajas, scrollIzquierdaRebajas, scrollDerechaRebajas, products.value.length))
    })

    // Watch para actualizar overflow cuando cambie la cantidad de productos
    watch(() => products.value.length, async () => {
        await nextTick() // Esperar a que el DOM se actualice
        const contenedorScrollRebajas = document.querySelector('.vitrinaSlideRebajas')
        const scrollIzquierdaRebajas = document.querySelector('.scrollIzquierdaRebajas')
        const scrollDerechaRebajas = document.querySelector('.scrollDerechaRebajas')
        if (contenedorScrollRebajas) {
            checkOverflow(contenedorScrollRebajas, scrollIzquierdaRebajas, scrollDerechaRebajas, products.value.length)
        }
    })
</script>

<template>
    
    <section v-if="shouldShowSection" class="seccionElementos">
        <h4>REBAJAS</h4>
        <div class="sectionSlide">
            <div class="botonesSlide">
                <i class="fa-solid fa-chevron-left scrollIzquierdaRebajas"></i>
                <i class="fa-solid fa-chevron-right scrollDerechaRebajas"></i>
            </div>
            <div class="vitrinaSlide vitrinaSlideRebajas">
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