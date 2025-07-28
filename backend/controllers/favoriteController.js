import { Favorite, Product, Category, ProductVariant, Size, Color, ImgColorProduct } from '../models/associations.js';
import { validationResult } from 'express-validator';

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
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
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const favoritesWithPricing = favorites.map(favorite => {
      let finalPrice = favorite.product.price;
      
      if (req.user.role === 'mayorista' && favorite.product.discount_percentage > 0) {
        finalPrice = favorite.product.price - (favorite.product.price * favorite.product.discount_percentage / 100);
      } else if (favorite.product.discount_percentage > 0) {
        finalPrice = favorite.product.price - (favorite.product.price * favorite.product.discount_percentage / 100);
      }

      return {
        ...favorite.toJSON(),
        product: {
          ...favorite.product.toJSON(),
          final_price: finalPrice
        }
      };
    });

    res.json({
      success: true,
      data: { favorites: favoritesWithPricing }
    });
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const addToFavorites = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { product_id } = req.body;

    const product = await Product.findOne({
      where: { id: product_id, is_active: true }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id
      }
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: 'El producto ya está en favoritos'
      });
    }

    const favorite = await Favorite.create({
      user_id: req.user.id,
      product_id
    });

    const favoriteWithProduct = await Favorite.findByPk(favorite.id, {
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
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Producto agregado a favoritos',
      data: { favorite: favoriteWithProduct }
    });
  } catch (error) {
    console.error('Error agregando a favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const { id } = req.params;

    const favorite = await Favorite.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado'
      });
    }

    await favorite.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado de favoritos'
    });
  } catch (error) {
    console.error('Error eliminando de favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const removeFromFavoritesByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const favorite = await Favorite.findOne({
      where: { 
        user_id: req.user.id,
        product_id 
      }
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en favoritos'
      });
    }

    await favorite.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado de favoritos'
    });
  } catch (error) {
    console.error('Error eliminando de favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const { product_id } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: req.user.id,
        product_id
      }
    });

    res.json({
      success: true,
      data: { is_favorite: !!favorite }
    });
  } catch (error) {
    console.error('Error verificando favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};