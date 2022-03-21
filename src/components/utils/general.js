import { _state, _dom, cookieConfig } from "../global";
import { api } from "../api";

/**
 * Returns index of found element inside array, otherwise -1
 * @param {Array} arr
 * @param {Object} value
 * @returns {number}
 */
export const _inArray = function(arr, value){
    return arr.indexOf(value);
}

/**
 * Helper function which prints info (console.log())
 * @param {Object} printMsg
 * @param {Object} [optionalParam]
 */
export const _log = function(printMsg, optionalParam, error){
    !error ? console.log(printMsg, optionalParam !== undefined ? optionalParam : ' ') : console.error(printMsg, optionalParam || "");
}

/**
 * Helper function which creates an HTMLElement object based on 'type' and returns it.
 * @param {string} type
 * @returns {HTMLElement}
 */
export const _createNode = function(type){
    var el = document.createElement(type);
    if(type === 'button'){
        _setAttribute(el, 'type', type);
    }
    return el;
}

/**
 * Helper function to set attribute
 * @param {HTMLElement} el
 * @param {string} attribute
 * @param {string|number|boolean} value
 */
export const _setAttribute = function(el, attribute, value){
    el.setAttribute(attribute, value);
}

/**
 * Helper function to append child to parent
 * @param {Node} parent
 * @param {Node} child
 */
export const _appendChild = function(parent, child){
    parent.appendChild(child);
}

/**
 * Generate RFC4122-compliant UUIDs.
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid?page=1&tab=votes#tab-top
 * @returns {string}
 */
export const _uuidv4 = function(){
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c){
        return (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    });
}


/**
 * Function to run when event is fired
 * @callback eventFired
 */

/**
 * Add event listener to dom object (cross browser function)
 * @param {Element} elem
 * @param {string} event
 * @param {eventFired} fn
 * @param {boolean} [isPasive]
 */
export const _addEvent = function(elem, event, fn, isPasive) {
    elem.addEventListener(event, fn , isPasive === true ? { passive: true } : false);
}

/**
 * Get all prop. keys defined inside object
 * @param {Object} obj
 */
export const _getKeys = function(obj){
    if(typeof obj === "object"){
        return Object.keys(obj);
    }
}

/**
 * Append class to the specified dom element
 * @param {HTMLElement} elem
 * @param {string} classname
 */
export const _addClass = function (elem, classname){
    elem.classList.add(classname);
}

/**
 * Remove specified class from dom element
 * @param {HTMLElement} elem
 * @param {string} classname
 */
export const _removeClass = function (el, className) {
    el.classList.remove(className);
}

/**
 * Check if html element has class
 * @param {HTMLElement} el
 * @param {string} className
 */
export const _hasClass = function(el, className) {
    return el.classList.contains(className);
}

/**
 * Calculate the existing cookie's remaining time until expiration (in milliseconds)
 * @returns {number}
 */
export const _getRemainingExpirationTimeMS = function(){
    var elapsedTimeMilliseconds = _state.lastConsentTimestamp ? new Date() - _state.lastConsentTimestamp : 0;
    return _getExpiresAfterDaysValue()*86400000 - elapsedTimeMilliseconds;
}

/**
 * Helper function to create xhr objects
 * @param {{
 *  method: string,
 *  path: string,
 *  data: any
 * }} params
 * @param {Function} [callback]
 */
export const _xhr = function(params, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            var status=httpRequest.status, data;
            if (status === 200) {
                try{
                    data = JSON.parse(httpRequest.responseText);
                }catch(e){
                    _log("CookieConsent [XHR] JSON.parse error:", e);
                }
            }else{
                _log("CookieConsent [XHR] error:", httpRequest.statusText);
            }
            if (typeof callback === 'function') callback(status, data);
        }
    };
    httpRequest.open(params.method, params.path);
    httpRequest.send(params.data);
}


/**
 * Helper function to retrieve cookie duration
 * @returns {number}
 */
export const _getExpiresAfterDaysValue = function(){
    var expiresAfterDays = cookieConfig['expiresAfterDays'];
    return typeof expiresAfterDays === 'function' ? expiresAfterDays(_state.acceptType) : expiresAfterDays;
}

/**
 * Calculate "accept type" given current categories state
 * @param {{accepted: string[], rejected: string[]}} currentCategoriesState
 * @returns {string}
 */
 export const _getAcceptType = function(currentCategoriesState){

    var type = 'custom';

    // number of categories marked as necessary/readonly
    var necessaryCategoriesLength = _state.readOnlyCategories.filter(function(readonly){
        return readonly === true;
    }).length;

    // calculate accept type based on accepted/rejected categories
    if(currentCategoriesState.accepted.length === _state.allCategoryNames.length)
        type = 'all';
    else if(currentCategoriesState.accepted.length === necessaryCategoriesLength)
        type = 'necessary'

    return type;
}

/**
 * Update global "acceptType" variable
 * Note: getUserPreferences() depends on "acceptType"
 */
export const _updateAcceptType = function(){
    _state.acceptType = _getAcceptType(_getCurrentCategoriesState());
}

/**
 * Add an onClick listeners to all html elements with data-cc attribute
 */
