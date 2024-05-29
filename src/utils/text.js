/**
 * Helper function for replacing text spaces with the given symbol.
 *
 * @param {string} text
 * @param {string} symbol 
 * @returns Replaces text
 */
export const replaceTextSpacesWithSymbol = (text, symbol) => {
    return text.replace(/\s/g, symbol);
};