import { globalObj } from '../core/global';
import { OPT_OUT_MODE, OPT_IN_MODE } from './constants';
import { manageExistingScripts } from './scripts';

import {
    _log,
    indexOf,
    uuidv4,
    getRemainingExpirationTimeMS,
    getExpiresAfterDaysValue,
    elContains,
    deepCopy,
    fireEvent,
    arrayDiff
} from './general';

/**
 * Delete all cookies which are unused (based on selected preferences)
 * @param {boolean} [clearOnFirstConsent]
 */
export const autoclearCookiesHelper = (clearOnFirstConsent) => {

    const state = globalObj._state;
    const allCookiesArray = getAllCookies();

    // reset reload state
    state._reloadPage = false;

    let categoriesToCheck = clearOnFirstConsent
        ? state._allCategoryNames
        : state._lastChangedCategoryNames;

    /**
     * Filter out categories with readOnly=true or don't have an autoClear object
     */
    categoriesToCheck = categoriesToCheck.filter((categoryName) => {
        let currentCategoryObject = state._allDefinedCategories[categoryName];

        /**
         * Make sure that:
         *  category != falsy
         *  readOnly = falsy
         *  autoClear = truthy (assuming that it is a valid object)
         */
        return(
            !!currentCategoryObject
            && !currentCategoryObject.readOnly
            && !!currentCategoryObject.autoClear
        );
    });

    for(const currentCategoryName of categoriesToCheck){

        const
            category = state._allDefinedCategories[currentCategoryName],
            autoClear = category.autoClear,
            autoClearCookies = autoClear?.cookies || [],

            categoryWasJustChanged = elContains(state._lastChangedCategoryNames, currentCategoryName),
            categoryIsDisabled = !elContains(state._acceptedCategories, currentCategoryName),
            categoryWasJustDisabled = categoryWasJustChanged && categoryIsDisabled;

        if(
            (clearOnFirstConsent && categoryIsDisabled) ||
            (!clearOnFirstConsent && categoryWasJustDisabled)
        ){

            // check if page needs to be reloaded after autoClear (if category was just disabled)
            if(autoClear.reloadPage === true && categoryWasJustDisabled)
                state._reloadPage = true;

            for(const cookieItem of autoClearCookies){

                /**
                 * List of all cookies matching the current cookie name
                 * @type {string[]}
                 */
                let foundCookies = [];

                const
                    cookieItemName = cookieItem.name,
                    cookieItemDomain = cookieItem.domain,
                    cookieItemPath = cookieItem.path;

                // If regex provided => filter array of cookies
                if(cookieItemName instanceof RegExp){
                    for(let cookie of allCookiesArray){
                        if(cookieItemName.test(cookie))
                            foundCookies.push(cookie);
                    }
                }else{
                    let foundCookieIndex = indexOf(allCookiesArray, cookieItemName);

                    if(foundCookieIndex > -1)
                        foundCookies.push(allCookiesArray[foundCookieIndex]);
                }

                _log('CookieConsent [AUTOCLEAR]: search cookie: "' + cookieItemName + '", found:', foundCookies);

                // Delete cookie(s)
                if(foundCookies.length > 0)
                    eraseCookiesHelper(foundCookies, cookieItemPath, cookieItemDomain);
            }
        }
    }
};


export const saveCookiePreferences = () => {

    const state = globalObj._state;

    /**
     * Determine if categories were changed from last state (saved in the cookie)
     */
    if(globalObj._config.mode === OPT_OUT_MODE && state._invalidConsent){
        state._lastChangedCategoryNames = arrayDiff(
            state._defaultEnabledCategories,
            state._acceptedCategories
        );
    }else{
        state._lastChangedCategoryNames = arrayDiff(
            state._acceptedCategories,
            state._savedCookieContent.categories
        );
    }

    let categoriesWereChanged = state._lastChangedCategoryNames.length > 0,
        servicesWereChanged = false;

    /**
     * Determine if services were changed from last state
     */
    for(const categoryName of state._allCategoryNames){

        state._lastChangedServices[categoryName] = arrayDiff(
            state._acceptedServices[categoryName],
            state._lastEnabledServices[categoryName]
        );

        if(state._lastChangedServices[categoryName].length > 0)
            servicesWereChanged = true;
    }

    const categoryToggles = globalObj._dom._categoryCheckboxInputs;

    /**
     * If the category is accepted check checkbox,
     * otherwise uncheck it
     */
    for(let categoryName in categoryToggles){
        categoryToggles[categoryName].checked = elContains(state._acceptedCategories, categoryName);
    }

    for(const categoryName of state._allCategoryNames){

        const servicesToggles = globalObj._dom._serviceCheckboxInputs[categoryName];
        const enabledServices = state._acceptedServices[categoryName];

        for(const serviceName in servicesToggles){
            const serviceInput = servicesToggles[serviceName];
            serviceInput.checked = elContains(enabledServices, serviceName);
        }
    }


    if(!state._consentTimestamp)
        state._consentTimestamp = new Date();

    if(!state._consentId)
        state._consentId = uuidv4();

    state._savedCookieContent = {
        categories: deepCopy(state._acceptedCategories),
        revision: globalObj._config.revision,
        data: state._cookieData,
        consentTimestamp: state._consentTimestamp.toISOString(),
        consentId: state._consentId,
        services: deepCopy(state._acceptedServices)
    };

    let firstUserConsent = false;

    if(state._invalidConsent || categoriesWereChanged || servicesWereChanged){

        /**
         * Set consent as valid
         */
        if(state._invalidConsent) {
            state._invalidConsent = false;
            firstUserConsent = true;
        }


        if(!state._lastConsentTimestamp)
            state._lastConsentTimestamp = state._consentTimestamp;
        else
            state._lastConsentTimestamp = new Date();

        state._savedCookieContent.lastConsentTimestamp = state._lastConsentTimestamp.toISOString();

        setCookie();

        /**
         * Clear cookies:
         * - on first consent
         * - on category change (consent must be valid)
         */
        if(globalObj._config.autoClearCookies && (firstUserConsent || (!state._invalidConsent && categoriesWereChanged)))
            autoclearCookiesHelper(firstUserConsent);

        manageExistingScripts();
    }

    if(firstUserConsent){

        fireEvent(globalObj._customEvents._onFirstConsent);
        fireEvent(globalObj._customEvents._onConsent);

        if(globalObj._config.mode === OPT_IN_MODE)
            return;
    }

    if(categoriesWereChanged || servicesWereChanged)
        fireEvent(globalObj._customEvents._onChange);

    /**
     * Reload page if needed
     */
    if(state._reloadPage)
        location.reload();
};

