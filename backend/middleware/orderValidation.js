import { body } from 'express-validator';

// Validaciones para crear orden
export const validateCreateOrder = [
  // Validaciones de contacto
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email no puede exceder 255 caracteres'),
  
  body('newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter debe ser un valor booleano'),

  // Validaciones de información de envío
  body('country')
    .notEmpty()
    .withMessage('El país es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El país debe tener entre 2 y 100 caracteres'),

  body('firstName')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('lastName')
    .notEmpty()
    .withMessage('Los apellidos son requeridos')
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),

  body('document')
    .notEmpty()
    .withMessage('El número de documento es requerido')
    .isNumeric()
    .withMessage('El documento debe contener solo números')
    .isLength({ min: 7, max: 15 })
    .withMessage('El documento debe tener entre 7 y 15 dígitos'),

  body('address')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('addressDetails')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Los detalles de dirección no pueden exceder 200 caracteres'),

  body('city')
    .notEmpty()
    .withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),

  body('department')
    .notEmpty()
    .withMessage('El departamento es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El departamento debe tener entre 2 y 100 caracteres'),

  body('postalCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('El código postal no puede exceder 10 caracteres'),

  body('phone')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, paréntesis, guiones y el signo +')
    .isLength({ min: 10, max: 20 })
    .withMessage('El teléfono debe tener entre 10 y 20 caracteres'),

  // Validaciones de métodos
  body('deliveryMethod')
    .optional()
    .isIn(['envio', 'pickup'])
    .withMessage('Método de entrega inválido'),

  body('paymentMethod')
    .notEmpty()
    .withMessage('El método de pago es requerido')
    .isIn(['pse', 'mercado_pago', 'wompi'])
    .withMessage('Método de pago inválido'),

  // Validación de dirección de facturación
  body('billingAddress')
    .notEmpty()
    .withMessage('Debe especificar si usar la misma dirección o una diferente')
    .isIn(['same', 'different'])
    .withMessage('Opción de dirección de facturación inválida'),

  // Validaciones condicionales para dirección de facturación diferente
  body('billing.country')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('El país de facturación es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El país de facturación debe tener entre 2 y 100 caracteres'),

  body('billing.firstName')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('El nombre de facturación es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre de facturación debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre de facturación solo puede contener letras y espacios'),

  body('billing.lastName')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('Los apellidos de facturación son requeridos')
    .isLength({ min: 2, max: 50 })
    .withMessage('Los apellidos de facturación deben tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos de facturación solo pueden contener letras y espacios'),

  body('billing.document')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('El documento de facturación es requerido')
    .isNumeric()
    .withMessage('El documento de facturación debe contener solo números')
    .isLength({ min: 7, max: 15 })
    .withMessage('El documento de facturación debe tener entre 7 y 15 dígitos'),

  body('billing.address')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('La dirección de facturación es requerida')
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección de facturación debe tener entre 5 y 200 caracteres'),

  body('billing.city')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('La ciudad de facturación es requerida')
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad de facturación debe tener entre 2 y 100 caracteres'),

  body('billing.department')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('El departamento de facturación es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El departamento de facturación debe tener entre 2 y 100 caracteres'),

  body('billing.phone')
    .if(body('billingAddress').equals('different'))
    .notEmpty()
    .withMessage('El teléfono de facturación es requerido')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('El teléfono de facturación debe contener solo números, espacios, paréntesis, guiones y el signo +')
    .isLength({ min: 10, max: 20 })
    .withMessage('El teléfono de facturación debe tener entre 10 y 20 caracteres')
];

// Validaciones para actualizar estado de orden (admin)
export const validateUpdateOrderStatus = [
  body('status')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Estado de orden inválido')
];

// Validaciones para actualizar estado de pago (admin)
export const validateUpdatePaymentStatus = [
  body('payment_status')
    .notEmpty()
    .withMessage('El estado de pago es requerido')
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Estado de pago inválido')
];