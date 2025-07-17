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
  body('size').notEmpty().withMessage('Talla es requerida'),
  body('color').notEmpty().withMessage('Color es requerido')
];

const updateCartValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
];

router.get('/', authenticate, authorize('cliente', 'mayorista'), getCart);
router.post('/', authenticate, authorize('cliente', 'mayorista'), addToCartValidation, addToCart);
router.put('/:id', authenticate, authorize('cliente', 'mayorista'), updateCartValidation, updateCartItem);
router.delete('/:id', authenticate, authorize('cliente', 'mayorista'), removeFromCart);
router.delete('/', authenticate, authorize('cliente', 'mayorista'), clearCart);

export default router;