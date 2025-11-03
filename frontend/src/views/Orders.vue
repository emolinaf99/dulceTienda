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
      <!-- Header con icono -->
      <div class="ordersHeader">
        <i class="fa-solid fa-receipt headerIcon"></i>
        <h1>Mis Pedidos</h1>
        <p class="itemCount" v-if="!loading && orders.length > 0">
          {{ orders.length }} {{ orders.length === 1 ? 'pedido' : 'pedidos' }}
        </p>
      </div>

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
        <RouterLink to="/" class="exploreButton">
          <i class="fa-solid fa-compass"></i>
          Explorar productos
        </RouterLink>
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
  font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 6rem);
}

.ordersContainer {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========================================
   HEADER WITH ICON
   ======================================== */

.ordersHeader {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.headerIcon {
  font-size: 3rem;
  color: #f06baa;
  margin-bottom: 1rem;
  display: block;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.ordersHeader h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.itemCount {
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

/* Estados */
.unauthenticatedMessage,
.loadingState,
.errorState {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.unauthenticatedMessage h3 {
  color: #333;
  font-weight: 600;
  margin-bottom: 1rem;
}

.unauthenticatedMessage p {
  color: #666;
  line-height: 1.6;
}

/* ========================================
   EMPTY ORDERS STATE
   ======================================== */

.emptyOrdersState {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f5f5f5;
  border-top: 4px solid #f06baa;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loadingState p {
  color: #666;
  font-weight: 500;
}

.emptyIcon {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, rgba(240, 107, 170, 0.1), rgba(232, 90, 155, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyIcon i {
  font-size: 4rem;
  color: #f06baa;
}

.emptyOrdersState h3 {
  font-size: 2rem;
  color: #222;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.emptyOrdersState p {
  color: #666;
  font-size: 1.125rem;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.errorState {
  color: #666;
}

.errorState i {
  font-size: 3rem;
  color: #f06baa;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.errorState p {
  margin-bottom: 1.5rem;
  color: #666;
}

.retryButton {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f06baa, #e85a9b);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);
}

.retryButton:hover {
  background: linear-gradient(135deg, #e85a9b, #d0487d);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 107, 170, 0.4);
}

.loginLink,
.registerLink {
  color: #f06baa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.loginLink:hover,
.registerLink:hover {
  color: #e85a9b;
  text-decoration: underline;
}

.exploreButton {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #f06baa, #e85a9b);
  color: white;
  padding: 1.125rem 2.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.exploreButton:hover {
  background: linear-gradient(135deg, #e85a9b, #d0487d);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 107, 170, 0.4);
}

.exploreButton i {
  font-size: 1.125rem;
}

/* Lista de órdenes */
.ordersList {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.orderCard {
  background: white;
  border: 2px solid #f5f5f5;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.orderCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border-color: #f06baa;
}

.orderHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #f5f5f5;
  margin-bottom: 1.5rem;
}

.orderNumber {
  font-size: 1.125rem;
  color: #222;
  font-weight: 600;
}

.orderDate {
  color: #999;
  font-size: 0.875rem;
  font-weight: 500;
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
  gap: 1rem;
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
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
  letter-spacing: 0.3px;
}

.status,
.payment-status {
  padding: 0.375rem 1rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Estados con paleta rosa + grises */
.status.pending,
.payment-status.pending {
  background: rgba(240, 107, 170, 0.1);
  color: #f06baa;
  border: 1px solid rgba(240, 107, 170, 0.2);
}

.status.confirmed,
.status.processing {
  background: rgba(240, 107, 170, 0.15);
  color: #d0487d;
  border: 1px solid rgba(240, 107, 170, 0.3);
}

.payment-status.paid {
  background: rgba(102, 102, 102, 0.08);
  color: #333;
  border: 1px solid rgba(102, 102, 102, 0.15);
}

.status.shipped,
.status.delivered {
  background: rgba(102, 102, 102, 0.08);
  color: #333;
  border: 1px solid rgba(102, 102, 102, 0.15);
}

.status.cancelled,
.payment-status.failed {
  background: rgba(153, 153, 153, 0.08);
  color: #999;
  border: 1px solid rgba(153, 153, 153, 0.15);
}

.totalAmount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f06baa;
  letter-spacing: -0.3px;
}

.orderItems h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.itemsList {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.orderItem {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #fafafa 0%, #f8f8f8 100%);
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.orderItem:hover {
  background: white;
  border-color: rgba(240, 107, 170, 0.2);
}

.itemName {
  font-weight: 600;
  color: #333;
}

.itemDetails {
  color: #999;
  font-weight: 500;
}

.itemPrice {
  text-align: right;
  font-weight: 600;
  color: #666;
}

.orderActions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid #f5f5f5;
}

.viewOrderButton {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f06baa, #e85a9b);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);
}

.viewOrderButton:hover {
  background: linear-gradient(135deg, #e85a9b, #d0487d);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 107, 170, 0.4);
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.paginationButton {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f06baa, #e85a9b);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);
}

.paginationButton:hover:not(:disabled) {
  background: linear-gradient(135deg, #e85a9b, #d0487d);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 107, 170, 0.4);
}

.paginationButton:disabled {
  background: linear-gradient(135deg, #e0e0e0, #d0d0d0);
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pageInfo {
  color: #666;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.3px;
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