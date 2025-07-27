import { Cart, Product, Category, Size, Color } from '../models/associations.js';
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
        },
        {
          model: Size,
          as: 'size',
          attributes: ['id', 'name']
        },
        {
          model: Color,
          as: 'color',
          attributes: ['id', 'name', 'hex_code']
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

    const { product_id, quantity, size_id, color_id } = req.body;

    // Verificar que el producto existe y está activo
    const product = await Product.findOne({
      where: { id: product_id, is_active: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que la talla existe
    const size = await Size.findByPk(size_id);
    if (!size) {
      return res.status(400).json({
        success: false,
        message: 'Talla no válida'
      });
    }

    // Verificar que el color existe
    const color = await Color.findByPk(color_id);
    if (!color) {
      return res.status(400).json({
        success: false,
        message: 'Color no válido'
      });
    }

    // Verificar que existe una variante del producto con esa talla y color
    // Esto depende de cómo esté estructurado tu sistema de variantes
    // Por ahora, asumimos que si talla y color existen, la combinación es válida

    // Verificar si el item ya existe en el carrito
    const existingCartItem = await Cart.findOne({
      where: {
        user_id: req.user.id,
        product_id,
        size_id,
        color_id
      }
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      
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
        size_id,
        color_id
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