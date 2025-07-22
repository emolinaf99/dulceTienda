<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/js/stores/userLogged.js';
import { useAdminApi } from '@/js/composables/useAdminApi.js';

// Components
import AdminDashboard from '@/components/admin/AdminDashboard.vue';
import AdminProducts from '@/components/admin/AdminProducts.vue';
import AdminCategories from '@/components/admin/AdminCategories.vue';
import AdminUsers from '@/components/admin/AdminUsers.vue';
import AdminSizesColors from '@/components/admin/AdminSizesColors.vue';

const router = useRouter();
const userStore = useUserStore();
const { loading, error } = useAdminApi();

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
  }
];

// Methods
const setActiveSection = (section) => {
  activeSection.value = section;
  sidebarVisible.value = false;
};

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

const logout = () => {
  userStore.logout();
  router.push('/login');
};

// Check authentication on mount
onMounted(() => {
  if (!isAdmin.value) {
    router.push('/');
  }
});

// Watch for authentication changes
const stopWatching = userStore.$subscribe(() => {
  if (!isAdmin.value) {
    router.push('/');
  }
});

// Clean up watcher
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => {
  stopWatching();
});
</script>

<template>
  <div class="adminPanel" v-if="isAdmin">
    <!-- Mobile Header -->
    <div class="adminPanelMobileHeader" style="display: none;">
      <button @click="toggleSidebar" class="adminMenuToggle">
        <i class="fas fa-bars"></i>
      </button>
      <h1>Panel de Administración</h1>
      <button @click="logout" class="adminBtn adminBtnSecondary adminBtnSmall">
        <i class="fas fa-sign-out-alt"></i>
        Salir
      </button>
    </div>

    <!-- Sidebar -->
    <aside class="adminSidebar" :class="{ show: sidebarVisible }">
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

      <!-- Error Alert -->
      <div v-if="error" class="adminAlert adminAlertError">
        <i class="fas fa-exclamation-triangle"></i>
        {{ error }}
      </div>

      <!-- Content Sections -->
      <AdminDashboard v-if="activeSection === 'dashboard'" />
      <AdminProducts v-if="activeSection === 'products'" />
      <AdminCategories v-if="activeSection === 'categories'" />
      <AdminUsers v-if="activeSection === 'users'" />
      <AdminSizesColors v-if="activeSection === 'sizes-colors'" />
    </main>

    <!-- Sidebar Overlay for Mobile -->
    <div 
      v-if="sidebarVisible" 
      class="adminSidebarOverlay"
      style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 49;"
      @click="sidebarVisible = false"
    ></div>
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