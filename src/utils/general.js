import { globalObj } from '../core/global';
import {
    SCRIPT_TAG_SELECTOR,
    BUTTON_TAG, CLICK_EVENT,
    TOGGLE_DISABLE_INTERACTION_CLASS
} from './constants';

/**
 * Helper console.log function
 * @param {any} [params]
 */
export const debug = (...params) => {
    console.log(...params);
};

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

export const isArray = el => Array.isArray(el);

export const isString = el => typeof el === 'string';

export const isObject = el => !!el && typeof el === 'object' && !isArray(el);

export const isFunction = el => typeof el === 'function';

export const getKeys = obj => Object.keys(obj);

/**
 * Return array without duplicates
 * @param {any[]} arr
 */
export const unique = (arr) => Array.from(new Set(arr));

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

/**
 * Store categories and services' config. details
 * @param {string[]} allCategoryNames
 */
export const fetchCategoriesAndServices = (allCategoryNames) => {
    const {
        _allDefinedCategories,
        _allDefinedServices,
        _acceptedServices,
        _enabledServices,
        _readOnlyCategories
    } = globalObj._state;

    for (let categoryName of allCategoryNames) {

        const currCategory = _allDefinedCategories[categoryName];
        const services = currCategory.services || {};
        const serviceNames = isObject(services) && getKeys(services) || [];

        _allDefinedServices[categoryName] = {};
        _acceptedServices[categoryName] = [];
        _enabledServices[categoryName] = [];

        /**
         * Keep track of readOnly categories
         */
        if (currCategory.readOnly) {
            _readOnlyCategories.push(categoryName);
            _acceptedServices[categoryName] = serviceNames;
        }

        globalObj._dom._serviceCheckboxInputs[categoryName] = {};

        for (let serviceName of serviceNames) {
            const service = services[serviceName];
            service._enabled = false;
            _allDefinedServices[categoryName][serviceName] = service;
        }
    }
};

/**
 * Retrieves all script elements with 'data-category' attribute
 * and save the following attributes: category-name and service
 */
export const retrieveScriptElements = () => {
    if (!globalObj._config.manageScriptTags)
        return;

    const state = globalObj._state;

    /**
     * @type {NodeListOf<HTMLScriptElement>}
     */
    const scripts = querySelectorAll(document, 'script[' + SCRIPT_TAG_SELECTOR +']');

    for (const scriptTag of scripts) {
        let scriptCategoryName = getAttribute(scriptTag, SCRIPT_TAG_SELECTOR);
        let scriptServiceName = scriptTag.dataset.service || '';
        let runOnDisable = false;

        /**
         * Remove the '!' char if it is present
         */
        if (scriptCategoryName && scriptCategoryName.charAt(0) === '!') {
            scriptCategoryName = scriptCategoryName.slice(1);
            runOnDisable = true;
        }

        if (scriptServiceName.charAt(0) === '!') {
            scriptServiceName = scriptServiceName.slice(1);
            runOnDisable = true;
        }

        if (elContains(state._allCategoryNames, scriptCategoryName)) {
            state._allScriptTags.push({
                _script: scriptTag,
                _executed: false,
                _runOnDisable: runOnDisable,
                _categoryName: scriptCategoryName,
                _serviceName: scriptServiceName
            });

            if (scriptServiceName) {
                const categoryServices = state._allDefinedServices[scriptCategoryName];
                if (!categoryServices[scriptServiceName]) {
                    categoryServices[scriptServiceName] = {
                        _enabled: false
                    };
                }
            }
        }
    }
};

/**
 * Calculate rejected services (all services - enabled services)
 * @returns {Object.<string, string[]>}
 */
export const retrieveRejectedServices = () => {
    const rejectedServices = {};

    const {
        _allCategoryNames,
        _allDefinedServices,
        _acceptedServices
    } = globalObj._state;

    for (const categoryName of _allCategoryNames) {
        rejectedServices[categoryName] = arrayDiff(
            _acceptedServices[categoryName],
            getKeys(_allDefinedServices[categoryName])
        );
    }

    return rejectedServices;
};

