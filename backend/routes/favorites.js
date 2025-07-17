import express from 'express';
import { 
  getFavorites, 
  addToFavorites, 
  removeFromFavorites, 
  removeFromFavoritesByProduct,
  checkFavorite 
} from '../controllers/favoriteController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

const addToFavoritesValidation = [
  body('product_id').isInt({ min: 1 }).withMessage('ID de producto inválido')
];

router.get('/', authenticate, authorize('cliente', 'mayorista'), getFavorites);
router.post('/', authenticate, authorize('cliente', 'mayorista'), addToFavoritesValidation, addToFavorites);
router.delete('/:id', authenticate, authorize('cliente', 'mayorista'), removeFromFavorites);
router.delete('/product/:product_id', authenticate, authorize('cliente', 'mayorista'), removeFromFavoritesByProduct);
router.get('/check/:product_id', authenticate, authorize('cliente', 'mayorista'), checkFavorite);

export default router;