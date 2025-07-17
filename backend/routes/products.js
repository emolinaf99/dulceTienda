import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getNewProducts,
  getSaleProducts 
} from '../controllers/productController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { uploadProductImages, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

router.get('/', optionalAuth, getAllProducts);
router.get('/nuevo', getNewProducts);
router.get('/rebajas', getSaleProducts);
router.get('/:id', optionalAuth, getProductById);

router.post('/', 
  authenticate, 
  authorize('admin'), 
  uploadProductImages, 
  handleMulterError, 
  createProduct
);

router.put('/:id', 
  authenticate, 
  authorize('admin'), 
  uploadProductImages, 
  handleMulterError, 
  updateProduct
);

router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

export default router;