export const retrieveCategoriesFromModal = () => {
    const toggles = globalObj._dom._categoryCheckboxInputs;

    if (!toggles)
        return [];

    let enabledCategories = [];

    for (let categoryName in toggles) {
        if (toggles[categoryName].checked) {
            enabledCategories.push(categoryName);
        }
    }

    return enabledCategories;
};

/**
 * @param {string[]|string} categories - Categories to accept
 * @param {string[]} [excludedCategories]
 */
export const resolveEnabledCategories = (categories, excludedCategories) => {
    const {
        _allCategoryNames,
        _acceptedCategories,
        _readOnlyCategories,
        _preferencesModalExists,
        _enabledServices,
        _defaultEnabledCategories,
        _allDefinedServices
    } = globalObj._state;

    /**
     * @type {string[]}
     */
    let enabledCategories = [];

    if (!categories) {
        enabledCategories = [..._acceptedCategories, ..._defaultEnabledCategories];
        //{{START: GUI}}
        if (_preferencesModalExists) {
            enabledCategories = retrieveCategoriesFromModal();
        }
        //{{END: GUI}}
    } else {
        if (isArray(categories)) {
            enabledCategories.push(...categories);
        } else if (isString(categories)) {
            enabledCategories = categories === 'all'
                ? _allCategoryNames
                : [categories];
        }

        /**
         * If there are services, turn them all on or off
         */
        for (const categoryName of _allCategoryNames) {
            _enabledServices[categoryName] = elContains(enabledCategories, categoryName)
                ? getKeys(_allDefinedServices[categoryName])
                : [];
        }
    }

    // Remove invalid and excluded categories
    enabledCategories = enabledCategories.filter(category =>
        !elContains(_allCategoryNames, category) ||
        !elContains(excludedCategories, category)
    );

    // Add back all the categories set as "readonly/required"
    enabledCategories.push(..._readOnlyCategories);

    setAcceptedCategories(enabledCategories);
};

/**
 * @param {string} [relativeCategory]
 */
export const resolveEnabledServices = (relativeCategory) => {
    const state = globalObj._state;

    const {
        _enabledServices,
        _readOnlyCategories,
        _acceptedServices,
        _allDefinedServices,
        _allCategoryNames
    } = state;

    const categoriesToConsider = relativeCategory
        ? [relativeCategory]
        : _allCategoryNames;

    /**
     * Save previously enabled services to calculate later on which of them was changed
     */
    state._lastEnabledServices = deepCopy(_acceptedServices);

    for (const categoryName of categoriesToConsider) {
        const services = _allDefinedServices[categoryName];
        const serviceNames = getKeys(services);
        const customServicesSelection = _enabledServices[categoryName] && _enabledServices[categoryName].length > 0;
        const readOnlyCategory = elContains(_readOnlyCategories, categoryName);

        /**
         * Stop here if there are no services
         */
        if (serviceNames.length === 0)
            continue;

        // Empty (previously) enabled services
        _acceptedServices[categoryName] = [];

        // If category is marked as readOnly enable all its services
        if (readOnlyCategory) {
            _acceptedServices[categoryName].push(...serviceNames);
        } else {
            if (customServicesSelection) {
                const selectedServices = _enabledServices[categoryName];
                _acceptedServices[categoryName].push(...selectedServices);
            } else {
                _acceptedServices[categoryName] = state._enabledServices[categoryName];
            }
        }

        /**
         * Make sure there are no duplicates inside array
         */
        _acceptedServices[categoryName] = unique(_acceptedServices[categoryName]);
    }
};

/**
 * @param {string} eventName
 */
const dispatchPluginEvent = (eventName, data) => dispatchEvent(new CustomEvent(eventName, {detail: data}));

/**
 * Update services state internally and tick/untick checkboxes
 * @param {string|string[]} service
 * @param {string} category
 */
