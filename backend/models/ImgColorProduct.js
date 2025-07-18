import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ImgColorProduct = sequelize.define('ImgColorProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  img: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
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
  tableName: 'img_color_products',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['img', 'product_id', 'color_id']
    }
  ]
});

export default ImgColorProduct;