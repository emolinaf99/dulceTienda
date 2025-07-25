
<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'
    import { useApi } from '/src/js/composables/useFetch.js'

    const route = useRoute()
    const titulo = route.name === 'ProductDetail' ? 'TAMBIÉN TE PUEDE INTERESAR' : 'LO NUEVO'
    
    const products = ref([])
    const loading = ref(true)
    const error = ref(null)

    const fetchNewProducts = async () => {
        try {
            const { data, error: fetchError } = await useApi('/api/products/nuevo')
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

    const getMainImage = (product) => {
        if (product.colorImages && product.colorImages.length > 0) {
            return `/uploads/products/${product.colorImages[0].img}`
        }
        return '/img/placeholder.jpg'
    }

    onMounted(async () => {
        await fetchNewProducts()

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
    })
</script>

<template>
    <section class="seccionElementos">
        <h4>{{titulo}}</h4>
        <div class="sectionSlide">
            <div class="botonesSlide">
                <i class="fa-solid fa-chevron-left scrollIzquierdaNuevo"></i>
                <i class="fa-solid fa-chevron-right scrollDerechaNuevo"></i>
            </div>
            <div class="vitrinaSlide vitrinaSlideNuevos">
                <div v-if="loading" class="loading-message">Cargando productos...</div>
                <div v-else-if="error" class="error-message">Error: {{ error }}</div>
                <template v-else>
                    <RouterLink 
                        v-for="product in products" 
                        :key="product.id" 
                        :to="`/products/${product.id}`" 
                        class="cajaElemento"
                    >
                        <img :src="getMainImage(product)" :alt="product.name">
                        <div class="itemData">
                            <div class="nameItem">{{ product.name }}</div>
                            <div class="priceItem">{{ formatPrice(product.price) }}</div>
                        </div>
                    </RouterLink>
                </template>
            </div>
        </div>
        
    </section>
    
</template>