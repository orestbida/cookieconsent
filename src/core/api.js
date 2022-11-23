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
    getKeys,
    retrieveRejectedServices,
    isArray,
    unique,
    getModalFocusableData,
    getActiveElement
} from '../utils/general';

import { manageExistingScripts, retrieveEnabledCategoriesAndServices } from '../utils/scripts';

import {
    fireEvent,
    globalObj,
    GlobalState,
    deepCopy
} from './global';

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
    OPT_IN_MODE,
    CONSENT_MODAL_NAME,
    ARIA_HIDDEN,
    PREFERENCES_MODAL_NAME
} from '../utils/constants';

/**
 * @param {HTMLInputElement} input
 */
const dispatchChangeEvent = (input) => input.dispatchEvent(new Event('change'));



/**
 * Get all enabled categories
 * @returns {string[]}
 */
const retrieveCurrentlyEnabledCategories = () => {
    const state = globalObj._state;
    const toggles = globalObj._dom._categoryCheckboxInputs;

    let enabledCategories = [];

    if(toggles){
        for(let categoryName in toggles){
            if(toggles[categoryName].checked){
                enabledCategories.push(categoryName);
            }
        }
    }else if(!state._invalidConsent){
        enabledCategories = state._savedCookieContent.categories;
    }

    for(let categoryName in state._customServicesSelection) {
        if(state._customServicesSelection[categoryName].length > 0){
            enabledCategories.push(categoryName);
        }
    }

    return enabledCategories;
};

/**
 * Accept API
 * @param {string[]|string} categories - Categories to accept
 * @param {string[]} [excludedCategories]
 */
export const acceptCategory = (categories, excludedCategories = []) => {

    const state = globalObj._state;
    const allCategoryNames = state._allCategoryNames;

    let customServicesSelection = false;

    /**
     * @type {string[]}
     */
    let categoriesToAccept = [];

    if(!categories){
        categoriesToAccept = retrieveCurrentlyEnabledCategories();
        customServicesSelection = true;
    }else{

        if(isArray(categories)){
            categoriesToAccept.push(...categories);
        }

        if(isString(categories)){
            if(categories === 'all')
                categoriesToAccept.push(...allCategoryNames);
            else
                categoriesToAccept.push(categories);
        }
    }

    // Remove invalid and excluded categories
    categoriesToAccept = categoriesToAccept.filter(category =>
        !elContains(allCategoryNames, category) ||
        !elContains(excludedCategories, category)
    );

    // Add back all the categories set as "readonly/required"
    categoriesToAccept.push(...state._readOnlyCategories);

    setAcceptedCategories(unique(categoriesToAccept));

    if(!customServicesSelection)
        state._customServicesSelection = {};

    /**
     * Save previously enabled services to calculate later on which of them was changed
     */
    state._lastEnabledServices = deepCopy(state._enabledServices);

    for(const categoryName of state._allCategoryNames) {

        const services = state._allDefinedServices[categoryName];
        const serviceNames = getKeys(services);
        const enabledServices = state._enabledServices;

        /**
         * Stop here if there are no services
         */
        if(serviceNames.length === 0)
            continue;

        enabledServices[categoryName] = [];

        // If category is marked as readOnly => enable all its services
        if(elContains(state._readOnlyCategories, categoryName)){
            enabledServices[categoryName].push(...serviceNames);
        }else{
            if(state._acceptType === 'all'){
                if(
                    customServicesSelection
                    && !!state._customServicesSelection[categoryName]
                    && state._customServicesSelection[categoryName].length > 0
                ){
                    const selectedServices = state._customServicesSelection[categoryName];
                    enabledServices[categoryName].push(...selectedServices);
                }else{
                    enabledServices[categoryName].push(...serviceNames);
                }
            }else if(state._acceptType === 'necessary'){
                enabledServices[categoryName] = [];
            }else {
                if(
                    customServicesSelection
                    && !!state._customServicesSelection[categoryName]
                    && state._customServicesSelection[categoryName].length > 0
                ){
                    const selectedServices = state._customServicesSelection[categoryName];
                    enabledServices[categoryName].push(...selectedServices);
                }else{
                    if(elContains(state._acceptedCategories, categoryName)){
                        enabledServices[categoryName].push(...serviceNames);
                    }
                }
            }
        }

        /**
         * Make sure there are no duplicates inside array
         */
        enabledServices[categoryName] = unique(enabledServices[categoryName]);
    }

    saveCookiePreferences();
};

