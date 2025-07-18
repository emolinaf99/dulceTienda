import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Color = sequelize.define('Color', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  hex_code: {
    type: DataTypes.STRING(7),
    allowNull: false,
    unique: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  }
}, {
  tableName: 'colors',
  underscored: true
});

export default Color;