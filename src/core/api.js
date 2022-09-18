import {
    _createNode,
    _setAttribute,
    _appendChild,
    _addClass,
    _removeClass,
    _log,
    _handleFocusTrap,
    _getCurrentCategoriesState,
    _getAcceptType,
    _elContains,
    _updateAcceptType,
    _getKeys,
    _retrieveRejectedServices
} from '../utils/general';

import { _manageExistingScripts, _retrieveEnabledCategoriesAndServices } from '../utils/scripts';

import {
    _fireEvent,
    globalObj,
    Global,
    _shallowCopy
} from './global';

import {
    _createConsentModal,
    _createPreferencesModal,
    _createCookieConsentHTML
} from './modals/modals';

import { _getCurrentLanguageCode, _loadTranslationData, _setCurrentLanguageCode, _validLanguageCode } from '../utils/language';

import {
    _setCookie,
    _eraseCookies,
    _saveCookiePreferences,
    _getSingleCookie,
    _parseCookie,
    _getAllCookies
} from '../utils/cookies';

import { _setConfig } from './config-init';

import {
    TOGGLE_CONSENT_MODAL_CLASS,
    TOGGLE_DISABLE_INTERACTION_CLASS,
    TOGGLE_PREFERENCES_MODAL_CLASS,
    OPT_OUT_MODE,
    OPT_IN_MODE,
    CONSENT_MODAL_NAME,
    PREFERENCES_MODAL_NAME
} from '../utils/constants';

/**
 * Dispatch the 'change' event to the input
 * @param {HTMLElement} input
 */
const _dispatchChangeEvent = (input) => {
    input.dispatchEvent(new Event('change'));
};

/**
 * Accept API
 * @param {string[]|string} _categories - Categories to accept
 * @param {string[]} [_exclusions] - Excluded categories [optional]
 */
