import sequelize from '../config/database.js';
import { User, Category, Product, Cart, Favorite, Order, OrderItem, TypeSize, Size, Color, ProductVariant, ImgColorProduct } from '../models/associations.js';

export const initializeDatabase = async () => {
  try {
    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: false }); // force: true borra y recrea las tablas
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Crear datos iniciales con timeout
    const initPromise = Promise.all([
      createDefaultTypeSizes(),
      createDefaultSizes(),
      createDefaultColors(),
      createDefaultCategories(),
      createDefaultAdmin()
    ]);

    await Promise.race([
      initPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout en inicialización')), 10000)
      )
    ]);

    console.log('✅ Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    // No relanzar el error para que el servidor pueda continuar
    console.log('⚠️ Continuando sin inicialización completa...');
  }
};

const createDefaultTypeSizes = async () => {
  try {
    const typeSizesCount = await TypeSize.count();
    
    if (typeSizesCount === 0) {
      const defaultTypeSizes = [
        { description: 'Tallaje por letras' },
        { description: 'Tallaje para pantalones' }
      ];

      await TypeSize.bulkCreate(defaultTypeSizes);
      console.log('✅ Tipos de tallas por defecto creados.');
    }
  } catch (error) {
    console.error('❌ Error creando tipos de tallas por defecto:', error);
  }
};

const createDefaultSizes = async () => {
  try {
    const sizesCount = await Size.count();
    
    if (sizesCount === 0) {
      // Obtener los IDs de los tipos de tallas
      const prendasSuperiores = await TypeSize.findOne({ where: { description: 'PRENDAS SUPERIORES' } });
      const prendasInferiores = await TypeSize.findOne({ where: { description: 'PRENDAS INFERIORES' } });

      if (prendasSuperiores && prendasInferiores) {
        const defaultSizes = [
          // Tallas para prendas superiores
          { name: 'XS', type_size_id: prendasSuperiores.id },
          { name: 'S', type_size_id: prendasSuperiores.id },
          { name: 'M', type_size_id: prendasSuperiores.id },
          { name: 'L', type_size_id: prendasSuperiores.id },
          { name: 'XL', type_size_id: prendasSuperiores.id },
          { name: 'XXL', type_size_id: prendasSuperiores.id },
          // Tallas para prendas inferiores
          { name: '0', type_size_id: prendasInferiores.id },
          { name: '2', type_size_id: prendasInferiores.id },
          { name: '4', type_size_id: prendasInferiores.id },
          { name: '6', type_size_id: prendasInferiores.id },
          { name: '8', type_size_id: prendasInferiores.id },
          { name: '10', type_size_id: prendasInferiores.id },
          { name: '12', type_size_id: prendasInferiores.id },
          { name: '14', type_size_id: prendasInferiores.id },
          { name: '16', type_size_id: prendasInferiores.id }
        ];

        await Size.bulkCreate(defaultSizes);
        console.log('✅ Tallas por defecto creadas.');
      }
    }
  } catch (error) {
    console.error('❌ Error creando tallas por defecto:', error);
  }
};

const createDefaultColors = async () => {
  try {
    const colorsCount = await Color.count();
    
    if (colorsCount === 0) {
      const defaultColors = [
        { name: 'Negro', hex_code: '#000000' },
        { name: 'Blanco', hex_code: '#FFFFFF' },
        { name: 'Gris', hex_code: '#808080' },
        { name: 'Azul', hex_code: '#0000FF' },
        { name: 'Rojo', hex_code: '#FF0000' },
        { name: 'Verde', hex_code: '#008000' },
        { name: 'Amarillo', hex_code: '#FFFF00' },
        { name: 'Rosa', hex_code: '#FFC0CB' },
        { name: 'Morado', hex_code: '#800080' },
        { name: 'Café', hex_code: '#A52A2A' }
      ];

      await Color.bulkCreate(defaultColors);
      console.log('✅ Colores por defecto creados.');
    }
  } catch (error) {
    console.error('❌ Error creando colores por defecto:', error);
  }
};

const createDefaultCategories = async () => {
  try {
    const categoriesCount = await Category.count();
    
    if (categoriesCount === 0) {
      // Obtener los IDs de los tipos de tallas
      const prendasSuperiores = await TypeSize.findOne({ where: { description: 'Tallaje por letras' } });
      const prendasInferiores = await TypeSize.findOne({ where: { description: 'Tallaje pantalones' } });

      const defaultCategories = [
        {
          name: 'Camisetas',
          description: 'Camisetas para todas las ocasiones',
          type: 'normal',
          sort_order: 1,
          type_size_id: prendasSuperiores?.id
        },
        {
          name: 'Leggins',
          description: 'Leggins cómodos y modernos',
          type: 'normal',
          sort_order: 2,
          type_size_id: prendasInferiores?.id
        },
        {
          name: 'Buzos',
          description: 'Buzos para el clima frío',
          type: 'normal',
          sort_order: 3,
          type_size_id: prendasSuperiores?.id
        },
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
        first_name: 'Admin',
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