export const updateModalToggles = (service, category) => {
    const state = globalObj._state;
    const {
        _allDefinedServices,
        _enabledServices,
        _preferencesModalExists
    } = state;

    const servicesInputs = globalObj._dom._serviceCheckboxInputs[category] || {};
    const categoryInput = globalObj._dom._categoryCheckboxInputs[category] || {};
    const allServiceNames = getKeys(_allDefinedServices[category]);

    // Clear previously enabled services
    _enabledServices[category] = [];

    if (isString(service)) {
        if (service === 'all') {

            // Enable all services
            _enabledServices[category].push(...allServiceNames);

            if (_preferencesModalExists) {
                for (let serviceName in servicesInputs) {
                    servicesInputs[serviceName].checked = true;
                    dispatchInputChangeEvent(servicesInputs[serviceName]);
                }
            }

        } else {

            // Enable only one service (if valid) and disable all the others
            if (elContains(allServiceNames, service))
                _enabledServices[category].push(service);

            if (_preferencesModalExists) {
                for (let serviceName in servicesInputs) {
                    servicesInputs[serviceName].checked = service === serviceName;
                    dispatchInputChangeEvent(servicesInputs[serviceName]);
                }
            }
        }
    } else if (isArray(service)) {
        for (let serviceName of allServiceNames) {
            const validService = elContains(service, serviceName);
            validService && _enabledServices[category].push(serviceName);

            if (_preferencesModalExists) {
                servicesInputs[serviceName].checked = validService;
                dispatchInputChangeEvent(servicesInputs[serviceName]);
            }
        }
    }

    const uncheckCategory = _enabledServices[category].length === 0;

    /**
     * Remove/add the category from acceptedCategories
     */
    state._acceptedCategories = uncheckCategory
        ? state._acceptedCategories.filter(cat => cat !== category)
        : unique([...state._acceptedCategories, category]);

    /**
     * If there are no services enabled in the
     * current category, uncheck the category
     */
    if (_preferencesModalExists) {
        categoryInput.checked = !uncheckCategory;
        dispatchInputChangeEvent(categoryInput);
    }
};

/**
 * Generate RFC4122-compliant UUIDs.
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid?page=1&tab=votes#tab-top
 * @returns {string} unique uuid string
 */
export const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) => {
        return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
    });
};

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
 * Calculate the existing cookie's remaining time until expiration (in milliseconds)
 */
export const getRemainingExpirationTimeMS = () => {
    const lastTimestamp = globalObj._state._lastConsentTimestamp;

    const elapsedTimeMilliseconds = lastTimestamp
        ? new Date() - lastTimestamp
        : 0;

    return getExpiresAfterDaysValue()*86400000 - elapsedTimeMilliseconds;
};

/**
 * Used to fetch external language files (.json)
 * @param {string} url
 * @returns {Promise<import('../core/global').Translation | boolean>}
 */
