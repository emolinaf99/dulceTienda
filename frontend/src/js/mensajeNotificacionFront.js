
export default function mostrarNotificacion(mensaje, color) {
    // mensaje es el mensaje que aparecerá
    // color es si es éxito (1) o si es error (0)

    let notificacionTexto = document.querySelector('.notificacionContainer')

    notificacionTexto.style.display = 'flex'
    notificacionTexto.innerHTML = `<p>${mensaje}</p>`

    if(color == 1) {
        // Éxito - Negro con borde rosa
        notificacionTexto.style.color = '#333'
        notificacionTexto.style.borderColor = '#333'
        notificacionTexto.style.background = 'white'
        // Icono de check simple
        notificacionTexto.style.setProperty('--icon', 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\'/%3E%3C/svg%3E")')
    } else {
        // Error - Gris más claro
        notificacionTexto.style.color = '#666'
        notificacionTexto.style.borderColor = '#aaa'
        notificacionTexto.style.background = 'white'
        // Icono de info/alerta
        notificacionTexto.style.setProperty('--icon', 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23666\'%3E%3Cpath d=\'M11 15h2v2h-2zm0-8h2v6h-2zm1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\'/%3E%3C/svg%3E")')
    }

    setTimeout(() => {
        notificacionTexto.style.display = 'none'
    }, 3000)
}