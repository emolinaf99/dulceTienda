<script setup>
    import {reactive,ref,onMounted, watch, computed} from 'vue'
    import { useCategories } from '../js/composables/useCategories.js'
    import { useRoute } from 'vue-router'
    import { useUserStore } from '../js/stores/userLogged.js'

    // Usar el composable de categorías
    const { categories, loading, error } = useCategories();
    const route = useRoute();

    // Usuario store
    const userStore = useUserStore();
    const userLogged = computed(() => userStore.userLogged);

    // Función para cerrar el sidebar (accesible desde el template)
    const cerrarSidebar = () => {
        let navBarBurguerMenu = document.querySelector('.site-home')
        let fondoTransparenteOscuro = document.querySelector('.opacity')

        if(navBarBurguerMenu.classList.contains('activeMain')) {
            navBarBurguerMenu.classList.remove('activeMain')
            fondoTransparenteOscuro.style.display = 'none'
        }
    }

    onMounted(() => {

        function abrirYCerrarNavbarBurguerMenu() {
            let navBarBurguerMenu = document.querySelector('.site-home')
            let fondoTransparenteOscuro = document.querySelector('.opacity')

            if(navBarBurguerMenu.classList.contains('activeMain')) {
                navBarBurguerMenu.classList.remove('activeMain')
                fondoTransparenteOscuro.style.display = 'none'
            } else {
                navBarBurguerMenu.classList.add('activeMain')
                fondoTransparenteOscuro.style.display = 'flex'
            }
        }

        // Ejecucion de abrirYCerrarNavbarBurguerMenu()

        let equisBurgerMenu = document.getElementById('equisOculta')
        let fondoTransparenteOscuro = document.querySelector('.opacity')

        // El evento click ya se maneja en Header.vue
        // Los clicks en RouterLinks ahora se manejan con @click en el template

        equisBurgerMenu.addEventListener('click',() => {
            abrirYCerrarNavbarBurguerMenu()
        })

        fondoTransparenteOscuro.addEventListener('click',(event) => {
            // No ejecutar si estamos en la ruta /admin
            if (window.location.pathname === '/admin') {
                return;
            }
            abrirYCerrarNavbarBurguerMenu()
        })

    })

</script>

<template>
    <!-- Menu hamburguesa -->
    <div class="site-home" >
        <i class="fa-solid fa-xmark equis" id="equisOculta"></i>
        <div class="contenedorSiteHome">
            <RouterLink
                v-for="category in categories"
                :key="category.id"
                :to="`/category/${category.id}`"
                @click="cerrarSidebar"
            >
                <div class="contItem"><p>{{ category.name }}</p></div>
            </RouterLink>
            <RouterLink to="/" @click="cerrarSidebar">
                <div class="contItem"><p>Mayoristas</p></div>
            </RouterLink>
        </div>

        <div class="contenedorSiteHome">
            <RouterLink to="/orders" v-if="userLogged" @click="cerrarSidebar">
                <div class="contItem">
                    <i class="fas fa-receipt"></i>
                    <p>Mis Pedidos</p>
                </div>
            </RouterLink>
            <a href="https://www.instagram.com/db_basic/" target="_blank" @click="cerrarSidebar">
                <div class="contItem">
                    <i class="fa-brands fa-instagram"></i>
                    <p>Síguenos</p>
                </div>
            </a>
        </div>

    </div>
</template>


