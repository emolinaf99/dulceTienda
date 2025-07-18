import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TypeSize = sequelize.define('TypeSize', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'type_sizes',
  underscored: true
});

export default TypeSize;