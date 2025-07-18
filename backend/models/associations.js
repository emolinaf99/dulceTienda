import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Cart from './Cart.js';
import Favorite from './Favorite.js';
import { Order, OrderItem } from './Order.js';
import TypeSize from './TypeSize.js';
import Size from './Size.js';
import Color from './Color.js';
import ProductVariant from './ProductVariant.js';
import ImgColorProduct from './ImgColorProduct.js';

// User associations
User.hasMany(Cart, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

// TypeSize associations
TypeSize.hasMany(Size, { foreignKey: 'type_size_id', as: 'sizes' });
TypeSize.hasMany(Category, { foreignKey: 'type_size_id', as: 'categories' });

// Size associations
Size.belongsTo(TypeSize, { foreignKey: 'type_size_id', as: 'typeSize' });
Size.hasMany(ProductVariant, { foreignKey: 'size_id', as: 'productVariants' });
Size.hasMany(Cart, { foreignKey: 'size_id', as: 'cartItems' });

// Color associations
Color.hasMany(ProductVariant, { foreignKey: 'color_id', as: 'productVariants' });
Color.hasMany(ImgColorProduct, { foreignKey: 'color_id', as: 'productImages' });
Color.hasMany(Cart, { foreignKey: 'color_id', as: 'cartItems' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Category.belongsTo(TypeSize, { foreignKey: 'type_size_id', as: 'typeSize' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(Cart, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
Product.hasMany(ImgColorProduct, { foreignKey: 'product_id', as: 'colorImages' });

// ProductVariant associations
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductVariant.belongsTo(Size, { foreignKey: 'size_id', as: 'size' });
ProductVariant.belongsTo(Color, { foreignKey: 'color_id', as: 'color' });

// ImgColorProduct associations
ImgColorProduct.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ImgColorProduct.belongsTo(Color, { foreignKey: 'color_id', as: 'color' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Cart.belongsTo(Size, { foreignKey: 'size_id', as: 'size' });
Cart.belongsTo(Color, { foreignKey: 'color_id', as: 'color' });

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
  OrderItem,
  TypeSize,
  Size,
  Color,
  ProductVariant,
  ImgColorProduct
};