export const acceptCategory = (_categories, _exclusions) => {

    const state = globalObj._state;

    var categories = _categories || undefined;
    var exclusions = _exclusions || [];
    var customAcceptType = false;

    /**
     * @type {string[]}
     */
    var categoriesToAccept = [];

    /**
     * Get all accepted categories
     * @returns {string[]}
     */
    var _getCurrentPreferences = () => {
        var toggles = globalObj._dom._categoryCheckboxInputs;
        var enabledCategories = [];

        if(toggles){
            for(var toggleName in toggles){
                if(toggles[toggleName].checked){
                    enabledCategories.push(toggles[toggleName].value);
                }
            }
        }else{
            if(!state._invalidConsent)
                enabledCategories = state._savedCookieContent.categories;
        }

        return enabledCategories;
    };

    if(!categories){
        categoriesToAccept = _getCurrentPreferences();
        customAcceptType = true;
    }else{
        if(
            typeof categories === 'object' &&
            typeof categories.length === 'number'
        ){
            for(var i=0; i<categories.length; i++){
                if(_elContains(state._allCategoryNames, categories[i]))
                    categoriesToAccept.push(categories[i]);
            }
        }else if(typeof categories === 'string'){
            if(categories === 'all')
                categoriesToAccept = state._allCategoryNames.slice();
            else{
                if(_elContains(state._allCategoryNames, categories))
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
    for(i=0; i<state._readOnlyCategories.length; i++){
        if(!_elContains(categoriesToAccept, state._readOnlyCategories[i]))
            categoriesToAccept.push(state._readOnlyCategories[i]);
    }

    /**
     * Keep state._acceptedCategories array updated
     */
    state._acceptedCategories = categoriesToAccept;

    _updateAcceptType();

    if(!customAcceptType)
        state._customServicesSelection = {};

    /**
     * Save previously enabled services to calculate later on which of them was changed
     */
    state._lastEnabledServices = _shallowCopy(state._enabledServices);


    state._allCategoryNames.forEach(categoryName => {

        var categoryServices = globalObj._dom._serviceCheckboxInputs[categoryName];

        /**
         * Stop here if there are no services
         */
        if(_getKeys(categoryServices).length === 0) return;

        const services = state._allDefinedServices[categoryName];
        const serviceNames = _getKeys(services);

        state._enabledServices[categoryName] = [];

        // If category is marked as readOnly => enable all its services
        if(_elContains(state._readOnlyCategories, categoryName)){
            serviceNames.forEach(serviceName => {
                state._enabledServices[categoryName].push(serviceName);
            });
        }else{
            if(globalObj._state._acceptType === 'all'){
                if(
                    customAcceptType
                    && !!state._customServicesSelection[categoryName]
                    && state._customServicesSelection[categoryName].length > 0
                ){
                    state._customServicesSelection[categoryName].forEach(serviceName => {
                        state._enabledServices[categoryName].push(serviceName);
                    });
                }else{
                    serviceNames.forEach(serviceName => {
                        state._enabledServices[categoryName].push(serviceName);
                    });
                }
            }else if(state._acceptType === 'necessary'){
                state._enabledServices[categoryName] = [];
            }else {
                if(
                    customAcceptType
                    && !!state._customServicesSelection[categoryName]
                    && state._customServicesSelection[categoryName].length > 0
                ){
                    state._customServicesSelection[categoryName].forEach(serviceName => {
                        state._enabledServices[categoryName].push(serviceName);
                    });
                }else{
                    for(let serviceName in categoryServices){
                        const serviceToggle = categoryServices[serviceName];

                        if(serviceToggle.checked)
                            state._enabledServices[categoryName].push(serviceToggle.value);
                    }
                }
            }
        }
    });

    _saveCookiePreferences();
};

/**
 * Returns true if cookie category is accepted
 * @param {string} category
 * @returns {boolean}
 */
export const acceptedCategory = (category) => {
    var categories;

    if(!globalObj._state._invalidConsent || globalObj._config.mode === OPT_IN_MODE)
        categories = _getCurrentCategoriesState().accepted || [];
    else  // mode is OPT_OUT_MODE
        categories = globalObj._state._defaultEnabledCategories;
    return _elContains(categories, category);
};

/**
 * Accept one or multiple services under a specific category
 * @param {string|string[]} service
 * @param {string} category
 */
export const acceptService = (service, category) => {

    if(
        !service
        || !category
        || typeof category !== 'string'
        || !_elContains(globalObj._state._allCategoryNames, category)
    ) {
        return false;
    }

    const servicesInputs = globalObj._dom._serviceCheckboxInputs[category] || {};

    globalObj._state._customServicesSelection[category] = [];

    if(typeof service === 'string'){
        if(service === 'all'){
            for(var serviceName in servicesInputs){
                servicesInputs[serviceName].checked = true;
                _dispatchChangeEvent(servicesInputs[serviceName]);
            }
        }else{
            for(serviceName in servicesInputs){
                if(service === serviceName)
                    servicesInputs[serviceName].checked = true;
                else
                    servicesInputs[serviceName].checked = false;

                _dispatchChangeEvent(servicesInputs[serviceName]);
            }
        }
    }else if(typeof service === 'object' && Array.isArray(service)){
        for(serviceName in servicesInputs){
            if(_elContains(service, serviceName))
                servicesInputs[serviceName].checked = true;
            else
                servicesInputs[serviceName].checked = false;
            _dispatchChangeEvent(servicesInputs[serviceName]);
        }
    }

    acceptCategory();
};

/**
 * Returns true if the service in the specified
 * category is accepted/enabled
 * @param {string} service
 * @param {string} category
 * @returns {boolean}
 */
export const acceptedService = (service, category) => {
    return _elContains(globalObj._state._enabledServices[category] || [], service);
};


/**
 * Returns true if cookie was found and has valid value (not an empty string)
 * @param {string} cookieName
 * @returns {boolean}
 */
export const validCookie = (cookieName) => {
    return _getSingleCookie(cookieName, true) !== '';
};

/**
 * Erase cookies API
 * @param {(string|RegExp|(string|RegExp)[])} cookies
 * @param {string} [path]
 * @param {string} [domain]
 */
export const eraseCookies = (cookies, path, domain) => {
    let allCookies = [];

    /**
     * Add cookie to allCookies array if it exists
     * @param {string | RegExp} cookieName
     */
    const addCookieIfExists = (cookieName) => {
        if(typeof cookieName === 'string'){
            let name = _getSingleCookie(cookieName);
            name !== '' && allCookies.push(name);
        }else{
            allCookies = allCookies.concat(_getAllCookies(cookieName));
        }
    };

    if(Array.isArray(cookies)){
        for(var i=0; i<cookies.length; i++){
            addCookieIfExists(cookies[i]);
        }
    }else{
        addCookieIfExists(cookies);
    }

    _eraseCookies(allCookies, path, domain);
};

/**
 * Show cookie consent modal
 * @param {boolean} [createModal] create modal if it doesn't exist
 */
export const show = (createModal) => {

    if(createModal && !globalObj._state._consentModalExists)
        _createConsentModal(miniAPI);

    if(globalObj._state._consentModalExists){

        _addClass(globalObj._dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);

        /**
         * Update attributes/internal statuses
         */
        _setAttribute(globalObj._dom._consentModal, 'aria-hidden', 'false');
        globalObj._state._consentModalVisible = true;

        setTimeout(() => {
            globalObj._state._lastFocusedElemBeforeModal = globalObj._dom._document.activeElement;
            globalObj._state._currentModalFocusableElements = globalObj._state._cmFocusableElements;
        }, 200);

        _log('CookieConsent [TOGGLE]: show consentModal');

        _fireEvent(globalObj._customEvents._onModalShow, CONSENT_MODAL_NAME);
    }
};

/**
 * Hide consent modal
 */
export const hide = () => {
    if(globalObj._state._consentModalExists && globalObj._state._consentModalVisible){
        _removeClass(globalObj._dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
        _setAttribute(globalObj._dom._consentModal, 'aria-hidden', 'true');
        globalObj._state._consentModalVisible = false;

        setTimeout(() => {
            //restore focus to the last page element which had focus before modal opening
            globalObj._state._lastFocusedElemBeforeModal.focus();
            globalObj._state._currentModalFocusableElements = [];
        }, 200);

        _log('CookieConsent [TOGGLE]: hide consentModal');

        _fireEvent(globalObj._customEvents._onModalHide, CONSENT_MODAL_NAME);
    }
};

/**
 * Show preferences modal
 */
export const showPreferences = () => {
    const state = globalObj._state;

    if(state._preferencesModalExists && state._preferencesModalVisible)
        return;

    if(!state._preferencesModalExists)
        _createPreferencesModal(miniAPI);

    _addClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    _setAttribute(globalObj._dom._pm, 'aria-hidden', 'false');
    state._preferencesModalVisible = true;

    setTimeout(()=>{
        state._preferencesModalVisibleDelayed = true;
    }, 1);

    /**
     * Set focus to the first focusable element inside preferences modal
     */
    setTimeout(() => {
        // If there is no consent-modal, keep track of the last focused elem.
        if(!state._consentModalVisible){
            state._lastFocusedElemBeforeModal = globalObj._dom._document.activeElement;
        }else{
            state._lastFocusedModalElement = globalObj._dom._document.activeElement;
        }

        if (state._pmFocusableElements.length === 0) return;

        state._pmFocusableElements[0].focus();

        state._currentModalFocusableElements = state._pmFocusableElements;
    }, 200);

    _log('CookieConsent [TOGGLE]: show preferencesModal');

    _fireEvent(globalObj._customEvents._onModalShow, PREFERENCES_MODAL_NAME);
};

/**
 * Hide preferences modal
 */
export const hidePreferences = () => {

    const state = globalObj._state;

    if(!state._preferencesModalVisible)
        return;

    _removeClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    _setAttribute(globalObj._dom._pm, 'aria-hidden', 'true');

    state._preferencesModalVisible = false;

    setTimeout(()=>{
        state._preferencesModalVisibleDelayed = false;
    }, 1);

    /**
     * If consent modal is visible, focus him (instead of page document)
     */
    if(state._consentModalVisible){
        state._lastFocusedModalElement && state._lastFocusedModalElement.focus();
        state._currentModalFocusableElements = state._cmFocusableElements;
    }else{
        /**
         * Restore focus to last page element which had focus before modal opening
         */
        state._lastFocusedElemBeforeModal && state._lastFocusedElemBeforeModal.focus();
        state._currentModalFocusableElements = [];
    }

    state._clickedInsideModal = false;

    _log('CookieConsent [TOGGLE]: hide preferencesModal');

    _fireEvent(globalObj._customEvents._onModalHide, PREFERENCES_MODAL_NAME);
};

var miniAPI = {
    show,
    hide,
    showPreferences,
    hidePreferences,
    acceptCategory
};

/**
 * Update/change modal's language
 * @param {string} lang new language
 * @param {boolean} [forceUpdate] update language fields forcefully
 * @returns {Promise<boolean>}
 */
export const setLanguage = async (newLanguageCode, forceUpdate) => {

    if(!_validLanguageCode(newLanguageCode))
        return false;

    /**
     * Set language only if it differs from current
     */
    if(newLanguageCode !== _getCurrentLanguageCode() || forceUpdate === true){

        const loaded = await _loadTranslationData(newLanguageCode);

        if(!loaded)
            return false;

        _setCurrentLanguageCode(newLanguageCode);

        if(globalObj._state._consentModalExists)
            _createConsentModal(miniAPI);

        if(globalObj._state._preferencesModalExists)
            _createPreferencesModal(miniAPI);

        return true;
    }

    return false;
};

/**
 * Retrieve current user preferences (summary)
 * @returns {import("./global").UserPreferences}
 */
export const getUserPreferences = () => {
    const validConsent = !globalObj._state._invalidConsent;

    var currentCategoriesState = validConsent && _getCurrentCategoriesState();

    return {
        acceptType: globalObj._state._acceptType,
        acceptedCategories: validConsent ? currentCategoriesState.accepted : [],
        rejectedCategories: validConsent ? currentCategoriesState.rejected : [],
        acceptedServices: validConsent ? globalObj._state._enabledServices : {},
        rejectedServices: validConsent ? _retrieveRejectedServices() : {}
    };
};

/**
 * Dynamically load script (append to head)
 * @param {string} src
 * @param {object[]} [attrs] Custom attributes
 * @returns {Promise<boolean>} promise
 */
export const loadScript = (src, attrs) => {
    let script = document.querySelector('script[src="' + src + '"]');

    return new Promise((resolve, reject) => {

        if(script)
            return resolve(true);

        script = _createNode('script');

        /**
         * Add custom attributes (if provided)
         */
        Array.isArray(attrs) && attrs.forEach(attr => {
            _setAttribute(script, attr.name, attr.value);
        });

        script.onload = () => resolve(true);
        script.onerror = () => {
            /**
             * Remove script from dom if error is thrown
             */
            script.remove();
            reject(false);
        };

        script.src = src;

        /**
         * Append script to head
         */
        _appendChild(document.head, script);
    });
};

/**
 * Save custom data inside cookie
 * @param {{
 *  value: any,
 *  mode: string
 * }} props
 * @returns {boolean}
 */
export const setCookieData = (props) => {

    let newData = props.value,
        mode = props.mode,
        set = false,
        cookieData;

    const state = globalObj._state;

    /**
     * If mode is 'update':
     * add/update only the specified props.
     */
    if(mode === 'update'){
        state._cookieData = getCookie('data');
        cookieData = getCookie('data');
        const sameType = typeof cookieData === typeof newData;

        if(sameType && typeof cookieData === 'object'){
            !cookieData && (cookieData = {});

            for(var prop in newData){
                if(cookieData[prop] !== newData[prop]){
                    cookieData[prop] = newData[prop];
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
        state._cookieData = cookieData;
        state._savedCookieContent.data = cookieData;
        _setCookie(globalObj._config.cookie.name, JSON.stringify(state._savedCookieContent), true);
    }

    return set;
};

/**
 * Retrieve data from existing cookie
 * @param {string} field
 * @param {string} [cookieName]
 * @returns {any}
 */
export const getCookie = (field, cookieName) => {
    const cookie = _parseCookie(_getSingleCookie(cookieName || globalObj._config.cookie.name, true));
    return field ? cookie[field] : cookie;
};

/**
 * Return configuration object or just one of its fields.
 * @param {string} field
 * @returns {any}
 */
export const getConfig = (field) => {

    const config = globalObj._config;
    const userConfig = globalObj._state._userConfig;

    return field
        ? config[field] || userConfig[field]
        : {...config, ...userConfig, cookie:{...config.cookie}};
};

/**
 * Returns true if consent is valid
 * @returns {boolean}
 */
export const validConsent = () => {
    return !globalObj._state._invalidConsent;
};

/**
 * Will run once and only if modals do not exist.
 * @param {import("./global").UserConfig} userConfig
 */
export const run = async (userConfig) => {

    const state = globalObj._state;
    const config = globalObj._config;
    const dom = globalObj._dom;

    if(!dom._ccMain){

        _setConfig(userConfig);

        // Stop if bot is detected
        if(state._botAgentDetected)
            return;

        /**
         * @type {import('../../types').CookieValue}
         */
        const cookieValue = _parseCookie(_getSingleCookie(config.cookie.name, true));
        const categories = cookieValue.categories;
        const validCategories = Array.isArray(categories) && categories.length > 0;

        state._savedCookieContent = cookieValue;
        state._consentId = cookieValue.consentId;

        // If "_consentId" is present => assume that consent was previously given
        const validConsentId = !!state._consentId && typeof state._consentId === 'string';

        // Retrieve "_consentTimestamp"
        state._consentTimestamp = cookieValue.consentTimestamp;
        state._consentTimestamp && (state._consentTimestamp = new Date(state._consentTimestamp));

        // Retrieve "_lastConsentTimestamp"
        state._lastConsentTimestamp = cookieValue.lastConsentTimestamp;
        state._lastConsentTimestamp && (state._lastConsentTimestamp = new Date(state._lastConsentTimestamp));

        // Retrieve "data"
        const dataTemp = cookieValue.data;
        state._cookieData = typeof dataTemp !== 'undefined' ? dataTemp : null;

        // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
        if(state._revisionEnabled && validConsentId && cookieValue.revision !== config.revision)
            state._validRevision = false;

        // If consent is not valid => create consent modal
        state._invalidConsent = (!validConsentId || !state._validRevision || !state._consentTimestamp || !state._lastConsentTimestamp || !validCategories);

        _log('CookieConsent [STATUS] valid consent:', !state._invalidConsent);

        /**
         * Retrieve last accepted categories from cookie
         * and calculate acceptType
         */
        if(!state._invalidConsent){
            state._acceptedCategories = cookieValue.categories,
            state._acceptType = _getAcceptType(_getCurrentCategoriesState());
            state._enabledServices = cookieValue.services || {};
        }else{
            if(config.mode === OPT_OUT_MODE){
                _retrieveEnabledCategoriesAndServices();
            }
        }

        /**
         * Load translation before generating modals
         */
        const translationLoaded = await _loadTranslationData();

        if(!translationLoaded)
            return;

        _createCookieConsentHTML(miniAPI);

        if(config.autoShow && state._invalidConsent)
            show(true);

        // Accessibility :=> if tab pressed => trap focus inside modal
        _handleFocusTrap({hidePreferences});

        // If consent is valid
        if(!state._invalidConsent){
            _manageExistingScripts();
            _fireEvent(globalObj._customEvents._onConsent);
        }else{
            if(config.mode === OPT_OUT_MODE){
                _log('CookieConsent [CONFIG] mode=\'' + config.mode + '\', default enabled categories:', state._defaultEnabledCategories);
                _manageExistingScripts(state._defaultEnabledCategories);
            }
        }
    }
};

/**
 * Reset cookieconsent.
 * @param {boolean} eraseCookie Delete plugin's cookie
 * @returns void
 */
export const reset = (eraseCookie) => {

    const dom = globalObj._dom;
    const cookie = globalObj._config.cookie;

    if(eraseCookie === true)
        eraseCookies(cookie.name, cookie.path, cookie.domain);

    /**
     * Remove data-cc event listeners
     */
    globalObj._state._dataEventListeners.forEach(item => {
        item._element.removeEventListener(item._event, item._listener);
    });

    /**
     * Remove html from DOM
     */
    dom._ccMain && dom._ccMain.remove();

    /**
     * Remove any remaining classes
     */
    if(dom._htmlDom){
        _removeClass(dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
        _removeClass(dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
        _removeClass(dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
    }

    const newGlobal = new Global();

    globalObj._state = newGlobal._state;
    globalObj._dom = newGlobal._dom;
    globalObj._config = newGlobal._config;
    globalObj._callbacks = newGlobal._callbacks;
    globalObj._customEvents = newGlobal._customEvents;
};