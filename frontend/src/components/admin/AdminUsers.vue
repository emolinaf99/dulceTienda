<script setup>
import { ref, onMounted } from 'vue';
import { useAdminApi } from '@/js/composables/useAdminApi.js';

const {
  getAdminUsers,
  toggleUserStatus,
  loading,
  error
} = useAdminApi();

// State
const users = ref([]);
const pagination = ref({});
const searchTerm = ref('');
const selectedRole = ref('all');
const selectedStatus = ref('all');
const currentPage = ref(1);
const showUserModal = ref(false);
const selectedUser = ref(null);

// Methods
const loadUsers = async () => {
  const params = {
    page: currentPage.value,
    limit: 10,
    search: searchTerm.value,
    role: selectedRole.value,
    status: selectedStatus.value
  };

  const result = await getAdminUsers(params);
  if (result) {
    users.value = result.data;
    pagination.value = result.pagination;
  }
};

const searchUsers = () => {
  currentPage.value = 1;
  loadUsers();
};

const resetFilters = () => {
  searchTerm.value = '';
  selectedRole.value = 'all';
  selectedStatus.value = 'all';
  currentPage.value = 1;
  loadUsers();
};

const changePage = (page) => {
  currentPage.value = page;
  loadUsers();
};

const viewUser = (user) => {
  selectedUser.value = user;
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  selectedUser.value = null;
};

const handleToggleStatus = async (user) => {
  const result = await toggleUserStatus(user.id);
  if (result) {
    loadUsers();
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'admin': return 'background: #dc3545; color: white;';
    case 'mayorista': return 'background: #ffc107; color: #000;';
    case 'cliente': return 'background: #28a745; color: white;';
    default: return 'background: #6c757d; color: white;';
  }
};

const getRoleLabel = (role) => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'mayorista': return 'Mayorista';
    case 'cliente': return 'Cliente';
    default: return role;
  }
};

