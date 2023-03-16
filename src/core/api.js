import {
    createNode,
    setAttribute,
    appendChild,
    addClass,
    removeClass,
    _log,
    getCurrentCategoriesState,
    elContains,
    setAcceptedCategories,
    isString,
    retrieveRejectedServices,
    isArray,
    isObject,
    getModalFocusableData,
    getActiveElement,
    resolveEnabledCategories,
    resolveEnabledServices,
    updateModalToggles,
    toggleDisableInteraction,
    fireEvent,
    getKeys,
    deepCopy
} from '../utils/general';

import { manageExistingScripts, retrieveEnabledCategoriesAndServices } from '../utils/scripts';

import {
    globalObj,
    GlobalState
} from './global';

//{{START: GUI}}

import {
    createConsentModal,
    createPreferencesModal,
    generateHtml,
    createMainContainer
} from './modals/index';

import {
    getCurrentLanguageCode,
    handleRtlLanguage,
    loadTranslationData,
    setCurrentLanguageCode,
    validLanguageCode
} from '../utils/language';

//{{END: GUI}}

import {
    setCookie,
    eraseCookiesHelper,
    saveCookiePreferences,
    getSingleCookie,
    getPluginCookie,
    getAllCookies
} from '../utils/cookies';

import { setConfig } from './config-init';

import {
    TOGGLE_CONSENT_MODAL_CLASS,
    TOGGLE_DISABLE_INTERACTION_CLASS,
    TOGGLE_PREFERENCES_MODAL_CLASS,
    OPT_OUT_MODE,
    CONSENT_MODAL_NAME,
    ARIA_HIDDEN,
    PREFERENCES_MODAL_NAME
} from '../utils/constants';

/**
 * Accept API
 * @param {string[]|string} categories - Categories to accept
 * @param {string[]} [excludedCategories]
 */
export const acceptCategory = (categories, excludedCategories = []) => {
    resolveEnabledCategories(categories, excludedCategories);
    resolveEnabledServices();
    saveCookiePreferences();
};

/**
 * Returns true if cookie category is accepted
 * @param {string} category
 */
export const acceptedCategory = (category) => {

    const acceptedCategories = !globalObj._state._invalidConsent
        ? globalObj._state._acceptedCategories
        : [];

    return elContains(acceptedCategories, category);
};

/**
 * Accept one or multiple services under a specific category
 * @param {string|string[]} service
 * @param {string} category
 */
export const acceptService = (service, category) => {

    const { _allCategoryNames, _allDefinedServices,  } = globalObj._state;

    if(
        !service
        || !category
        || !isString(category)
        || !elContains(_allCategoryNames, category)
        || getKeys(_allDefinedServices[category]).length === 0
    ) {
        return false;
    }

    updateModalToggles(service, category);
    acceptCategory();
};

/**
 * Returns true if the service in the specified
 * category is accepted/enabled
 * @param {string} service
 * @param {string} category
 */
export const acceptedService = (service, category) => {
    const acceptedServices = !globalObj._state._invalidConsent
        ? globalObj._state._acceptedServices[category]
        : [];

    return elContains(acceptedServices, service);
};

/**
 * Returns true if cookie was found and has valid value (not an empty string)
 * @param {string} cookieName
 */
export const validCookie = (cookieName) => getSingleCookie(cookieName, true) !== '';

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
        if(isString(cookieName)){
            let name = getSingleCookie(cookieName);
            name !== '' && allCookies.push(name);
        }else{
            allCookies.push(...getAllCookies(cookieName));
        }
    };

    if(isArray(cookies)){
        for(let cookie of cookies){
            addCookieIfExists(cookie);
        }
    }else{
        addCookieIfExists(cookies);
    }

    eraseCookiesHelper(allCookies, path, domain);
};

//{{START: GUI}}

/**
 * Show cookie consent modal
 * @param {boolean} [createModal] create modal if it doesn't exist
 */