export const fetchJson = async (url) => {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Helper function to retrieve cookie duration
 * @returns {number}
 */
export const getExpiresAfterDaysValue = () => {
    const expiresAfterDays = globalObj._config.cookie.expiresAfterDays;

    return isFunction(expiresAfterDays)
        ? expiresAfterDays(globalObj._state._acceptType)
        : expiresAfterDays;
};

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

/**
 * Calculate "accept type"
 * @returns {'all'|'custom'|'necessary'} accept type
 */
export const resolveAcceptType = () => {
    let type = 'custom';

    const { _acceptedCategories, _allCategoryNames, _readOnlyCategories } = globalObj._state;
    const nAcceptedCategories = _acceptedCategories.length;

    if (nAcceptedCategories === _allCategoryNames.length)
        type = 'all';
    else if (nAcceptedCategories === _readOnlyCategories.length)
        type = 'necessary';

    return type;
};

/**
 * Note: getUserPreferences() depends on "acceptType"
 * @param {string[]} acceptedCategories
 */
export const setAcceptedCategories = (acceptedCategories) => {
    globalObj._state._acceptedCategories = unique(acceptedCategories);
    globalObj._state._acceptType = resolveAcceptType();
};

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback createModal
 * @param {import('../core/global').Api} api
 */

/**
 * Add an onClick listeners to all html elements with data-cc attribute
 * @param {HTMLElement} [elem]
 * @param {import('../core/global').Api} api
 * @param {createModal} [createPreferencesModal]
 */
export const addDataButtonListeners = (elem, api, createPreferencesModal, createMainContainer) => {
    const ACCEPT_PREFIX = 'accept-';

    const {
        show,
        showPreferences,
        hide,
        hidePreferences,
        acceptCategory
    } = api;

    const rootEl = elem || document;
    const getElements = dataRole => querySelectorAll(rootEl, `[data-cc="${dataRole}"]`);

    /**
     * Helper function: accept and then hide modals
     * @param {Event} event source event
     * @param {string|string[]} [acceptType]
     */
    const acceptAction = (event, acceptType) => {
        preventDefault(event);
        acceptCategory(acceptType);
        hidePreferences();
        hide();
    };

    const
        showPreferencesModalElements = getElements('show-preferencesModal'),
        showConsentModalElements = getElements('show-consentModal'),
        acceptAllElements = getElements(ACCEPT_PREFIX + 'all'),
        acceptNecessaryElements = getElements(ACCEPT_PREFIX + 'necessary'),
        acceptCustomElements = getElements(ACCEPT_PREFIX + 'custom'),
        createPreferencesModalOnHover = globalObj._config.lazyHtmlGeneration;

    //{{START: GUI}}
    for (const el of showPreferencesModalElements) {
        setAttribute(el, 'aria-haspopup', 'dialog');
        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            showPreferences();
        });

        if (createPreferencesModalOnHover) {
            addEvent(el, 'mouseenter', (event) => {
                preventDefault(event);
                if (!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            }, true);

            addEvent(el, 'focus', () => {
                if (!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            });
        }
    }

    for (let el of showConsentModalElements) {
        setAttribute(el, 'aria-haspopup', 'dialog');
        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            show(true);
        }, true);
    }
    //{{END: GUI}}

    for (let el of acceptAllElements) {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, 'all');
        }, true);
    }

    for (let el of acceptCustomElements) {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event);
        }, true);
    }

    for (let el of acceptNecessaryElements) {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, []);
        }, true);
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

/**
 * @param {HTMLDivElement} element
 * @param {1 | 2} modalId
 */
export const focusAfterTransition = (element, modalId) => {
    const getVisibleDiv = (modalId) => modalId === 1
        ? globalObj._dom._cmDivTabindex
        : globalObj._dom._pmDivTabindex;

    const setFocus = (event) => {
        event.target.removeEventListener('transitionend', setFocus);
        if (event.propertyName === 'opacity' && getComputedStyle(element).opacity === '1') {
            focus(getVisibleDiv(modalId));
        }
    };

    addEvent(element, 'transitionend', setFocus);
};

/**
 * Obtain accepted and rejected categories
 * @returns {{accepted: string[], rejected: string[]}}
 */
export const getCurrentCategoriesState = () => {
    const {
        _invalidConsent,
        _acceptedCategories,
        _allCategoryNames
    } = globalObj._state;

    return {
        accepted: _acceptedCategories,
        rejected: _invalidConsent
            ? []
            : _allCategoryNames.filter(category =>
                !elContains(_acceptedCategories, category)
            )
    };
};

let disableInteractionTimeout;

/**
 * @param {boolean} [enable]
 */
export const toggleDisableInteraction = (enable) => {
    clearTimeout(disableInteractionTimeout);

    if (enable) {
        addClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
    }else {
        disableInteractionTimeout = setTimeout(() => {
            removeClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
        }, 500);
    }
};

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
    return `<svg viewBox="0 0 24 24" stroke-width="${strokeWidth}"><path d="${iconStrokes[iconIndex]}"/></svg>`;
};

/**
 * Trap focus inside modal and focus the first
 * focusable element of current active modal
 * @param {HTMLDivElement} modal
 */
