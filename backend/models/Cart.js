import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
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
  }
}, {
  tableName: 'cart_items',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'product_id', 'size_id', 'color_id']
    }
  ]
});

export default Cart;