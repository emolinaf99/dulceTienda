import { User } from '../models/associations.js';
import { generateToken } from '../utils/jwt.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password, name, first_name, last_name, phone, role = 'cliente' } = req.body;

    // Si viene 'name', dividir en first_name y last_name
    let firstName = first_name;
    let lastName = last_name;
    
    if (name && !first_name && !last_name) {
      const nameParts = name.trim().split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '';
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const user = await User.create({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: role === 'admin' && req.user?.role !== 'admin' ? 'cliente' : role
    });

    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active
    };

    // Set HttpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      token: token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active
    };

    // Set HttpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: userResponse,
      token: token
    });

    console.log('inicio exitoso');
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userResponse = {
      id: req.user.id,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`.trim(),
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      phone: req.user.phone,
      role: req.user.role,
      address: req.user.address,
      city: req.user.city,
      postal_code: req.user.postal_code,
      is_active: req.user.is_active
    };

    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { first_name, last_name, phone, address, city, postal_code } = req.body;

    await req.user.update({
      first_name,
      last_name,
      phone,
      address,
      city,
      postal_code
    });

    const userResponse = {
      id: req.user.id,
      email: req.user.email,
      name: `${req.user.first_name} ${req.user.last_name}`.trim(),
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      phone: req.user.phone,
      role: req.user.role,
      address: req.user.address,
      city: req.user.city,
      postal_code: req.user.postal_code,
      is_active: req.user.is_active
    };

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the HttpOnly cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};