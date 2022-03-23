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
} from '../utils/general';

import { _manageExistingScripts } from '../utils/scripts';

import {
    config,
    state,
    dom,
    callbacks,
    cookieConfig,
} from './global';

import {
    _createConsentModal,
    _createPreferencesModal,
    _createCookieConsentHTML
} from './modals/modals';

import { _getValidLanguageCode, _loadTranslationData } from '../utils/language';

import {
    _getCookie,
    _setCookie,
    _eraseCookies,
    _saveCookiePreferences
} from '../utils/cookies';

import { _setConfig } from './config-init';

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
        };

        if(!categories){
            categoriesToAccept = _getCurrentPreferences();
        }else{
            if(
                typeof categories === 'object' &&
                typeof categories.length === 'number'
            ){
                for(var i=0; i<categories.length; i++){
                    if(_inArray(state._allCategoryNames, categories[i]) !== -1)
                        categoriesToAccept.push(categories[i]);
                }
            }else if(typeof categories === 'string'){
                if(categories === 'all')
                    categoriesToAccept = state._allCategoryNames.slice();
                else{
                    if(_inArray(state._allCategoryNames, categories) !== -1)
                        categoriesToAccept.push(categories);
                }
            }
        }

        // Remove excluded categories
        if(exclusions.length >= 1){
            for(i=0; i<exclusions.length; i++){
                categoriesToAccept = categoriesToAccept.filter((item) => {
                    return item !== exclusions[i];
                });
            }
        }

        // Add back all the categories set as "readonly/required"
        for(i=0; i<state._allCategoryNames.length; i++){
            if(
                state._readOnlyCategories[i] === true &&
                _inArray(categoriesToAccept, state._allCategoryNames[i]) === -1
            ){
                categoriesToAccept.push(state._allCategoryNames[i]);
            }
        }
        /**
         * Keep state._acceptedCategories array updated
         */
        state._acceptedCategories = categoriesToAccept;

        _saveCookiePreferences(categoriesToAccept, api);
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

        var configDomain = cookieConfig.domain;

        var domains = domain
            ? [domain, '.'+domain]
            : [configDomain, '.' + configDomain];

        if(typeof cookies === 'object' && cookies.length > 0){
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
        if(newLanguageCode !== state._currentLanguageCode || forceUpdate === true){
            state._currentLanguageCode = newLanguageCode;

            _loadTranslationData(state._currentLanguageCode, () => {
                if(state._consentModalExists){
                    _createConsentModal(api);
                    _addDataButtonListeners(dom._consentModalInner, api);
                }

                _createPreferencesModal(api);

                _log('CookieConsent [LANG]: current language: \'' + newLanguageCode + '\'');
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
        var currentCategoriesState = !state._invalidConsent && _getCurrentCategoriesState();

        return {
            'acceptType': state._acceptType,
            'acceptedCategories': !state._invalidConsent ? currentCategoriesState.accepted : [],
            'rejectedCategories': !state._invalidConsent ? currentCategoriesState.rejected : []
        };
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

        var callbackExists = typeof callback === 'function';

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
            if(callbackExists){
                script.onload = callback;
            }

            script.src = src;

            /**
             * Append script to head
             */
            _appendChild(document.head, script);
        }else{
            callbackExists && callback();
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
            set = false;


        /**
         * If mode is 'update':
         * add/update only the specified props.
         */
        if(mode === 'update'){
            state._cookieData = api.getCookie('data');
            var sameType = typeof state._cookieData === typeof newData;

            if(sameType && typeof state._cookieData === 'object'){
                !state._cookieData && (state._cookieData = {});

                for(var prop in newData){
                    if(state._cookieData[prop] !== newData[prop]){
                        state._cookieData[prop] = newData[prop];
                        set = true;
                    }
                }
            }else if((sameType || !state._cookieData) && state._cookieData !== newData){
                state._cookieData = newData;
                set = true;
            }
        }else{
            state._cookieData = newData;
            set = true;
        }

        if(set){
            state._savedCookieContent['data'] = state._cookieData;
            _setCookie(cookieConfig.name, JSON.stringify(state._savedCookieContent), true);
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
        var cookie = JSON.parse(_getCookie(cookieName || cookieConfig.name, 'one', true, true) || '{}');
        return field ? cookie[field] : cookie;
    },

    /**
     * Read current configuration value
     * @returns {any}
     */
    getConfig: (field) => {
        return  config[field] || state._userConfig[field];
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
            _createConsentModal(api);
        }

        if(state._consentModalExists){
            setTimeout(() => {
                _addClass(dom._htmlDom, 'show--consent');

                /**
                 * Update attributes/internal statuses
                 */
                _setAttribute(dom._consentModal, 'aria-hidden', 'false');
                state._consentModalVisible = true;

                setTimeout(() => {
                    state._lastFocusedElemBeforeModal = document.activeElement;
                    state._currentModalFocusableElements = state._allConsentModalFocusableElements;
                }, 200);

                _log('CookieConsent [TOGGLE]: show consentModal');
            }, delay > 0 ? delay : (createModal ? 30 : 0));
        }
    },

    /**
     * Hide consent modal
     */
    hide: () => {
        if(state._consentModalExists){
            _removeClass(dom._htmlDom, 'show--consent');
            _setAttribute(dom._consentModal, 'aria-hidden', 'true');
            state._consentModalVisible = false;

            setTimeout(() => {
                //restore focus to the last page element which had focus before modal opening
                state._lastFocusedElemBeforeModal.focus();
                state._currentModalFocusableElements = null;
            }, 200);

            _log('CookieConsent [TOGGLE]: hide _consentModal');
        }
    },

    /**
     * Hide preferences modal
     */
    hidePreferences: () => {
        _removeClass(dom._htmlDom, 'show--settings');
        state._preferencesModalVisible = false;
        _setAttribute(dom._preferencesContainer, 'aria-hidden', 'true');

        setTimeout(() => {
            /**
             * If consent modal is visible, focus him (instead of page document)
             */
            if(state._consentModalVisible){
                state._lastFocusedModalElement && state._lastFocusedModalElement.focus();
                state._currentModalFocusableElements = state._allConsentModalFocusableElements;
            }else{
                /**
                 * Restore focus to last page element which had focus before modal opening
                 */
                state._lastFocusedElemBeforeModal && state._lastFocusedElemBeforeModal.focus();
                state._currentModalFocusableElements = null;
            }

            state._clickedInsideModal = false;
        }, 200);

        _log('CookieConsent [TOGGLE]: hide preferencesModal');
    },

    /**
     * Returns true if cookie category is accepted by the user
     * @param {string} category
     * @returns {boolean}
     */
    acceptedCategory: (category) => {
        var categories;

        if(!state._invalidConsent || config.mode === 'opt-in')
            categories = api.getUserPreferences().acceptedCategories;
        else  // mode is 'opt-out'
            categories = state._defaultEnabledCategories;

        return _inArray(categories, category) > -1;
    },

    /**
     * Show preferences modal (with optional delay)
     * @param {number} [delay]
     */
    showPreferences: (delay) => {
        setTimeout(() => {
            _addClass(dom._htmlDom, 'show--settings');
            _setAttribute(dom._preferencesContainer, 'aria-hidden', 'false');
            state._preferencesModalVisible = true;

            /**
             * Set focus to the first focusable element inside preferences modal
             */
            setTimeout(() => {
                // If there is no consent-modal, keep track of the last focused elem.
                if(!state._consentModalVisible){
                    state._lastFocusedElemBeforeModal = document.activeElement;
                }else{
                    state._lastFocusedModalElement = document.activeElement;
                }

                if (state._allPreferencesModalFocusableElements.length === 0) return;

                if(state._allPreferencesModalFocusableElements[3]){
                    state._allPreferencesModalFocusableElements[3].focus();
                }else{
                    state._allPreferencesModalFocusableElements[0].focus();
                }
                state._currentModalFocusableElements = state._allPreferencesModalFocusableElements;
            }, 200);

            _log('CookieConsent [TOGGLE]: show preferencesModal');
        }, delay > 0 ? delay : 0);
    },

    /**
     * "Init" method. Will run once and only if modals do not exist
     */
    run: (conf) => {

        if(!document.getElementById('cc-main')){

            // configure all parameters
            _setConfig(conf);

            // Don't run plugin if bot is detected
            if(state._botAgentDetected) return;

            // Retrieve cookie value (if set)
            state._savedCookieContent = JSON.parse(_getCookie(cookieConfig.name, 'one', true) || '{}');

            // Retrieve "_consentId"
            state._consentId = state._savedCookieContent['consentId'];

            // If "_consentId" is present => assume that consent was previously given
            var cookieConsentAccepted = state._consentId !== undefined;

            // Retrieve "_consentTimestamp"
            state._consentTimestamp = state._savedCookieContent['consentTimestamp'];
            state._consentTimestamp && (state._consentTimestamp = new Date(state._consentTimestamp));

            // Retrieve "_lastConsentTimestamp"
            state._lastConsentTimestamp = state._savedCookieContent['lastConsentTimestamp'];
            state._lastConsentTimestamp && (state._lastConsentTimestamp = new Date(state._lastConsentTimestamp));

            // Retrieve "data"
            var dataTemp = state._savedCookieContent['data'];
            state._cookieData = typeof dataTemp !== 'undefined' ? dataTemp : null;

            // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
            if(state._revisionEnabled && cookieConsentAccepted && state._savedCookieContent['revision'] !== config.revision)
                state._validRevision = false;

            // If consent is not valid => create consent modal
            state._consentModalExists = state._invalidConsent = (!cookieConsentAccepted || !state._validRevision || !state._consentTimestamp || !state._lastConsentTimestamp || !state._consentId);

            _log('CookieConsent [STATUS] valid consent:', !state._invalidConsent);
            /**
             * Load translation before generating modals
             */
            _loadTranslationData(null, () => {

                // Generate cookie-preferences dom (& consent modal)
                _createCookieConsentHTML(api);

                _getModalFocusableData();
                _addDataButtonListeners(null, api);

                if(config.autoShow && state._consentModalExists)
                    api.show();

                // Add class to enable animations/transitions
                setTimeout(() => {_addClass(dom._ccMain, 'c--anim');}, 100);

                // Accessibility :=> if tab pressed => trap focus inside modal
                setTimeout(() => {_handleFocusTrap(api);}, 100);

                // If consent is valid
                if(!state._invalidConsent){

                    _manageExistingScripts();

                    if(typeof callbacks._onConsent === 'function')
                        callbacks._onConsent(state._savedCookieContent);

                }else{
                    if(config.mode === 'opt-out'){
                        _log('CookieConsent [CONFIG] mode=\'' + config.mode + '\', default enabled categories:', state._defaultEnabledCategories);
                        _manageExistingScripts(state._defaultEnabledCategories);
                    }
                }
            });
        }
    }
};