/**
 * Returns true if cookie category is accepted
 * @param {string} category
 */
export const acceptedCategory = (category) => {
    let categories;

    if(!globalObj._state._invalidConsent || globalObj._config.mode === OPT_IN_MODE)
        categories = getCurrentCategoriesState().accepted || [];
    else  // mode is OPT_OUT_MODE
        categories = globalObj._state._defaultEnabledCategories;

    return elContains(categories, category);
};

/**
 * Accept one or multiple services under a specific category
 * @param {string|string[]} service
 * @param {string} category
 */
export const acceptService = (service, category) => {

    const state = globalObj._state;

    if(
        !service
        || !category
        || typeof category !== 'string'
        || !elContains(state._allCategoryNames, category)
    ) {
        return false;
    }

    const servicesInputs = globalObj._dom._serviceCheckboxInputs[category] || {};
    const allServiceNames = getKeys(state._allDefinedServices[category]);

    state._customServicesSelection[category] = [];

    if(isString(service)){
        if(service === 'all'){

            for(let serviceName in servicesInputs){
                servicesInputs[serviceName].checked = true;
                dispatchChangeEvent(servicesInputs[serviceName]);
            }

            state._customServicesSelection[category] = [...allServiceNames];
        }else{

            for(let serviceName in servicesInputs){
                if(service === serviceName)
                    servicesInputs[serviceName].checked = true;
                else
                    servicesInputs[serviceName].checked = false;

                dispatchChangeEvent(servicesInputs[serviceName]);
            }

            if(elContains(allServiceNames, service))
                state._customServicesSelection[category].push(service);

        }
    }else if(isArray(service)){

        for(let serviceName in servicesInputs){
            servicesInputs[serviceName].checked = elContains(service, serviceName);

            dispatchChangeEvent(servicesInputs[serviceName]);
        }

        for(let serviceName in allServiceNames){
            if(elContains(service, serviceName))
                state._customServicesSelection[category].push(serviceName);
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
    return elContains(globalObj._state._enabledServices[category] || [], service);
};


/**
 * Returns true if cookie was found and has valid value (not an empty string)
 * @param {string} cookieName
 * @returns {boolean}
 */
export const validCookie = (cookieName) => {
    return getSingleCookie(cookieName, true) !== '';
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

let disableInteractionTimeout;

/**
 * @param {boolean} [enable]
 */
const toggleDisableInteraction = (enable) => {
    clearTimeout(disableInteractionTimeout);

    if(enable){
        addClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
    }else {
        disableInteractionTimeout = setTimeout(() => {
            removeClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
        }, 500);
    }
};

/**
 * Show cookie consent modal
 * @param {boolean} [createModal] create modal if it doesn't exist
 */
export const show = (createModal) => {

    const
        dom = globalObj._dom,
        state = globalObj._state;

    if(createModal && !state._consentModalExists)
        createConsentModal(miniAPI, createMainContainer);

    if(state._consentModalExists){
        state._consentModalVisible = true;

        if(state._disablePageInteraction)
            toggleDisableInteraction(true);

        addClass(dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
        setAttribute(dom._cm, ARIA_HIDDEN, 'false');

        setTimeout(() => {
            state._lastFocusedElemBeforeModal = getActiveElement();
            state._currentModalFocusableElements = state._cmFocusableElements;
        }, 200);

        _log('CookieConsent [TOGGLE]: show consentModal');

        fireEvent(globalObj._customEvents._onModalShow, CONSENT_MODAL_NAME);
    }
};

/**
 * Hide consent modal
 */
export const hide = () => {

    const
        dom = globalObj._dom,
        state = globalObj._state;

    if(state._consentModalExists){
        state._consentModalVisible = false;

        if(state._disablePageInteraction)
            toggleDisableInteraction();

        removeClass(dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
        setAttribute(dom._cm, ARIA_HIDDEN, 'true');

        setTimeout(() => {
            //restore focus to the last focused element
            state._lastFocusedElemBeforeModal.focus();
            state._currentModalFocusableElements = [];
        }, 200);

        _log('CookieConsent [TOGGLE]: hide consentModal');

        fireEvent(globalObj._customEvents._onModalHide, CONSENT_MODAL_NAME);
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

/**
 * Retrieve current user preferences (summary)
 * @returns {import("./global").UserPreferences}
 */
export const getUserPreferences = () => {

    const {_acceptType, _enabledService} = globalObj._state;
    const {accepted, rejected} = getCurrentCategoriesState();

    return {
        acceptType: _acceptType,
        acceptedCategories: accepted,
        rejectedCategories: rejected,
        acceptedServices: _enabledService,
        rejectedServices: retrieveRejectedServices()
    };
};

/**
 * Dynamically load script (append to head)
 * @param {string} src
 * @param {object[]} [attrs] Custom attributes
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
         * Add custom attributes (if provided)
         */
        isArray(attrs) && attrs.forEach(attr => {
            setAttribute(script, attr.name, attr.value);
        });

        script.onload = () => resolve(true);
        script.onerror = () => {
            /**
             * Remove script from dom if error is thrown
             */
            script.remove();
            resolve(false);
        };

        script.src = src;

        /**
         * Append script to head
         */
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
export const validConsent = () => {
    return !globalObj._state._invalidConsent;
};

const retrieveState = () => {

    const state = globalObj._state;
    const config = globalObj._config;

    /**
     * @type {import('./global').CookieValue}
     */
    const cookieValue = getPluginCookie();
    const categories = cookieValue.categories;
    const validCategories = isArray(categories);

    state._savedCookieContent = cookieValue;
    state._consentId = cookieValue.consentId;

    // If "_consentId" is present => assume that consent was previously given
    const validConsentId = !!state._consentId && isString(state._consentId);

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

        state._enabledServices = {
            ...state._enabledServices,
            ...cookieValue.services
        };

        setAcceptedCategories(unique([
            ...state._readOnlyCategories,
            ...cookieValue.categories
        ]));
    }else{
        if(config.mode === OPT_OUT_MODE)
            retrieveEnabledCategoriesAndServices();
    }
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
        const translationLoaded = await loadTranslationData();

        if(!translationLoaded)
            return false;

        await generateHtml(miniAPI);

        if(_config.autoShow && !consentIsValid)
            show(true);

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
 * @param {boolean} eraseCookie Delete plugin's cookie
 */
export const reset = (eraseCookie) => {

    const dom = globalObj._dom;
    const cookie = globalObj._config.cookie;

    if(eraseCookie === true)
        eraseCookies(cookie.name, cookie.path, cookie.domain);

    /**
     * Remove data-cc event listeners
     */
    for(const item of globalObj._state._dataEventListeners){
        item._element.removeEventListener(item._event, item._listener);
    }

    /**
     * Remove html from DOM
     */
    dom._ccMain && dom._ccMain.remove();

    /**
     * Remove any remaining classes
     */
    if(dom._htmlDom){
        removeClass(dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);
        removeClass(dom._htmlDom, TOGGLE_PREFERENCES_MODAL_CLASS);
        removeClass(dom._htmlDom, TOGGLE_CONSENT_MODAL_CLASS);
    }

    const newGlobal = new GlobalState();

    globalObj._state = newGlobal._state;
    globalObj._dom = newGlobal._dom;
    globalObj._config = newGlobal._config;
    globalObj._callbacks = newGlobal._callbacks;
    globalObj._customEvents = newGlobal._customEvents;

    window._ccRun = false;
};