export function checkOverflow(container, leftButton, rightButton) {
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;

    if (leftButton) {
        leftButton.style.display = hasOverflow ? 'block' : 'none';
    }
    if (rightButton) {
        rightButton.style.display = hasOverflow ? 'block' : 'none';
    }
}