/**
 * Set cookie, by specifying name and value
 * @param {boolean} [useRemainingExpirationTime]
 */
export const setCookie = (useRemainingExpirationTime) => {

    const {hostname, protocol} = location;
    const {name, path, domain, sameSite} = globalObj._config.cookie;

    /**
     * Encode value (RFC compliant)
     */
    const cookieValue = encodeURIComponent(JSON.stringify(globalObj._state._savedCookieContent));

    const expiresAfterMs = useRemainingExpirationTime
        ? getRemainingExpirationTimeMS()
        : getExpiresAfterDaysValue()*86400000;

    /**
     * Expiration date
     */
    const date = new Date();
    date.setTime(date.getTime() + expiresAfterMs);

    let cookieStr = name + '='
        + cookieValue
        + (expiresAfterMs !== 0 ? '; expires=' + date.toUTCString() : '')
        + '; Path=' + path
        + '; SameSite=' + sameSite;

    /**
     * Set "domain" only if hostname contains a dot (e.g domain.com)
     * to ensure that cookie works with 'localhost'
     */
    if(elContains(hostname, '.'))
        cookieStr += '; Domain=' + domain;

    if(protocol === 'https:')
        cookieStr += '; Secure';

    document.cookie = cookieStr;

    _log('CookieConsent [SET_COOKIE]: ' + name + ':', globalObj._state._savedCookieContent);
};

/**
 * Parse cookie value using JSON.parse
 * @param {string} value
 */
export const parseCookie = (value) => {
    let parsedValue;

    try{
        parsedValue = JSON.parse(decodeURIComponent(value));
    }catch(e){
        parsedValue = {}; // Cookie value is not valid
    }

    return parsedValue;
};

/**
 * Delete cookie by name & path
 * @param {string[]} cookies Array of cookie names
 * @param {string} [customPath]
 * @param {string} [customDomain]
 */
export const eraseCookiesHelper = (cookies, customPath, customDomain) => {

    const
        domain = customDomain || globalObj._config.cookie.domain,
        path = customPath || globalObj._config.cookie.path,
        isWwwSubdomain = domain.slice(0, 4) === 'www.',
        mainDomain = isWwwSubdomain && domain.substring(4);

    /**
     * Helper function to erase cookie
     * @param {string} cookie
     * @param {string} [domain]
     */
    const erase = (cookie, domain) => {
        document.cookie = cookie + '='
            + '; path=' + path
            + (domain ? '; domain=.' + domain : '')
            + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    for(const cookieName of cookies){

        /**
         * 2 attempts to erase the cookie:
         * - without domain
         * - with domain
         */
        erase(cookieName);
        erase(cookieName, domain);

        /**
         * If domain starts with 'www.',
         * also erase the cookie for the
         * main domain (without www)
         */
        if(isWwwSubdomain)
            erase(cookieName, mainDomain);

        _log('CookieConsent [AUTOCLEAR]: deleting cookie: "' + cookieName + '" path: "' + path + '" domain:', domain);
    }
};

/**
 * Get plugin cookie
 * @param {string} [customName]
 * @returns {string} cookie value
 */
export const getPluginCookie = (customName) => {
    return parseCookie(getSingleCookie(customName || globalObj._config.cookie.name, true));
};

/**
 * Returns the cookie name/value, if it exists
 * @param {string} name
 * @param {boolean} getValue
 * @returns {string}
 */
export const getSingleCookie = (name, getValue) => {
    const found = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');

    return found
        ? (getValue ? found.pop() : name)
        : '';
};

/**
 * Returns array with all the cookie names
 * @param {RegExp} regex
 * @returns {string[]}
 */
export const getAllCookies = (regex) => {

    const allCookies = document.cookie.split(/;\s*/);

    /**
     * @type {string[]}
     */
    const cookieNames = [];

    /**
     * Save only the cookie names
     */
    for(const cookie of allCookies){
        let name = cookie.split('=')[0];

        if(regex){
            try{
                regex.test(name) && cookieNames.push(name);
            // eslint-disable-next-line no-empty
            }catch(e){}
        }else{
            cookieNames.push(name);
        }
    }

    return cookieNames;
};