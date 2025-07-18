import { Product, Category, ProductVariant, Size, Color, ImgColorProduct } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import fs from 'fs/promises';
import path from 'path';

export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      onSale,
      featured
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { is_active: true };

    if (category) {
      where.category_id = category;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (onSale === 'true') {
      where.discount_percentage = { [Op.gt]: 0 };
    }

    if (featured === 'true') {
      where.is_featured = true;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
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
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
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
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    let finalPrice = product.price;
    if (req.user?.role === 'mayorista' && product.discount_percentage > 0) {
      finalPrice = product.price - (product.price * product.discount_percentage / 100);
    }

    const productData = {
      ...product.toJSON(),
      final_price: finalPrice
    };

    res.json({
      success: true,
      data: { product: productData }
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      price,
      discount_percentage = 0,
      variants, // Array de {size_id, color_id, stock}
      colorImages, // Array de {color_id, images}
      category_id,
      is_featured = false
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere al menos una imagen'
      });
    }

    // Crear producto base
    const product = await Product.create({
      name,
      description,
      price,
      discount_percentage,
      category_id,
      is_featured
    });

    // Crear variantes de producto
    if (variants && variants.length > 0) {
      const variantData = JSON.parse(variants).map(variant => ({
        product_id: product.id,
        size_id: variant.size_id,
        color_id: variant.color_id,
        stock: variant.stock || 0
      }));
      
      await ProductVariant.bulkCreate(variantData);
    }

    // Crear imágenes por color
    if (colorImages && req.files) {
      const colorImageData = JSON.parse(colorImages);
      const imagePromises = [];

      colorImageData.forEach((colorImg, index) => {
        if (req.files[index]) {
          imagePromises.push(
            ImgColorProduct.create({
              product_id: product.id,
              color_id: colorImg.color_id,
              img: req.files[index].filename
            })
          );
        }
      });

      await Promise.all(imagePromises);
    }

    // Obtener producto completo con todas las relaciones
    const productWithRelations = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            { model: Size, as: 'size', attributes: ['id', 'name'] },
            { model: Color, as: 'color', attributes: ['id', 'name', 'hex_code'] }
          ]
        },
        {
          model: ImgColorProduct,
          as: 'colorImages',
          include: [
            { model: Color, as: 'color', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: productWithRelations }
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    
    if (req.files) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error('Error eliminando archivo:', err);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateProduct = async (req, res) => {
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
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const {
      name,
      description,
      price,
      discount_percentage,
      category_id,
      is_featured,
      is_active
    } = req.body;

    // Actualizar solo los campos básicos del producto
    await product.update({
      name,
      description,
      price,
      discount_percentage,
      category_id,
      is_featured,
      is_active
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            { model: Size, as: 'size', attributes: ['id', 'name'] },
            { model: Color, as: 'color', attributes: ['id', 'name', 'hex_code'] }
          ]
        },
        {
          model: ImgColorProduct,
          as: 'colorImages',
          include: [
            { model: Color, as: 'color', attributes: ['id', 'name'] }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    
    if (req.files) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (err) {
          console.error('Error eliminando archivo:', err);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await product.update({ is_active: false });

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getNewProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { is_active: true },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            { model: Size, as: 'size', attributes: ['id', 'name'] },
            { model: Color, as: 'color', attributes: ['id', 'name', 'hex_code'] }
          ]
        },
        {
          model: ImgColorProduct,
          as: 'colorImages',
          include: [
            { model: Color, as: 'color', attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Error obteniendo productos nuevos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getSaleProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { 
        is_active: true,
        discount_percentage: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            { model: Size, as: 'size', attributes: ['id', 'name'] },
            { model: Color, as: 'color', attributes: ['id', 'name', 'hex_code'] }
          ]
        },
        {
          model: ImgColorProduct,
          as: 'colorImages',
          include: [
            { model: Color, as: 'color', attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['discount_percentage', 'DESC']]
    });

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Error obteniendo productos en rebaja:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};