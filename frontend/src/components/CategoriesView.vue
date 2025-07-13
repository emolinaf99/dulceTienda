
<script setup>
  import {reactive,ref,onMounted, watch} from 'vue'
  import { RouterLink, RouterView, useRoute} from 'vue-router'
  import {scrollearConClick} from '/src/js/scrollWithClick'

  onMounted(() => {
    let contenedorScroll = document.querySelector('.vitrinaSlide')
    let itemIntoScroll = document.querySelector('.blockCategory')

    let scrollDerechaCategorias = document.querySelector('.scrollDerechaCategorias')
    let scrollIzquierdaCategorias = document.querySelector('.scrollIzquierdaCategorias')

    scrollDerechaCategorias.addEventListener('click',() => {
      scrollearConClick(contenedorScroll,itemIntoScroll,0)
    })

    scrollIzquierdaCategorias.addEventListener('click',() => {
      scrollearConClick(contenedorScroll,itemIntoScroll,1)
    })
  })

</script>

<template>
  <div class="categoriesSection">
    
    <h1>Tienda online de ropa para mujer</h1>
    <div class="contenedorGeneralCategorias">
      <div class="botonesSlideOutside">
        <i class="fa-solid fa-chevron-left scrollIzquierdaCategorias"></i>
        <i class="fa-solid fa-chevron-right scrollDerechaCategorias"></i>
      </div>
      
      <div class="sectionSlide">
        
        <div class="vitrinaSlide">
          <RouterLink to="/" class="blockCategory">
            <img src="/img/camisetas.png" alt="Camisetas">
            <p>Camisetas</p>
          </RouterLink>
          <RouterLink to="/" class="blockCategory">
            <img src="/img/buzos.jpg" alt="Buzos">
            <p>Buzos</p>
          </RouterLink>
          <RouterLink to="/" class="blockCategory">
            <img src="/img/leggins.png" alt="Leggins">
            <p>Leggins</p>
          </RouterLink>
          <RouterLink to="/" class="blockCategory">
            <img src="/img/camisetas.png" alt="Camisetas">
            <p>Camisetas</p>
          </RouterLink>
          <RouterLink to="/" class="blockCategory">
            <img src="/img/buzos.jpg" alt="Buzos">
            <p>Buzos</p>
          </RouterLink>
          <RouterLink to="/" class="blockCategory">
            <img src="/img/leggins.png" alt="Leggins">
            <p>Leggins</p>
          </RouterLink>
        </div>
      </div>
    </div>
    
  </div>
  
</template>