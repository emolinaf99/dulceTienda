import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Importar middleware de seguridad
import { helmetConfig, generalRateLimit, apiRateLimit, sanitizeInput } from './middleware/security.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import favoriteRoutes from './routes/favorites.js';
import sizeRoutes from './routes/sizes.js';
import colorRoutes from './routes/colors.js';
import typeSizeRoutes from './routes/typeSizes.js';
import adminRoutes from './routes/admin.js';

// Importar controlador de correos
import { enviarCorreoContacto } from './controllers/emailController.js';

// Importar inicialización de base de datos
import { initializeDatabase } from './database/init.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de archivos estáticos y rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de seguridad
app.use(helmetConfig);
app.use('/api', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
app.use('/api/', apiRateLimit);
app.use(generalRateLimit);

// Servir archivos estáticos con una configuración CORS más flexible
app.use('/uploads', cors(), express.static(path.join(__dirname, 'public/uploads')));

// // Servir archivos estáticos con CORS headers específicos
// app.use('/uploads', (req, res, next) => {
//   const allowedOrigins = [
//     process.env.FRONTEND_URL || 'http://localhost:5173', // Tu frontend
//     'http://localhost:3000' // Tu backend
//   ];
//   const origin = req.headers.origin; // Obtiene el origen de la solicitud entrante

//   // Verifica si el origen de la solicitud está en la lista de permitidos
//   if (allowedOrigins.includes(origin)) {
//     // Si lo está, establece la cabecera Access-Control-Allow-Origin con ese origen
//     res.header('Access-Control-Allow-Origin', origin);
//   }
//   // Si el origen no está en la lista, la cabecera no se establece,
//   // y el navegador aplicará la política de mismo origen por defecto.

//   res.header('Access-Control-Allow-Methods', 'GET');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// }, express.static(path.join(__dirname, 'public/uploads')));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/type-sizes', typeSizeRoutes);
app.use('/api/admin', adminRoutes);

// Ruta para envío de correos de contacto
app.post('/api/enviarCorreo', enviarCorreoContacto);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor backend funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

// Inicializar base de datos y servidor
const iniciarServidor = async () => {
  try {
    await initializeDatabase();
    
    app.listen(port, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
      console.log(`📊 Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 Seguridad: Helmet, CORS y Rate Limiting activados`);
      console.log(`💾 Base de datos: MySQL con Sequelize ORM`);
      console.log(`📁 Archivos estáticos: /uploads para imágenes de productos`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();