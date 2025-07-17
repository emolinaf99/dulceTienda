import { Cart, Product, Category } from '../models/associations.js';
import { validationResult } from 'express-validator';

export const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    let total = 0;
    const itemsWithPricing = cartItems.map(item => {
      let unitPrice = item.product.price;
      
      if (req.user.role === 'mayorista' && item.product.discount_percentage > 0) {
        unitPrice = item.product.price - (item.product.price * item.product.discount_percentage / 100);
      } else if (item.product.discount_percentage > 0) {
        unitPrice = item.product.price - (item.product.price * item.product.discount_percentage / 100);
      }

      const itemTotal = unitPrice * item.quantity;
      total += itemTotal;

      return {
        ...item.toJSON(),
        unit_price: unitPrice,
        total_price: itemTotal
      };
    });

    res.json({
      success: true,
      data: {
        cart_items: itemsWithPricing,
        total: parseFloat(total.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { product_id, quantity, size, color } = req.body;

    const product = await Product.findOne({
      where: { id: product_id, is_active: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    if (!product.sizes.includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Talla no disponible'
      });
    }

    if (!product.colors.includes(color)) {
      return res.status(400).json({
        success: false,
        message: 'Color no disponible'
      });
    }

    const existingCartItem = await Cart.findOne({
      where: {
        user_id: req.user.id,
        product_id,
        size,
        color
      }
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente para la cantidad total'
        });
      }

      await existingCartItem.update({ quantity: newQuantity });
      
      res.json({
        success: true,
        message: 'Cantidad actualizada en el carrito',
        data: { cart_item: existingCartItem }
      });
    } else {
      const cartItem = await Cart.create({
        user_id: req.user.id,
        product_id,
        quantity,
        size,
        color
      });

      res.status(201).json({
        success: true,
        message: 'Producto agregado al carrito',
        data: { cart_item: cartItem }
      });
    }
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await Cart.findOne({
      where: { id, user_id: req.user.id },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente'
      });
    }

    await cartItem.update({ quantity });

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: { cart_item: cartItem }
    });
  } catch (error) {
    console.error('Error actualizando item del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado del carrito'
    });
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.destroy({
      where: { user_id: req.user.id }
    });

    res.json({
      success: true,
      message: 'Carrito vacío'
    });
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};