import express from 'express';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadCategoryImage, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize('admin'), uploadCategoryImage, handleMulterError, createCategory);
router.put('/:id', authenticate, authorize('admin'), uploadCategoryImage, handleMulterError, updateCategory);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

export default router;