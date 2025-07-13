# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DulceTienda is a Vue 3 e-commerce application with an Express.js backend for serving static files and handling API endpoints. The project uses Vite as the build tool and has a hybrid architecture where the Express server serves both static frontend files and API routes.

## Development Commands

### Frontend Development
```bash
cd frontend
npm install
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Production Server
```bash
cd frontend
node server.mjs      # Start Express server (serves built frontend + API)
```

## Architecture

### Frontend Structure
- **Vue 3 + Composition API**: Uses `<script setup>` syntax throughout
- **Vue Router**: SPA routing with lazy-loaded components
- **Vite Build Tool**: Modern build system with hot module replacement
- **CSS Architecture**: Separate CSS files for components, views, and partials

### Key Frontend Directories
- `src/views/`: Main page components (HomeView, Login, Register, Cart, etc.)
- `src/components/`: Reusable UI components (Banner, CategoriesView, etc.)
- `src/partials/`: Layout components (Header, Footer)
- `src/controllers/`: API interaction logic
- `src/js/`: Utility functions and composables
- `src/assets/css/`: Organized CSS with component/view-specific styles

### Backend Integration
- **Hybrid Server**: Express.js serves both static files and API endpoints
- **API Routes**: Prefixed with `/api/` (e.g., `/api/enviarCorreo`)
- **SPA Fallback**: All non-API routes redirect to `index.html` for client-side routing
- **Email Service**: Nodemailer integration for contact form functionality

### Router Configuration
- Automatic scroll-to-top on route changes
- Lazy loading for all routes except home page
- Dynamic route for product details with props

### API Integration
- Custom `useApi` composable in `src/js/useFetch.js` for API calls
- Controller pattern for API endpoints in `src/controllers/`
- Express middleware for JSON and URL-encoded data parsing

## Important Notes

### Development vs Production
- **Development**: Vite dev server handles frontend, separate Express server for API
- **Production**: Single Express server serves both built frontend and API routes
- **Proxy Configuration**: Commented out in `vite.config.js` - enable for development if needed

### File Structure Conventions
- Vue components use PascalCase naming
- CSS files mirror component structure
- Controllers handle API business logic
- Utility functions are organized in `src/js/`

### Environment Configuration
- Uses ES modules (`"type": "module"` in package.json)
- Environment variables loaded via dotenv
- Vite alias `@` points to `src/` directory