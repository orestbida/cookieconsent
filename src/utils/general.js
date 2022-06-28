import { globalObj } from '../core/global';
import { SCRIPT_TAG_SELECTOR, BUTTON_TAG } from './constants';
/**
 * Helper function which prints info (console.log())
 * @param {Object} printMsg
 * @param {Object} [optionalParam]
 */
export const _log = (printMsg, optionalParam, error) => {
    !error ? console.log(printMsg, optionalParam !== undefined ? optionalParam : ' ') : console.error(printMsg, optionalParam || '');
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
 * + saves their info: category-name and service-name
 */
export const _retrieveScriptElements = () => {

    if(!globalObj._config.manageScriptTags) return;

    globalObj._state._allScriptTags = globalObj._dom._document.querySelectorAll('script[' + SCRIPT_TAG_SELECTOR +']');

    globalObj._state._allScriptTagsInfo = [];
    globalObj._state._allScriptTags.forEach(scriptTag => {

        let scriptCategoryName = scriptTag.getAttribute(SCRIPT_TAG_SELECTOR) || '';
        let scriptServiceName = scriptTag.dataset.service || '';
        let runOnDisable = false;

        /**
         * Remove the '!' char if it is present
         */
        if(scriptCategoryName.charAt(0) === '!'){
            scriptCategoryName = scriptCategoryName.slice(1);
            runOnDisable = true;
        }

        if(scriptServiceName.charAt(0) === '!'){
            scriptServiceName = scriptServiceName.slice(1);
            runOnDisable = true;
        }

        if(_elContains(globalObj._state._allCategoryNames, scriptCategoryName)){

            globalObj._state._allScriptTagsInfo.push({
                _executed: false,
                _runOnDisable: runOnDisable,
                _categoryName: scriptCategoryName,
                _serviceName: scriptServiceName
            });

            if(scriptServiceName){
                const categoryServices = globalObj._state._allDefinedServices[scriptCategoryName];
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
    var el = document.createElement(type);
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
        return (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
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
 * @param {boolean} [isPassive]
 */
export const _addEvent = (elem, event, fn, isPassive) => {
    elem.addEventListener(event, fn , isPassive === true ? { passive: true } : false);
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
    var elapsedTimeMilliseconds = globalObj._state._lastConsentTimestamp ? new Date() - globalObj._state._lastConsentTimestamp : 0;
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
    var expiresAfterDays = globalObj._config.cookie.expiresAfterDays;
    return typeof expiresAfterDays === 'function' ? expiresAfterDays(globalObj._state._acceptType) : expiresAfterDays;
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
 */
export const _addDataButtonListeners = (elem, api) => {

    var _a = 'accept-';

    var showPreferencesModalElements = _getElements('show-preferencesModal');
    var showConsentModalElements = _getElements('show-consentModal');
    var acceptAllElements = _getElements(_a + 'all');
    var acceptNecessaryElements = _getElements(_a + 'necessary');
    var acceptCustomElements = _getElements(_a + 'custom');

    for(var i=0; i<showPreferencesModalElements.length; i++){
        _setAttribute(showPreferencesModalElements[i], 'aria-haspopup', 'dialog');
        _addEvent(showPreferencesModalElements[i], 'click', (event) => {
            event.preventDefault();
            api.showPreferences();
        });
    }

    for(i=0; i<showConsentModalElements.length; i++){
        _setAttribute(showConsentModalElements[i], 'aria-haspopup', 'dialog');
        _addEvent(showConsentModalElements[i], 'click', (event) => {
            event.preventDefault();
            api.show(true);
        });
    }

    for(i=0; i<acceptAllElements.length; i++){
        _addEvent(acceptAllElements[i], 'click', (event) => {
            _acceptAction(event, 'all');
        });
    }

    for(i=0; i<acceptCustomElements.length; i++){
        _addEvent(acceptCustomElements[i], 'click', (event) => {
            _acceptAction(event);
        });
    }

    for(i=0; i<acceptNecessaryElements.length; i++){
        _addEvent(acceptNecessaryElements[i], 'click', (event) => {
            _acceptAction(event, []);
        });
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
    var rejectedCategories = globalObj._state._allCategoryNames.filter((category) => {
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
    var tabbedOutsideDiv = false;
    var tabbedInsideModal = false;

    _addEvent(globalObj._dom._htmlDom, 'keydown', (e) => {

        // If is tab key => ok
        if(e.key !== 'Tab') return;

        // If there is any modal to focus
        if(globalObj._state._currentModalFocusableElements){
            // If reached natural end of the tab sequence => restart
            if(e.shiftKey){
                if (globalObj._dom._document.activeElement === globalObj._state._currentModalFocusableElements[0]) {
                    globalObj._state._currentModalFocusableElements[1].focus();
                    e.preventDefault();
                }
            }else{
                if (globalObj._dom._document.activeElement === globalObj._state._currentModalFocusableElements[1]) {
                    globalObj._state._currentModalFocusableElements[0].focus();
                    e.preventDefault();
                }
            }

            // If have not yet used tab (or shift+tab) and modal is open ...
            // Focus the first focusable element
            if(!tabbedInsideModal && !globalObj._state._clickedInsideModal){
                tabbedInsideModal = true;
                !tabbedOutsideDiv && e.preventDefault();

                if(e.shiftKey){
                    if(globalObj._state._currentModalFocusableElements[3]){
                        if(!globalObj._state._currentModalFocusableElements[2]){
                            globalObj._state._currentModalFocusableElements[0].focus();
                        }else{
                            globalObj._state._currentModalFocusableElements[2].focus();
                        }
                    }else{
                        globalObj._state._currentModalFocusableElements[1].focus();
                    }
                }else{
                    if(globalObj._state._currentModalFocusableElements[3]){
                        globalObj._state._currentModalFocusableElements[3].focus();
                    }else{
                        globalObj._state._currentModalFocusableElements[0].focus();
                    }
                }
            }
        }

        !tabbedInsideModal && (tabbedOutsideDiv = true);
    });

    _addEvent(globalObj._dom._ccMain, 'click', (e) => {
        /**
         * If click is on the foreground overlay (and not inside preferencesModal),
         * hide preferences modal
         */
        if(globalObj._state._preferencesModalVisibleDelayed){
            if(!globalObj._dom._pm.contains(e.target)){
                api.hidePreferences(0);
                globalObj._state._clickedInsideModal = false;
            }else{
                globalObj._state._clickedInsideModal = true;
            }
        }else if(globalObj._state._consentModalVisible){
            if(globalObj._dom._consentModal.contains(e.target)){
                globalObj._state._clickedInsideModal = true;
            }
        }

    }, true);

};

/**
 * Save reference to first and last focusable elements inside each modal
 * to prevent losing focus while navigating with TAB
 */
export const _getModalFocusableData = () => {

    /**
     * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
     * the first or last element of the modal, won't receive focus during "open/close" modal
     */
    var allowed_focusable_types = ['[href]', BUTTON_TAG, 'input', 'details', '[tabindex="0"]'];

    /**
     * Saves all focusable elements inside modal, into the array
     * @param {HTMLElement} modal
     * @param {Element[]} _array
     */
    function _saveAllFocusableElements(modal, _array){
        var focusLater=false, focusFirst=false;

        try{
            var focusableElements = modal && modal.querySelectorAll(allowed_focusable_types.join(':not([tabindex="-1"]), '));
            var attr, len=focusableElements.length, i=0;

            while(i < len){

                attr = focusableElements[i].getAttribute('data-focus');

                if(!focusFirst && attr === '1'){
                    focusFirst = focusableElements[i];

                }else if(attr === '0'){
                    focusLater = focusableElements[i];
                    if(!focusFirst && focusableElements[i+1].getAttribute('data-focus') !== '0'){
                        focusFirst = focusableElements[i+1];
                    }
                }

                i++;
            }

        }catch(e){
            return [];
        }

        /**
         * Save first and last elements (used to lock/trap focus inside modal)
         */
        _array[0] = focusableElements[0];
        _array[1] = focusableElements[focusableElements.length - 1];
        _array[2] = focusLater;
        _array[3] = focusFirst;
    }

    /**
     * Get preferences modal's all focusable elements
     * Save first and last elements (used to lock/trap focus inside modal)
     */
    _saveAllFocusableElements(globalObj._dom._pm, globalObj._state._allPreferencesModalFocusableElements);

    /**
     * If consent modal exists, do the same
     */
    if(globalObj._state._consentModalExists){
        _saveAllFocusableElements(globalObj._dom._consentModal, globalObj._state._allConsentModalFocusableElements);
    }
};