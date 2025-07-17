import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  final_price: {
    type: DataTypes.VIRTUAL,
    get() {
      const price = this.getDataValue('price');
      const discount = this.getDataValue('discount_percentage');
      return discount > 0 ? price - (price * discount / 100) : price;
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  sizes: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  colors: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidImages(value) {
        if (!Array.isArray(value) || value.length < 1 || value.length > 4) {
          throw new Error('Debe tener entre 1 y 4 imágenes');
        }
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'products'
});

export default Product;