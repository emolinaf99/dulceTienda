import express from 'express';
import {
  createOrder,
  getUserOrders,
  getUserOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateUpdatePaymentStatus
} from '../middleware/orderValidation.js';

const router = express.Router();

// Rutas públicas - ninguna

// Rutas protegidas para usuarios autenticados
router.use(authenticate);

// Crear nueva orden desde el carrito (checkout)
router.post('/', validateCreateOrder, createOrder);

// Obtener órdenes del usuario actual
router.get('/my-orders', getUserOrders);

// Obtener orden específica del usuario actual
router.get('/my-orders/:id', getUserOrder);

// Rutas de administración - solo para admins
router.use(authorize('admin'));

// Obtener todas las órdenes (admin)
router.get('/admin/all', getAllOrders);

// Actualizar estado de orden (admin)
router.patch('/admin/:id/status', validateUpdateOrderStatus, updateOrderStatus);

// Actualizar estado de pago (admin)
router.patch('/admin/:id/payment-status', validateUpdatePaymentStatus, updatePaymentStatus);

export default router;