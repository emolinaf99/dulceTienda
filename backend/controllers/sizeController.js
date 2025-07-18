import { Size, TypeSize } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export const getAllSizes = async (req, res) => {
  try {
    const { typeSizeId } = req.query;

    const whereCondition = {};
    if (typeSizeId) {
      whereCondition.type_size_id = typeSizeId;
    }

    const sizes = await Size.findAll({
      where: whereCondition,
      include: [
        {
          model: TypeSize,
          as: 'typeSize',
          attributes: ['id', 'description']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { sizes }
    });
  } catch (error) {
    console.error('Error obteniendo tallas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getSizeById = async (req, res) => {
  try {
    const { id } = req.params;

    const size = await Size.findByPk(id, {
      include: [
        {
          model: TypeSize,
          as: 'typeSize',
          attributes: ['id', 'description']
        }
      ]
    });

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Talla no encontrada'
      });
    }

    res.json({
      success: true,
      data: { size }
    });
  } catch (error) {
    console.error('Error obteniendo talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const createSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, type_size_id } = req.body;

    const existingSize = await Size.findOne({ where: { name } });
    if (existingSize) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una talla con ese nombre'
      });
    }

    const size = await Size.create({
      name,
      type_size_id
    });

    res.status(201).json({
      success: true,
      message: 'Talla creada exitosamente',
      data: { size }
    });
  } catch (error) {
    console.error('Error creando talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateSize = async (req, res) => {
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
    const { name, type_size_id } = req.body;

    const size = await Size.findByPk(id);
    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Talla no encontrada'
      });
    }

    if (name && name !== size.name) {
      const existingSize = await Size.findOne({ 
        where: { name, id: { [Op.ne]: id } }
      });
      if (existingSize) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una talla con ese nombre'
        });
      }
    }

    await size.update({
      name,
      type_size_id
    });

    res.json({
      success: true,
      message: 'Talla actualizada exitosamente',
      data: { size }
    });
  } catch (error) {
    console.error('Error actualizando talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteSize = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await Size.findByPk(id);

    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Talla no encontrada'
      });
    }

    await size.destroy();

    res.json({
      success: true,
      message: 'Talla eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};