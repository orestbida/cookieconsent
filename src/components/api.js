import {
    _createNode,
    _setAttribute,
    _appendChild,
    _addClass,
    _removeClass,
    _log,
    _inArray,
    _handleFocusTrap,
    _getCurrentCategoriesState,
    _addDataButtonListeners,
    _getModalFocusableData
} from './utils/general';

import {
    _manageExistingScripts
} from "./utils/scripts"

import {
    _config,
    _state,
    _dom,
    _callbacks,
    cookieConfig,
} from "./global"

import {
    _createConsentModal,
    _createPreferencesModal,
    _createCookieConsentHTML
} from './modals';

import {
    _getValidLanguageCode,
    _loadTranslationData
} from './utils/language';

import {
    _getCookie,
    _setCookie,
    _eraseCookies,
    _saveCookiePreferences
} from './utils/cookies';

import {
    _setConfig
} from "./config-init";

export const api = {

    /**
     * Accept cookieconsent function API
     * @param {string[]|string} _categories - Categories to accept
     * @param {string[]} [_exclusions] - Excluded categories [optional]
     */
    accept : (_categories, _exclusions) => {
        var categories = _categories || undefined;
        var exclusions = _exclusions || [];
        var categoriesToAccept = [];

        /**
         * Get all accepted categories
         * @returns {string[]}
         */
        var _getCurrentPreferences = () => {
            var toggles = document.querySelectorAll('.c-tgl') || [];
            var states = [];

            for(var i=0; i<toggles.length; i++){
                if(toggles[i].checked){
                    states.push(toggles[i].value);
                }
            }
            return states;
        }

        if(!categories){
            categoriesToAccept = _getCurrentPreferences();
        }else{
            if(
                typeof categories === "object" &&
                typeof categories.length === "number"
            ){
                for(var i=0; i<categories.length; i++){
                    if(_inArray(_state.allCategoryNames, categories[i]) !== -1)
                        categoriesToAccept.push(categories[i]);
                }
            }else if(typeof categories === "string"){
                if(categories === 'all')
                    categoriesToAccept = _state.allCategoryNames.slice();
                else{
                    if(_inArray(_state.allCategoryNames, categories) !== -1)
                        categoriesToAccept.push(categories);
                }
            }
        }

        // Remove excluded categories
        if(exclusions.length >= 1){
            for(i=0; i<exclusions.length; i++){
                categoriesToAccept = categoriesToAccept.filter(function(item) {
                    return item !== exclusions[i]
                })
            }
        }

        // Add back all the categories set as "readonly/required"
        for(i=0; i<_state.allCategoryNames.length; i++){
            if(
                _state.readOnlyCategories[i] === true &&
                _inArray(categoriesToAccept, _state.allCategoryNames[i]) === -1
            ){
                categoriesToAccept.push(_state.allCategoryNames[i]);
            }
        }
        /**
         * Keep _state.acceptedCategories array updated
         */
        _state.acceptedCategories = categoriesToAccept;

        _saveCookiePreferences(categoriesToAccept);
    },

    /**
     * Returns true if cookie was found and has valid value (not empty string)
     * @param {string} cookieName
     * @returns {boolean}
     */
    validCookie : (cookieName) => {
        return _getCookie(cookieName, 'one', true) !== '';
    },

    /**
     * API function to easily erase cookies
     * @param {(string|string[])} cookies
     * @param {string} [path] - optional
     * @param {string} [domain] - optional
     */
    eraseCookies: (cookies, path, domain) => {
        var allCookies = [];
        var domains = domain
            ? [domain, "."+domain]
            : [cookieConfig.domain, "."+cookieConfig.domain];

        if(typeof cookies === "object" && cookies.length > 0){
            for(var i=0; i<cookies.length; i++){
                api.validCookie(cookies[i]) && allCookies.push(cookies[i]);
            }
        }else{
            api.validCookie(cookies) && allCookies.push(cookies);
        }

        _eraseCookies(allCookies, path, domains);
    },

    /**
     * Update/change modals language
     * @param {string} lang new language
     * @param {boolean} [force] update language fields forcefully
     * @returns {boolean}
     */
    updateLanguage: (newLanguage, forceUpdate) => {

        if(typeof newLanguage !== 'string') return;

        /**
         * Validate language to avoid errors
         */
        var newLanguageCode = _getValidLanguageCode(newLanguage);

        /**
         * Set language only if it differs from current
         */
        if(newLanguageCode !== _state.currentLanguageCode || forceUpdate === true){
            _state.currentLanguageCode = newLanguageCode;

            _loadTranslationData(_state.currentLanguageCode, function(){
                if(_state.consentModalExists){
                    _createConsentModal();
                    _addDataButtonListeners(_dom.consentModalInner);
                }

                _createPreferencesModal();

                _log("CookieConsent [LANG]: current language: '" + newLanguageCode + "'");
            });

            return true;
        }

        return false;
    },

    /**
     * @typedef {object} userPreferences
     * @property {string} acceptType
     * @property {string[]} acceptedCategories
     * @property {string[]} rejectedCategories
     */

    /**
     * Retrieve current user preferences (summary)
     * @returns {userPreferences}
     */
    getUserPreferences: () => {
        var currentCategoriesState = !_state.invalidConsent && _getCurrentCategoriesState();

        return {
            '_state.acceptType': _state.acceptType,
            '_state.acceptedCategories': !_state.invalidConsent ? currentCategoriesState.accepted : [],
            'rejectedCategories': !_state.invalidConsent ? currentCategoriesState.rejected : []
        }
    },

    /**
     * Function which will run after script load
     * @callback scriptLoaded
     */

    /**
     * Dynamically load script (append to head)
     * @param {string} src
     * @param {scriptLoaded} callback
     * @param {object[]} [attrs] Custom attributes
     */
    loadScript: (src, callback, attrs) => {

        var function_defined = typeof callback === 'function';

        // Load script only if not already loaded
        if(!document.querySelector('script[src="' + src + '"]')){

            var script = _createNode('script');

            // if an array is provided => add custom attributes
            if(attrs && attrs.length > 0){
                for(var i=0; i<attrs.length; ++i){
                    attrs[i] && _setAttribute(script, attrs[i]['name'], attrs[i]['value']);
                }
            }

            // if callback function defined => run callback onload
            if(function_defined){
                script.onload = callback;
            }

            script.src = src;

            /**
             * Append script to head
             */
            _appendChild(document.head, script);
        }else{
            function_defined && callback();
        }
    },

    /**
     * Save custom data inside cookie
     * @param {{
     *  value: any,
     *  mode: string
     * }} props
     * @returns {boolean}
     */
    setCookieData: (props) => {

        var newData = props['value'],
            mode = props['mode'],
            set = false,
            cookieData = _state.cookieData;


        /**
         * If mode is 'update':
         * add/update only the specified props.
         */
        if(mode === 'update'){
            cookieData = api.getCookie('data');
            var sameType = typeof cookieData === typeof newData;

            if(sameType && typeof cookieData === "object"){
                !cookieData && (cookieData = {});

                for(var prop in newData){
                    if(cookieData[prop] !== newData[prop]){
                        cookieData[prop] = newData[prop]
                        set = true;
                    }
                }
            }else if((sameType || !cookieData) && cookieData !== newData){
                cookieData = newData;
                set = true;
            }
        }else{
            cookieData = newData;
            set = true;
        }

        if(set){
            _state.savedCookieContent['data'] = cookieData;
            _setCookie(cookieConfig.name, JSON.stringify(_state.savedCookieContent), true);
        }

        return set;
    },

    /**
     * Retrieve data from existing cookie
     * @param {string} field
     * @param {string} [cookieName]
     * @returns {any}
     */
    getCookie: (field, cookieName) => {
        var cookie = JSON.parse(_getCookie(cookieName || cookieConfig.name, 'one', true, true) || "{}");
        return field ? cookie[field] : cookie;
    },

    /**
     * Read current configuration value
     * @returns {any}
     */
    getConfig: (field) => {
        return  _config[field] || _state.userConfig[field];
    },

    /**
     * Manage dynamically loaded scripts: https://github.com/orestbida/cookieconsent/issues/101
     * If plugin has already run, call this method to enable
     * the newly added scripts based on currently selected preferences
     */
    updateScripts: () => {
        _manageExistingScripts();
    },

    /**
     * Show cookie consent modal (with delay parameter)
     * @param {number} [delay]
     * @param {boolean} [create_modal] create modal if it doesn't exist
     */
    show: (delay, createModal) => {

        if(createModal === true){
            _createConsentModal();
        }

        if(_state.consentModalExists){
            setTimeout(function() {
                _addClass(_dom.htmlDom, "show--consent");

                /**
                 * Update attributes/internal statuses
                 */
                _setAttribute(_dom.consentModal, 'aria-hidden', 'false');
                _state.consentModalVisible = true;

                setTimeout(function(){
                    _state.lastFocusedElemBeforeModal = document.activeElement;
                    _state.currentModalFocusableElements = _state.allConsentModalFocusableElements;
                }, 200);

                _log("CookieConsent [TOGGLE]: show consentModal");
            }, delay > 0 ? delay : (createModal ? 30 : 0));
        }
    },

    /**
     * Hide consent modal
     */
    hide: () => {
        if(_state.consentModalExists){
            _removeClass(_dom.htmlDom, "show--consent");
            _setAttribute(_dom.consentModal, 'aria-hidden', 'true');
            _state.consentModalVisible = false;

            setTimeout(function(){
                //restore focus to the last page element which had focus before modal opening
                _state.lastFocusedElemBeforeModal.focus();
                _state.currentModalFocusableElements = null;
            }, 200);

            _log("CookieConsent [TOGGLE]: hide consentModal");
        }
    },

    /**
     * Hide preferences modal
     */
    hidePreferences: () => {
        _removeClass(_dom.htmlDom, "show--settings");
        _state.preferencesModalVisible = false;
        _setAttribute(_dom.preferencesContainer, 'aria-hidden', 'true');

        setTimeout(function(){
            /**
             * If consent modal is visible, focus him (instead of page document)
             */
            if(_state.consentModalVisible){
                _state.lastFocusedModalElement && _state.lastFocusedModalElement.focus();
                _state.currentModalFocusableElements = _state.allConsentModalFocusableElements;
            }else{
                /**
                 * Restore focus to last page element which had focus before modal opening
                 */
                _state.lastFocusedElemBeforeModal && _state.lastFocusedElemBeforeModal.focus();
                _state.currentModalFocusableElements = null;
            }

            _state.clickedInsideModal = false;
        }, 200);

        _log("CookieConsent [TOGGLE]: hide preferencesModal");
    },

    /**
     * Returns true if cookie category is accepted by the user
     * @param {string} category
     * @returns {boolean}
     */
    acceptedCategory: (category) => {
        var categories;

        if(!_state.invalidConsent || _config.mode === 'opt-in')
            categories = api.getUserPreferences()._state.acceptedCategories;
        else  // mode is 'opt-out'
            categories = _state.defaultEnabledCategories;

        return _inArray(categories, category) > -1;
    },

    /**
     * Show preferences modal (with optional delay)
     * @param {number} [delay]
     */
    showPreferences: (delay) => {
        setTimeout(function() {
            _addClass(_dom.htmlDom, "show--settings");
            _setAttribute(_dom.preferencesContainer, 'aria-hidden', 'false');
            _state.preferencesModalVisible = true;

            /**
             * Set focus to the first focusable element inside preferences modal
             */
            setTimeout(function(){
                // If there is no consent-modal, keep track of the last focused elem.
                if(!_state.consentModalVisible){
                    _state.lastFocusedElemBeforeModal = document.activeElement;
                }else{
                    _state.lastFocusedModalElement = document.activeElement;
                }

                if (_state.allPreferencesModalFocusableElements.length === 0) return;

                if(_state.allPreferencesModalFocusableElements[3]){
                    _state.allPreferencesModalFocusableElements[3].focus();
                }else{
                    _state.allPreferencesModalFocusableElements[0].focus();
                }
                _state.currentModalFocusableElements = _state.allPreferencesModalFocusableElements;
            }, 200);

            _log("CookieConsent [TOGGLE]: show preferencesModal");
        }, delay > 0 ? delay : 0);
    },

    /**
     * "Init" method. Will run once and only if modals do not exist
     */
    run: function(config){
        if(!document.getElementById('cc_div')){

            // configure all parameters
            _setConfig(config);

            // Don't run plugin if bot is detected
            if(_state.botAgentDetected) return;

            // Retrieve cookie value (if set)
            _state.savedCookieContent = JSON.parse(_getCookie(cookieConfig.name, 'one', true) || "{}");

            // Retrieve "consentId"
            _state.consentId = _state.savedCookieContent['consentId'];

            // If "consentId" is present => assume that consent was previously given
            var cookieConsentAccepted = _state.consentId !== undefined;

            // Retrieve "consentTimestamp"
            _state.consentTimestamp = _state.savedCookieContent['consentTimestamp'];
            _state.consentTimestamp && (_state.consentTimestamp = new Date(_state.consentTimestamp));

            // Retrieve "lastConsentTimestamp"
            _state.lastConsentTimestamp = _state.savedCookieContent['lastConsentTimestamp'];
            _state.lastConsentTimestamp && (_state.lastConsentTimestamp = new Date(_state.lastConsentTimestamp));

            // Retrieve "data"
            var dataTemp = _state.savedCookieContent['data'];
            _state.cookieData = typeof dataTemp !== 'undefined' ? dataTemp : null;

            // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
            if(_state.revisionEnabled && cookieConsentAccepted && _state.savedCookieContent['revision'] !== _config.revision)
            _state.validRevision = false;

            // If consent is not valid => create consent modal
            _state.consentModalExists = _state.invalidConsent = (!cookieConsentAccepted || !_state.validRevision || !_state.consentTimestamp || !_state.lastConsentTimestamp || !_state.consentId);

            _log("CookieConsent [STATUS] valid consent:", !_state.invalidConsent);
            /**
             * Load translation before generating modals
             */
            _loadTranslationData(null, function(){

                // Generate cookie-preferences dom (& consent modal)
                _createCookieConsentHTML();

                _getModalFocusableData();
                _addDataButtonListeners();

                if(_config.autoShow && _state.consentModalExists)
                    api.show();

                // Add class to enable animations/transitions
                setTimeout(function(){_addClass(_dom.mainContainer, 'c--anim');}, 50);

                // Accessibility :=> if tab pressed => trap focus inside modal
                setTimeout(function(){_handleFocusTrap();}, 100);

                // If consent is valid
                if(!_state.invalidConsent){

                    _manageExistingScripts();

                    if(typeof _callbacks._onConsent === 'function')
                        _callbacks._onConsent(_state.savedCookieContent);

                }else{
                    if(_config.mode === 'opt-out'){
                        _log("CookieConsent [CONFIG] mode='" + _config.mode + "', default enabled categories:", _state.defaultEnabledCategories);
                        _manageExistingScripts(_state.defaultEnabledCategories);
                    }
                }
            });
        }
    }
}