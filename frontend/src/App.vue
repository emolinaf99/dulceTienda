<script setup>
  import {reactive, ref, onMounted} from 'vue'
  import { RouterLink, RouterView, useRoute} from 'vue-router'
  import HeaderPartial from './components/Header.vue'
  import FooterPartial from './components/Footer.vue'
  import { useUserStore } from '@/js/stores/userLogged.js'

  const route = useRoute()
  const userStore = useUserStore()

  // Cargar usuario al iniciar la aplicación
  onMounted(() => {
    userStore.loadUserFromStorage()
  })

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


