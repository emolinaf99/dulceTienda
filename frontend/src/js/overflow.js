export function checkOverflow(container, leftButton, rightButton, productsCount = null) {
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;

    // Mostrar/ocultar botones
    if (leftButton) {
        leftButton.style.display = hasOverflow ? 'block' : 'none';
    }
    if (rightButton) {
        rightButton.style.display = hasOverflow ? 'block' : 'none';
    }

    // Agregar/quitar clase según la cantidad de productos
    // Si hay 4 o más productos, alinear a la izquierda
    // Si hay menos de 4, centrar
    if (productsCount !== null) {
        if (productsCount >= 4) {
            container.classList.add('has-overflow');
        } else {
            container.classList.remove('has-overflow');
        }
    } else {
        // Fallback: usar detección de overflow si no se proporciona cantidad
        if (hasOverflow) {
            container.classList.add('has-overflow');
        } else {
            container.classList.remove('has-overflow');
        }
    }
}
