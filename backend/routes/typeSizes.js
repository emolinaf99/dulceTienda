import express from 'express';
import { body } from 'express-validator';
import { getAllTypeSizes, getTypeSizeById, createTypeSize, updateTypeSize, deleteTypeSize } from '../controllers/typeSizeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validaciones para crear/actualizar tipos de tallas
const typeSizeValidation = [
  body('description')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 1, max: 100 })
    .withMessage('La descripción debe tener entre 1 y 100 caracteres')
];

// Rutas públicas
router.get('/', getAllTypeSizes);
router.get('/:id', getTypeSizeById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('admin'), typeSizeValidation, createTypeSize);
router.put('/:id', authenticate, authorize('admin'), typeSizeValidation, updateTypeSize);
router.delete('/:id', authenticate, authorize('admin'), deleteTypeSize);

export default router;