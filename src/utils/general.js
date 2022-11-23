import { deepCopy, globalObj, isFunction } from '../core/global';
import {
    SCRIPT_TAG_SELECTOR,
    BUTTON_TAG, CLICK_EVENT,
    TOGGLE_DISABLE_INTERACTION_CLASS
} from './constants';

/**
 * Helper console.log function
 * @param {Object} printMsg
 * @param {Object} [optionalParam]
 */
export const _log = (printMsg, optionalParam) => {
    console.log(printMsg, optionalParam !== undefined
        ? optionalParam
        : ' '
    );
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

export const isArray = (el) => Array.isArray(el);

export const isString = el => typeof el === 'string';

export const isObject = (el) => !!el && typeof el === 'object' && !isArray(el);

export const getKeys = obj => Object.keys(obj);

/**
 * Return array without duplicates
 * @param {any[]} arr
 */
export const unique = (arr) => Array.from(new Set(arr));

/**
 * Get current active element
 */
export const getActiveElement = () => document.activeElement;

/**
 * preventDefault helper function
 * @param {Event} e
 */
export const preventDefault = (e) => e.preventDefault();

/**
 * querySelectorAll helper function
 * @param {Element} el
 * @param {string} selector
 */
export const querySelectorAll = (el, selector) => el.querySelectorAll(selector);


/**
 * Store categories and services' config. details
 * @param {string[]} allCategoryNames
 */
export const fetchCategoriesAndServices = (allCategoryNames) => {

    const state = globalObj._state;

    for(let categoryName of allCategoryNames){

        const currCategory = state._allDefinedCategories[categoryName];
        const services = currCategory.services || {};
        const serviceNames = isObject(services) && getKeys(services) || [];

        state._allDefinedServices[categoryName] = {};
        state._enabledServices[categoryName] = [];

        /**
         * Keep track of readOnly categories
         */
        if(currCategory.readOnly){
            state._readOnlyCategories.push(categoryName);
            state._enabledServices[categoryName] = getKeys(services);
        }

        globalObj._dom._serviceCheckboxInputs[categoryName] = {};

        for(let serviceName of serviceNames){
            const service = services[serviceName];
            service._enabled = false;
            state._allDefinedServices[categoryName][serviceName] = service;
        }
    }
};

/**
 * Retrieves all script elements with 'data-category' attribute
 * and save the following attributes: category-name and service
 */
export const retrieveScriptElements = () => {

    if(!globalObj._config.manageScriptTags)
        return;

    const state = globalObj._state;

    state._allScriptTags = querySelectorAll(globalObj._dom._document, 'script[' + SCRIPT_TAG_SELECTOR +']');
    state._allScriptTagsInfo = [];

    for(const scriptTag of state._allScriptTags){

        let scriptCategoryName = getAttribute(scriptTag, SCRIPT_TAG_SELECTOR);
        let scriptServiceName = scriptTag.dataset.service || '';
        let runOnDisable = false;

        /**
         * Remove the '!' char if it is present
         */
        if(scriptCategoryName && scriptCategoryName.charAt(0) === '!'){
            scriptCategoryName = scriptCategoryName.slice(1);
            runOnDisable = true;
        }

        if(scriptServiceName.charAt(0) === '!'){
            scriptServiceName = scriptServiceName.slice(1);
            runOnDisable = true;
        }

        if(elContains(state._allCategoryNames, scriptCategoryName)){

            state._allScriptTagsInfo.push({
                _executed: false,
                _runOnDisable: runOnDisable,
                _categoryName: scriptCategoryName,
                _serviceName: scriptServiceName
            });

            if(scriptServiceName){
                const categoryServices = state._allDefinedServices[scriptCategoryName];
                if(!categoryServices[scriptServiceName]){
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
        _enabledServices
    } = globalObj._state;

    for(const categoryName of _allCategoryNames){
        rejectedServices[categoryName] = arrayDiff(
            _enabledServices[categoryName],
            getKeys(_allDefinedServices[categoryName])
        );
    }

    return rejectedServices;
};

/**
 * @param {HTMLInputElement} input
 */
export const dispatchChangeEvent = (input) => input.dispatchEvent(new Event('change'));

export const retrieveCategoriesFromModal = () => {
    const state = globalObj._state;
    const toggles = globalObj._dom._categoryCheckboxInputs;

    if(!toggles)
        return [];

    let enabledCategories = [];

    for(let categoryName in toggles){
        if(toggles[categoryName].checked){
            enabledCategories.push(categoryName);
        }
    }

    for(let categoryName in state._customServicesSelection) {
        if(state._customServicesSelection[categoryName].length > 0){
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
        _readOnlyCategories,
        _savedCookieContent,
        _preferencesModalExists
    } = globalObj._state;

    /**
     * @type {string[]}
     */
    let enabledCategories = [];

    if(!categories){
        enabledCategories = _preferencesModalExists
            ? retrieveCategoriesFromModal()
            : _savedCookieContent.categories;
    }else{
        if(isArray(categories)){
            enabledCategories.push(...categories);
        }else if(isString(categories)){
            if(categories === 'all')
                enabledCategories = _allCategoryNames;
            else
                enabledCategories.push(categories);
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

export const resolveEnabledServices = () => {

    const state = globalObj._state;

    const {
        _acceptType,
        _customServicesSelection,
        _readOnlyCategories,
        _acceptedCategories,
        _enabledServices,
        _allDefinedServices,
        _allCategoryNames
    } = state;

    /**
     * Save previously enabled services to calculate later on which of them was changed
     */
    state._lastEnabledServices = deepCopy(_enabledServices);

    for(const categoryName of _allCategoryNames) {

        const services = _allDefinedServices[categoryName];
        const serviceNames = getKeys(services);
        const customServicesSelection = _customServicesSelection[categoryName]?.length > 0;
        const readOnlyCategory = elContains(_readOnlyCategories, categoryName);

        /**
         * Stop here if there are no services
         */
        if(serviceNames.length === 0)
            continue;

        // Empty (previously) enabled services
        _enabledServices[categoryName] = [];

        // If category is marked as readOnly enable all its services
        if(readOnlyCategory){
            _enabledServices[categoryName].push(...serviceNames);
        }else{
            if(_acceptType === 'all'){
                if(customServicesSelection){
                    const selectedServices = _customServicesSelection[categoryName];
                    _enabledServices[categoryName].push(...selectedServices);
                }else{
                    _enabledServices[categoryName].push(...serviceNames);
                }
            }else if(_acceptType === 'necessary'){
                _enabledServices[categoryName] = [];
            }else {
                if(customServicesSelection){
                    const selectedServices = _customServicesSelection[categoryName];
                    _enabledServices[categoryName].push(...selectedServices);
                }else if(elContains(_acceptedCategories, categoryName)){
                    _enabledServices[categoryName].push(...serviceNames);
                }
            }

            // Reset selection
            state._customServicesSelection = {};
        }

        /**
         * Make sure there are no duplicates inside array
         */
        _enabledServices[categoryName] = unique(_enabledServices[categoryName]);
    }
};

/**
 * @param {string|string[]} service
 * @param {string} category
 */
export const updateServicesState = (service, category) => {

    const state = globalObj._state;

    const {_allDefinedServices, _customServicesSelection } = state;

    const servicesInputs = globalObj._dom._serviceCheckboxInputs[category] || {};
    const allServiceNames = getKeys(_allDefinedServices[category]);

    // Clear previously enabled services
    _customServicesSelection[category] = [];

    if(isString(service)){
        if(service === 'all'){

            for(let serviceName in servicesInputs){
                servicesInputs[serviceName].checked = true;
                dispatchChangeEvent(servicesInputs[serviceName]);
            }

        }else{

            for(let serviceName in servicesInputs){
                servicesInputs[serviceName].checked = service === serviceName;
                dispatchChangeEvent(servicesInputs[serviceName]);
            }

            if(elContains(allServiceNames, service))
                _customServicesSelection[category].push(service);

        }
    }else if(isArray(service)){

        for(let serviceName in servicesInputs){
            servicesInputs[serviceName].checked = elContains(service, serviceName);
            dispatchChangeEvent(servicesInputs[serviceName]);
        }

        for(let serviceName in allServiceNames){
            if(elContains(service, serviceName))
                _customServicesSelection[category].push(serviceName);
        }
    }
};

/**
 * @typedef {keyof HTMLElementTagNameMap} Type
 */

/**
 * @param {keyof HTMLElementTagNameMap} type
 */
export const createNode = (type) => {
    const el = document.createElement(type);

    if(type === BUTTON_TAG){
        el.type = type;
    }

    return el;
};

/**
 * Helper function to set attribute
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {string} value
 */
export const setAttribute = (el, attribute, value) => {
    el.setAttribute(attribute, value);
};

/**
 * Helper function to remove attribute
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
 * Helper function to get attribute
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {boolean} [prependData]
 * @returns {string} attribute value
 */
export const getAttribute = (el, attribute, prependData) => {
    return el.getAttribute(prependData
        ? 'data-' + attribute
        : attribute
    );
};

/**
 * Helper function to append child to parent
 * @param {Node} parent
 * @param {Node} child
 */
export const appendChild = (parent, child) => parent.appendChild(child);

/**
 * Generate RFC4122-compliant UUIDs.
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid?page=1&tab=votes#tab-top
 * @returns {string} unique uuid string
 */
export const uuidv4 = () => {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) => {
        return (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
    });
};

/**
 * Function to run when event is fired
 * @callback eventFired
 * @param {Event} event
 */

/**
 * Add event listener to dom object (cross browser function)
 * @param {Element} elem
 * @param {keyof WindowEventMap} event
 * @param {EventListenerOrEventListenerObject} fn
 * @param {boolean} [saveListener]
 */
export const addEvent = (elem, event, fn, saveListener) => {
    elem.addEventListener(event, fn);

    /**
     * Keep track of specific event listeners
     * that must be removed on `.reset()`
     */
    if(saveListener){
        globalObj._state._dataEventListeners.push({
            _element: elem,
            _event: event,
            _listener: fn
        });
    }
};

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
 * Check if html element has class
 * @param {HTMLElement} el
 * @param {string} className
 */
export const hasClass = (el, className) => el.classList.contains(className);

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
    try{

        const response = await fetch(url, {
            method: 'GET'
        });

        return response.ok
            ? await response.json()
            : false;

    }catch(e){
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
 * @param {{accepted: string[], rejected: string[]}} currentCategoriesState
 * @returns {'all'|'custom'|'necessary'} accept type
 */
export const resolveAcceptType = () => {

    let type = 'custom';

    const { _acceptedCategories, _allCategoryNames, _readOnlyCategories } = globalObj._state;
    const nAcceptedCategories = _acceptedCategories.length;

    if(nAcceptedCategories === _allCategoryNames.length)
        type = 'all';
    else if(nAcceptedCategories === _readOnlyCategories.length)
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

    for(const el of showPreferencesModalElements){
        setAttribute(el, 'aria-haspopup', 'dialog');

        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            showPreferences();
        });

        if(createPreferencesModalOnHover){
            addEvent(el, 'mouseenter', (event) => {
                preventDefault(event);

                if(!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            }, true);
        }
    }

    for(let el of showConsentModalElements){
        setAttribute(el, 'aria-haspopup', 'dialog');
        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            show(true);
        }, true);
    }

    for(let el of acceptAllElements){
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, 'all');
        }, true);
    }

    for(let el of acceptCustomElements){
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event);
        }, true);
    }

    for(let el of acceptNecessaryElements){
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, []);
        }, true);
    }
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

    if(enable){
        addClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
    }else {
        disableInteractionTimeout = setTimeout(() => {
            removeClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
        }, 500);
    }
};

