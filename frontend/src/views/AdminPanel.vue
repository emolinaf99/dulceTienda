<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/js/stores/userLogged.js';

// Components
import AdminDashboard from '@/components/admin/AdminDashboard.vue';
import AdminProducts from '@/components/admin/AdminProducts.vue';
import AdminCategories from '@/components/admin/AdminCategories.vue';
import AdminUsers from '@/components/admin/AdminUsers.vue';
import AdminSizesColors from '@/components/admin/AdminSizesColors.vue';
import AdminBanner from '@/components/admin/AdminBanner.vue';
import AdminAboutUs from '@/components/admin/AdminAboutUs.vue';

const router = useRouter();
const userStore = useUserStore();

// State
const activeSection = ref('dashboard');
const sidebarVisible = ref(false);

// Check if user is admin
const isAdmin = computed(() => {
  return userStore.isLoggedIn && userStore.getUserRole === 'admin';
});

// Sidebar navigation items
const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fa-tachometer-alt'
  },
  {
    id: 'products',
    label: 'Productos',
    icon: 'fa-box'
  },
  {
    id: 'categories',
    label: 'Categorías',
    icon: 'fa-tags'
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: 'fa-users'
  },
  {
    id: 'sizes-colors',
    label: 'Tallas y Colores',
    icon: 'fa-palette'
  },
  {
    id: 'banner',
    label: 'Banner Principal',
    icon: 'fa-image'
  },
  {
    id: 'about-us',
    label: 'Quienes Somos',
    icon: 'fa-info-circle'
  }
];

// Methods
const setActiveSection = (section) => {
  activeSection.value = section;
  closeSidebar(); // Usar la función closeSidebar para cerrar correctamente
};

// Método para manejar eventos externos del header
const handleSidebarToggle = () => {
  const newState = !sidebarVisible.value;
  sidebarVisible.value = newState;
  
  // Controlar el fondo de opacity cuando se abre/cierra el sidebar
  const opacity = document.querySelector('.opacity');
  if (opacity) {
    if (newState) {
      opacity.style.display = 'flex';
      // Agregar event listener para cerrar el sidebar al hacer clic en opacity
      opacity.addEventListener('click', closeSidebar);
    } else {
      opacity.style.display = 'none';
      opacity.removeEventListener('click', closeSidebar);
    }
  }
};

// Función para cerrar sidebar
const closeSidebar = () => {
  sidebarVisible.value = false;
  const opacity = document.querySelector('.opacity');
  if (opacity) {
    opacity.style.display = 'none';
    opacity.removeEventListener('click', closeSidebar);
  }
};

// Exponer métodos para uso externo
window.adminPanelToggleSidebar = handleSidebarToggle;

const logout = () => {
  userStore.logout();
  router.push('/login');
};

// Check authentication on mount
onMounted(() => {
  if (!isAdmin.value) {
    router.push('/');
  }
  
  // Añadir data-route al body para CSS condicional
  document.body.setAttribute('data-route', '/admin');
});

// Watch for authentication changes
const stopWatching = userStore.$subscribe(() => {
  if (!isAdmin.value) {
    router.push('/');
  }
});

// Clean up watcher and exposed methods
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  stopWatching();
  delete window.adminPanelToggleSidebar;
  
  // Limpiar event listeners de opacity
  const opacity = document.querySelector('.opacity');
  if (opacity) {
    opacity.removeEventListener('click', closeSidebar);
    opacity.style.display = 'none';
  }
  
  // Limpiar data-route del body al salir
  document.body.removeAttribute('data-route');
});
</script>

<template>
  <div class="adminPanel" v-if="isAdmin" :class="{ 'sidebar-open': sidebarVisible }">

    <!-- Sidebar -->
    <aside class="adminSidebar" :class="{ show: sidebarVisible }">
      <i class="fa-solid fa-xmark equis" @click="closeSidebar"></i>
      <div class="adminSidebarHeader">
        <h2>Admin Panel</h2>
        <p style="color: #666; margin: 0.5rem 0 0; font-size: 0.9rem;">
          {{ userStore.getUserInfo?.first_name }} {{ userStore.getUserInfo?.last_name }}
        </p>
      </div>
      
      <nav class="adminSidebarNav">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="setActiveSection(item.id)"
          class="adminSidebarItem"
          :class="{ active: activeSection === item.id }"
        >
          <i class="fas" :class="item.icon"></i>
          {{ item.label }}
        </button>
        
        <button @click="logout" class="adminSidebarItem" style="margin-top: 2rem; color: #dc3545;">
          <i class="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="adminContent">
      <div class="adminContentHeader">
        <h1>
          {{ navItems.find(item => item.id === activeSection)?.label || 'Panel de Administración' }}
        </h1>
        <button @click="logout" class="adminBtn adminBtnSecondary" style="display: none;">
          <i class="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </div>


      <!-- Content Sections -->
      <AdminDashboard v-if="activeSection === 'dashboard'" @change-section="setActiveSection" />
      <AdminProducts v-if="activeSection === 'products'" />
      <AdminCategories v-if="activeSection === 'categories'" />
      <AdminUsers v-if="activeSection === 'users'" />
      <AdminSizesColors v-if="activeSection === 'sizes-colors'" />
      <AdminBanner v-if="activeSection === 'banner'" />
      <AdminAboutUs v-if="activeSection === 'about-us'" />
    </main>

  </div>

  <!-- Not authorized -->
  <div v-else class="adminPanel">
    <div class="adminContent" style="margin-left: 0; text-align: center; padding-top: 5rem;">
      <div class="adminCard">
        <h2 style="color: #dc3545; margin-bottom: 1rem;">
          <i class="fas fa-exclamation-triangle"></i>
          Acceso No Autorizado
        </h2>
        <p style="margin-bottom: 2rem;">
          No tienes permisos para acceder al panel de administración.
        </p>
        <RouterLink to="/" class="adminBtn adminBtnPrimary">
          <i class="fas fa-home"></i>
          Volver al Inicio
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style>
@import '@/assets/css/views/AdminPanel.css';

@media screen and (max-width: 1024px) {
  .adminPanelMobileHeader {
    display: flex !important;
  }
  
  .adminContentHeader button {
    display: none !important;
  }
}
</style>