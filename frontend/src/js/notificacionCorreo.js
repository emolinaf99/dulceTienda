import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config(); // Asegúrate de cargar dotenv al inicio

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // si usa SSL
    auth: {
      // TODO: replace `user` and `pass` values 
      user: process.env.USER,
      pass: process.env.APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false // solo en desarrollo
    }
});

export default async function enviarNotificacion(cualNotificacion, informacion, mensaje) {
    //Notificacion
    // 0. Notificacion Persona Interesada Contacto
    
    function formatoFecha(fecha) {
        // Especificar la zona horaria de Colombia
        const zonaHorariaColombia = 'America/Bogota';
    
        // Crear una nueva instancia de fecha con la zona horaria de Colombia
        const fechaColombia = new Date(fecha.toLocaleString('en-US', { timeZone: zonaHorariaColombia }));
        
        const dia = fechaColombia.getDate().toString().padStart(2, '0');
        const mes = (fechaColombia.getMonth() + 1).toString().padStart(2, '0');
        const anho = fechaColombia.getFullYear().toString();
        const horas = fechaColombia.getHours().toString().padStart(2, '0');
        const minutos = fechaColombia.getMinutes().toString().padStart(2, '0');
    
        // Construir la cadena de fecha formateada
        const fechaFormateada = `${dia}/${mes}/${anho} ${horas}:${minutos}`; 
        
        return fechaFormateada;
    }

    try {
        await transporter.verify();
        console.log('transporter is verify');

        let notificaciones = [
            
            {
                subject: `${informacion.nombre} quiere contactarlos` ,
                titulo: `${informacion.nombre} quiere contactarlos`,
                text: `Hoy ${formatoFecha(new Date())} ${informacion.nombre} quiere dejarles la siguiente información de contacto:`,
                info: ['']
            }
    
    
        ]

        //Plantillas de correos

        let mensajeHtmlNotificacionRanInspeccion = `<!DOCTYPE html>
        <html lang="en">
        
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
                <style>
                    * {
                        margin: 0px;
                        padding: 0px;
                        box-sizing: border-box;
                        border: none;
                        color: '#14213d'
                    }
        
                    .contenedorNotificacion h1 {
                        margin-bottom: 1rem;
                        font-size: 22px;
                    }
        
                    body {
                        font-family: 'Inter';
                        background-color: #FFF;
                        width: 70%;
                        background-color: #D0D3D8;
                        overflow-x: hidden;
                        font-weight: 300;
                        display: 'block';
                    }
        
                    .b {
                        font-weight: bold;
                    }
        
                    #BGBlueIDS {
                        background-color: #b3af52;
                        width: 100%;
                        height: 6rem;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        padding: 0.5rem 2rem
                    }
        
                    .contMail {
                        width: 100%;
                        background-color: rgb(245, 244, 244);
                        display: block;
                        justify-content: center;
                        align-items: center;
                        height: fit-content;
                    }
        
                    .logoMail {
                        width: 80px;
                    }
        
                    .contenedorNotificacion {
                        width: 100%;
                        height: auto;
                        padding: 1rem 2rem;
                        gap: 0.5rem;
                        display: block;
                        justify-content: center;
                        align-items: flex-start;
                    }
        
                    .contenedorNotificacionC {
                        width: 80%;
                        height: auto;
                        padding: 1rem 2rem;
                        text-align: center;
                        display: block;
                        justify-content: left;
                        align-items: center;
                    }
        
                    .contenedorNotificacionC a {
                        text-align: center;
                        overflow: auto;
                        display: block;
                        justify-content: center;
                        align-items: center;
                        background-color: #14213D;
                        width: 15rem;
                        color: white;
                        height: auto;
                        padding: 0.5rem 1rem;
                        text-decoration: none;
                    }
        
                    footer {
                        font-family: 'Inter';
                        background-color: #FFF;
                        width: 100%;
                        background-color: #D0D3D8;
                        overflow-x: hidden;
                        font-weight: 300;
                        border-top: 1px solid #D0D3D8;
                    }
        
                    .contFo {
                        width: 100%;
                        background-color: rgb(245, 244, 244);
                        display: block;
                        justify-content: center;
                        align-items: center;
                        height: fit-content;
                        padding: 1.5rem;
                    }
        
                    .contFo p {
                        width: 80%;
                    }
        
                    .contFo a {
                        display: inherit;
                        overflow: hidden;
                        width: 80%;
                    }
        
                    .contGen {
                        width: 100%;
                    }
        
                    .flexRow {
                        width: 100%;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: flex-start;
                        gap: 1rem;
                    }
                </style>
            </head>
        
            <body>
                <div class="contMail">
                    <div class="" id='BGBlueIDS'>
                        <img class="logoMail" src="cid:logoSendasDeLibertad" alt="">
                    </div>
        
                    <div class="contenedorNotificacion">
                        <h1>Hola!</h1>
                        <p>${notificaciones[0].text}</p>
                    </div>
        
                    <div class="contenedorNotificacion">
                        <div class='flexRow'>
                            <p>Telefono:</p>
                            <p>${informacion.telefono}</p>
                        </div>
                        <div class='flexRow'>
                            <p>Ciudad: </p>
                            <p>${informacion.ciudad}</p>
                        </div>
                        <div class='flexRow'>
                            <p>Correo: </p>
                            <p>${informacion.correo}</p>
                        </div>
                        <div class='flexRow'>
                            <p>Mensaje: </p>
                            <p>${informacion.mensaje}</p>
                        </div>
                    </div>
        
                    
        
                    <div class="contenedorNotificacion">
        
                        <h4>Soporte Fundación Sendas de Libertad.</h4>
        
                    </div>
        
                </div>
            </body>
        
        </html>`

        

        // Array de plantillas
        let arrayDePlantillas = [mensajeHtmlNotificacionRanInspeccion]
       
        //Enviar correo
        transporter.verify().catch(console.error);
        transporter.sendMail({
            from: '"Soporte Fundación Sendas de Libertad" "Soporte Fundación Sendas de Libertad"',
            to: 'sendasdelibertadfundacion@gmail.com',
            subject: notificaciones[cualNotificacion].subject,
            text: 'Soporte Fundación Sendas de Libertad'/*notificaciones[cualNotificacion].notificacion*/,
            html: arrayDePlantillas[cualNotificacion],
            attachments: [ // Archivos adjuntado
                {
                    filename: 'logoBlanco.png', //nombre
                    path: 'public/img/sendasDeLibertadLogo.png', // ruta
                    cid: 'logoSendasDeLibertad'  // nombre que lleva el src en html en un correo electronico (como se encuentra la ruta)
                }
            ]
        })

    } catch (err) {
        console.log(err);
    }

   


    
}