/**
 * Trap focus inside modal and focus the first
 * focusable element of current active modal
 */
export const handleFocusTrap = () => {

    const dom = globalObj._dom;
    const state = globalObj._state;

    addEvent(dom._htmlDom, 'keydown', (e) => {

        if(e.key !== 'Tab')
            return;

        const focusableElements = state._currentModalFocusableElements;

        // If there is any modal to focus
        if(focusableElements.length > 0){

            const currentActiveElement = getActiveElement();

            // If reached natural end of the tab sequence => restart
            if(e.shiftKey){
                if (currentActiveElement === focusableElements[0]) {
                    focusableElements[1].focus();
                    preventDefault(e);
                }
            }else{
                if (currentActiveElement === focusableElements[1]) {
                    focusableElements[0].focus();
                    preventDefault(e);
                }
            }

            // If have not yet used tab (or shift+tab) and modal is open ...
            // Focus the first focusable element
            if(!state._tabbedInsideModal && !globalObj._state._clickedInsideModal){
                state._tabbedInsideModal = true;
                !state._tabbedOutside && preventDefault(e);

                if(e.shiftKey){
                    focusableElements[1].focus();
                }else{
                    focusableElements[0].focus();
                }
            }
        }

        !state._tabbedInsideModal && (state._tabbedOutside = true);
    }, true);
};

