// elemento es el cuadro que desaparecera
// background es la opacidad que aparece en el fondo al aparecer el cuadro

export function abrirVentana(elemento,background) {
    try {
        elemento.classList.add('flex')
        background.classList.add('flex')

    } catch(err) {
        console.error('Ha ocurrido un error abriendo el elemento: ',elemento, err);
    }
}   
    
