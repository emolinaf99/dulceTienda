import express from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, loginValidation, updateProfileValidation } from '../validators/authValidators.js';
import { authRateLimit } from '../middleware/security.js'; 

//El propósito principal de authRateLimit es proteger tu servidor contra ataques de fuerza bruta, 
// ataques de denegación de servicio (DoS) y el abuso de las rutas de autenticación.

const router = express.Router();

// Temporalmente deshabilitado para desarrollo - RECUERDA VOLVER A HABILITARLO
router.post('/register', /*authRateLimit,*/ registerValidation, register);
router.post('/login', /*authRateLimit,*/ loginValidation, login);
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

export default router;