import express from 'express';
import {
    requestPasswordReset,
    verifyResetToken,
    resetPassword
} from '../controllers/passwordResetController.js';

const router = express.Router();

// Solicitar recuperación de contraseña
router.post('/request', requestPasswordReset);

// Verificar token de recuperación
router.get('/verify/:token', verifyResetToken);

// Restablecer contraseña
router.post('/reset', resetPassword);

export default router;
