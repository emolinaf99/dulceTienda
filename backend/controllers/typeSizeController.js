import { TypeSize, Size } from '../models/associations.js';
import { validationResult } from 'express-validator';

export const getAllTypeSizes = async (req, res) => {
  try {
    const { includeSizes = false } = req.query;

    const includeOptions = [];
    if (includeSizes === 'true') {
      includeOptions.push({
        model: Size,
        as: 'sizes',
        attributes: ['id', 'name']
      });
    }

    const typeSizes = await TypeSize.findAll({
      include: includeOptions,
      order: [['description', 'ASC']]
    });

    res.json({
      success: true,
      data: { typeSizes }
    });
  } catch (error) {
    console.error('Error obteniendo tipos de tallas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getTypeSizeById = async (req, res) => {
  try {
    const { id } = req.params;

    const typeSize = await TypeSize.findByPk(id, {
      include: [
        {
          model: Size,
          as: 'sizes',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!typeSize) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de talla no encontrado'
      });
    }

    res.json({
      success: true,
      data: { typeSize }
    });
  } catch (error) {
    console.error('Error obteniendo tipo de talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const createTypeSize = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { description } = req.body;

    const existingTypeSize = await TypeSize.findOne({ where: { description } });
    if (existingTypeSize) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un tipo de talla con esa descripción'
      });
    }

    const typeSize = await TypeSize.create({
      description
    });

    res.status(201).json({
      success: true,
      message: 'Tipo de talla creado exitosamente',
      data: { typeSize }
    });
  } catch (error) {
    console.error('Error creando tipo de talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateTypeSize = async (req, res) => {
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
    const { description } = req.body;

    const typeSize = await TypeSize.findByPk(id);
    if (!typeSize) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de talla no encontrado'
      });
    }

    await typeSize.update({
      description
    });

    res.json({
      success: true,
      message: 'Tipo de talla actualizado exitosamente',
      data: { typeSize }
    });
  } catch (error) {
    console.error('Error actualizando tipo de talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteTypeSize = async (req, res) => {
  try {
    const { id } = req.params;
    const typeSize = await TypeSize.findByPk(id);

    if (!typeSize) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de talla no encontrado'
      });
    }

    await typeSize.destroy();

    res.json({
      success: true,
      message: 'Tipo de talla eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando tipo de talla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};