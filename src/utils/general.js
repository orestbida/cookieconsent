import { globalObj, isFunction } from '../core/global';
import { SCRIPT_TAG_SELECTOR, BUTTON_TAG, CLICK_EVENT } from './constants';

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
 * @param {any} value
 */
export const elContains = (el, value) => indexOf(el, value) !== -1;


/**
 * Check if el is an array
 * @param {any} el
 */
export const isArray = (el) => Array.isArray(el);

/**
 * Returns true if el is an object
 * @param {any} el
 */
export const isObject = (el) => {
    return !!el && typeof el === 'object' && !isArray(el);
};

/**
 * Get all keys defined inside object
 * @param {Object} obj
 */
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
 * Retrieves all script elements with 'data-category' attribute
 * and save the following attributes: category-name and service
 */
export const retrieveScriptElements = () => {

    if(!globalObj._config.manageScriptTags)
        return;

    const state = globalObj._state;

    state._allScriptTags = querySelectorAll(globalObj._dom._document, 'script[' + SCRIPT_TAG_SELECTOR +']');

    state._allScriptTagsInfo = [];
    state._allScriptTags.forEach(scriptTag => {

        let scriptCategoryName = scriptTag.getAttribute(SCRIPT_TAG_SELECTOR);
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
                        enabled: false
                    };
                }
            }
        }
    });
};

/**
 * Calculate rejected services (all services - enabled services)
 * @returns {Object.<string, string[]>}
 */
export const retrieveRejectedServices = () => {
    let rejectedServices = {};

    globalObj._state._allCategoryNames.forEach(categoryName => {
        rejectedServices[categoryName] = arrayDiff(
            globalObj._state._enabledServices[categoryName] || [],
            getKeys(globalObj._state._allDefinedServices[categoryName]) || []
        );
    });

    return rejectedServices;
};

/**
 * Helper function which creates an HTMLElement object based on 'type' and returns it.
 * @param {string} type
 */
export const createNode = (type) => {
    const el = document.createElement(type);
    if(type === BUTTON_TAG){
        setAttribute(el, 'type', type);
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
 * @param {eventFired} fn
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
 * Append class to the specified dom element
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const addClass = (elem, className) => {
    elem.classList.add(className);
};

export const addClassCm = (elem, className) => {
    addClass(elem, 'cm__' + className);
};

export const addClassPm = (elem, className) => {
    addClass(elem, 'pm__' + className);
};

/**
 * Remove specified class from dom element
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const removeClass = (el, className) => {
    el.classList.remove(className);
};

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
    return arr1
        .filter(x => !elContains(arr2, x))
        .concat(arr2.filter(x => !elContains(arr1, x)));
};

/**
 * Calculate "accept type"
 * @param {{accepted: string[], rejected: string[]}} currentCategoriesState
 * @returns {'all'|'custom'|'necessary'} accept type
 */
export const getAcceptType = () => {

    let
        type = 'custom',
        acceptedCategories = getCurrentCategoriesState().accepted,
        totAcceptedCategories = acceptedCategories.length;

    // Determine accept type based on number of accepted categories
    if(totAcceptedCategories === globalObj._state._allCategoryNames.length)
        type = 'all';
    else if(totAcceptedCategories === globalObj._state._readOnlyCategories.length)
        type = 'necessary';

    return type;
};

/**
 * Update global "acceptType" variable
 * Note: getUserPreferences() depends on "acceptType"
 */
export const updateAcceptType = () => {
    globalObj._state._acceptType = getAcceptType();
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
 * @param {import(''../core/global').Api} api
 * @param {createModal} [createPreferencesModal]
 */
export const addDataButtonListeners = (elem, api, createPreferencesModal, createMainContainer) => {

    const _a = 'accept-';

    const showPreferencesModalElements = getElements('show-preferencesModal'),
        showConsentModalElements = getElements('show-consentModal'),
        acceptAllElements = getElements(_a + 'all'),
        acceptNecessaryElements = getElements(_a + 'necessary'),
        acceptCustomElements = getElements(_a + 'custom'),
        createPreferencesModalOnHover = globalObj._config.lazyHtmlGeneration;

    showPreferencesModalElements.forEach(el => {
        setAttribute(el, 'aria-haspopup', 'dialog');

        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            api.showPreferences();
        });

        if(createPreferencesModalOnHover){
            addEvent(el, 'mouseenter', (event) => {
                preventDefault(event);

                if(!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            }, true);
        }
    });

    showConsentModalElements.forEach(el => {
        setAttribute(el, 'aria-haspopup', 'dialog');
        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            api.show(true);
        }, true);
    });

    acceptAllElements.forEach(el => {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, 'all');
        }, true);
    });

    acceptCustomElements.forEach(el => {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event);
        }, true);
    });

    acceptNecessaryElements.forEach(el => {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, []);
        }, true);
    });

    /**
     * Return all elements with given data-cc role
     * @param {string} dataRole
     */
    function getElements(dataRole){
        return querySelectorAll(elem || document, '[data-cc="' + dataRole + '"]');
    }

    /**
     * Helper function: accept and then hide modals
     * @param {Event} event source event
     * @param {string|string[]} [acceptType]
     */
    function acceptAction(event, acceptType){
        preventDefault(event);
        api.acceptCategory(acceptType);
        api.hidePreferences();
        api.hide();
    }
};

/**
 * Obtain accepted and rejected categories
 * @returns {{accepted: string[], rejected: string[]}}
 */
export const getCurrentCategoriesState = () => {

    let acceptedCategories = globalObj._state._acceptedCategories;

    // calculate rejected categories: allCategories - acceptedCategories
    return {
        accepted: acceptedCategories,
        rejected: globalObj._state._allCategoryNames.filter((category) =>
            !elContains(acceptedCategories, category)
        )
    };
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
export const closeModalOnOutsideClick = (api) => {

    const dom = globalObj._dom;

    addEvent(dom._ccMain, CLICK_EVENT, (e) => {
        const state = globalObj._state;

        /**
         * If click is on the foreground overlay (and not inside preferencesModal),
         * hide preferences modal
         */
        if(state._preferencesModalVisibleDelayed){
            if(!dom._pm.contains(e.target)){
                api.hidePreferences(0);
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