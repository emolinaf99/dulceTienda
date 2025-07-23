import { Product, Category, User, Size, Color, Order, TypeSize } from '../models/associations.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.count({ where: { is_active: true } });
    const totalCategories = await Category.count(); // Debug: contar todas las categorías
    console.log('Debug Dashboard - Total categories in DB:', totalCategories);
    const totalUsers = await User.count({ where: { is_active: true, role: ['cliente', 'mayorista'] } });
    
    // Recent products (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentProducts = await Product.count({
      where: {
        created_at: { [Op.gte]: sevenDaysAgo },
        is_active: true
      }
    });

    // Products on sale
    const productsOnSale = await Product.count({
      where: {
        discount_percentage: { [Op.gt]: 0 },
        is_active: true
      }
    });

    // Out of stock products - Comentado porque el modelo Product no tiene campo stock
    // const outOfStock = await Product.count({
    //   where: {
    //     stock: { [Op.lte]: 0 },
    //     is_active: true
    //   }
    // });
    const outOfStock = 0; // Valor por defecto hasta que se implemente el campo stock

    res.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalUsers,
        recentProducts,
        productsOnSale,
        outOfStock
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del dashboard'
    });
  }
};

// Get all products for admin (including inactive)
export const getAdminProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category && category !== 'all') {
      where.category_id = category;
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos'
    });
  }
};

// Get all categories for admin
export const getAdminCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status = 'all',
      sortBy = 'name',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    // Separar el conteo de las categorías para evitar problemas con JOIN
    const count = await Category.count({ where });
    
    const categories = await Category.findAll({
      where,
      attributes: ['id', 'name', 'description', 'is_active', 'type_size_id', 'created_at', 'updated_at'],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['id'],
          where: { is_active: true },
          required: false
        },
        {
          model: TypeSize,
          as: 'typeSize',
          attributes: ['id', 'description'],
          required: false
        }
      ]
    });

    // Debug log para verificar el conteo
    console.log('Debug Categories FIXED:', {
      count,
      categoriesLength: categories.length,
      where,
      page,
      limit,
      offset
    });

    // Add product count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category.toJSON(),
      productCount: category.products ? category.products.length : 0,
      products: undefined
    }));

    res.json({
      success: true,
      data: categoriesWithCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías'
    });
  }
};

// Get all users for admin
export const getAdminUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role = 'all',
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role !== 'all') {
      where.role = role;
    }

    if (status === 'active') {
      where.is_active = true;
    } else if (status === 'inactive') {
      where.is_active = false;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios'
    });
  }
};

// Get all sizes grouped by type for admin
export const getAdminSizes = async (req, res) => {
  try {
    const typeSizes = await TypeSize.findAll({
      include: [{
        model: Size,
        as: 'sizes',
        attributes: ['id', 'name', 'type_size_id']
      }],
      order: [
        ['description', 'ASC'],
        [{ model: Size, as: 'sizes' }, 'name', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: typeSizes
    });
  } catch (error) {
    console.error('Error fetching sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tallas'
    });
  }
};

// Get all type sizes for admin
export const getAdminTypeSizes = async (req, res) => {
  try {
    const typeSizes = await TypeSize.findAll({
      order: [['description', 'ASC']]
    });

    res.json({
      success: true,
      data: typeSizes
    });
  } catch (error) {
    console.error('Error fetching type sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de talla'
    });
  }
};

// Get all colors for admin
export const getAdminColors = async (req, res) => {
  try {
    const colors = await Color.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: colors
    });
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener colores'
    });
  }
};

// Toggle product active status
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    product.is_active = !product.is_active;
    await product.save();

    res.json({
      success: true,
      message: `Producto ${product.is_active ? 'activado' : 'desactivado'} correctamente`,
      data: product
    });
  } catch (error) {
    console.error('Error toggling product status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del producto'
    });
  }
};

// Toggle category active status
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    category.is_active = !category.is_active;
    await category.save();

    res.json({
      success: true,
      message: `Categoría ${category.is_active ? 'activada' : 'desactivada'} correctamente`,
      data: category
    });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado de la categoría'
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir desactivar al propio admin
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'No puedes desactivar tu propia cuenta'
      });
    }

    user.is_active = !user.is_active;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${user.is_active ? 'activado' : 'desactivado'} correctamente`,
      data: { ...user.toJSON(), password: undefined }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del usuario'
    });
  }
};

// Delete or deactivate category based on associated products
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

    // Verificar si la categoría tiene productos asociados
    const productCount = await Product.count({
      where: { category_id: id }
    });

    if (productCount > 0) {
      // Si tiene productos asociados, solo desactivar
      if (!category.is_active) {
        return res.status(400).json({
          success: false,
          message: 'La categoría ya está desactivada'
        });
      }

      category.is_active = false;
      await category.save();

      res.json({
        success: true,
        message: `Categoría desactivada correctamente. No se puede eliminar porque tiene ${productCount} producto(s) asociado(s).`,
        data: category,
        action: 'deactivated'
      });
    } else {
      // Si no tiene productos asociados, eliminar completamente
      await category.destroy();

      res.json({
        success: true,
        message: 'Categoría eliminada completamente.',
        action: 'deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting/deactivating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la eliminación de la categoría'
    });
  }
};

// Create type size
export const createTypeSize = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'La descripción del tipo de talla es requerida'
      });
    }

    const typeSize = await TypeSize.create({
      description: description.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Tipo de talla creado correctamente',
      data: typeSize
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un tipo de talla con esa descripción'
      });
    }
    console.error('Error creating type size:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el tipo de talla'
    });
  }
};