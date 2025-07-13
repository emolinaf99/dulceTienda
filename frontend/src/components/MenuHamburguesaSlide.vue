<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'

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

        burgerMenuIcon.addEventListener('click',() => {
            abrirYCerrarNavbarBurguerMenu()
        })

        equisBurgerMenu.addEventListener('click',() => {
            abrirYCerrarNavbarBurguerMenu()
        })

        fondoTransparenteOscuro.addEventListener('click',() => {
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
            <RouterLink to="/"><div class="contItem"><p>Lo Nuevo</p></div></RouterLink>
            <RouterLink to="/"><div class="contItem"><p>Camisetas</p></div></RouterLink>    
            <RouterLink to="/"><div class="contItem"><p>Buzos</p></div></RouterLink>
            <RouterLink to="/"><div class="contItem"><p>Leggins</p></div></RouterLink>
            <RouterLink to="/"><div class="contItem"><p>Rebajas</p></div></RouterLink>
            <RouterLink to="/"><div class="contItem"><p>Mayoristas</p></div></RouterLink>
        </div>

        <div class="contenedorSiteHome">
            <a href="https://www.instagram.com/db_basic/" target="_blank"><div class="contItem"><i class="fa-brands fa-instagram"></i><p>Síguenos</p></div></a>
            
        </div>
        
    </div>
</template>


