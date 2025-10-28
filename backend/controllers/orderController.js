import { Order, OrderItem, Cart, Product, Size, Color, User, ProductVariant } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Generar número de orden único
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DT-${timestamp.slice(-6)}${random}`;
};

// Crear nueva orden desde el carrito
export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🛒 [ORDER] Iniciando proceso de checkout...');
    console.log('🛒 [ORDER] Usuario:', req.user?.id, req.user?.email);
    console.log('🛒 [ORDER] Datos recibidos:', JSON.stringify(req.body, null, 2));

    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🛒 [ORDER] Errores de validación:', errors.array());
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      // Contacto
      email,
      newsletter,
      
      // Información de envío
      country,
      firstName,
      lastName,
      document,
      address,
      addressDetails,
      city,
      department,
      postalCode,
      phone,
      
      // Información de facturación
      billing,
      
      // Opciones
      deliveryMethod,
      paymentMethod,
      billingAddress
    } = req.body;

    // Obtener items del carrito del usuario
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'discount_percentage']
        },
        {
          model: Size,
          as: 'size',
          attributes: ['id', 'name']
        },
        {
          model: Color,
          as: 'color',
          attributes: ['id', 'name']
        }
      ],
      transaction
    });

    if (cartItems.length === 0) {
      console.log('🛒 [ORDER] Carrito vacío');
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El carrito está vacío'
      });
    }

    console.log(`🛒 [ORDER] ${cartItems.length} items encontrados en el carrito`);

    // Verificar stock y calcular totales
    let subtotal = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      const product = cartItem.product;
      
      // Buscar la variante específica para verificar stock
      const variant = await ProductVariant.findOne({
        where: {
          product_id: cartItem.product_id,
          size_id: cartItem.size_id,
          color_id: cartItem.color_id
        },
        transaction
      });

      if (!variant) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Variante no encontrada para ${product.name} en talla ${cartItem.size.name} y color ${cartItem.color.name}`
        });
      }

      // Verificar stock disponible
      if (variant.stock < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${product.name} (${cartItem.size.name}/${cartItem.color.name}). Disponible: ${variant.stock}, solicitado: ${cartItem.quantity}`
        });
      }

      // Calcular precio unitario (aplicar descuentos si aplica)
      let unitPrice = product.price;
      
      // Aplicar descuento para mayoristas en productos con descuento
      if (req.user.role === 'mayorista' && product.discount_percentage > 0) {
        unitPrice = product.price - (product.price * product.discount_percentage / 100);
      } else if (product.discount_percentage > 0) {
        unitPrice = product.price - (product.price * product.discount_percentage / 100);
      }

      const totalPrice = unitPrice * cartItem.quantity;
      subtotal += totalPrice;

      orderItemsData.push({
        product_id: product.id,
        size: cartItem.size.name, // Guardar como string
        color: cartItem.color.name, // Guardar como string
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      });

      console.log(`🛒 [ORDER] Item: ${product.name} - Cantidad: ${cartItem.quantity} - Precio unitario: ${unitPrice} - Total: ${totalPrice}`);
    }

    // Preparar dirección de envío
    const shippingAddress = {
      country,
      firstName,
      lastName,
      document,
      address,
      addressDetails,
      city,
      department,
      postalCode,
      phone
    };

    // Preparar dirección de facturación
    let billingAddressData = null;
    if (billingAddress === 'different' && billing) {
      billingAddressData = {
        country: billing.country,
        firstName: billing.firstName,
        lastName: billing.lastName,
        document: billing.document,
        address: billing.address,
        addressDetails: billing.addressDetails,
        city: billing.city,
        department: billing.department,
        postalCode: billing.postalCode,
        phone: billing.phone
      };
    }

    // Generar número de orden único
    let orderNumber;
    let isUniqueOrderNumber = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUniqueOrderNumber && attempts < maxAttempts) {
      orderNumber = generateOrderNumber();
      const existingOrder = await Order.findOne({
        where: { order_number: orderNumber },
        transaction
      });
      
      if (!existingOrder) {
        isUniqueOrderNumber = true;
      }
      attempts++;
    }

    if (!isUniqueOrderNumber) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: 'Error generando número de orden único'
      });
    }

    console.log(`🛒 [ORDER] Número de orden generado: ${orderNumber}`);
    console.log(`🛒 [ORDER] Subtotal calculado: ${subtotal}`);

    // Crear la orden
    const order = await Order.create({
      user_id: req.user.id,
      order_number: orderNumber,
      status: 'pending',
      subtotal: subtotal,
      discount_amount: 0, // Por ahora sin descuentos adicionales
      total: subtotal,
      shipping_address: shippingAddress,
      billing_address: billingAddressData,
      delivery_method: deliveryMethod || 'envio',
      payment_method: paymentMethod,
      payment_status: 'pending',
      customer_email: email,
      newsletter_consent: newsletter || false
    }, { transaction });

    console.log(`🛒 [ORDER] Orden creada con ID: ${order.id}`);

    // Crear los items de la orden
    const orderItems = await Promise.all(
      orderItemsData.map(itemData => 
        OrderItem.create({
          order_id: order.id,
          ...itemData
        }, { transaction })
      )
    );

    console.log(`🛒 [ORDER] ${orderItems.length} items de orden creados`);

    // Actualizar stock de variantes de productos
    for (const cartItem of cartItems) {
      await ProductVariant.update(
        { 
          stock: sequelize.literal(`stock - ${cartItem.quantity}`)
        },
        { 
          where: { 
            product_id: cartItem.product_id,
            size_id: cartItem.size_id,
            color_id: cartItem.color_id
          },
          transaction 
        }
      );
      console.log(`🛒 [ORDER] Stock actualizado para variante: Producto ${cartItem.product_id}, Talla ${cartItem.size_id}, Color ${cartItem.color_id}`);
    }

    // Limpiar el carrito del usuario
    await Cart.destroy({
      where: { user_id: req.user.id },
      transaction
    });

    console.log('🛒 [ORDER] Carrito limpiado');

    // Confirmar transacción
    await transaction.commit();

    console.log('🛒 [ORDER] Orden creada exitosamente');

    // Preparar respuesta
    console.log('🛒 [ORDER] Preparando respuesta para frontend...');
    const responseData = {
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total: order.total,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          created_at: order.created_at
        },
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }))
      }
    };
    
    console.log('🛒 [ORDER] Enviando respuesta:', JSON.stringify(responseData, null, 2));
    
    // Responder con los datos de la orden
    res.status(201).json(responseData);
    
    console.log('🛒 [ORDER] Respuesta enviada exitosamente');

  } catch (error) {
    await transaction.rollback();
    console.error('🛒 [ORDER] Error creando orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener órdenes del usuario
export const getUserOrders = async (req, res) => {
  try {
    console.log('📦 [GET ORDERS] Iniciando obtención de órdenes...');
    console.log('📦 [GET ORDERS] Usuario ID:', req.user?.id);

    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📦 [GET ORDERS] Parámetros de paginación:', { page, limit, offset });

    const orders = await Order.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name'],
              required: false // No falla si el producto fue eliminado
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log('📦 [GET ORDERS] Órdenes encontradas:', orders.count);
    console.log('📦 [GET ORDERS] Órdenes en esta página:', orders.rows.length);

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        pagination: {
          total: orders.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(orders.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('📦 [GET ORDERS] ❌ Error obteniendo órdenes del usuario:', error);
    console.error('📦 [GET ORDERS] ❌ Stack trace:', error.stack);
    console.error('📦 [GET ORDERS] ❌ Mensaje de error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener orden específica del usuario
export const getUserOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { 
        id, 
        user_id: req.user.id 
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Admin: Obtener todas las órdenes
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        pagination: {
          total: orders.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(orders.count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo todas las órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Admin: Actualizar estado de orden
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de orden inválido'
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: 'Estado de orden actualizado',
      data: { order }
    });

  } catch (error) {
    console.error('Error actualizando estado de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Admin: Actualizar estado de pago
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status } = req.body;

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de pago inválido'
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    await order.update({ payment_status });

    res.json({
      success: true,
      message: 'Estado de pago actualizado',
      data: { order }
    });

  } catch (error) {
    console.error('Error actualizando estado de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};