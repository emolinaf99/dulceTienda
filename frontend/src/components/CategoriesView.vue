
<script setup>
  import {reactive,ref,onMounted, watch} from 'vue'
  import { RouterLink, RouterView, useRoute} from 'vue-router'
  import {scrollearConClick} from '/src/js/scrollWithClick'
  import { useCategories } from '../js/composables/useCategories.js';
  import { checkOverflow } from '/src/js/overflow.js'

  // Usar el composable de categorías
  const { categories, loading, error } = useCategories();

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

    checkOverflow(contenedorScroll, scrollIzquierdaCategorias, scrollDerechaCategorias)
    window.addEventListener('resize', () => checkOverflow(contenedorScroll, scrollIzquierdaCategorias, scrollDerechaCategorias))
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
          <RouterLink 
            v-for="category in categories"
            :to="`/category/${category.id}`"
            class="blockCategory"
            :key="category.id"
          >
            <img 
              v-if="!category.image"
              :src="`/img/percha.png`" 
              :alt="category.name"
            >
            <img 
              v-else
              :src="`/uploads/categories/${category.image}`" 
              :alt="category.name"
            >

            <p>{{ category.name }}</p>
          </RouterLink>
          
        </div>
      </div>
    </div>
    
  </div>
  
</template>