// Lifecycle
onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="adminUsers">
    <!-- Header Actions -->
    <div class="adminCard">
      <div class="adminCardHeader">
        <h3>
          <i class="fas fa-users" style="margin-right: 0.5rem;"></i>
          Gestión de Usuarios
        </h3>
        <div style="font-size: 0.9rem; color: #666;">
          Los usuarios se registran desde el frontend. Aquí puedes gestionar su estado y ver su información.
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="adminSearchBar">
        <input
          v-model="searchTerm"
          @input="searchUsers"
          type="text"
          placeholder="Buscar usuarios por nombre, apellido o email..."
        />
        
        <select v-model="selectedRole" @change="searchUsers">
          <option value="all">Todos los roles</option>
          <option value="cliente">Clientes</option>
          <option value="mayorista">Mayoristas</option>
          <option value="admin">Administradores</option>
        </select>
        
        <select v-model="selectedStatus" @change="searchUsers">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        
        <button @click="resetFilters" class="adminBtn adminBtnSecondary">
          <i class="fas fa-undo"></i>
          Limpiar
        </button>
      </div>

      <p style="color: #666; margin: 1rem 0 0;">
        Mostrando {{ users.length }} de {{ pagination.totalItems || 0 }} usuarios
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="adminLoading">
      <div class="adminSpinner"></div>
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length > 0" class="adminCard">
      <div class="adminTableWrapper">
        <table class="adminTable">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div>
                  <strong>{{ user.first_name }} {{ user.last_name }}</strong>
                  <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                    ID: {{ user.id }}
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || 'No registrado' }}</td>
              <td>
                <span :style="getRoleBadgeClass(user.role) + ' padding: 0.25rem 0.5rem; border-radius: 3px; font-size: 0.8rem;'">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td>
                <span :style="{ 
                  background: user.is_active ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '3px',
                  fontSize: '0.8rem'
                }">
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ user.last_login ? formatDate(user.last_login) : 'Nunca' }}</td>
              <td>
                <div class="adminTableActions">
                  <button
                    @click="viewUser(user)"
                    class="adminBtn adminBtnSecondary adminBtnSmall"
                    title="Ver detalles"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  
                  <button
                    @click="handleToggleStatus(user)"
                    :class="[
                      'adminBtn', 'adminBtnSmall',
                      user.is_active ? 'adminBtnDanger' : 'adminBtnSuccess'
                    ]"
                    :title="user.is_active ? 'Desactivar usuario' : 'Activar usuario'"
                    v-if="user.role !== 'admin'"
                  >
                    <i :class="user.is_active ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                  </button>
                  
                  <span v-else class="adminBtn adminBtnSmall" style="opacity: 0.5;" title="No puedes desactivar administradores">
                    <i class="fas fa-lock"></i>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="adminPagination" v-if="pagination.totalPages > 1">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="adminPaginationBtn"
        >
          <i class="fas fa-chevron-left"></i>
          Anterior
        </button>
        
        <span style="margin: 0 1rem; color: #666;">
          Página {{ currentPage }} de {{ pagination.totalPages }}
        </span>
        
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= pagination.totalPages"
          class="adminPaginationBtn"
        >
          Siguiente
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="adminCard" style="text-align: center; padding: 3rem;">
      <i class="fas fa-users" style="font-size: 3rem; color: #ddd; margin-bottom: 1rem;"></i>
      <h3 style="color: #666; margin-bottom: 1rem;">No hay usuarios</h3>
      <p style="color: #999; margin-bottom: 2rem;">
        {{ searchTerm || selectedRole !== 'all' || selectedStatus !== 'all' 
           ? 'No se encontraron usuarios con los filtros aplicados.' 
           : 'Los usuarios aparecerán aquí cuando se registren en la tienda.' }}
      </p>
    </div>

    <!-- User Details Modal -->
    <div v-if="showUserModal" class="adminModal" @click.self="closeUserModal">
      <div class="adminModalContent">
        <div class="adminModalHeader">
          <h3>
            <i class="fas fa-user"></i>
            Detalles del Usuario
          </h3>
          <button @click="closeUserModal" class="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedUser" style="display: grid; gap: 1rem;">
          <div class="adminCard" style="margin: 0; padding: 1rem; background: #f8f9fa;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
              <div>
                <strong>Información Personal</strong>
                <div style="margin-top: 0.5rem; color: #666;">
                  <div><strong>Nombre:</strong> {{ selectedUser.first_name }}</div>
                  <div><strong>Apellido:</strong> {{ selectedUser.last_name }}</div>
                  <div><strong>Email:</strong> {{ selectedUser.email }}</div>
                  <div><strong>Teléfono:</strong> {{ selectedUser.phone || 'No registrado' }}</div>
                </div>
              </div>

              <div>
                <strong>Información de Cuenta</strong>
                <div style="margin-top: 0.5rem; color: #666;">
                  <div><strong>ID:</strong> {{ selectedUser.id }}</div>
                  <div>
                    <strong>Rol:</strong> 
                    <span :style="getRoleBadgeClass(selectedUser.role) + ' padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.8rem; margin-left: 0.5rem;'">
                      {{ getRoleLabel(selectedUser.role) }}
                    </span>
                  </div>
                  <div>
                    <strong>Estado:</strong> 
                    <span :style="{ color: selectedUser.is_active ? '#28a745' : '#dc3545', fontWeight: '500' }">
                      {{ selectedUser.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                  <div><strong>Email verificado:</strong> {{ selectedUser.email_verified_at ? 'Sí' : 'No' }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="adminCard" style="margin: 0; padding: 1rem;">
            <strong style="display: block; margin-bottom: 0.5rem;">Fechas Importantes</strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; color: #666;">
              <div><strong>Registro:</strong> {{ formatDate(selectedUser.created_at) }}</div>
              <div><strong>Última actualización:</strong> {{ formatDate(selectedUser.updated_at) }}</div>
              <div><strong>Último acceso:</strong> {{ selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nunca' }}</div>
            </div>
          </div>

          <div class="adminCard" style="margin: 0; padding: 1rem;">
            <strong style="display: block; margin-bottom: 0.5rem;">Dirección</strong>
            <div style="color: #666;">
              <div><strong>Dirección:</strong> {{ selectedUser.address || 'No registrada' }}</div>
              <div><strong>Ciudad:</strong> {{ selectedUser.city || 'No registrada' }}</div>
              <div><strong>Código Postal:</strong> {{ selectedUser.postal_code || 'No registrado' }}</div>
            </div>
          </div>

          <div v-if="selectedUser.role === 'mayorista'" class="adminCard" style="margin: 0; padding: 1rem; background: #fff3cd;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <i class="fas fa-store" style="color: #856404;"></i>
              <strong style="color: #856404;">Información de Mayorista</strong>
            </div>
            <div style="color: #856404;">
              <div><strong>NIT/RUT:</strong> {{ selectedUser.business_id || 'No registrado' }}</div>
              <div><strong>Nombre de empresa:</strong> {{ selectedUser.business_name || 'No registrado' }}</div>
              <div><strong>Descuento automático:</strong> Aplica en productos con descuento</div>
            </div>
          </div>
        </div>

        <div class="adminModalActions">
          <button @click="closeUserModal" class="adminBtn adminBtnSecondary">
            <i class="fas fa-times"></i>
            Cerrar
          </button>
          <button 
            v-if="selectedUser.role !== 'admin'"
            @click="handleToggleStatus(selectedUser); closeUserModal();" 
            :class="[
              'adminBtn',
              selectedUser.is_active ? 'adminBtnDanger' : 'adminBtnSuccess'
            ]"
          >
            <i :class="selectedUser.is_active ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
            {{ selectedUser.is_active ? 'Desactivar Usuario' : 'Activar Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="adminAlert adminAlertError">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
    </div>
  </div>
</template>