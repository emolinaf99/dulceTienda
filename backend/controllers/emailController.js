import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const enviarCorreoContacto = async (req, res) => {
  try {
    // Extraer información del cuerpo de la solicitud
    const { nombre, telefono, ciudad, correo, mensaje } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, correo y mensaje son obligatorios'
      });
    }

    // Configurar el contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar a tu propio correo
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      html: `
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
        <p><strong>Ciudad:</strong> ${ciudad || 'No proporcionada'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
        <hr>
        <p><small>Este mensaje fue enviado desde el formulario de contacto de DulceTienda</small></p>
      `
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Respuesta exitosa
    res.json({
      success: true,
      message: '¡Correo enviado exitosamente!'
    });

  } catch (error) {
    console.error('Error al enviar el correo:', error);
    
    res.status(500).json({
      success: false,
      message: 'Ocurrió un error al enviar el correo. Por favor, intenta más tarde.'
    });
  }
};