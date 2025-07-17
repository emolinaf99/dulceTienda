import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import Favorite from './Favorite.js';
import { Order, OrderItem } from './Order.js';

// User associations
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Favorite associations
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export {
  User,
  Category,
  Product,
  Cart,
  Favorite,
  Order,
  OrderItem
};