export const handleFocusTrap = (modal) => {
    const dom = globalObj._dom;
    const state = globalObj._state;

    /**
     * @param {HTMLDivElement} modal
     * @param {HTMLElement[]} focusableElements
     */
    const trapFocus = (modal) => {
        const isConsentModal = modal === dom._cm;

        const scope = state._userConfig.disablePageInteraction
            ? dom._htmlDom
            : isConsentModal
                ? dom._ccMain
                : dom._htmlDom;

        const getFocusableElements = () => isConsentModal
            ? state._cmFocusableElements
            : state._pmFocusableElements;

        const isModalVisible = () => isConsentModal
            ? state._consentModalVisible && !state._preferencesModalVisible
            : state._preferencesModalVisible;

        addEvent(scope, 'keydown', (e) => {
            if (e.key !== 'Tab' || !isModalVisible())
                return;

            const currentActiveElement = getActiveElement();
            const focusableElements = getFocusableElements();

            if (focusableElements.length === 0)
                return;

            /**
             * If reached natural end of the tab sequence => restart
             * If current focused element is not inside modal => focus modal
             */
            if (e.shiftKey) {
                if (currentActiveElement === focusableElements[0] || !modal.contains(currentActiveElement)) {
                    preventDefault(e);
                    focus(focusableElements[1]);
                }
            } else {
                if (currentActiveElement === focusableElements[1] || !modal.contains(currentActiveElement)) {
                    preventDefault(e);
                    focus(focusableElements[0]);
                }
            }
        }, true);
    };

    trapFocus(modal);
};

/**
 * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
 * the first or last element of the modal, won't receive focus during "open/close" modal
 */
const focusableTypesSelector = ['[href]', BUTTON_TAG, 'input', 'details', '[tabindex]']
    .map(selector => selector+':not([tabindex="-1"])').join(',');

export const getFocusableElements = (root) => querySelectorAll(root, focusableTypesSelector);

/**
 * Save reference to first and last focusable elements inside each modal
 * to prevent losing focus while navigating with TAB
 * @param {1 | 2} [modalId]
 */
export const getModalFocusableData = (modalId) => {
    const { _state, _dom } = globalObj;

    /**
     * Saves all focusable elements inside modal, into the array
     * @param {HTMLElement} modal
     * @param {Element[]} array
     */
    const saveAllFocusableElements = (modal, array) => {
        const focusableElements = getFocusableElements(modal);

        /**
         * Save first and last elements (trap focus inside modal)
         */
        array[0] = focusableElements[0];
        array[1] = focusableElements[focusableElements.length - 1];
    };

    if (modalId === 1 && _state._consentModalExists)
        saveAllFocusableElements(_dom._cm, _state._cmFocusableElements);

    if (modalId === 2 && _state._preferencesModalExists)
        saveAllFocusableElements(_dom._pm, _state._pmFocusableElements);
};

/**
 * Fire custom event
 * @param {string} eventName
 * @param {string} [modalName]
 * @param {HTMLElement} [modal]
 */
export const fireEvent = (eventName, modalName, modal) => {
    const {
        _onChange,
        _onConsent,
        _onFirstConsent,
        _onModalHide,
        _onModalReady,
        _onModalShow
    } = globalObj._callbacks;

    const events = globalObj._customEvents;

    //{{START: GUI}}
    if (modalName) {
        const modalParams = { modalName };

        if (eventName === events._onModalShow) {
            isFunction(_onModalShow) && _onModalShow(modalParams);
        } else if (eventName === events._onModalHide) {
            isFunction(_onModalHide) && _onModalHide(modalParams);
        } else {
            modalParams.modal = modal;
            isFunction(_onModalReady) && _onModalReady(modalParams);
        }

        return dispatchPluginEvent(eventName, modalParams);
    }
    //{{END: GUI}}

    const params = {
        cookie: globalObj._state._savedCookieContent
    };

    if (eventName === events._onFirstConsent) {
        isFunction(_onFirstConsent) && _onFirstConsent(deepCopy(params));
    } else if (eventName === events._onConsent) {
        isFunction(_onConsent) && _onConsent(deepCopy(params));
    } else {
        params.changedCategories = globalObj._state._lastChangedCategoryNames;
        params.changedServices = globalObj._state._lastChangedServices;
        isFunction(_onChange) && _onChange(deepCopy(params));
    }

    dispatchPluginEvent(eventName, deepCopy(params));
};

/**
 * @param {CallableFunction} fn
 */
export const safeRun = (fn, hideError) => {
    try {
        return fn();
    } catch (e) {
        !hideError && console.warn('CookieConsent:', e);
        return false;
    }
};