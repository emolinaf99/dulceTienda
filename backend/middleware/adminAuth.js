import { authenticate, authorize } from './auth.js';

// Middleware específico para rutas de administrador
export const adminOnly = [authenticate, authorize('admin')];

// Middleware para verificar si es admin (sin requerir autenticación obligatoria)
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Acceso no autorizado' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo los administradores pueden acceder a este recurso' 
    });
  }

  next();
};