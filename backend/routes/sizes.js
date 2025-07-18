import express from 'express';
import { body } from 'express-validator';
import { getAllSizes, getSizeById, createSize, updateSize, deleteSize } from '../controllers/sizeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validaciones para crear/actualizar tallas
const sizeValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  body('type_size_id')
    .isInt({ min: 1 })
    .withMessage('El tipo de talla debe ser un número entero válido')
];

// Rutas públicas
router.get('/', getAllSizes);
router.get('/:id', getSizeById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('admin'), sizeValidation, createSize);
router.put('/:id', authenticate, authorize('admin'), sizeValidation, updateSize);
router.delete('/:id', authenticate, authorize('admin'), deleteSize);

export default router;