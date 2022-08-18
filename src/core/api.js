import {
    _createNode,
    _setAttribute,
    _appendChild,
    _addClass,
    _removeClass,
    _log,
    _handleFocusTrap,
    _getCurrentCategoriesState,
    _addDataButtonListeners,
    _getModalFocusableData,
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

import { _getValidLanguageCode, _loadTranslationData } from '../utils/language';

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
        var states = [];

        for(var toggleName in toggles){
            if(toggles[toggleName].checked){
                states.push(toggles[toggleName].value);
            }
        }
        return states;
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
                if(_elContains(globalObj._state._allCategoryNames, categories[i]))
                    categoriesToAccept.push(categories[i]);
            }
        }else if(typeof categories === 'string'){
            if(categories === 'all')
                categoriesToAccept = globalObj._state._allCategoryNames.slice();
            else{
                if(_elContains(globalObj._state._allCategoryNames, categories))
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
    for(i=0; i<globalObj._state._readOnlyCategories.length; i++){
        if(!_elContains(categoriesToAccept, globalObj._state._readOnlyCategories[i]))
            categoriesToAccept.push(globalObj._state._readOnlyCategories[i]);
    }

    /**
     * Keep globalObj._state._acceptedCategories array updated
     */
    globalObj._state._acceptedCategories = categoriesToAccept;

    _updateAcceptType();

    if(!customAcceptType) globalObj._state._customServicesSelection = {};

    /**
     * Save previously enabled services to calculate later on which of them was changed
     */
    globalObj._state._lastEnabledServices = _shallowCopy(globalObj._state._enabledServices);


    globalObj._state._allCategoryNames.forEach(categoryName => {

        var categoryServices = globalObj._dom._serviceCheckboxInputs[categoryName];

        /**
         * Stop here if there are no services
         */
        if(_getKeys(categoryServices).length === 0) return;

        const services = globalObj._state._allDefinedServices[categoryName];
        const serviceNames = _getKeys(services);

        globalObj._state._enabledServices[categoryName] = [];

        // If category is marked as readOnly => enable all its services
        if(_elContains(globalObj._state._readOnlyCategories, categoryName)){
            serviceNames.forEach(serviceName => {
                globalObj._state._enabledServices[categoryName].push(serviceName);
            });
        }else{
            if(globalObj._state._acceptType === 'all'){
                if(
                    customAcceptType
                    && !!globalObj._state._customServicesSelection[categoryName]
                    && globalObj._state._customServicesSelection[categoryName].length > 0
                ){
                    globalObj._state._customServicesSelection[categoryName].forEach(serviceName => {
                        globalObj._state._enabledServices[categoryName].push(serviceName);
                    });
                }else{
                    serviceNames.forEach(serviceName => {
                        globalObj._state._enabledServices[categoryName].push(serviceName);
                    });
                }
            }else if(globalObj._state._acceptType === 'necessary'){
                globalObj._state._enabledServices[categoryName] = [];
            }else {
                if(customAcceptType && !!globalObj._state._customServicesSelection[categoryName] && globalObj._state._customServicesSelection[categoryName].length > 0){
                    globalObj._state._customServicesSelection[categoryName].forEach(serviceName => {
                        globalObj._state._enabledServices[categoryName].push(serviceName);
                    });
                }else{
                    for(let serviceName in categoryServices){
                        const serviceToggle = categoryServices[serviceName];
                        if(serviceToggle.checked){
                            globalObj._state._enabledServices[categoryName].push(serviceToggle.value);
                        }
                    }
                }
            }
        }
    });

    _saveCookiePreferences();
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
        || !_elContains(globalObj._state._allCategoryNames, category)) return false;

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
 * Update/change modal's language
 * @param {string} lang new language
 * @param {boolean} [forceUpdate] update language fields forcefully
 * @returns {Promise<boolean>}
 */
export const setLanguage = async (newLanguage, forceUpdate) => {

    /**
     * Validate language to avoid errors
     */
    var validatedLanguageCode = _getValidLanguageCode(newLanguage);

    if(newLanguage !== validatedLanguageCode) return false;

    /**
     * Set language only if it differs from current
     */
    if(validatedLanguageCode !== globalObj._state._currentLanguageCode || forceUpdate === true){

        const translationLoaded = await _loadTranslationData(validatedLanguageCode);

        if(!translationLoaded) return false;

        globalObj._state._currentLanguageCode = validatedLanguageCode;

        if(globalObj._state._consentModalExists){
            _createConsentModal({
                hide,
                acceptCategory,
                showPreferences
            });
            _addDataButtonListeners(globalObj._dom._consentModalInner, {
                show,
                hide,
                showPreferences,
                hidePreferences,
                acceptCategory
            });
        }

        _createPreferencesModal({
            hide,
            hidePreferences,
            acceptCategory
        });
        _log('CookieConsent [LANG]: current language: \'' + validatedLanguageCode + '\'');

        return true;
    }

    return false;
};

/**
 * Retrieve current user preferences (summary)
 * @returns {import("./global").UserPreferences}
 */
export const getUserPreferences = () => {
    var currentCategoriesState = !globalObj._state._invalidConsent && _getCurrentCategoriesState();

    return {
        acceptType: globalObj._state._acceptType,
        acceptedCategories: !globalObj._state._invalidConsent ? currentCategoriesState.accepted : [],
        rejectedCategories: !globalObj._state._invalidConsent ? currentCategoriesState.rejected : [],
        acceptedServices: !globalObj._state._invalidConsent ? globalObj._state._enabledServices : {},
        rejectedServices: !globalObj._state._invalidConsent ? _retrieveRejectedServices() : {}
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

    var newData = props.value,
        mode = props.mode,
        set = false;

    /**
     * If mode is 'update':
     * add/update only the specified props.
     */
    if(mode === 'update'){
        globalObj._state._cookieData = getCookie('data');
        var sameType = typeof globalObj._state._cookieData === typeof newData;

        if(sameType && typeof globalObj._state._cookieData === 'object'){
            !globalObj._state._cookieData && (globalObj._state._cookieData = {});

            for(var prop in newData){
                if(globalObj._state._cookieData[prop] !== newData[prop]){
                    globalObj._state._cookieData[prop] = newData[prop];
                    set = true;
                }
            }
        }else if((sameType || !globalObj._state._cookieData) && globalObj._state._cookieData !== newData){
            globalObj._state._cookieData = newData;
            set = true;
        }
    }else{
        globalObj._state._cookieData = newData;
        set = true;
    }

    if(set){
        globalObj._state._savedCookieContent.data = globalObj._state._cookieData;
        _setCookie(globalObj._config.cookie.name, JSON.stringify(globalObj._state._savedCookieContent), true);
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
    var cookie = _parseCookie(_getSingleCookie(cookieName || globalObj._config.cookie.name, true));
    return field ? cookie[field] : cookie;
};

/**
 * Return configuration object or just one of its fields.
 * @param {string} field
 * @returns {any}
 */
export const getConfig = (field) => {
    return field
        ? globalObj._config[field] || globalObj._state._userConfig[field]
        : {...globalObj._config, ...globalObj._state._userConfig, cookie:{...globalObj._config.cookie}};
};

/**
 * Show cookie consent modal
 * @param {boolean} [createModal] create modal if it doesn't exist
 */
export const show = (createModal) => {

    if(createModal && !globalObj._state._consentModalExists){
        _createConsentModal({
            hide,
            acceptCategory,
            showPreferences
        });
        _getModalFocusableData();
        _addDataButtonListeners(globalObj._dom._consentModal, {
            show,
            hide,
            showPreferences,
            hidePreferences,
            acceptCategory
        });
    }

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
    if(globalObj._state._preferencesModalVisible) return;

    _addClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    _setAttribute(globalObj._dom._pm, 'aria-hidden', 'false');
    globalObj._state._preferencesModalVisible = true;

    setTimeout(()=>{
        globalObj._state._preferencesModalVisibleDelayed = true;
    }, 1);

    /**
     * Set focus to the first focusable element inside preferences modal
     */
    setTimeout(() => {
        // If there is no consent-modal, keep track of the last focused elem.
        if(!globalObj._state._consentModalVisible){
            globalObj._state._lastFocusedElemBeforeModal = globalObj._dom._document.activeElement;
        }else{
            globalObj._state._lastFocusedModalElement = globalObj._dom._document.activeElement;
        }

        if (globalObj._state._pmFocusableElements.length === 0) return;

        globalObj._state._pmFocusableElements[0].focus();

        globalObj._state._currentModalFocusableElements = globalObj._state._pmFocusableElements;
    }, 200);

    _log('CookieConsent [TOGGLE]: show preferencesModal');

    _fireEvent(globalObj._customEvents._onModalShow, PREFERENCES_MODAL_NAME);
};

/**
 * Hide preferences modal
 */
export const hidePreferences = () => {

    if(!globalObj._state._preferencesModalVisible) return;

    _removeClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    globalObj._state._preferencesModalVisible = false;
    _setAttribute(globalObj._dom._pm, 'aria-hidden', 'true');

    setTimeout(()=>{
        globalObj._state._preferencesModalVisibleDelayed = false;
    }, 1);

    /**
     * If consent modal is visible, focus him (instead of page document)
     */
    if(globalObj._state._consentModalVisible){
        globalObj._state._lastFocusedModalElement && globalObj._state._lastFocusedModalElement.focus();
        globalObj._state._currentModalFocusableElements = globalObj._state._cmFocusableElements;
    }else{
        /**
         * Restore focus to last page element which had focus before modal opening
         */
        globalObj._state._lastFocusedElemBeforeModal && globalObj._state._lastFocusedElemBeforeModal.focus();
        globalObj._state._currentModalFocusableElements = [];
    }

    globalObj._state._clickedInsideModal = false;

    _log('CookieConsent [TOGGLE]: hide preferencesModal');

    _fireEvent(globalObj._customEvents._onModalHide, PREFERENCES_MODAL_NAME);
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
 * Returns true if consent is valid
 * @returns {boolean}
 */
export const validConsent = () => {
    return !globalObj._state._invalidConsent;
};

/**
 * Will run once and only if modals do not exist.
 * @param {import("./global").UserConfig} conf
 */
export const run = async (conf) => {
    if(!globalObj._dom._ccMain){

        // configure all parameters
        _setConfig(conf);

        // Don't run plugin if bot is detected
        if(globalObj._state._botAgentDetected) return;

        // Retrieve cookie value (if set)
        globalObj._state._savedCookieContent = _parseCookie(_getSingleCookie(globalObj._config.cookie.name, true));

        // Retrieve "_consentId"
        globalObj._state._consentId = globalObj._state._savedCookieContent.consentId;

        // If "_consentId" is present => assume that consent was previously given
        var cookieConsentAccepted = globalObj._state._consentId !== undefined;

        // Retrieve "_consentTimestamp"
        globalObj._state._consentTimestamp = globalObj._state._savedCookieContent.consentTimestamp;
        globalObj._state._consentTimestamp && (globalObj._state._consentTimestamp = new Date(globalObj._state._consentTimestamp));

        // Retrieve "_lastConsentTimestamp"
        globalObj._state._lastConsentTimestamp = globalObj._state._savedCookieContent.lastConsentTimestamp;
        globalObj._state._lastConsentTimestamp && (globalObj._state._lastConsentTimestamp = new Date(globalObj._state._lastConsentTimestamp));

        // Retrieve "data"
        var dataTemp = globalObj._state._savedCookieContent.data;
        globalObj._state._cookieData = typeof dataTemp !== 'undefined' ? dataTemp : null;

        // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
        if(globalObj._state._revisionEnabled && cookieConsentAccepted && globalObj._state._savedCookieContent.revision !== globalObj._config.revision)
            globalObj._state._validRevision = false;

        // If consent is not valid => create consent modal
        globalObj._state._consentModalExists = globalObj._state._invalidConsent = (!cookieConsentAccepted || !globalObj._state._validRevision || !globalObj._state._consentTimestamp || !globalObj._state._lastConsentTimestamp || !globalObj._state._consentId);

        _log('CookieConsent [STATUS] valid consent:', !globalObj._state._invalidConsent);

        /**
         * Retrieve last accepted categories from cookie
         * and calculate acceptType
         */
        if(!globalObj._state._invalidConsent){
            globalObj._state._acceptedCategories = globalObj._state._savedCookieContent.categories,
            globalObj._state._acceptType = _getAcceptType(_getCurrentCategoriesState());
            globalObj._state._enabledServices = globalObj._state._savedCookieContent.services || {};
        }else{
            if(globalObj._config.mode === OPT_OUT_MODE){
                _retrieveEnabledCategoriesAndServices();
            }
        }

        /**
         * Load translation before generating modals
         */
        const translationLoaded = await _loadTranslationData(null);
        if(!translationLoaded) return;

        // Generate cookie-preferences dom (& consent modal)
        _createCookieConsentHTML({
            hide,
            hidePreferences,
            acceptCategory,
            showPreferences
        });

        _getModalFocusableData();

        _addDataButtonListeners(null, {
            show,
            hide,
            showPreferences,
            hidePreferences,
            acceptCategory
        });

        if(globalObj._config.autoShow && globalObj._state._consentModalExists)
            show();

        // Add class to enable animations/transitions
        setTimeout(() => {_addClass(globalObj._dom._ccMain, 'c--anim');}, 100);

        // Accessibility :=> if tab pressed => trap focus inside modal
        _handleFocusTrap({hidePreferences});

        // If consent is valid
        if(!globalObj._state._invalidConsent){
            _manageExistingScripts();
            _fireEvent(globalObj._customEvents._onConsent);
        }else{
            if(globalObj._config.mode === OPT_OUT_MODE){
                _log('CookieConsent [CONFIG] mode=\'' + globalObj._config.mode + '\', default enabled categories:', globalObj._state._defaultEnabledCategories);
                _manageExistingScripts(globalObj._state._defaultEnabledCategories);
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

    if(!globalObj._init) return;

    globalObj._init = false;

    if(eraseCookie === true){
        eraseCookies(globalObj._config.cookie.name, globalObj._config.cookie.path, globalObj._config.cookie.domain);
    }

    globalObj._dom._ccMain && globalObj._dom._ccMain.remove();
    _removeClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
    _removeClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    _removeClass(globalObj._dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);

    const newGlobal = new Global();

    globalObj._state = newGlobal._state;
    globalObj._dom = newGlobal._dom;
    globalObj._config = newGlobal._config;
    globalObj._callbacks = newGlobal._callbacks;
    globalObj._customEvents = newGlobal._customEvents;
};