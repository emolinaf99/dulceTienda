
<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import {scrollearConClick} from '/src/js/scrollWithClick'

    onMounted(() => {

        let contenedorScrollRebajas = document.querySelector('.vitrinaSlideRebajas')
        let itemIntoScroll = document.querySelector('.cajaElemento')

        let scrollDerechaRebajas = document.querySelector('.scrollDerechaRebajas')
        let scrollIzquierdaRebajas = document.querySelector('.scrollIzquierdaRebajas')


        scrollDerechaRebajas.addEventListener('click',() => {
            scrollearConClick(contenedorScrollRebajas,itemIntoScroll,0)
        })

        scrollIzquierdaRebajas.addEventListener('click',() => {
            scrollearConClick(contenedorScrollRebajas,itemIntoScroll,1)
        })
        
    })
</script>

<template>
    
    <section class="seccionElementos">
        <h4>REBAJAS</h4>
        <div class="sectionSlide">
            <div class="botonesSlide">
                <i class="fa-solid fa-chevron-left scrollIzquierdaRebajas"></i>
                <i class="fa-solid fa-chevron-right scrollDerechaRebajas"></i>
            </div>
            <div class="vitrinaSlide vitrinaSlideRebajas">
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
                <RouterLink to="/" class="cajaElemento">
                    <img src="/img/camisetaMuestra.jpg" alt="">
                    <div class="itemData">
                        <div class="nameItem">Buzo Rosado</div>
                        <div class="priceItem">$40.000</div>
                    </div>
                </RouterLink>
            </div>
        </div>
        
    </section>
    
</template>