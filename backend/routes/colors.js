import express from 'express';
import { body } from 'express-validator';
import { getAllColors, getColorById, createColor, updateColor, deleteColor } from '../controllers/colorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validaciones para crear/actualizar colores
const colorValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  body('hex_code')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('El código hexadecimal debe tener el formato #RRGGBB')
];

// Rutas públicas
router.get('/', getAllColors);
router.get('/:id', getColorById);

// Rutas protegidas (solo admin)
router.post('/', authenticate, authorize('admin'), colorValidation, createColor);
router.put('/:id', authenticate, authorize('admin'), colorValidation, updateColor);
router.delete('/:id', authenticate, authorize('admin'), deleteColor);

export default router;