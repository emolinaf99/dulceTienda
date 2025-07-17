# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DulceTienda is a full-stack e-commerce platform built with Vue 3 frontend and Express.js backend. It features user authentication with role-based access control (admin, cliente, mayorista), product management with image uploads, shopping cart, favorites, and comprehensive security measures. The backend uses MySQL with Sequelize ORM for data persistence.

## Development Commands

### Setup Backend
```bash
cd backend
npm install                    # Instalar dependencias del backend
cp .env.example .env          # Crear archivo de variables de entorno
```

### Setup Frontend
```bash
cd frontend
npm install                    # Instalar dependencias del frontend
```

### Database Setup
1. Crear base de datos MySQL llamada `dulcetienda`
2. Configurar credenciales de la base de datos en `backend/.env`
3. Las tablas se crean automáticamente al iniciar el servidor

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev          # Inicia el servidor backend en http://localhost:3000

# Terminal 2 - Frontend
cd frontend
npm run dev          # Inicia el servidor de desarrollo Vite en http://localhost:5173
```

### Production
```bash
# Compilar frontend
cd frontend
npm run build

# Servir frontend desde backend
cd backend
npm start            # Servidor de producción que sirve frontend + API
```

## Architecture

### Estructura del Proyecto

#### Frontend (`/frontend`)
- **Vue 3 + Composition API**: Usa sintaxis `<script setup>` en todos los componentes
- **Vue Router**: Enrutamiento SPA con lazy loading
- **Vite**: Herramienta de compilación moderna con HMR
- **CSS**: Archivos CSS separados por componentes, vistas y secciones
- **Proxy**: Configurado para redirigir `/api` al backend en desarrollo

#### Backend (`/backend`)
- **Express.js**: Servidor API con middleware de seguridad
- **Sequelize + MySQL**: ORM para manejo de base de datos
- **JWT + bcrypt**: Autenticación y encriptación de contraseñas
- **Multer**: Manejo de archivos e imágenes
- **Validación**: Express-validator para validación de datos

### Directorios Principales

#### Frontend
- `src/views/`: Páginas principales (HomeView, Login, Register, Cart, etc.)
- `src/components/`: Componentes reutilizables (Banner, CategoriesView, etc.)
- `src/partials/`: Componentes de layout (Header, Footer)
- `src/controllers/`: Lógica de interacción con la API
- `src/js/`: Funciones utilitarias y composables
- `src/assets/css/`: CSS organizado por componentes y vistas

#### Backend
- `models/`: Modelos de Sequelize para la base de datos
- `controllers/`: Lógica de negocio para cada endpoint
- `routes/`: Definición de rutas API
- `middleware/`: Autenticación, seguridad y validación
- `config/`: Configuración de base de datos
- `public/uploads/`: Archivos subidos (imágenes de productos)

### Backend Architecture
- **Database**: MySQL with Sequelize ORM for data modeling and relationships
- **Authentication**: JWT tokens with bcrypt password hashing
- **Authorization**: Role-based access control (admin, cliente, mayorista)
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **File Upload**: Multer middleware for product image handling (1-4 images per product)
- **API Structure**: RESTful endpoints with comprehensive validation

### Database Models
- **Users**: Authentication, profiles, roles (admin/cliente/mayorista)
- **Products**: Name, price, discount, stock, sizes, colors, images (JSON fields)
- **Categories**: Normal categories + auto-categories (nuevo, rebajas)
- **Cart**: User shopping cart with size/color selections
- **Favorites**: User wishlist functionality
- **Orders**: Order management with items and status tracking

### API Endpoints
- `/api/auth/*` - Authentication (register, login, profile)
- `/api/products/*` - Product CRUD with image upload
- `/api/categories/*` - Category management
- `/api/cart/*` - Shopping cart operations
- `/api/favorites/*` - Wishlist management
- `/api/enviarCorreo` - Contact form (existing)

### Router Configuration
- Automatic scroll-to-top on route changes
- Lazy loading for all routes except home page
- Dynamic route for product details with props

## Important Notes

### User Roles & Permissions
- **Admin**: Full CRUD access to products, categories, and user management
- **Cliente**: Browse products, add to cart/favorites, place orders
- **Mayorista**: Same as cliente + automatic wholesale discounts on discounted products

### Default Credentials
On first run, a default admin user is created:
- Email: `admin@dulcetienda.com`
- Password: `Admin123!`

### Security Features
- Password hashing with bcrypt (12 rounds)
- JWT token authentication with configurable expiration
- Rate limiting on auth endpoints (5 attempts per 15 minutes)
- Input sanitization and validation
- Helmet security headers
- CORS protection

### File Structure Conventions
- Backend models in `src/models/` with Sequelize definitions
- Controllers in `src/controllers/` handle business logic
- Routes in `src/routes/` define API endpoints
- Middleware in `src/middleware/` for auth, security, uploads
- Vue components use PascalCase naming
- CSS files mirror component structure

### Environment Configuration
- Copy `.env.example` to `.env` and configure database credentials
- JWT_SECRET should be changed in production
- Uses ES modules (`"type": "module"` in package.json)
- Vite alias `@` points to `src/` directory

### Image Upload
- Product images stored in `public/uploads/products/`
- Maximum 4 images per product, minimum 1
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB per image
- Auto-generated unique filenames