export const _addDataButtonListeners = function(elem){

    var _a = 'accept-';

    var showPreferencesElements = _getElements('show-preferences');
    var acceptAllElements = _getElements(_a + 'all');
    var acceptNecessaryElements = _getElements(_a + 'necessary');
    var acceptCustomElements = _getElements(_a + 'custom');

    for(var i=0; i<showPreferencesElements.length; i++){
        _setAttribute(showPreferencesElements[i], 'aria-haspopup', 'dialog');
        _addEvent(showPreferencesElements[i], 'click', function(event){
            event.preventDefault();
            api.showPreferences(0);
        });
    }

    for(i=0; i<acceptAllElements.length; i++){
        _addEvent(acceptAllElements[i], 'click', function(event){
            _acceptAction(event, 'all');
        });
    }

    for(i=0; i<acceptCustomElements.length; i++){
        _addEvent(acceptCustomElements[i], 'click', function(event){
            _acceptAction(event);
        });
    }

    for(i=0; i<acceptNecessaryElements.length; i++){
        _addEvent(acceptNecessaryElements[i], 'click', function(event){
            _acceptAction(event, []);
        });
    }

    /**
     * Return all elements with given data-cc role
     * @param {string} dataRole
     * @returns {NodeListOf<Element>}
     */
    function _getElements(dataRole){
        return (elem || document).querySelectorAll('a[data-cc="' + dataRole + '"], button[data-cc="' + dataRole + '"]');
    }

    /**
     * Helper function: accept and then hide modals
     * @param {PointerEvent} e source event
     * @param {string} [_acceptType]
     */
    function _acceptAction(e, _acceptType){
        e.preventDefault();
        api.accept(_acceptType);
        api.hidePreferences();
        api.hide();
    }
}

/**
 * Obtain accepted and rejected categories
 * @returns {{accepted: string[], rejected: string[]}}
 */
export const _getCurrentCategoriesState = function(){

    // calculate rejected categories (allCategoryNames - acceptedCategories)
    var rejectedCategories = _state.allCategoryNames.filter(function(category){
        return (_inArray(_state.acceptedCategories, category) === -1);
    });

    return {
        accepted: _state.acceptedCategories,
        rejected: rejectedCategories
    }
}

/**
 * Trap focus inside modal and focus the first
 * focusable element of current active modal
 */
export const _handleFocusTrap = function(){
    var tabbedOutsideDiv = false;
    var tabbedInsideModal = false;

    _addEvent(document, 'keydown', function(e){
        e = e || window.event;

        // If is tab key => ok
        if(e.key !== 'Tab') return;

        // If there is any modal to focus
        if(_state.currentModalFocusableElements){
            // If reached natural end of the tab sequence => restart
            if(e.shiftKey){
                if (document.activeElement === _state.currentModalFocusableElements[0]) {
                    _state.currentModalFocusableElements[1].focus();
                    e.preventDefault();
                }
            }else{
                if (document.activeElement === _state.currentModalFocusableElements[1]) {
                    _state.currentModalFocusableElements[0].focus();
                    e.preventDefault();
                }
            }

            // If have not yet used tab (or shift+tab) and modal is open ...
            // Focus the first focusable element
            if(!tabbedInsideModal && !_state.clickedInsideModal){
                tabbedInsideModal = true;
                !tabbedOutsideDiv && e.preventDefault();

                if(e.shiftKey){
                    if(_state.currentModalFocusableElements[3]){
                        if(!_state.currentModalFocusableElements[2]){
                            _state.currentModalFocusableElements[0].focus();
                        }else{
                            _state.currentModalFocusableElements[2].focus();
                        }
                    }else{
                        _state.currentModalFocusableElements[1].focus();
                    }
                }else{
                    if(_state.currentModalFocusableElements[3]){
                        _state.currentModalFocusableElements[3].focus();
                    }else{
                        _state.currentModalFocusableElements[0].focus();
                    }
                }
            }
        }

        !tabbedInsideModal && (tabbedOutsideDiv = true);
    });

    if(document.contains){
        _addEvent(_dom.mainContainer, 'click', function(e){
            e = e || window.event;
            /**
             * If click is on the foreground overlay (and not inside preferencesModal),
             * hide preferences modal
             *
             * Notice: click on div is not supported in IE
             */
            if(_state.preferencesModalVisible){
                if(!_dom.preferencesInner.contains(e.target)){
                    api.hidePreferences(0);
                    _state.clickedInsideModal = false;
                }else{
                    _state.clickedInsideModal = true;
                }
            }else if(_state._dom.consentModalVisible){
                if(_dom.consentModal.contains(e.target)){
                    _state.clickedInsideModal = true;
                }
            }

        }, true);
    }
}

/**
 * Save reference to first and last focusable elements inside each modal
 * to prevent losing focus while navigating with TAB
 */
export const _getModalFocusableData = function(){

    /**
     * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
     * the first or last element of the modal, won't receive focus during "open/close" modal
     */
    var allowed_focusable_types = ['[href]', 'button', 'input', 'details', '[tabindex="0"]'];

    function _getAllFocusableElements(modal, _array){
        var focusLater=false, focusFirst=false;

        // ie might throw exception due to complex unsupported selector => a:not([tabindex="-1"])
        try{
            var focusableElements = modal.querySelectorAll(allowed_focusable_types.join(':not([tabindex="-1"]), '));
            var attr, len=focusableElements.length, i=0;

            while(i < len){

                attr = focusableElements[i].getAttribute('data-focus');

                if(!focusFirst && attr === "1"){
                    focusFirst = focusableElements[i];

                }else if(attr === "0"){
                    focusLater = focusableElements[i];
                    if(!focusFirst && focusableElements[i+1].getAttribute('data-focus') !== "0"){
                        focusFirst = focusableElements[i+1];
                    }
                }

                i++;
            }

        }catch(e){
            return modal.querySelectorAll(allowed_focusable_types.join(', '));
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
    _getAllFocusableElements(_dom.preferencesInner, _state.allPreferencesModalFocusableElements);

    /**
     * If consent modal exists, do the same
     */
    if(_state.consentModalExists){
        _getAllFocusableElements(_dom.consentModal, _state.allConsentModalFocusableElements);
    }
}