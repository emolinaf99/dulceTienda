// elemento es el cuadro que desaparecera
// background es la opacidad que aparece en el fondo al aparecer el cuadro

export function cerrarVentana(elemento,background) {
    try {
        elemento.classList.remove('flex')
        background.classList.remove('flex')

    } catch(err) {
        console.error('Ha ocurrido un error cerrando el elemento: ',elemento, err);
    }
}   
    
