import sequelize from '../config/database.js';
import { User, Category, Product, Cart, Favorite, Order, OrderItem } from '../models/associations.js';

export const initializeDatabase = async () => {
  try {
    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: false }); // force: true borra y recrea las tablas
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Crear categorías por defecto si no existen
    await createDefaultCategories();
    
    // Crear usuario administrador por defecto si no existe
    await createDefaultAdmin();

    console.log('✅ Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    throw error;
  }
};

const createDefaultCategories = async () => {
  try {
    const categoriesCount = await Category.count();
    
    if (categoriesCount === 0) {
      const defaultCategories = [
        {
          name: 'Camisetas',
          description: 'Camisetas para todas las ocasiones',
          type: 'normal',
          sort_order: 1
        },
        {
          name: 'Leggins',
          description: 'Leggins cómodos y modernos',
          type: 'normal',
          sort_order: 2
        },
        {
          name: 'Buzos',
          description: 'Buzos para el clima frío',
          type: 'normal',
          sort_order: 3
        },
        {
          name: 'Lo Nuevo',
          description: 'Los últimos productos agregados',
          type: 'nuevo',
          sort_order: 4
        },
        {
          name: 'Descuentos',
          description: 'Productos con descuentos especiales',
          type: 'Descuentos',
          sort_order: 5
        }
      ];

      await Category.bulkCreate(defaultCategories);
      console.log('✅ Categorías por defecto creadas.');
    }
  } catch (error) {
    console.error('❌ Error creando categorías por defecto:', error);
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminCount = await User.count({ where: { role: 'admin' } });
    
    if (adminCount === 0) {
      await User.create({
        email: 'admin@dulcetienda.com',
        password: 'Admin123!',
        first_name: 'Administrador',
        last_name: 'Sistema',
        role: 'admin',
        phone: '1234567890'
      });
      console.log('✅ Usuario administrador por defecto creado.');
      console.log('📧 Email: admin@dulcetienda.com');
      console.log('🔑 Contraseña: Admin123!');
    }
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
  }
};