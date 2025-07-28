import { Cart, Product, Category, Size, Color, ImgColorProduct } from '../models/associations.js';
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
            },
            {
              model: ImgColorProduct,
              as: 'colorImages',
              include: [
                {
                  model: Color,
                  as: 'color',
                  attributes: ['id', 'name']
                }
              ]
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
    console.log('🛒 [BACKEND] Cart items found:', cartItems.length);
    if (cartItems.length > 0) {
      console.log('🛒 [BACKEND] First item structure:', JSON.stringify(cartItems[0].toJSON(), null, 2));
    }

    const itemsWithPricing = cartItems.map(item => {
      console.log('🛒 [BACKEND] Processing item:', item.product.name);
      console.log('🛒 [BACKEND] Item colorImages:', item.product.colorImages?.length || 0);
      
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
    console.log('🛒 [BACKEND] Datos recibidos en addToCart:', req.body);
    console.log('🛒 [BACKEND] Usuario:', req.user?.id, req.user?.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🛒 [BACKEND] Errores de validación:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { product_id, quantity, size_id, color_id } = req.body;
    console.log('🛒 [BACKEND] IDs extraídos:', { product_id, quantity, size_id, color_id });

    // Verificar que el producto existe y está activo
    const product = await Product.findOne({
      where: { id: product_id, is_active: true }
    });

    if (!product) {
      console.log('🛒 [BACKEND] Producto no encontrado:', product_id);
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    console.log('🛒 [BACKEND] Producto encontrado:', product.name);

    // Verificar que la talla existe
    const size = await Size.findByPk(size_id);
    if (!size) {
      console.log('🛒 [BACKEND] Talla no encontrada:', size_id);
      return res.status(400).json({
        success: false,
        message: 'Talla no válida'
      });
    }
    console.log('🛒 [BACKEND] Talla encontrada:', size.name);

    // Verificar que el color existe
    const color = await Color.findByPk(color_id);
    if (!color) {
      console.log('🛒 [BACKEND] Color no encontrado:', color_id);
      return res.status(400).json({
        success: false,
        message: 'Color no válido'
      });
    }
    console.log('🛒 [BACKEND] Color encontrado:', color.name);

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
      console.log(`🛒 [BACKEND] Item existente encontrado. Cantidad actual: ${existingCartItem.quantity}, nueva cantidad: ${newQuantity}`);
      
      await existingCartItem.update({ quantity: newQuantity });
      
      res.json({
        success: true,
        message: `Cantidad actualizada en el carrito (${newQuantity} unidades)`,
        data: { cart_item: existingCartItem }
      });
    } else {
      console.log('🛒 [BACKEND] Creando nuevo item en el carrito');
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