<script setup>
  import {reactive, ref, onMounted} from 'vue'
  import { RouterLink, RouterView } from 'vue-router'
  
  import Instagram from '../components/Instagram.vue'
  import Banner from '../components/Banner.vue'
  import CategoriesView from '../components/CategoriesView.vue'
  import Nuevo from '../components/Nuevo.vue'
  import Rebajas from '../components/Rebajas.vue'
  import QuienesSomosReview from '../components/QuienesSomosReview.vue'
  import InfoAdicional from '../components/InfoAdicional.vue'
  
</script>

<template>
  
  <Banner></Banner>
  <CategoriesView></CategoriesView>
  <Nuevo></Nuevo>
  <Rebajas></Rebajas>
  <Instagram></Instagram>
  <QuienesSomosReview></QuienesSomosReview>
  <InfoAdicional></InfoAdicional>
  
</template>


