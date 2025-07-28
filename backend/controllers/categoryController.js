import { Category, Product, ProductVariant, Size, Color, ImgColorProduct } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export const getAllCategories = async (req, res) => {
  try {
    const { includeProducts = false } = req.query;

    const includeOptions = [];
    if (includeProducts === 'true') {
      includeOptions.push({
        model: Product,
        as: 'products',
        where: { is_active: true },
        required: false,
        attributes: ['id', 'name', 'price', 'discount_percentage'],
        include: [
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
    }

    const categories = await Category.findAll({
      where: { is_active: true },
      include: includeOptions,
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      sizes, 
      colors, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Construir filtros para productos
    const productWhere = { is_active: true };
    const variantWhere = {};

    // Filtros de precio
    if (minPrice || maxPrice) {
      productWhere.price = {};
      if (minPrice) productWhere.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) productWhere.price[Op.lte] = parseFloat(maxPrice);
    }

    // Filtros de tallas y colores (aplicados a variants)
    if (sizes) {
      const sizeArray = Array.isArray(sizes) ? sizes : [sizes];
      variantWhere.size_id = { [Op.in]: sizeArray };
    }

    if (colors) {
      const colorArray = Array.isArray(colors) ? colors : [colors];
      variantWhere.color_id = { [Op.in]: colorArray };
    }

    const offset = (page - 1) * limit;

    // Primero obtener la categoría básica
    const category = await Category.findOne({
      where: { id, is_active: true },
      attributes: ['id', 'name', 'description', 'image', 'type_size_id']
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Luego obtener productos con filtros y paginación
    const { count, rows: products } = await Product.findAndCountAll({
      where: { ...productWhere, category_id: id },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
          required: Object.keys(variantWhere).length > 0,
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
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Obtener todas las tallas y colores disponibles para esta categoría (para filtros)
    const availableFilters = await Product.findAll({
      where: { category_id: id, is_active: true },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          include: [
            { model: Size, as: 'size', attributes: ['id', 'name'] },
            { model: Color, as: 'color', attributes: ['id', 'name', 'hex_code'] }
          ]
        }
      ],
      attributes: []
    });

    // Extraer tallas y colores únicos
    const availableSizes = [];
    const availableColors = [];
    const seenSizes = new Set();
    const seenColors = new Set();

    console.log('Available filters data:', availableFilters.length, 'products found');
    
    availableFilters.forEach(product => {
      console.log('Product variants:', product.variants.length);
      product.variants.forEach(variant => {
        console.log('Variant size:', variant.size, 'color:', variant.color);
        if (!seenSizes.has(variant.size.id)) {
          availableSizes.push(variant.size);
          seenSizes.add(variant.size.id);
        }
        if (!seenColors.has(variant.color.id)) {
          availableColors.push(variant.color);
          seenColors.add(variant.color.id);
        }
      });
    });

    console.log('Final filters - Sizes:', availableSizes.length, 'Colors:', availableColors.length);

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: { 
        category: {
          ...category.toJSON(),
          products
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        },
        filters: {
          availableSizes,
          availableColors
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, description, sort_order = 0, type = 'normal', type_size_id } = req.body;
    
    // Manejar archivo de imagen subido
    let image = req.body.image; // Para caso de edición sin nueva imagen
    if (req.file) {
      image = req.file.filename; // Usar nueva imagen subida
    }

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
      sort_order,
      type,
      type_size_id
    });

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category }
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateCategory = async (req, res) => {
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
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const { name, description, sort_order, type, is_active, type_size_id } = req.body;
    
    // Manejar archivo de imagen subido
    let image = req.body.image; // Mantener imagen existente si no se sube nueva
    if (req.file) {
      image = req.file.filename; // Usar nueva imagen subida
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        where: { name, id: { [Op.ne]: id } }
      });
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre'
        });
      }
    }

    await category.update({
      name,
      description,
      image,
      sort_order,
      type,
      is_active,
      type_size_id
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category }
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const productsCount = await Product.count({
      where: { category_id: id, is_active: true }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la categoría porque tiene productos asociados'
      });
    }

    await category.update({ is_active: false });

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};