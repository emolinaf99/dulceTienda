<script setup>
    import {reactive,ref,onMounted, watch, computed, nextTick} from 'vue'
    import { RouterLink, RouterView, useRoute, useRouter} from 'vue-router'
    import MenuHamburguesaSlide from '../components/MenuHamburguesaSlide.vue'
    import { useUserStore } from '../js/stores/userLogged.js';
    import { useCategories } from '../js/composables/useCategories.js';
    
    const userStore = useUserStore();
    const userLogged = computed(() => userStore.userLogged);
    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const isAdmin = computed(() => userStore.getUserRole === 'admin');
    const route = useRoute()
    const router = useRouter()

    // Detectar si estamos en la ruta de admin
    const isAdminRoute = computed(() => route.path === '/admin');

    // Usar el composable de categorías
    const { categories, loading, error } = useCategories();

    // El usuario ya se carga desde App.vue

    const handleLogout = () => {
        userStore.logout();
        router.push('/');
    };

    // Función para manejar el clic del burger menu
    const handleBurgerClick = (event) => {
        if (isAdminRoute.value) {
            // Si estamos en admin, abrir adminSidebar
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            if (window.adminPanelToggleSidebar) {
                window.adminPanelToggleSidebar();
            }
            return false;
        } else {
            // Si no es admin, abrir site-home
            event.preventDefault();
            event.stopPropagation();
            
            const siteHome = document.querySelector('.site-home');
            const opacity = document.querySelector('.opacity');
            
            if (siteHome && opacity) {
                if (siteHome.classList.contains('activeMain')) {
                    siteHome.classList.remove('activeMain');
                    opacity.style.display = 'none';
                } else {
                    siteHome.classList.add('activeMain');
                    opacity.style.display = 'flex';
                }
            }
        }
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
            <i class="fa-solid fa-bars" id="burgerMenuIcon" @click="handleBurgerClick"></i>
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

            <!-- Admin Panel Link (solo para administradores) -->
            <RouterLink to="/admin" v-if="isAdmin" title="Panel de Administración" style="display: flex; align-items: center; padding: 5px; background: #333; border-radius: 3px; color: white; text-decoration: none;">
                <i class="fas fa-cog" style="font-size: 16px;"></i>
            </RouterLink>
            
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

