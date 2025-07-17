import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos MySQL con Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'dulcetienda_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Ares442*',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,        // Máximo número de conexiones en el pool
      min: 0,         // Mínimo número de conexiones en el pool
      acquire: 30000, // Tiempo máximo en ms para obtener una conexión
      idle: 10000     // Tiempo máximo en ms que una conexión puede estar inactiva
    },
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export default sequelize;