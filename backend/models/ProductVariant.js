import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  size_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sizes',
      key: 'id'
    }
  },
  color_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'colors',
      key: 'id'
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'product_variants',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['product_id', 'size_id', 'color_id']
    }
  ]
});

export default ProductVariant;