--  Tienda de Ropa

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS dulcetienda_db;

-- Usar la base de datos
USE dulcetienda_db;

-- Tabla: users
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `role` ENUM('admin', 'cliente', 'mayorista') DEFAULT 'cliente' NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `address` TEXT,
  `city` VARCHAR(100),
  `postal_code` VARCHAR(20),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

---

-- NUEVA TABLA: type_sizes (Tipos de tallas: ropa, calzado, etc.)
CREATE TABLE `type_sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `description` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

---

-- NUEVA TABLA: sizes (Tallas específicas: S, M, L, 38, 39, etc.)
CREATE TABLE `sizes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE, -- Ejemplo: 'S', 'M', 'L', 'XL', '38', '40'
  `type_size_id` INT NOT NULL, -- FK a type_sizes para agrupar tallas (ej. 'ropa', 'calzado')
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`type_size_id`) REFERENCES `type_sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

---

-- NUEVA TABLA: colors
CREATE TABLE `colors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE, -- Ejemplo: 'Rojo', 'Azul', 'Negro'
  `hex_code` VARCHAR(7) NOT NULL UNIQUE, -- Opcional: para guardar el código hexadecimal del color (ej. '#FF0000')
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

---

-- Table: categories (MODIFICADA para incluir FKs a type_sizes y colors)
-- Tabla corregida: categories
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `image` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `type` ENUM('normal', 'nuevo', 'rebajas') DEFAULT 'normal' NOT NULL,
  `sort_order` INT DEFAULT 0,
  `type_size_id` INT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`type_size_id`) REFERENCES `type_sizes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

---

-- Table: products 
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `discount_percentage` DECIMAL(5, 2) DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `category_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

---

-- NUEVA TABLA INTERMEDIA: product_variants (Relación N:M entre productos y tallas,colores)
CREATE TABLE `product_variants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `size_id` INT NOT NULL,
  `color_id` INT NOT NULL,
  `stock` INT DEFAULT 0,
  `sku` VARCHAR(100), -- Opcional: para identificación única
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`product_id`, `size_id`, `color_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE
);

---

-- NUEVA TABLA: img_color_products (Imágenes de productos asociadas a colores específicos)
CREATE TABLE `img_color_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `img` VARCHAR(255) NOT NULL, -- Ruta o URL de la imagen
  `product_id` INT NOT NULL,
  `color_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (`img`, `product_id`, `color_id`) -- Para evitar imágenes duplicadas para la misma combinación
);

---

CREATE TABLE `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT DEFAULT 1 NOT NULL,
  `size_id` INT NOT NULL,  -- CAMBIADO: Ahora es una FK a la tabla `sizes`
  `color_id` INT NOT NULL, -- CAMBIADO: Ahora es una FK a la tabla `colors`
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`size_id`) REFERENCES `sizes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,  -- NUEVA FK
  FOREIGN KEY (`color_id`) REFERENCES `colors` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE, -- NUEVA FK
  UNIQUE (`user_id`, `product_id`, `size_id`, `color_id`) -- CAMBIADO: La restricción UNIQUE ahora usa los IDs
);

---

-- Table: favorites
CREATE TABLE `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (`user_id`, `product_id`)
);

---

-- Table: orders (ACTUALIZADA con nuevas columnas para checkout)
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `status` ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `discount_amount` DECIMAL(10, 2) DEFAULT 0,
  `total` DECIMAL(10, 2) NOT NULL,
  `shipping_address` JSON NOT NULL,
  `billing_address` JSON NULL, -- NUEVA: Dirección de facturación (cuando es diferente a la de envío)
  `delivery_method` ENUM('envio', 'pickup') DEFAULT 'envio', -- NUEVA: Método de entrega
  `payment_method` ENUM('pse', 'mercado_pago', 'wompi') NOT NULL, -- MODIFICADA: Cambiada de VARCHAR a ENUM
  `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `customer_email` VARCHAR(255) NOT NULL, -- NUEVA: Email del cliente para confirmación
  `newsletter_consent` BOOLEAN DEFAULT FALSE, -- NUEVA: Consentimiento para newsletter
  `notes` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

---

-- Table: order_items (MODIFICADA para reflejar los cambios en `products`)
-- NOTA: Dejo `size` y `color` como VARCHARs para capturar el valor exacto en el momento de la orden.
-- `unit_price` y `total_price` ya estaban.
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `size` VARCHAR(10) NOT NULL,  -- Se mantiene como string para la historia de la orden
  `color` VARCHAR(50) NOT NULL, -- Se mantiene como string para la historia de la orden
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

---

-- DOCUMENTACIÓN DE CAMBIOS EN ORDERS (2024)
-- ============================================

-- NUEVAS COLUMNAS AGREGADAS:
-- 
-- 1. billing_address (JSON NULL):
--    Almacena la dirección de facturación cuando es diferente a la de envío
--    Estructura JSON ejemplo:
--    {
--      "country": "Colombia",
--      "firstName": "Juan",
--      "lastName": "Pérez",
--      "document": "12345678",
--      "address": "Calle 123 #45-67",
--      "addressDetails": "Apartamento 301",
--      "city": "Bogotá",
--      "department": "Cundinamarca",
--      "postalCode": "110111",
--      "phone": "3001234567"
--    }
--
-- 2. delivery_method (ENUM('envio', 'pickup') DEFAULT 'envio'):
--    Método de entrega seleccionado por el cliente
--    - 'envio': Envío a domicilio
--    - 'pickup': Recogida en tienda
--
-- 3. customer_email (VARCHAR(255) NOT NULL):
--    Email del cliente para envío de confirmaciones de orden
--    Incluye validación de formato de email
--
-- 4. newsletter_consent (BOOLEAN DEFAULT FALSE):
--    Consentimiento del cliente para recibir newsletter
--    Almacena la decisión explícita del usuario
--
-- COLUMNAS MODIFICADAS:
--
-- 1. payment_method (VARCHAR → ENUM('pse', 'mercado_pago', 'wompi')):
--    Cambio de VARCHAR a ENUM para restringir valores válidos
--    - 'pse': PSE (Pagos Seguros en Línea)
--    - 'mercado_pago': Mercado Pago
--    - 'wompi': Wompi
--
-- ESTRUCTURA JSON DE shipping_address:
-- {
--   "country": "Colombia",
--   "firstName": "María",
--   "lastName": "García",
--   "document": "87654321",
--   "address": "Carrera 45 #67-89",
--   "addressDetails": "Casa 2B",
--   "city": "Medellín",
--   "department": "Antioquia",
--   "postalCode": "050001",
--   "phone": "3009876543"
-- }
--
-- MIGRACIÓN APLICADA: 002-update-orders.js
-- Fecha: 2024
-- Propósito: Agregar campos del formulario de checkout al sistema de órdenes