export const show = (createModal) => {

    const { _dom, _state } = globalObj;

    if(createModal && !_state._consentModalExists)
        createConsentModal(miniAPI, createMainContainer);

    if(_state._consentModalExists){
        _state._consentModalVisible = true;

        if(_state._disablePageInteraction)
            toggleDisableInteraction(true);

        addClass(_dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
        setAttribute(_dom._cm, ARIA_HIDDEN, 'false');

        setTimeout(() => {
            _state._lastFocusedElemBeforeModal = getActiveElement();
            _state._currentModalFocusableElements = _state._cmFocusableElements;
        }, 200);

        _log('CookieConsent [TOGGLE]: show consentModal');

        fireEvent(globalObj._customEvents._onModalShow, CONSENT_MODAL_NAME);
    }
};

/**
 * Hide consent modal
 */
export const hide = () => {

    const { _dom, _state, _customEvents } = globalObj;

    if(_state._consentModalExists){
        _state._consentModalVisible = false;
        _state._shouldHandleFirstTab = true;

        if(_state._disablePageInteraction)
            toggleDisableInteraction();

        removeClass(_dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
        setAttribute(_dom._cm, ARIA_HIDDEN, 'true');

        setTimeout(() => {
            // restore focus to the last focused element
            // _state._lastFocusedElemBeforeModal.focus();
            _state._currentModalFocusableElements = [];
        }, 200);

        _log('CookieConsent [TOGGLE]: hide consentModal');

        fireEvent(_customEvents._onModalHide, CONSENT_MODAL_NAME);
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
        createPreferencesModal(miniAPI, createMainContainer);

    addClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    setAttribute(globalObj._dom._pm, ARIA_HIDDEN, 'false');
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
            state._lastFocusedElemBeforeModal = getActiveElement();
        }else{
            state._lastFocusedModalElement = getActiveElement();
        }

        if (state._pmFocusableElements.length === 0)
            return;

        state._pmFocusableElements[0].focus();

        state._currentModalFocusableElements = state._pmFocusableElements;
    }, 200);

    _log('CookieConsent [TOGGLE]: show preferencesModal');

    fireEvent(globalObj._customEvents._onModalShow, PREFERENCES_MODAL_NAME);
};

/**
 * Hide preferences modal
 */
export const hidePreferences = () => {

    const state = globalObj._state;

    if(!state._preferencesModalVisible)
        return;

    removeClass(globalObj._dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
    setAttribute(globalObj._dom._pm, ARIA_HIDDEN, 'true');

    state._preferencesModalVisible = false;
    state._shouldHandleFirstTab = true;

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
        //state._lastFocusedElemBeforeModal && state._lastFocusedElemBeforeModal.focus();
        state._currentModalFocusableElements = [];
    }

    state._clickedInsideModal = false;

    _log('CookieConsent [TOGGLE]: hide preferencesModal');

    fireEvent(globalObj._customEvents._onModalHide, PREFERENCES_MODAL_NAME);
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

    if(!validLanguageCode(newLanguageCode))
        return false;

    const state = globalObj._state;

    /**
     * Set language only if it differs from current
     */
    if(newLanguageCode !== getCurrentLanguageCode() || forceUpdate === true){

        const loaded = await loadTranslationData(newLanguageCode);

        if(!loaded)
            return false;

        setCurrentLanguageCode(newLanguageCode);

        if(state._consentModalExists)
            createConsentModal(miniAPI, createMainContainer);

        if(state._preferencesModalExists)
            createPreferencesModal(miniAPI, createMainContainer);

        handleRtlLanguage();
        getModalFocusableData();

        return true;
    }

    return false;
};

//{{END: GUI}}

/**
 * Retrieve current user preferences (summary)
 * @returns {import("./global").UserPreferences}
 */
export const getUserPreferences = () => {

    const { _acceptType, _acceptedServices } = globalObj._state;
    const { accepted, rejected } = getCurrentCategoriesState();

    return deepCopy({
        acceptType: _acceptType,
        acceptedCategories: accepted,
        rejectedCategories: rejected,
        acceptedServices: _acceptedServices,
        rejectedServices: retrieveRejectedServices()
    });
};

/**
 * Dynamically load script (append to head)
 * @param {string} src
 * @param {{[key: string]: string}} [attrs] Custom attributes
 * @returns {Promise<boolean>} promise
 */
