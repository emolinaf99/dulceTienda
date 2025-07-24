import { Product, Category, User, Size, Color, Order, TypeSize, ProductVariant, ImgColorProduct } from '../models/associations.js';
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
    const includeArray = [{
      model: Category,
      as: 'category',
      attributes: ['id', 'name']
    }];

    // Construir condiciones de búsqueda
    if (search) {
      console.log('🔍 Searching for:', search);
      
      // Para búsqueda por nombre y descripción en la tabla principal
      const mainSearchConditions = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];

      // Buscar productos que tengan variantes con SKU coincidente
      const productsWithMatchingSku = await Product.findAll({
        include: [{
          model: ProductVariant,
          as: 'variants',
          where: {
            sku: { [Op.like]: `%${search}%` }
          },
          attributes: ['id']
        }],
        attributes: ['id']
      });

      // Extraer IDs de productos que tienen variantes con SKU coincidente
      const productIdsWithMatchingSku = productsWithMatchingSku.map(p => p.id);

      // Combinar condiciones: búsqueda en campos principales O productos con SKU coincidente
      if (productIdsWithMatchingSku.length > 0) {
        where[Op.or] = [
          ...mainSearchConditions,
          { id: { [Op.in]: productIdsWithMatchingSku } }
        ];
      } else {
        where[Op.or] = mainSearchConditions;
      }
      
      console.log('🔍 Products with matching SKU:', productIdsWithMatchingSku);
      console.log('🔍 Final search conditions:', JSON.stringify(where[Op.or], null, 2));
    }

    // Siempre incluir variantes para mostrar información completa y calcular stock total
    includeArray.push({
      model: ProductVariant,
      as: 'variants',
      attributes: ['id', 'sku', 'stock', 'color_id', 'size_id'],
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
      ],
      required: false
    });

    // Incluir todas las imágenes del producto organizadas por color
    includeArray.push({
      model: ImgColorProduct,
      as: 'colorImages',
      attributes: ['id', 'img', 'color_id'],
      include: [
        {
          model: Color,
          as: 'color',
          attributes: ['id', 'name', 'hex_code']
        }
      ],
      required: false
    });

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
      include: includeArray,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
      distinct: true // Para evitar duplicados cuando hay múltiples variantes
    });

    // Calcular stock total para cada producto sumando el stock de todas sus variantes
    const productsWithTotalStock = products.map(product => {
      const productData = product.toJSON();
      
      // Calcular stock total sumando todas las variantes
      let totalStock = 0;
      if (productData.variants && productData.variants.length > 0) {
        totalStock = productData.variants.reduce((sum, variant) => {
          return sum + (variant.stock || 0);
        }, 0);
      }
      
      // Agregar el campo total_stock al producto
      productData.total_stock = totalStock;
      
      // Determinar imagen principal (tomar la primera imagen disponible)
      let mainImage = null;
      if (productData.colorImages && productData.colorImages.length > 0) {
        const firstImage = productData.colorImages[0];
        if (firstImage && firstImage.img) {
          mainImage = `/uploads/products/${firstImage.img}`;
        }
      }
      productData.main_image = mainImage;
      
      return productData;
    });

    console.log('📊 Found products count:', count);
    console.log('📊 Returned products:', productsWithTotalStock.length);
    if (search) {
      console.log('📊 Search results for "' + search + '":', productsWithTotalStock.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description?.substring(0, 50),
        total_stock: p.total_stock,
        main_image: p.main_image,
        variants: p.variants?.map(v => ({ sku: v.sku, stock: v.stock }))
      })));
    }

    res.json({
      success: true,
      data: productsWithTotalStock,
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
        ['id', 'ASC'],
        [{ model: Size, as: 'sizes' }, 'id', 'ASC']
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
      order: [['id', 'ASC']]
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
      order: [['id', 'ASC']]
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

// Update type size
export const updateTypeSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'La descripción del tipo de talla es requerida'
      });
    }

    const typeSize = await TypeSize.findByPk(id);
    if (!typeSize) {
      return res.status(404).json({
        success: false,
        message: 'Tipo de talla no encontrado'
      });
    }

    await typeSize.update({
      description: description.trim()
    });

    res.json({
      success: true,
      message: 'Tipo de talla actualizado correctamente',
      data: typeSize
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un tipo de talla con esa descripción'
      });
    }
    console.error('Error updating type size:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar tipo de talla'
    });
  }
};

// Update size
export const updateSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type_size_id } = req.body;

    if (!name || !type_size_id) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y tipo de talla son requeridos'
      });
    }

    const size = await Size.findByPk(id);
    if (!size) {
      return res.status(404).json({
        success: false,
        message: 'Talla no encontrada'
      });
    }

    // Verificar que el tipo de talla existe
    const typeSize = await TypeSize.findByPk(type_size_id);
    if (!typeSize) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de talla no válido'
      });
    }

    await size.update({
      name: name.trim(),
      type_size_id
    });

    // Cargar la talla actualizada con su tipo
    const updatedSize = await Size.findByPk(id, {
      include: [{
        model: TypeSize,
        as: 'typeSize',
        attributes: ['id', 'description']
      }]
    });

    res.json({
      success: true,
      message: 'Talla actualizada correctamente',
      data: updatedSize
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una talla con ese nombre en este tipo'
      });
    }
    console.error('Error updating size:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar talla'
    });
  }
};