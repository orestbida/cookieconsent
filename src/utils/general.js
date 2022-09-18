import { globalObj, _isFunction } from '../core/global';
import { SCRIPT_TAG_SELECTOR, BUTTON_TAG } from './constants';
/**
 * Helper function which prints info (console.log())
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
 * @returns {number}
 */
export const _indexOf = (el, value) => {
    return el.indexOf(value);
};

/**
 * Returns true if el is an object
 * @param {any} el
 * @returns {boolean}
 */
export const _isObject = (el) => {
    return !!el && typeof el === 'object' && !Array.isArray(el);
};

/**
 * Retrieves all script elements with 'data-category' attribute
 * and save the following attributes: category-name and service
 */
export const _retrieveScriptElements = () => {

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

        if(_elContains(state._allCategoryNames, scriptCategoryName)){

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
export const _retrieveRejectedServices = () => {
    var rejectedServices = {};

    globalObj._state._allCategoryNames.forEach(categoryName => {
        rejectedServices[categoryName] = _arrayDiff(
            globalObj._state._enabledServices[categoryName] || [],
            _getKeys(globalObj._state._allDefinedServices[categoryName]) || []
        );
    });

    return rejectedServices;
};

/**
 * Returns true if el. (array or string) contains the specified value
 * @param {Array|String} el
 * @param {*} value
 * @returns {boolean}
 */
export const _elContains = (el, value) => {
    return el.indexOf(value) !== -1;
};

/**
 * Helper function which creates an HTMLElement object based on 'type' and returns it.
 * @param {string} type
 * @returns {HTMLElement}
 */
export const _createNode = (type) => {
    const el = document.createElement(type);
    if(type === BUTTON_TAG){
        _setAttribute(el, 'type', type);
    }
    return el;
};

/**
 * Helper function to set attribute
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {string|number|boolean} value
 */
export const _setAttribute = (el, attribute, value) => {
    el.setAttribute(attribute, value);
};

/**
 * Helper function to append child to parent
 * @param {Node} parent
 * @param {Node} child
 */
export const _appendChild = (parent, child) => {
    parent.appendChild(child);
};

/**
 * Generate RFC4122-compliant UUIDs.
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid?page=1&tab=votes#tab-top
 * @returns {string}
 */
export const _uuidv4 = () => {
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
export const _addEvent = (elem, event, fn, saveListener) => {
    elem.addEventListener(event, fn);

    if(saveListener){
        globalObj._state._dataEventListeners.push({
            _element: elem,
            _event: event,
            _listener: fn
        });
    }
};

/**
 * Get all prop. keys defined inside object
 * @param {Object} obj
 */
export const _getKeys = obj => {
    if(typeof obj === 'object'){
        return Object.keys(obj);
    }
};

/**
 * Append class to the specified dom element
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const _addClass = (elem, className) => {
    elem.classList.add(className);
};

export const _addClassCm = (elem, className) => {
    _addClass(elem, 'cm__' + className);
};

export const _addClassPm = (elem, className) => {
    _addClass(elem, 'pm__' + className);
};

/**
 * Remove specified class from dom element
 * @param {HTMLElement} elem
 * @param {string} className
 */
export const _removeClass = (el, className) => {
    el.classList.remove(className);
};

/**
 * Check if html element has class
 * @param {HTMLElement} el
 * @param {string} className
 */
export const _hasClass = (el, className) => {
    return el.classList.contains(className);
};

/**
 * Calculate the existing cookie's remaining time until expiration (in milliseconds)
 * @returns {number}
 */
export const _getRemainingExpirationTimeMS = () => {
    const lastTimestamp = globalObj._state._lastConsentTimestamp;

    const elapsedTimeMilliseconds = lastTimestamp
        ? new Date() - lastTimestamp
        : 0;

    return _getExpiresAfterDaysValue()*86400000 - elapsedTimeMilliseconds;
};

/**
 * Used to fetch external language files (.json)
 * @param {string} url
 * @returns {Promise<import('../core/global').Translation | boolean>}
 */
export const _fetchJson = async (url) => {
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
export const _getExpiresAfterDaysValue = () => {
    const expiresAfterDays = globalObj._config.cookie.expiresAfterDays;

    return _isFunction(expiresAfterDays)
        ? expiresAfterDays(globalObj._state._acceptType)
        : expiresAfterDays;
};

/**
 * Symmetric difference between 2 arrays (detect changed preferences)
 * @param {any[]} arr1
 * @param {any[]} arr2
 */
export const _arrayDiff = (arr1, arr2) => {
    return arr1
        .filter(x => !_elContains(arr2, x))
        .concat(arr2.filter(x => !_elContains(arr1, x)));
};

/**
 * Calculate "accept type" given current categories state
 * @param {{accepted: string[], rejected: string[]}} currentCategoriesState
 * @returns {string}
 */
export const _getAcceptType = (currentCategoriesState) => {

    var type = 'custom';

    // calculate accept type based on accepted/rejected categories
    if(currentCategoriesState.accepted.length === globalObj._state._allCategoryNames.length)
        type = 'all';
    else if(currentCategoriesState.accepted.length === globalObj._state._readOnlyCategories.length)
        type = 'necessary';

    return type;
};

/**
 * Update global "acceptType" variable
 * Note: getUserPreferences() depends on "acceptType"
 */
export const _updateAcceptType = () => {
    globalObj._state._acceptType = _getAcceptType(_getCurrentCategoriesState());
};

/**
 * Add an onClick listeners to all html elements with data-cc attribute
 * @param {HTMLElement} [elem]
 * @param {import("../core/global").Api} api
 * @param {Function} [createPreferencesModal]
 */
export const _addDataButtonListeners = (elem, api, createPreferencesModal) => {

    const _a = 'accept-';

    const showPreferencesModalElements = _getElements('show-preferencesModal'),
        showConsentModalElements = _getElements('show-consentModal'),
        acceptAllElements = _getElements(_a + 'all'),
        acceptNecessaryElements = _getElements(_a + 'necessary'),
        acceptCustomElements = _getElements(_a + 'custom'),
        createPreferencesModalOnHover = globalObj._config.lazyHtmlGeneration === true;

    for(var i=0; i<showPreferencesModalElements.length; i++){
        _setAttribute(showPreferencesModalElements[i], 'aria-haspopup', 'dialog');

        _addEvent(showPreferencesModalElements[i], 'click', (event) => {
            event.preventDefault();
            api.showPreferences();
        }, true);

        if(createPreferencesModalOnHover){
            _addEvent(showPreferencesModalElements[i], 'mouseover', (event ) => {
                event.preventDefault();

                if(!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api);
            }, true);
        }
    }

    for(i=0; i<showConsentModalElements.length; i++){
        _setAttribute(showConsentModalElements[i], 'aria-haspopup', 'dialog');
        _addEvent(showConsentModalElements[i], 'click', (event) => {
            event.preventDefault();
            api.show(true);
        }, true);
    }

    for(i=0; i<acceptAllElements.length; i++){
        _addEvent(acceptAllElements[i], 'click', (event) => {
            _acceptAction(event, 'all');
        }, true);
    }

    for(i=0; i<acceptCustomElements.length; i++){
        _addEvent(acceptCustomElements[i], 'click', (event) => {
            _acceptAction(event);
        }, true);
    }

    for(i=0; i<acceptNecessaryElements.length; i++){
        _addEvent(acceptNecessaryElements[i], 'click', (event) => {
            _acceptAction(event, []);
        }, true);
    }

    /**
     * Return all elements with given data-cc role
     * @param {string} dataRole
     * @returns {NodeListOf<Element>}
     */
    function _getElements(dataRole){
        return (elem || document).querySelectorAll('[data-cc="' + dataRole + '"]');
    }

    /**
     * Helper function: accept and then hide modals
     * @param {PointerEvent} e source event
     * @param {string} [acceptType]
     */
    function _acceptAction(e, acceptType){
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
export const _getCurrentCategoriesState = () => {

    // calculate rejected categories (_allCategoryNames - _acceptedCategories)
    const rejectedCategories = globalObj._state._allCategoryNames.filter((category) => {
        return !_elContains(globalObj._state._acceptedCategories, category);
    });

    return {
        accepted: globalObj._state._acceptedCategories,
        rejected: rejectedCategories
    };
};

/**
 * Trap focus inside modal and focus the first
 * focusable element of current active modal
 * @param {import("../core/global").Api} api
 */
export const _handleFocusTrap = (api) => {

    const dom = globalObj._dom;

    var tabbedOutsideDiv = false;
    var tabbedInsideModal = false;

    _addEvent(dom._htmlDom, 'keydown', (e) => {

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

    _addEvent(dom._ccMain, 'click', (e) => {
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
            if(dom._consentModal.contains(e.target)){
                state._clickedInsideModal = true;
            }
        }

    });

};

/**
 * Save reference to first and last focusable elements inside each modal
 * to prevent losing focus while navigating with TAB
 */
export const _getModalFocusableData = () => {

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
    const _saveAllFocusableElements = (modal, _array) => {

        const focusableElements = modal && modal.querySelectorAll(focusableTypesSelector);

        /**
         * Save first and last elements (used to lock/trap focus inside modal)
         */
        _array[0] = focusableElements[0];
        _array[1] = focusableElements[focusableElements.length - 1];
    };

    if(state._consentModalExists)
        _saveAllFocusableElements(globalObj._dom._consentModal, state._cmFocusableElements);

    if(state._preferencesModalExists)
        _saveAllFocusableElements(globalObj._dom._pm, state._pmFocusableElements);
};