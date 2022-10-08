import { globalObj, isFunction } from '../core/global';
import { SCRIPT_TAG_SELECTOR, BUTTON_TAG } from './constants';

/**
 * Helper console.log function
 * @param {Object} printMsg
 * @param {Object} [optionalParam]
 */
export const _log = (printMsg, optionalParam) => {
    console.log(printMsg, optionalParam !== undefined ? optionalParam : ' ');
};

/**
 * Helper indexOf
 * @param {Array|String} el
 * @param {Object} value
 */
export const indexOf = (el, value) => {
    return el.indexOf(value);
};

/**
 * Returns true if el is an object
 * @param {any} el
 */
export const isObject = (el) => {
    return !!el && typeof el === 'object' && !Array.isArray(el);
};

/**
 * Retrieves all script elements with 'data-category' attribute
 * and save the following attributes: category-name and service
 */
export const retrieveScriptElements = () => {

    if(!globalObj._config.manageScriptTags)
        return;

    const state = globalObj._state;

    state._allScriptTags = globalObj._dom._document.querySelectorAll('script[' + SCRIPT_TAG_SELECTOR +']');

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
    var rejectedServices = {};

    globalObj._state._allCategoryNames.forEach(categoryName => {
        rejectedServices[categoryName] = arrayDiff(
            globalObj._state._enabledServices[categoryName] || [],
            getKeys(globalObj._state._allDefinedServices[categoryName]) || []
        );
    });

    return rejectedServices;
};

/**
 * Returns true if el. (array or string) contains the specified value
 * @param {any[]|string} el
 * @param {any} value
 */
export const elContains = (el, value) => {
    return el.indexOf(value) !== -1;
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
 * Helper function to append child to parent
 * @param {Node} parent
 * @param {Node} child
 */
export const appendChild = (parent, child) => {
    parent.appendChild(child);
};

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
 */

/**
 * Add event listener to dom object (cross browser function)
 * @param {Element} elem
 * @param {string} event
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
 * Get all keys defined inside object
 * @param {Object} obj
 */
export const getKeys = obj => {
    return Object.keys(obj);
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
export const hasClass = (el, className) => {
    return el.classList.contains(className);
};

/**
 * Calculate the existing cookie's remaining time until expiration (in milliseconds)
 * @returns {number}
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
        const response = await fetch(url, {method: 'GET'});
        return response.ok ? await response.json() : false;
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
 * @returns {string} accept type
 */
export const getAcceptType = () => {

    let type = 'custom';
    let acceptedCategories = getCurrentCategoriesState().accepted;

    // Determine accept type based on number of accepted categories
    if(acceptedCategories.length === globalObj._state._allCategoryNames.length)
        type = 'all';
    else if(acceptedCategories.length === globalObj._state._readOnlyCategories.length)
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
        createPreferencesModalOnHover = globalObj._config.lazyHtmlGeneration === true;

    for(var i=0; i<showPreferencesModalElements.length; i++){
        setAttribute(showPreferencesModalElements[i], 'aria-haspopup', 'dialog');

        addEvent(showPreferencesModalElements[i], 'click', (event) => {
            event.preventDefault();
            api.showPreferences();
        }, true);

        if(createPreferencesModalOnHover){
            addEvent(showPreferencesModalElements[i], 'mouseover', (event ) => {
                event.preventDefault();

                if(!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            }, true);
        }
    }

    for(i=0; i<showConsentModalElements.length; i++){
        setAttribute(showConsentModalElements[i], 'aria-haspopup', 'dialog');
        addEvent(showConsentModalElements[i], 'click', (event) => {
            event.preventDefault();
            api.show(true);
        }, true);
    }

    for(i=0; i<acceptAllElements.length; i++){
        addEvent(acceptAllElements[i], 'click', (event) => {
            acceptAction(event, 'all');
        }, true);
    }

    for(i=0; i<acceptCustomElements.length; i++){
        addEvent(acceptCustomElements[i], 'click', (event) => {
            acceptAction(event);
        }, true);
    }

    for(i=0; i<acceptNecessaryElements.length; i++){
        addEvent(acceptNecessaryElements[i], 'click', (event) => {
            acceptAction(event, []);
        }, true);
    }

    /**
     * Return all elements with given data-cc role
     * @param {string} dataRole
     * @returns {NodeListOf<Element>}
     */
    function getElements(dataRole){
        return (elem || document).querySelectorAll('[data-cc="' + dataRole + '"]');
    }

    /**
     * Helper function: accept and then hide modals
     * @param {PointerEvent} e source event
     * @param {string} [acceptType]
     */
    function acceptAction(e, acceptType){
        e.preventDefault();
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

    // calculate rejected categories (_allCategoryNames - _acceptedCategories)
    const rejectedCategories = globalObj._state._allCategoryNames.filter((category) => {
        return !elContains(globalObj._state._acceptedCategories, category);
    });

    return {
        accepted: globalObj._state._acceptedCategories,
        rejected: rejectedCategories
    };
};

/**
 * Trap focus inside modal and focus the first
 * focusable element of current active modal
 */
export const handleFocusTrap = () => {

    const dom = globalObj._dom;

    var tabbedOutsideDiv = false;
    var tabbedInsideModal = false;

    addEvent(dom._htmlDom, 'keydown', (e) => {

        if(e.key !== 'Tab')
            return;

        const focusableElements = globalObj._state._currentModalFocusableElements;

        // If there is any modal to focus
        if(focusableElements.length > 0){

            const currentActiveElement = dom._document.activeElement;

            // If reached natural end of the tab sequence => restart
            if(e.shiftKey){
                if (currentActiveElement === focusableElements[0]) {
                    focusableElements[1].focus();
                    e.preventDefault();
                }
            }else{
                if (currentActiveElement === focusableElements[1]) {
                    focusableElements[0].focus();
                    e.preventDefault();
                }
            }

            // If have not yet used tab (or shift+tab) and modal is open ...
            // Focus the first focusable element
            if(!tabbedInsideModal && !globalObj._state._clickedInsideModal){
                tabbedInsideModal = true;
                !tabbedOutsideDiv && e.preventDefault();

                if(e.shiftKey){
                    focusableElements[1].focus();
                }else{
                    focusableElements[0].focus();
                }
            }
        }

        !tabbedInsideModal && (tabbedOutsideDiv = true);
    }, true);
};

/**
 * Close preferences modal if click is outside
 * @param {import('../core/global').Api} api
 */
export const closeModalOnOutsideClick = (api) => {

    const dom = globalObj._dom;

    addEvent(dom._ccMain, 'click', (e) => {
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
    const saveAllFocusableElements = (modal, _array) => {

        const focusableElements = modal && modal.querySelectorAll(focusableTypesSelector);

        /**
         * Save first and last elements (used to lock/trap focus inside modal)
         */
        _array[0] = focusableElements[0];
        _array[1] = focusableElements[focusableElements.length - 1];
    };

    if(state._consentModalExists)
        saveAllFocusableElements(globalObj._dom._cm, state._cmFocusableElements);

    if(state._preferencesModalExists)
        saveAllFocusableElements(globalObj._dom._pm, state._pmFocusableElements);
};