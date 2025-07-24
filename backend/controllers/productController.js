import { Product, Category, ProductVariant, Size, Color, ImgColorProduct, Cart, Favorite, OrderItem } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import fs from 'fs/promises';
import fSync from 'fs';
import path from 'path';
import sequelize from '../config/database.js';

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
      data: productData
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

    console.log('=== PRODUCT CREATION DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Received product data:', {
      name, description, price, category_id, variants, colorImages
    });
    console.log('Files received:', req.files?.length || 0);
    console.log('Request headers:', req.headers['content-type']);

    // Validar campos requeridos
    if (!name) {
      console.log('ERROR: Missing name');
      return res.status(400).json({
        success: false,
        message: 'El nombre del producto es requerido'
      });
    }

    if (!price) {
      console.log('ERROR: Missing price');
      return res.status(400).json({
        success: false,
        message: 'El precio del producto es requerido'
      });
    }

    if (!category_id) {
      console.log('ERROR: Missing category_id');
      return res.status(400).json({
        success: false,
        message: 'La categoría del producto es requerida'
      });
    }

    if (!req.files || req.files.length === 0) {
      console.log('ERROR: No files uploaded');
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

    // Crear variantes de producto con SKU automático
    if (variants && variants.length > 0) {
      console.log('Processing variants:', variants);
      const parsedVariants = JSON.parse(variants);
      console.log('Parsed variants:', parsedVariants);
      
      const variantData = parsedVariants.map(variant => ({
        product_id: product.id,
        size_id: variant.size_id,
        color_id: variant.color_id,
        stock: variant.stock || 0,
        sku: `${product.id}-${variant.size_id}-${variant.color_id}` // SKU automático
      }));
      
      console.log('Variant data to create:', variantData);
      await ProductVariant.bulkCreate(variantData);
      console.log('Variants created successfully');
    } else {
      console.log('No variants to create');
    }

    // Crear imágenes por color
    if (colorImages && req.files && req.files.length > 0) {
      console.log('Processing color images:', colorImages);
      const colorImageData = JSON.parse(colorImages);
      console.log('Parsed color images:', colorImageData);
      console.log('Available files:', req.files.map(f => f.filename));
      
      const imagePromises = [];
      let fileIndex = 0;

      // Procesar imágenes por color
      colorImageData.forEach((colorImg) => {
        console.log('Processing color:', colorImg.color_id);
        // Cada color puede tener múltiples imágenes
        const numberOfImagesForColor = colorImg.images ? colorImg.images.length : 0;
        console.log('Number of images for this color:', numberOfImagesForColor);
        
        for (let i = 0; i < numberOfImagesForColor && fileIndex < req.files.length; i++) {
          if (req.files[fileIndex]) {
            console.log('Creating image record:', {
              product_id: product.id,
              color_id: colorImg.color_id,
              img: req.files[fileIndex].filename
            });
            
            imagePromises.push(
              ImgColorProduct.create({
                product_id: product.id,
                color_id: colorImg.color_id,
                img: req.files[fileIndex].filename
              })
            );
            fileIndex++;
          }
        }
      });

      await Promise.all(imagePromises);
      console.log('Images created successfully');
    } else {
      console.log('No color images to create');
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
  const transaction = await sequelize.transaction();
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      
      if (req.files) {
        req.files.forEach(async (file) => {
          try {
            await fs.unlink(file.path);
          } catch (err) {
            console.error('Error eliminando archivo:', err);
          }
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      
      if (req.files) {
        req.files.forEach(async (file) => {
          try {
            await fs.unlink(file.path);
          } catch (err) {
            console.error('Error eliminando archivo:', err);
          }
        });
      }
      
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
      is_active,
      variants: variantsData
    } = req.body;

    // Actualizar campos básicos del producto
    await product.update({
      name,
      description,
      price,
      discount_percentage,
      category_id,
      is_featured,
      is_active
    }, { transaction });

    // Si hay datos de variantes, actualizarlas
    if (variantsData) {
      const variants = typeof variantsData === 'string' ? JSON.parse(variantsData) : variantsData;
      
      // Eliminar variantes existentes
      await ProductVariant.destroy({
        where: { product_id: product.id },
        transaction
      });

      // Crear nuevas variantes
      if (variants && variants.length > 0) {
        const variantsToCreate = variants.map(variant => ({
          product_id: product.id,
          size_id: variant.size_id,
          color_id: variant.color_id,
          stock: variant.stock || 0,
          sku: variant.sku || `${product.id}-${variant.color_id}-${variant.size_id}`
        }));

        await ProductVariant.bulkCreate(variantsToCreate, { transaction });
      }
    }

    // Manejar imágenes si se enviaron
    if (req.files && req.files.length > 0) {
      // Eliminar imágenes existentes del producto
      const existingImages = await ImgColorProduct.findAll({
        where: { product_id: product.id },
        transaction
      });

      // Eliminar archivos físicos de imágenes existentes
      for (const img of existingImages) {
        const imagePath = path.join('public', img.image_url);
        try {
          if (fSync.existsSync(imagePath)) {
            await fs.unlink(imagePath);
          }
        } catch (err) {
          console.error('Error eliminando imagen existente:', err);
        }
      }

      // Eliminar registros de imágenes existentes
      await ImgColorProduct.destroy({
        where: { product_id: product.id },
        transaction
      });

      // Procesar nuevas imágenes por color
      const imagesByColor = {};
      
      req.files.forEach(file => {
        const colorId = file.fieldname.split('_')[1]; // Asume formato "color_1_images"
        if (!imagesByColor[colorId]) {
          imagesByColor[colorId] = [];
        }
        imagesByColor[colorId].push({
          product_id: product.id,
          color_id: parseInt(colorId),
          image_url: '/uploads/products/' + file.filename,
          is_main: imagesByColor[colorId].length === 0 // Primera imagen es principal
        });
      });

      // Crear registros de nuevas imágenes
      for (const colorId of Object.keys(imagesByColor)) {
        await ImgColorProduct.bulkCreate(imagesByColor[colorId], { transaction });
      }

      // Actualizar main_image del producto con la primera imagen
      const firstImage = Object.values(imagesByColor)[0]?.[0];
      if (firstImage) {
        await product.update({
          main_image: firstImage.image_url
        }, { transaction });
      }
    }

    await transaction.commit();

    // Obtener producto actualizado con todas las relaciones
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
    await transaction.rollback();
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

export const deactivateProduct = async (req, res) => {
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
      message: 'Producto desactivado exitosamente',
      action: 'deactivated'
    });
  } catch (error) {
    console.error('Error desactivando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteProduct = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    console.log(`Iniciando eliminación del producto ID: ${id}`);

    // Verificar si el producto tiene órdenes asociadas
    const orderItemsCount = await OrderItem.count({
      where: { product_id: id }
    });

    if (orderItemsCount > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el producto porque tiene ${orderItemsCount} orden(es) asociada(s). Solo se puede desactivar.`,
        canOnlyDeactivate: true
      });
    }

    // 1. Eliminar imágenes del producto de las carpetas físicas
    const productImages = await ImgColorProduct.findAll({
      where: { product_id: id },
      transaction: t
    });

    for (const imgRecord of productImages) {
      if (imgRecord.img) {
        const fullPath = path.join(process.cwd(), 'public', 'uploads', 'products', imgRecord.img);
        try {
          if (fSync.existsSync(fullPath)) {
            fSync.unlinkSync(fullPath);
            console.log(`Imagen eliminada: ${fullPath}`);
          }
        } catch (fileError) {
          console.warn(`Error eliminando imagen ${fullPath}:`, fileError.message);
        }
      }
    }

    // 2. Eliminar registros de tablas relacionadas
    console.log('Eliminando registros de ImgColorProduct...');
    await ImgColorProduct.destroy({
      where: { product_id: id },
      transaction: t
    });

    console.log('Eliminando registros de ProductVariant...');
    await ProductVariant.destroy({
      where: { product_id: id },
      transaction: t
    });

    console.log('Eliminando registros de Cart...');
    await Cart.destroy({
      where: { product_id: id },
      transaction: t
    });

    console.log('Eliminando registros de Favorite...');
    await Favorite.destroy({
      where: { product_id: id },
      transaction: t
    });

    // 3. Finalmente eliminar el producto
    console.log('Eliminando el producto...');
    await product.destroy({ transaction: t });

    await t.commit();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente',
      deletedProductId: id,
      action: 'deleted'
    });

  } catch (error) {
    await t.rollback();
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el producto'
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