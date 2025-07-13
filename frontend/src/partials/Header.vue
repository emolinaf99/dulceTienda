<script setup>
    import {reactive,ref,onMounted, watch} from 'vue'
    import { RouterLink, RouterView, useRoute} from 'vue-router'
    import MenuHamburguesaSlide from '../components/MenuHamburguesaSlide.vue'

    const route = useRoute()
    
</script>

<template>

    <div class="opacity"></div>
    <div class="opacityVentanas"></div>

    <section class="s2Header" id="mayoristaMovile">
        <RouterLink to="/"><div class="itemSecondNavbar">¿Quieres ser mayorista?</div></RouterLink>
        
    </section>
    <section class="s1Header">
        <div class="bloque_logo_burguerMenu">
            <i class="fa-solid fa-bars" id="burgerMenuIcon"></i>
            <RouterLink to="/"><img class="logoApp" src="/img/logoDulceEjemplo.jpg" alt=""></RouterLink>
            
        </div>

        <div class="navbar">
            <RouterLink to="/"><button class="botonHeader">Mayoristas</button></RouterLink>
            <RouterLink to="/login"><img src="/img/userIcon.png" alt=""></RouterLink>
            <RouterLink to="/wishlist"><img src="/img/heartIcon.png" alt=""></RouterLink>
            <RouterLink to="/cart"><img src="/img/shoppingBag.png" alt=""></RouterLink>
            
        </div>
    </section>
    <section class="contenedorSectionTwo">
        <section class="s2Header" id="navbarCategorias">
            <RouterLink to="/"><div class="itemSecondNavbar">LO NUEVO</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">CAMISETAS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">LEGGINS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">BUSOS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">REBAJAS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">LO NUEVO</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">CAMISETAS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">LEGGINS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">BUSOS</div></RouterLink>
            <RouterLink to="/"><div class="itemSecondNavbar">REBAJAS</div></RouterLink>
        </section>
    </section>
    
    
    <MenuHamburguesaSlide></MenuHamburguesaSlide>
    
    <!-- Notificaciones -->
    <div class="notificacionContainer">
        <p></p>
    </div>
</template>

