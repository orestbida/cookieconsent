/**
 * Clone object using recursion
 * @param {any} el
 */
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


export const customEvents = {
    _RESET: 'cc:reset'
}

export const fireEvent = (eventType) => {
    window.dispatchEvent(new CustomEvent(eventType))
}

export const onEvent = (eventType, fn) => {
    window.addEventListener(eventType, fn);
}