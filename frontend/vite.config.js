import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), // Este plugin permite que Vite maneje archivos .vue, lo que es esencial para cualquier proyecto Vue.
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) //El alias '@' se configura para apuntar a la carpeta src, lo que facilita la importación de módulos dentro de tu código.
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // URL del backend
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:3000', // Para servir las imágenes de productos
        changeOrigin: true,
        secure: false
      }
    }
  }

})

// COMENTARIOS IMPORTANTES

//  * Cuando estás en un entorno de producción y el dominio es dominio.com, la configuración del proxy en Vite ya no es necesaria porque tanto el frontend como el backend estarán desplegados juntos en un mismo servidor o en servidores conectados. En lugar de usar un proxy, lo que necesitas hacer es asegurarte de que el servidor backend sirva tanto los archivos estáticos del frontend como las rutas API.
