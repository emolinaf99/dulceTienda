<script setup>
  import {reactive, ref, onMounted} from 'vue'
  import { RouterLink, RouterView, useRoute} from 'vue-router'
  import HeaderPartial from './partials/Header.vue'
  import FooterPartial from './partials/Footer.vue'

  const route = useRoute()

</script>

<template>
  
    <header>
      <HeaderPartial
      
      />
    </header>

    <main>
      <RouterView />
    </main>


    <footer >
      <FooterPartial

      />
    </footer>
</template>


