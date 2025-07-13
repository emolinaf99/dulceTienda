import enviarNotificacion from '../../public/js/notificacionCorreo.js';

export const enviarCorreoContacto = async (req, res) => {
    

    // Crear objeto de información para el correo
    let informacion = {
        nombre: req.body.nombre,
        telefono: req.body.telefono,
        ciudad: req.body.ciudad,
        correo: req.body.correo,
        mensaje: req.body.mensaje,
    };

    try {
        // Llamar a la función de enviarNotificacion y esperar su resolución
        await enviarNotificacion(0, informacion, '');

        // Enviar respuesta JSON en caso de éxito
        res.json({ message: '¡Correo enviado exitosamente!' });

    } catch (error) {
        // Manejar cualquier error ocurrido durante el envío del correo
        console.error('Error al enviar el correo:', error);
        
        // Enviar respuesta JSON con un mensaje de error
        res.status(500).json({ message: 'Ocurrió un error al enviar el correo.' });
    }
};