
<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'

    const route = useRoute()
    const titulo = route.name === 'ProductDetail' ? 'TAMBIÉN TE PUEDE INTERESAR' : 'LO NUEVO'

    onMounted(() => {

        let contenedorScrollNuevos = document.querySelector('.vitrinaSlideNuevos')
        let itemIntoScroll = document.querySelector('.cajaElemento')

        let scrollDerechaNuevo = document.querySelector('.scrollDerechaNuevo')
        let scrollIzquierdaNuevo = document.querySelector('.scrollIzquierdaNuevo')

        scrollDerechaNuevo.addEventListener('click',() => {
            scrollearConClick(contenedorScrollNuevos,itemIntoScroll,0)
        })

        scrollIzquierdaNuevo.addEventListener('click',() => {
            scrollearConClick(contenedorScrollNuevos,itemIntoScroll,1)
        })

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
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/products/1" class="cajaElemento">
                    <img src="/img/buzosMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
            </div>
        </div>
        
    </section>
    
</template>