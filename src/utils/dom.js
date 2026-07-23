import { globalObj } from '../core/global';
import { BUTTON_TAG, TOGGLE_DISABLE_INTERACTION_CLASS } from './constants';

export const getActiveElement = () => document.activeElement;

/**
 * @param {Event} e
 */
export const preventDefault = (e) => e.preventDefault();

/**
 * @param {Element} el
 * @param {string} selector
 */
export const querySelectorAll = (el, selector) => el.querySelectorAll(selector);

/**
 * @param {HTMLInputElement} input
 */
export const dispatchInputChangeEvent = (input) => input.dispatchEvent(new Event('change'));

/**
 * @param {keyof HTMLElementTagNameMap} type
 */
export const createNode = (type) => {
    const el = document.createElement(type);

    if (type === BUTTON_TAG) {
        el.type = type;
    }

    return el;
};

/**
 * Idempotent create-once helper: modals are re-created every time
 * `run()`/`setLanguage()` regenerates the html, so most nodes are cached
 * on `dom` and only created (+ wired up via `setup`) the first time.
 *
 * `getEl`/`setEl` must use plain static `dom._prop` access rather than a
 * computed/string key: production builds mangle `_`-prefixed property names
 * (see `mangle.properties` in rollup-full.config.mjs), and that mangling
 * only rewrites literal `.prop` access it can see at build time - a string
 * key passed at runtime would silently point at an unmangled, disconnected
 * property instead.
 * @param {() => HTMLElement} getEl
 * @param {(el: HTMLElement) => void} setEl
 * @param {keyof HTMLElementTagNameMap} type
 * @param {(el: HTMLElement) => void} [setup]
 * @returns {HTMLElement}
 */
export const getOrCreateNode = (getEl, setEl, type, setup) => {
    let el = getEl();

    if (!el) {
        el = createNode(type);
        setEl(el);
        setup && setup(el);
    }

    return el;
};

/**
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {string} value
 */
export const setAttribute = (el, attribute, value) => el.setAttribute(attribute, value);

/**
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {boolean} [prependData]
 */
export const removeAttribute = (el, attribute, prependData) => {
    el.removeAttribute(prependData
        ? 'data-' + attribute
        : attribute
    );
};

/**
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {boolean} [prependData]
 * @returns {string}
 */
export const getAttribute = (el, attribute, prependData) => {
    return el.getAttribute(prependData
        ? 'data-' + attribute
        : attribute
    );
};

/**
 * @param {Node} parent
 * @param {Node} child
 */
export const appendChild = (parent, child) => parent.appendChild(child);

/**
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const addClass = (elem, className) => elem.classList.add(className);

/**
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const addClassCm = (elem, className) => addClass(elem, 'cm__' + className);
/**
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const addClassPm = (elem, className) => addClass(elem, 'pm__' + className);

/**
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const removeClass = (el, className) => el.classList.remove(className);

/**
 * @param {HTMLElement} el
 * @param {string} className
 */
export const hasClass = (el, className) => el.classList.contains(className);

/**
 * Add event listener to dom object (cross browser function)
 * @param {Element} elem
 * @param {keyof WindowEventMap} event
 * @param {EventListener} fn
 * @param {boolean} [saveListener]
 */
export const addEvent = (elem, event, fn, saveListener) => {
    elem.addEventListener(event, fn);

    /**
     * Keep track of specific event listeners
     * that must be removed on `.reset()`
     */
    if (saveListener) {
        globalObj._state._dataEventListeners.push({
            _element: elem,
            _event: event,
            _listener: fn
        });
    }
};

/**
 * @param {HTMLElement} el
 * @param {boolean} [toggleTabIndex]
 */
export const focus = (el, toggleTabIndex) => {
    if (!el) return;

    /**
     * Momentarily add the `tabindex` attribute to fix
     * a bug with focus restoration in chrome
     */
    toggleTabIndex && (el.tabIndex = -1);

    el.focus();

    /**
     * Remove the `tabindex` attribute so
     * that the html markup is valid again
     */
    toggleTabIndex && el.removeAttribute('tabindex');
};

let disableInteractionTimeout;

/**
 * @param {boolean} [enable]
 */
export const toggleDisableInteraction = (enable) => {
    clearTimeout(disableInteractionTimeout);

    if (enable) {
        addClass(globalObj._dom._rootEl, TOGGLE_DISABLE_INTERACTION_CLASS);
    }else {
        disableInteractionTimeout = setTimeout(() => {
            removeClass(globalObj._dom._rootEl, TOGGLE_DISABLE_INTERACTION_CLASS);
        }, 500);
    }
};
