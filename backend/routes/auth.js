import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, loginValidation, updateProfileValidation } from '../validators/authValidators.js';
import { authRateLimit } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authRateLimit, registerValidation, register);
router.post('/login', authRateLimit, loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

export default router;