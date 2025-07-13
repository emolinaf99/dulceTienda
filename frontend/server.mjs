import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;

// Configura el directorio de archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'dist'))); //Sirve los archivos estáticos generados por Vite desde la carpeta dist.

// Configura el middleware para parsear JSON
app.use(express.json()); // Esto es necesario para req.body en formato JSON

// Configura el middleware para parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

import dotenv from 'dotenv';
dotenv.config();

import { enviarCorreoContacto } from './src/controllers/apiController.js';

// Rutas API
app.post('/api/enviarCorreo', enviarCorreoContacto)// Define y maneja todas las rutas API específicas para tu aplicación


// Manejo de rutas SPA
app.get('*', (req, res) => { //Esta configuración captura todas las rutas no manejadas previamente (como /about, /profile, etc.) y las redirige al archivo index.html de tu aplicación. Vue Router en el frontend se encarga de manejar el enrutamiento una vez que el archivo index.html es cargado.
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


// DESARROLLO
// import express from 'express';

// const app = express();
// const port = process.env.PORT || 3000;

// // Rutas API
// app.get('/api/hello', (req, res) => {
//   res.json({ message: '¡Hola desde el backend!' });
// });

// // Aquí no necesitas servir archivos estáticos ni manejar rutas frontend,
// // ya que Vite se encarga de eso en desarrollo.

// app.listen(port, () => {
//   console.log(`Servidor backend corriendo en http://localhost:${port}`);
// });