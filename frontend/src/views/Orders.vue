<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useOrder } from '@/js/composables/useOrder.js'
import { useUserStore } from '@/js/stores/userLogged.js'

// Composables
const { getUserOrders, loading, error } = useOrder()
const userStore = useUserStore()

// Estado reactivo
const orders = ref([])
const currentPage = ref(1)
const totalPages = ref(1)

// Computed
const isAuthenticated = computed(() => userStore.isLoggedIn)

// Función para formatear precio
const formatPrice = (price) => {
  const numericPrice = parseFloat(price)
  if (isNaN(numericPrice) || numericPrice < 0) {
    return '$0'
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(numericPrice)
}

// Función para formatear fecha
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para obtener el estado en español
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmada',
    'processing': 'En proceso',
    'shipped': 'Enviada',
    'delivered': 'Entregada',
    'cancelled': 'Cancelada'
  }
  return statusMap[status] || status
}

// Función para obtener el estado de pago en español
const getPaymentStatusText = (paymentStatus) => {
  const statusMap = {
    'pending': 'Pendiente',
    'paid': 'Pagada',
    'failed': 'Fallida',
    'refunded': 'Reembolsada'
  }
  return statusMap[paymentStatus] || paymentStatus
}

// Cargar órdenes
const loadOrders = async (page = 1) => {
  if (!isAuthenticated.value) return

  try {
    const result = await getUserOrders(page, 10)
    if (result.success) {
      orders.value = result.data.orders
      currentPage.value = result.data.pagination.page
      totalPages.value = result.data.pagination.totalPages
    }
  } catch (err) {
    console.error('Error cargando órdenes:', err)
  }
}

// Cargar órdenes al montar
onMounted(async () => {
  await userStore.loadUserFromStorage()
  if (isAuthenticated.value) {
    await loadOrders()
  }
})
</script>

<template>
  <section class="ordersSection">
    <div class="ordersContainer">
      <h1>Mis Pedidos</h1>
      
      <!-- Mensaje para usuarios no autenticados -->
      <div v-if="!isAuthenticated" class="unauthenticatedMessage">
        <h3>Inicia sesión para ver tus pedidos</h3>
        <p>Para acceder a tu historial de pedidos, por favor 
          <RouterLink to="/login" class="loginLink">inicia sesión</RouterLink> o 
          <RouterLink to="/register" class="registerLink">crea una cuenta</RouterLink>
        </p>
      </div>
      
      <!-- Loading state -->
      <div v-else-if="loading" class="loadingState">
        <div class="spinner"></div>
        <p>Cargando tus pedidos...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="errorState">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button @click="loadOrders()" class="retryButton">Reintentar</button>
      </div>
      
      <!-- Empty orders -->
      <div v-else-if="orders.length === 0" class="emptyOrdersState">
        <div class="emptyIcon">
          <i class="fas fa-receipt"></i>
        </div>
        <h3>No tienes pedidos aún</h3>
        <p>Cuando realices tu primera compra, aparecerá aquí</p>
        <RouterLink to="/" class="exploreButton">Explorar productos</RouterLink>
      </div>
      
      <!-- Orders list -->
      <div v-else class="ordersList">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="orderCard"
        >
          <div class="orderHeader">
            <div class="orderNumber">
              <strong>Pedido #{{ order.order_number }}</strong>
            </div>
            <div class="orderDate">
              {{ formatDate(order.created_at) }}
            </div>
          </div>
          
          <div class="orderBody">
            <div class="orderInfo">
              <div class="orderStatus">
                <span class="statusLabel">Estado:</span>
                <span :class="`status ${order.status}`">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              
              <div class="paymentStatus">
                <span class="statusLabel">Pago:</span>
                <span :class="`payment-status ${order.payment_status}`">
                  {{ getPaymentStatusText(order.payment_status) }}
                </span>
              </div>
              
              <div class="orderTotal">
                <span class="totalLabel">Total:</span>
                <span class="totalAmount">{{ formatPrice(order.total) }}</span>
              </div>
            </div>
            
            <div class="orderItems">
              <h4>Productos ({{ order.items?.length || 0 }} artículos)</h4>
              <div class="itemsList">
                <div 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="orderItem"
                >
                  <span class="itemName">{{ item.product.name }}</span>
                  <span class="itemDetails">
                    {{ item.size }} / {{ item.color }} x{{ item.quantity }}
                  </span>
                  <span class="itemPrice">{{ formatPrice(item.total_price) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="orderActions">
            <RouterLink 
              :to="`/orders/${order.id}`" 
              class="viewOrderButton"
            >
              Ver detalles
            </RouterLink>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="loadOrders(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="paginationButton"
        >
          Anterior
        </button>
        
        <span class="pageInfo">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        
        <button 
          @click="loadOrders(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="paginationButton"
        >
          Siguiente
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ordersSection {
  margin-top: 6rem;
  padding: 2rem;
  font-family: 'Roboto';
  color: #333;
}

.ordersContainer {
  max-width: 1200px;
  margin: 0 auto;
}

.ordersContainer h1 {
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

/* Estados */
.unauthenticatedMessage,
.loadingState,
.errorState,
.emptyOrdersState {
  text-align: center;
  padding: 3rem 2rem;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 2rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #f06baa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.emptyIcon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 1.5rem;
}

.loginLink,
.registerLink,
.exploreButton {
  color: #f06baa;
  text-decoration: underline;
  font-weight: 500;
}

.exploreButton {
  display: inline-block;
  padding: 1rem 2rem;
  background: #f06baa;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.exploreButton:hover {
  background: #e85a9b;
  transform: translateY(-2px);
}

/* Lista de órdenes */
.ordersList {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.orderCard {
  background: white;
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.orderCard:hover {
  transform: translateY(-2px);
}

.orderHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 1rem;
}

.orderNumber {
  font-size: 1.1rem;
  color: #333;
}

.orderDate {
  color: #666;
  font-size: 0.9rem;
}

.orderBody {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.orderInfo {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.orderStatus,
.paymentStatus,
.orderTotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statusLabel,
.totalLabel {
  font-weight: 500;
  color: #666;
}

.status,
.payment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status.pending,
.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.confirmed,
.status.processing,
.payment-status.paid {
  background: #d1ecf1;
  color: #0c5460;
}

.status.shipped {
  background: #d4edda;
  color: #155724;
}

.status.delivered {
  background: #d4edda;
  color: #155724;
}

.status.cancelled,
.payment-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.totalAmount {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f06baa;
}

.orderItems h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.itemsList {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.orderItem {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.9rem;
}

.itemName {
  font-weight: 500;
}

.itemDetails {
  color: #666;
}

.itemPrice {
  text-align: right;
  font-weight: 500;
}

.orderActions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.viewOrderButton {
  padding: 0.5rem 1.5rem;
  background: #f06baa;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.viewOrderButton:hover {
  background: #e85a9b;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.paginationButton {
  padding: 0.5rem 1rem;
  background: #f06baa;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.paginationButton:hover:not(:disabled) {
  background: #e85a9b;
}

.paginationButton:disabled {
  background: #ddd;
  cursor: not-allowed;
}

.pageInfo {
  color: #666;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .orderBody {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .orderItem {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  
  .itemPrice {
    text-align: left;
  }
  
  .orderHeader {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>