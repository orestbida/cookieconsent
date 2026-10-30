const iconStrokes = [
    'M 19.5 4.5 L 4.5 19.5 M 4.5 4.501 L 19.5 19.5',    // X
    'M 3.572 13.406 L 8.281 18.115 L 20.428 5.885',     // TICK
    'M 21.999 6.94 L 11.639 17.18 L 2.001 6.82 '        // ARROW
];

/**
 * [0: x, 1: tick, 2: arrow]
 * @param {0 | 1 | 2} [iconIndex]
 * @param {number} [strokeWidth]
 */
export const getSvgIcon = (iconIndex = 0, strokeWidth = 1.5) => {
    return `<svg aria-hidden="true" viewBox="0 0 24 24" stroke-width="${strokeWidth}"><path d="${iconStrokes[iconIndex]}"/></svg>`;
};
