import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import nodemailer from 'nodemailer';

// Configurar transporter de nodemailer (usa el mismo que ya tienes en tu app)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-contraseña-app'
    }
});

// Template HTML del email
const getEmailTemplate = (resetLink, userName) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - DulceTienda</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden;">
                        <!-- Header con logo -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #f06baa, #e85a9b); padding: 40px 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                                    🍬 DulceTienda
                                </h1>
                                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">
                                    Tu tienda de confianza
                                </p>
                            </td>
                        </tr>

                        <!-- Contenido -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                                    Recuperación de Contraseña
                                </h2>

                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Hola <strong>${userName}</strong>,
                                </p>

                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                    Hemos recibido una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                                </p>

                                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                    Para crear una nueva contraseña, haz clic en el siguiente botón:
                                </p>

                                <!-- Botón de recuperación -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 0 0 30px 0;">
                                            <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f06baa, #e85a9b); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(240, 107, 170, 0.3);">
                                                Restablecer Contraseña
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <div style="background-color: #fff5f8; border-left: 4px solid #f06baa; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 4px;">
                                    <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                                        <strong>⏱️ Este enlace expirará en 15 minutos</strong><br>
                                        Por razones de seguridad, este enlace solo será válido durante los próximos 15 minutos.
                                    </p>
                                </div>

                                <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                                    Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                                </p>

                                <p style="color: #f06baa; font-size: 14px; word-break: break-all; margin: 0 0 30px 0;">
                                    ${resetLink}
                                </p>

                                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

                                <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 0;">
                                    Si no solicitaste este cambio de contraseña, tu cuenta podría estar en riesgo. Te recomendamos cambiar tu contraseña inmediatamente.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #fafafa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                                <p style="color: #999; font-size: 14px; margin: 0 0 10px 0;">
                                    © 2025 DulceTienda. Todos los derechos reservados.
                                </p>
                                <p style="color: #999; font-size: 12px; margin: 0;">
                                    Este es un correo automático, por favor no respondas a este mensaje.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validar email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico es requerido'
            });
        }

        // Verificar que el usuario existe
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Por seguridad, no revelar si el email existe o no
            return res.status(200).json({
                success: true,
                message: 'Si el correo está registrado, recibirás un enlace de recuperación'
            });
        }

        // Generar token aleatorio
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Calcular fecha de expiración (15 minutos)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Guardar token en el usuario
        await user.update({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: expiresAt
        });

        // Crear link de recuperación
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

        // Enviar email
        const mailOptions = {
            from: `"DulceTienda" <${process.env.EMAIL_USER || 'noreply@dulcetienda.com'}>`,
            to: email,
            subject: 'Recuperación de Contraseña - DulceTienda',
            html: getEmailTemplate(resetLink, user.name)
        };

        await transporter.sendMail(mailOptions);

        console.log(`✅ Email de recuperación enviado a: ${email}`);

        res.status(200).json({
            success: true,
            message: 'Si el correo está registrado, recibirás un enlace de recuperación'
        });

    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud'
        });
    }
};

// Verificar token de recuperación
export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Hash del token para comparar
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar usuario con este token
        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Verificar si el token ha expirado
        if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({
                success: false,
                message: 'El token ha expirado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token válido',
            email: user.email
        });

    } catch (error) {
        console.error('Error en verifyResetToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar el token'
        });
    }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token y nueva contraseña son requeridos'
            });
        }

        // Validar longitud de contraseña
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Hash del token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar usuario con este token
        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido'
            });
        }

        // Verificar expiración
        if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({
                success: false,
                message: 'El token ha expirado'
            });
        }

        // Actualizar contraseña y limpiar token (el hook de User se encarga del hash)
        await user.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        console.log(`✅ Contraseña actualizada para: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error al restablecer la contraseña'
        });
    }
};
