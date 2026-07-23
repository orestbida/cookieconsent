/**
 * Helper indexOf
 * @param {any[]|string} el
 * @param {any} value
 */
export const indexOf = (el, value) => el.indexOf(value);

/**
 * Returns true if el. (array or string) contains the specified value
 * @param {any[]|string} el
 */
export const elContains = (el, value) => indexOf(el, value) !== -1;

export const getKeys = obj => Object.keys(obj);

/**
 * Return array without duplicates
 * @param {any[]} arr
 */
export const unique = (arr) => Array.from(new Set(arr));

/**
 * Symmetric difference between 2 arrays
 * @param {any[]} arr1
 * @param {any[]} arr2
 */
export const arrayDiff = (arr1, arr2) => {
    const a = arr1 || [];
    const b = arr2 || [];

    return a
        .filter(x => !elContains(b, x))
        .concat(b.filter(x => !elContains(a, x)));
};

export const deepCopy = (el) => {
    if (typeof el !== 'object' )
        return el;

    if (el instanceof Date)
        return new Date(el.getTime());

    let clone = Array.isArray(el) ? [] : {};

    for (let key in el) {
        let value = el[key];
        clone[key] = deepCopy(value);
    }

    return clone;
};