export const loadScript = (src, attrs) => {

    /**
     * @type {HTMLScriptElement}
     */
    let script = document.querySelector('script[src="' + src + '"]');

    return new Promise((resolve) => {

        if(script)
            return resolve(true);

        script = createNode('script');

        /**
         * Add custom attributes
         */
        if(isObject(attrs)){
            for(const key in attrs){
                setAttribute(script, key, attrs[key]);
            }
        }

        script.onload = () => resolve(true);
        script.onerror = () => {
            /**
             * Remove script from dom if error is thrown
             */
            script.remove();
            resolve(false);
        };

        script.src = src;

        appendChild(document.head, script);
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
        state._cookieData = cookieData = getCookie('data');
        const sameType = typeof cookieData === typeof newData;

        if(sameType && typeof cookieData === 'object'){
            !cookieData && (cookieData = {});

            for(let prop in newData){
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
        setCookie(true);
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
    const cookie = getPluginCookie(cookieName);

    return field
        ? cookie[field]
        : cookie;
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
export const validConsent = () => !globalObj._state._invalidConsent;

const retrieveState = () => {

    const state = globalObj._state;
    const config = globalObj._config;

    /**
     * @type {import('./global').CookieValue}
     */
    const cookieValue = getPluginCookie();

    const {
        categories,
        services,
        consentId,
        consentTimestamp,
        lastConsentTimestamp,
        data,
        revision
    } = cookieValue;

    const validCategories = isArray(categories);

    state._savedCookieContent = cookieValue;
    state._consentId = consentId;

    // If "_consentId" is present => assume that consent was previously given
    const validConsentId = !!consentId && isString(consentId);

    // Retrieve "_consentTimestamp"
    state._consentTimestamp = consentTimestamp;
    state._consentTimestamp && (state._consentTimestamp = new Date(consentTimestamp));

    // Retrieve "_lastConsentTimestamp"
    state._lastConsentTimestamp = lastConsentTimestamp;
    state._lastConsentTimestamp && (state._lastConsentTimestamp = new Date(lastConsentTimestamp));

    // Retrieve "data"
    state._cookieData = typeof data !== 'undefined'
        ? data
        : null;

    // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
    if(state._revisionEnabled && validConsentId && revision !== config.revision)
        state._validRevision = false;

    // If consent is not valid => create consent modal
    state._invalidConsent = !validConsentId
        || !state._validRevision
        || !state._consentTimestamp
        || !state._lastConsentTimestamp
        || !validCategories;

    _log('CookieConsent [STATUS] valid consent:', !state._invalidConsent);

    /**
     * Retrieve last accepted categories from cookie
     * and calculate acceptType
     */
    if(!state._invalidConsent){

        state._acceptedServices = {
            ...state._acceptedServices,
            ...services
        };

        setAcceptedCategories([
            ...state._readOnlyCategories,
            ...categories
        ]);
    }else{
        if(config.mode === OPT_OUT_MODE) {
            retrieveEnabledCategoriesAndServices();

            state._acceptedCategories = [
                ...state._defaultEnabledCategories
            ];
        }
    }

    state._enabledServices = {...state._acceptedServices};
};

/**
 * Will run once and only if modals do not exist.
 * @param {import("./global").UserConfig} userConfig
 */
export const run = async (userConfig) => {

    const {
        _state,
        _config,
        _customEvents
    } = globalObj;

    const win = window;

    if(!win._ccRun){
        win._ccRun = true;

        setConfig(userConfig);

        if(_state._botAgentDetected)
            return;

        retrieveState(userConfig);

        const consentIsValid = validConsent();

        //{{START: GUI}}

        const translationLoaded = await loadTranslationData();

        if(!translationLoaded)
            return false;

        await generateHtml(miniAPI);

        if(_config.autoShow && !consentIsValid)
            show(true);

        //{{END: GUI}}

        if(consentIsValid){
            manageExistingScripts();
            return fireEvent(_customEvents._onConsent);
        }

        if(_config.mode === OPT_OUT_MODE)
            manageExistingScripts(_state._defaultEnabledCategories);
    }
};

/**
 * Reset cookieconsent.
 * @param {boolean} [deleteCookie] Delete plugin's cookie
 */
export const reset = (deleteCookie) => {

    //{{START: GUI}}
    const { _ccMain, _htmlDom } = globalObj._dom;
    //{{END: GUI}}

    const { name, path, domain } = globalObj._config.cookie;

    deleteCookie && eraseCookies(name, path, domain);

    /**
     * Remove data-cc event listeners
     */
    for(const {_element, _event, _listener} of globalObj._state._dataEventListeners){
        _element.removeEventListener(_event, _listener);
    }

    //{{START: GUI}}

    /**
     * Remove main container from DOM
     */
    _ccMain?.remove();

    /**
     * Remove any remaining classes
     */
    _htmlDom?.classList.remove(
        TOGGLE_DISABLE_INTERACTION_CLASS,
        TOGGLE_PREFERENCES_MODAL_CLASS,
        TOGGLE_CONSENT_MODAL_CLASS
    );

    //{{END: GUI}}

    const newGlobal = new GlobalState();

    /**
     * Reset all global state props.
     */
    for(const key in globalObj){
        globalObj[key] = newGlobal[key];
    }

    window._ccRun = false;
};