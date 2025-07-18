import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Size = sequelize.define('Size', {
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
  type_size_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'type_sizes',
      key: 'id'
    }
  }
}, {
  tableName: 'sizes',
  underscored: true
});

export default Size;