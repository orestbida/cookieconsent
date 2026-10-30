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
    _PLAYGROUND_READY: 'pg:ready',
    _INIT: 'cc:onInit',
    _RESET: 'cc:reset',
    _UPDATE: 'pg:update',
    _RUN: 'pg:run'
};

/**
 * @param {string} eventType
 */
export const fireEvent = (eventType) => {
    window.dispatchEvent(new CustomEvent(eventType));
};

/**
 * @param {string} json
 * @returns {string}
 */
export const unquoteJson = json => json.replace(/"([^"]+)":/g, '$1:');

/**
 * @callback Callback
 */

/**
 * @param {string} eventType
 * @param {Callback} fn
 */
export const onEvent = (eventType, fn) => {
    window.addEventListener(eventType, fn);
};

/**
 * @param {HTMLElement|Node} el
 * @param {string} eventType
 * @param {Callback} fn
 */
export const addEvent = (el, eventType, fn) => {
    el.addEventListener(eventType, fn);
};

/**
 * @param {string} selector
 */
export const getById = (selector) => document.getElementById(selector);

export const deepEqual = (x, y) => {
    const ok = Object.keys, tx = typeof x, ty = typeof y;
    return x && y && tx === 'object' && tx === ty ? (
        ok(x).length === ok(y).length &&
        ok(x).every(key => deepEqual(x[key], y[key]))
    ) : (x === y);
};

/**
 * Minimal highlighting for the generated config and the cookie JSON:
 * comments, keys, strings and literals
 * @param {string} code
 */
export const highlightCode = (code) => code
    .replace(/[&<>]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'})[char])
    .replace(
        /(\/\/.*$)|("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(true|false|null|\d+)\b|^(\s*)([\w$]+)(?=:)/gm,
        (match, comment, jsonKey, string, literal, indent, key) => {
            if (comment)
                return `<span class="tk-comment">${comment}</span>`;

            if (jsonKey)
                return `<span class="tk-key">${jsonKey}</span>`;

            if (string)
                return `<span class="tk-string">${string}</span>`;

            if (literal)
                return `<span class="tk-literal">${literal}</span>`;

            return `${indent}<span class="tk-key">${key}</span>`;
        }
    );
