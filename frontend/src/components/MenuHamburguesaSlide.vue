<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { useCategories } from '../js/composables/useCategories.js'
    import { useRoute } from 'vue-router'

    // Usar el composable de categorías
    const { categories, loading, error } = useCategories();
    const route = useRoute();

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

        let burgerMenuIcon = document.getElementById('burgerMenuIcon')
        let equisBurgerMenu = document.getElementById('equisOculta')
        let optionsNavbarBurgerMenu = document.querySelectorAll('.site-home a')
        let fondoTransparenteOscuro = document.querySelector('.opacity')

        // El evento click ya se maneja en Header.vue
        // Solo mantenemos los otros event listeners

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


        optionsNavbarBurgerMenu.forEach(option => {
            option.addEventListener('click',() => {
                abrirYCerrarNavbarBurguerMenu()
            })
        });

        

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
            >
                <div class="contItem"><p>{{ category.name }}</p></div>
            </RouterLink>
            <RouterLink to="/"><div class="contItem"><p>Mayoristas</p></div></RouterLink>
        </div>

        <div class="contenedorSiteHome">
            <a href="https://www.instagram.com/db_basic/" target="_blank"><div class="contItem"><i class="fa-brands fa-instagram"></i><p>Síguenos</p></div></a>
            
        </div>
        
    </div>
</template>


