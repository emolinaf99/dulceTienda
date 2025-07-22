import express from 'express';
import {
  getDashboardStats,
  getAdminProducts,
  getAdminCategories,
  getAdminUsers,
  getAdminSizes,
  getAdminTypeSizes,
  getAdminColors,
  toggleProductStatus,
  toggleCategoryStatus,
  toggleUserStatus,
  createTypeSize
} from '../controllers/adminController.js';
import { adminOnly } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Products management
router.get('/products', getAdminProducts);
router.patch('/products/:id/toggle-status', toggleProductStatus);

// Categories management
router.get('/categories', getAdminCategories);
router.patch('/categories/:id/toggle-status', toggleCategoryStatus);

// Users management
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Sizes, type sizes and colors
router.get('/sizes', getAdminSizes);
router.get('/type-sizes', getAdminTypeSizes);
router.post('/type-sizes', createTypeSize);
router.get('/colors', getAdminColors);

export default router;