/**
 * Close preferences modal if click is outside
 * @param {import('../core/global').Api} api
 */
export const closeModalOnOutsideClick = ({hidePreferences}) => {

    const dom = globalObj._dom;

    addEvent(dom._ccMain, CLICK_EVENT, (e) => {
        const state = globalObj._state;

        /**
         * If click is on the foreground overlay (and not inside preferencesModal),
         * hide preferences modal
         */
        if(state._preferencesModalVisibleDelayed){
            if(!dom._pm.contains(e.target)){
                hidePreferences();
                state._clickedInsideModal = false;
            }else{
                state._clickedInsideModal = true;
            }
        }else if(state._consentModalVisible){
            if(dom._cm.contains(e.target)){
                state._clickedInsideModal = true;
            }
        }

    });
};

/**
 * Save reference to first and last focusable elements inside each modal
 * to prevent losing focus while navigating with TAB
 */
export const getModalFocusableData = () => {

    const state = globalObj._state;
    const dom = globalObj._dom;
    /**
     * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
     * the first or last element of the modal, won't receive focus during "open/close" modal
     */
    const focusableTypesSelector = ['[href]', BUTTON_TAG, 'input', 'details', '[tabindex="0"]']
        .join(':not([tabindex="-1"]), ');

    /**
     * Saves all focusable elements inside modal, into the array
     * @param {HTMLElement} modal
     * @param {Element[]} _array
     */
    const saveAllFocusableElements = (modal, array) => {

        const focusableElements = querySelectorAll(modal, focusableTypesSelector);

        /**
         * Save first and last elements (trap focus inside modal)
         */
        array[0] = focusableElements[0];
        array[1] = focusableElements[focusableElements.length - 1];
    };

    if(state._consentModalExists)
        saveAllFocusableElements(dom._cm, state._cmFocusableElements);

    if(state._preferencesModalExists)
        saveAllFocusableElements(dom._pm, state._pmFocusableElements);

    state._tabbedOutside = false;
    state._tabbedInsideModal = false;
};