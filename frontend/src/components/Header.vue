<script setup>
    import {reactive,ref,onMounted, watch, computed} from 'vue'
    import { RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
    import MenuHamburguesaSlide from '../components/MenuHamburguesaSlide.vue'
    import { useUserStore } from '../js/stores/userLogged.js';
    import { useCategories } from '../js/composables/useCategories.js';
    
    const userStore = useUserStore();
    const userLogged = computed(() => userStore.userLogged);
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const route = useRoute()
    const router = useRouter()

    // Usar el composable de categorías
    const { categories, loading, error } = useCategories();

    // El usuario ya se carga desde App.vue

    const handleLogout = () => {
        userStore.logout();
        router.push('/');
    };

    
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
            
            <!-- Si no está logueado -->
            <RouterLink to="/login" v-if="!isLoggedIn">
                <img src="/img/userIcon.png" alt="Login">
            </RouterLink>
            
            <!-- Si está logueado -->
            <div v-else class="user-menu">
                <span class="user-name">{{ userLogged?.first_name || userLogged?.email }}</span>
                
            </div>
            
            <RouterLink to="/wishlist"><img src="/img/heartIcon.png" title="Favoritos"></RouterLink>
            <RouterLink to="/cart"><img src="/img/shoppingBag.png" title="Carrito"></RouterLink>
            <div class="logout-btn" v-if="userLogged"><img @click="handleLogout" src="/img/logout.png" title="Cerrar sesión"></div>
            
        </div>
    </section>
    <section class="contenedorSectionTwo">
        <section class="s2Header" id="navbarCategorias">
            <RouterLink 
                v-for="category in categories" 
                :key="category.id" 
                :to="`/category/${category.id}`"
            >
                <div class="itemSecondNavbar">{{ category.name.toUpperCase() }}</div>
            </RouterLink>
        </section>
    </section>
    
    
    <MenuHamburguesaSlide></MenuHamburguesaSlide>
    
    <!-- Notificaciones -->
    <div class="notificacionContainer">
        <p></p>
    </div>
</template>

