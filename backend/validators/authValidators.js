import { body } from 'express-validator';

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 }) // Cambia el mínimo a 8 caracteres
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])/) // Agrega la validación para carácter especial
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('phone')
    .optional()
    .isMobilePhone('es-CO')
    .withMessage('Debe ser un número de teléfono válido'),
  
  body('role')
    .isIn(['cliente', 'mayorista'])
    .withMessage('El rol debe ser cliente o mayorista')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
];

export const updateProfileValidation = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras y espacios'),
  
  body('phone')
    .optional()
    .isMobilePhone('es-CO')
    .withMessage('Debe ser un número de teléfono válido'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ciudad no puede exceder 100 caracteres'),
  
  body('postal_code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('El código postal no puede exceder 20 caracteres')
];