import express from 'express';
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} from '../controllers/cartController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

const addToCartValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('ID de producto inválido'),
  body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
  body('size_id').isInt({ min: 1 }).withMessage('ID de talla inválido'),
  body('color_id').isInt({ min: 1 }).withMessage('ID de color inválido')
];

const updateCartValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
];

router.get('/', authenticate, authorize('cliente', 'mayorista', 'admin'), getCart);
router.post('/', authenticate, authorize('cliente', 'mayorista', 'admin'), addToCartValidation, addToCart);
router.put('/:id', authenticate, authorize('cliente', 'mayorista', 'admin'), updateCartValidation, updateCartItem);
router.delete('/:id', authenticate, authorize('cliente', 'mayorista', 'admin'), removeFromCart);
router.delete('/', authenticate, authorize('cliente', 'mayorista', 'admin'), clearCart);

export default router;