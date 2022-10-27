const win = window;

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
    _INIT: 'cc:onInit',
    _RESET: 'cc:reset',
    _ON_CONSENT: 'cc:onConsent',
    _ON_CHANGE: 'cc:onChange',
    _ON_MODAL_SHOW: 'cc:onModalShow'
};

/**
 * @param {string} eventType
 */
export const fireEvent = (eventType) => {
    win.dispatchEvent(new CustomEvent(eventType));
};

/**
 * @callback Callback
 */

/**
 * @param {string} eventType
 * @param {Callback} fn
 */
export const onEvent = (eventType, fn) => {
    win.addEventListener(eventType, fn);
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
 * @param {import("vanilla-cookieconsent").CookieConsentConfig} config
 * @param {'consentModal' | 'preferencesModal'} [showModal]
 */
export const reRunPlugin = (config, showModal) => {
    const cc = win.CookieConsent;

    cc.reset();
    cc.run(config);

    showModal === 'consentModal' && cc.show(true);
    showModal === 'preferencesModal' && cc.showPreferences();
};

/**
 * @param {string} selector
 */
export const getById = (selector) => document.getElementById(selector);