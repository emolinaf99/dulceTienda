<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';

const emit = defineEmits(['change-section']);
const { getDashboardStats, loading, error } = useAdminApi();

// State
const stats = ref(null);

// Methods
const loadStats = async () => {
  const result = await getDashboardStats();
  if (result) {
    stats.value = result.data;
  }
};

// Lifecycle
onMounted(() => {
  loadStats();
});
</script>

<template>
  <div class="adminDashboard">
    <!-- Loading -->
    <div v-if="loading" class="adminLoading">
      <div class="adminSpinner"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="adminAlert adminAlertError">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
      <button @click="loadStats" class="adminBtn adminBtnPrimary adminBtnSmall" style="margin-left: 1rem;">
        <i class="fas fa-redo"></i>
        Reintentar
      </button>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats">
      <!-- Welcome Message -->
      <div class="adminCard" style="margin-bottom: 2rem;">
        <h2 style="color: #333; margin: 0 0 0.5rem;">
          <i class="fas fa-tachometer-alt" style="margin-right: 0.5rem;"></i>
          Bienvenido al Panel de Administración
        </h2>
        <p style="color: #666; margin: 0;">
          Aquí puedes gestionar productos, categorías, usuarios y más.
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="adminStatsGrid">
        <div class="adminStatCard">
          <h3 style="color: #007bff;">{{ stats.totalProducts }}</h3>
          <p>
            <i class="fas fa-box" style="margin-right: 0.5rem;"></i>
            Total de Productos
          </p>
        </div>

        <div class="adminStatCard">
          <h3 style="color: #28a745;">{{ stats.totalCategories }}</h3>
          <p>
            <i class="fas fa-tags" style="margin-right: 0.5rem;"></i>
            Total de Categorías
          </p>
        </div>

        <div class="adminStatCard">
          <h3 style="color: #17a2b8;">{{ stats.totalUsers }}</h3>
          <p>
            <i class="fas fa-users" style="margin-right: 0.5rem;"></i>
            Total de Usuarios
          </p>
        </div>

        <div class="adminStatCard">
          <h3 style="color: #ffc107;">{{ stats.recentProducts }}</h3>
          <p>
            <i class="fas fa-plus" style="margin-right: 0.5rem;"></i>
            Productos Nuevos (Últimos 10)
          </p>
        </div>

        <div class="adminStatCard">
          <h3 style="color: #fd7e14;">{{ stats.productsOnSale }}</h3>
          <p>
            <i class="fas fa-percentage" style="margin-right: 0.5rem;"></i>
            Productos en Rebaja
          </p>
        </div>

        <div class="adminStatCard">
          <h3 style="color: #dc3545;">{{ stats.outOfStock }}</h3>
          <p>
            <i class="fas fa-exclamation-triangle" style="margin-right: 0.5rem;"></i>
            Sin Stock
          </p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="adminCard">
        <div class="adminCardHeader">
          <h3>
            <i class="fas fa-bolt" style="margin-right: 0.5rem;"></i>
            Acciones Rápidas
          </h3>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <button class="adminBtn adminBtnPrimary" @click="emit('change-section', 'products')" style="padding: 1rem;">
            <i class="fas fa-plus" style="display: block; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            Nuevo Producto
          </button>
          
          <button class="adminBtn adminBtnSuccess" @click="emit('change-section', 'categories')" style="padding: 1rem;">
            <i class="fas fa-tag" style="display: block; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            Nueva Categoría
          </button>
          
          <button class="adminBtn adminBtnSecondary" @click="emit('change-section', 'users')" style="padding: 1rem;">
            <i class="fas fa-user" style="display: block; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            Ver Usuarios
          </button>
          
          <button class="adminBtn adminBtnWarning" @click="emit('change-section', 'sizes-colors')" style="padding: 1rem;">
            <i class="fas fa-palette" style="display: block; font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
            Tallas y Colores
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="adminCard">
        <div class="adminCardHeader">
          <h3>
            <i class="fas fa-clock" style="margin-right: 0.5rem;"></i>
            Actividad Reciente
          </h3>
        </div>
        
        <div style="padding: 1rem 0;">
          <p style="color: #666; text-align: center; margin: 0;">
            <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
            La funcionalidad de actividad reciente estará disponible próximamente.
          </p>
        </div>
      </div>

      <!-- System Info -->
      <div class="adminCard">
        <div class="adminCardHeader">
          <h3>
            <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
            Información del Sistema
          </h3>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
          <div>
            <strong>Versión:</strong>
            <p style="margin: 0.5rem 0; color: #666;">DulceTienda v1.0.0</p>
          </div>
          
          <div>
            <strong>Estado del Sistema:</strong>
            <p style="margin: 0.5rem 0; color: #28a745;">
              <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
              Operativo
            </p>
          </div>
          
          <div>
            <strong>Última Actualización:</strong>
            <p style="margin: 0.5rem 0; color: #666;">{{ new Date().toLocaleDateString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="adminCard" style="text-align: center; padding: 3rem;">
      <i class="fas fa-chart-line" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
      <h3 style="color: #666; margin-bottom: 1rem;">No hay datos disponibles</h3>
      <button @click="loadStats" class="adminBtn adminBtnPrimary">
        <i class="fas fa-redo"></i>
        Cargar Datos
      </button>
    </div>
  </div>
</template>