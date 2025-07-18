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

    const category = await Category.findOne({
      where: { id, is_active: true },
      include: [
        {
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
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: { category }
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

    const { name, description, image, sort_order = 0, type = 'normal', type_size_id } = req.body;

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

    const { name, description, image, sort_order, type, is_active, type_size_id } = req.body;

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