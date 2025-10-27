import { ref } from 'vue'
import { useApi } from './useFetch.js'

export const useOrder = () => {
  const loading = ref(false)
  const error = ref(null)

  // Crear orden (checkout)
  const createOrder = async (orderData) => {
    loading.value = true
    error.value = null

    try {
      console.log('🛒 [FRONTEND] Creando orden con datos:', orderData)

      const { data, error: fetchError } = await useApi('/api/orders', 'POST', orderData)
      
      // Obtener los valores actuales de los refs
      const response = data.value
      const errorValue = fetchError.value
      
      console.log('🛒 [FRONTEND] Response data:', response)
      console.log('🛒 [FRONTEND] Error value:', errorValue)

      // Si hay un error en la petición
      if (errorValue) {
        console.error('🛒 [FRONTEND] Error de fetch:', errorValue)
        
        if (errorValue.response) {
          console.error('🛒 [FRONTEND] Error status:', errorValue.response.status)
          console.error('🛒 [FRONTEND] Error data:', errorValue.response.data)
          error.value = `Error ${errorValue.response.status}: ${errorValue.response.data?.message || 'Error del servidor'}`
          
          return {
            success: false,
            message: error.value,
            errors: errorValue.response.data?.errors
          }
        } else {
          error.value = `Error de conexión: ${errorValue.message || 'No se pudo conectar al servidor'}`
          return {
            success: false,
            message: error.value
          }
        }
      }

      if (response && response.success) {
        console.log('🛒 [FRONTEND] Orden creada exitosamente:', response.data)
        return {
          success: true,
          data: response.data,
          message: response.message
        }
      } else {
        console.error('🛒 [FRONTEND] Error del servidor:', response?.message)
        error.value = response?.message || 'Error al crear la orden'
        return {
          success: false,
          message: response?.message || 'Error al crear la orden',
          errors: response?.errors
        }
      }
    } catch (err) {
      console.error('🛒 [FRONTEND] Error inesperado:', err)
      error.value = 'Error inesperado al crear la orden'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Obtener órdenes del usuario
  const getUserOrders = async (page = 1, limit = 10) => {
    loading.value = true
    error.value = null

    try {
      console.log('🛒 [FRONTEND] Solicitando órdenes del usuario...')
      const { data, error: fetchError } = await useApi(`/api/orders/my-orders?page=${page}&limit=${limit}`)
      
      // Obtener los valores actuales de los refs
      const response = data.value
      const errorValue = fetchError.value
      
      console.log('🛒 [FRONTEND] Response data:', response)
      console.log('🛒 [FRONTEND] Error value:', errorValue)
      
      // Si hay un error en la petición
      if (errorValue) {
        console.error('🛒 [FRONTEND] Error de fetch:', errorValue)
        
        if (errorValue.response) {
          console.error('🛒 [FRONTEND] Error status:', errorValue.response.status)
          console.error('🛒 [FRONTEND] Error data:', errorValue.response.data)
          error.value = `Error ${errorValue.response.status}: ${errorValue.response.data?.message || 'Error del servidor'}`
          
          return {
            success: false,
            message: error.value
          }
        } else {
          error.value = `Error de conexión: ${errorValue.message || 'No se pudo conectar al servidor'}`
          return {
            success: false,
            message: error.value
          }
        }
      }
      
      console.log('🛒 [FRONTEND] Respuesta completa:', response)

      if (response && response.success) {
        console.log('🛒 [FRONTEND] Órdenes cargadas exitosamente:', response.data)
        return {
          success: true,
          data: response.data
        }
      } else {
        console.error('🛒 [FRONTEND] Error del servidor:', response?.message)
        error.value = response?.message || 'Error al cargar las órdenes'
        return {
          success: false,
          message: response?.message || 'Error al cargar las órdenes'
        }
      }
    } catch (err) {
      console.error('🛒 [FRONTEND] Error inesperado:', err)
      error.value = 'Error inesperado al cargar las órdenes'
      return {
        success: false,
        message: error.value
      }
    } finally {
      loading.value = false
    }
  }

  // Obtener orden específica del usuario
  const getUserOrder = async (orderId) => {
    loading.value = true
    error.value = null

    try {
      const { data: response } = await useApi(`/api/orders/my-orders/${orderId}`)

      if (response.success) {
        return {
          success: true,
          data: response.data
        }
      } else {
        error.value = response.message || 'Error al cargar la orden'
        return {
          success: false,
          message: response.message
        }
      }
    } catch (err) {
      console.error('Error cargando orden:', err)
      error.value = 'Error de conexión al cargar la orden'
      return {
        success: false,
        message: 'Error de conexión al cargar la orden'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createOrder,
    getUserOrders,
    getUserOrder
  }
}