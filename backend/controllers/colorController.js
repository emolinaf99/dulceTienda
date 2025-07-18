import { Color } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

export const getAllColors = async (req, res) => {
  try {
    const colors = await Color.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { colors }
    });
  } catch (error) {
    console.error('Error obteniendo colores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getColorById = async (req, res) => {
  try {
    const { id } = req.params;

    const color = await Color.findByPk(id);

    if (!color) {
      return res.status(404).json({
        success: false,
        message: 'Color no encontrado'
      });
    }

    res.json({
      success: true,
      data: { color }
    });
  } catch (error) {
    console.error('Error obteniendo color:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const createColor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, hex_code } = req.body;

    const existingColor = await Color.findOne({ 
      where: { 
        [Op.or]: [
          { name },
          { hex_code }
        ]
      }
    });
    
    if (existingColor) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un color con ese nombre o código hexadecimal'
      });
    }

    const color = await Color.create({
      name,
      hex_code
    });

    res.status(201).json({
      success: true,
      message: 'Color creado exitosamente',
      data: { color }
    });
  } catch (error) {
    console.error('Error creando color:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateColor = async (req, res) => {
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
    const { name, hex_code } = req.body;

    const color = await Color.findByPk(id);
    if (!color) {
      return res.status(404).json({
        success: false,
        message: 'Color no encontrado'
      });
    }

    await color.update({
      name,
      hex_code
    });

    res.json({
      success: true,
      message: 'Color actualizado exitosamente',
      data: { color }
    });
  } catch (error) {
    console.error('Error actualizando color:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    const color = await Color.findByPk(id);

    if (!color) {
      return res.status(404).json({
        success: false,
        message: 'Color no encontrado'
      });
    }

    await color.destroy();

    res.json({
      success: true,
      message: 'Color eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando color:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};