export function scrollearConClick(container,item,derechaOIzquierda) {
    //container es el contenedor donde se realiza el scroll
    //item es la imagen o el elemento a scrollear
    //derechaOIzquierda 0 para derecha 1 para izquierda

    // Obtén el ancho de un elemento dentro del contenedor
    const itemWidth = item.offsetWidth;

    if(derechaOIzquierda == 0) {
        container.scrollBy({
            left: itemWidth,   // Desplazamiento hacia la derecha
            behavior: 'smooth' // Animación suave
        });
    } else if(derechaOIzquierda == 1) {
        container.scrollBy({
            left: -itemWidth,  // Desplazamiento hacia la izquierda
            behavior: 'smooth' // Animación suave
        });
    }

}