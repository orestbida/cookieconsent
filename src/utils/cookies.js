import { globalObj } from '../core/global';
import { OPT_OUT_MODE, OPT_IN_MODE } from './constants';
import { manageExistingScripts } from './scripts';

import {
    debug,
    indexOf,
    uuidv4,
    getRemainingExpirationTimeMS,
    getExpiresAfterDaysValue,
    elContains,
    deepCopy,
    fireEvent,
    arrayDiff,
    safeRun
} from './general';
import { localStorageManager } from './localstorage';

/**
 * @param {boolean} [isFirstConsent]
 */
const getCategoriesWithCookies = (isFirstConsent) => {
    const state = globalObj._state;

    const categoriesToFilter = isFirstConsent
        ? state._allCategoryNames
        : state._lastChangedCategoryNames;

    /**
     * Filter out categories with readOnly=true or don't have an autoClear object
     */
    return categoriesToFilter.filter(categoryName => {
        const currentCategoryObject = state._allDefinedCategories[categoryName];

        return !!currentCategoryObject
            && !currentCategoryObject.readOnly
            && !!currentCategoryObject.autoClear;
    });
};

/**
 * @param {string[]} allCookies
 * @param {string} cookieName
 */
const findMatchingCookies = (allCookies, cookieName) => {
    if (cookieName instanceof RegExp) {
        return allCookies.filter(cookie => cookieName.test(cookie));
    } else {
        const cookieIndex = indexOf(allCookies, cookieName);
        return cookieIndex > -1
            ? [allCookies[cookieIndex]]
            : [];
    }
};

/**
 * Delete all unused cookies
 * @param {boolean} [isFirstConsent]
 */
export const autoclearCookiesHelper = (isFirstConsent) => {
    const state = globalObj._state;
    const allCookiesArray = getAllCookies();
    const categoriesToClear = getCategoriesWithCookies(isFirstConsent);

    /**
     * Clear cookies for each disabled service
     */
    for (const categoryName in state._lastChangedServices) {
        for (const serviceName of state._lastChangedServices[categoryName]) {
            const serviceCookies = state._allDefinedServices[categoryName][serviceName].cookies;
            const serviceIsDisabled = !elContains(state._acceptedServices[categoryName], serviceName);

            if (!serviceIsDisabled || !serviceCookies)
                continue;

            for (const cookieItem of serviceCookies) {
                const foundCookies = findMatchingCookies(allCookiesArray, cookieItem.name);
                eraseCookiesHelper(foundCookies, cookieItem.path, cookieItem.domain);
            }
        }
    }

    for (const currentCategoryName of categoriesToClear) {
        const category = state._allDefinedCategories[currentCategoryName];
        const autoClear = category.autoClear;
        const autoClearCookies = autoClear && autoClear.cookies || [];

        const categoryWasJustChanged = elContains(state._lastChangedCategoryNames, currentCategoryName);
        const categoryIsDisabled = !elContains(state._acceptedCategories, currentCategoryName);
        const categoryWasJustDisabled = categoryWasJustChanged && categoryIsDisabled;

        const shouldClearCookies = isFirstConsent
            ? categoryIsDisabled
            : categoryWasJustDisabled;

        if (!shouldClearCookies)
            continue;

        if (autoClear.reloadPage && categoryWasJustDisabled)
            state._reloadPage = true;

        for (const cookieItem of autoClearCookies) {
            const foundCookies = findMatchingCookies(allCookiesArray, cookieItem.name);
            eraseCookiesHelper(foundCookies, cookieItem.path, cookieItem.domain);
        }
    }
};

export const saveCookiePreferences = () => {
    const state = globalObj._state;

    /**
     * Determine if categories were changed from last state (saved in the cookie)
     */
    state._lastChangedCategoryNames = globalObj._config.mode === OPT_OUT_MODE && state._invalidConsent
        ? arrayDiff(state._defaultEnabledCategories, state._acceptedCategories)
        : arrayDiff(state._acceptedCategories, state._savedCookieContent.categories);

    let categoriesWereChanged = state._lastChangedCategoryNames.length > 0;
    let servicesWereChanged = false;

    /**
     * Determine if services were changed from last state
     */
    for (const categoryName of state._allCategoryNames) {
        state._lastChangedServices[categoryName] = arrayDiff(
            state._acceptedServices[categoryName],
            state._lastEnabledServices[categoryName]
        );

        if (state._lastChangedServices[categoryName].length > 0)
            servicesWereChanged = true;
    }

    //{{START: GUI}}
    const categoryToggles = globalObj._dom._categoryCheckboxInputs;

    /**
     * If the category is accepted check checkbox,
     * otherwise uncheck it
     */
    for (const categoryName in categoryToggles) {
        categoryToggles[categoryName].checked = elContains(state._acceptedCategories, categoryName);
    }

    for (const categoryName of state._allCategoryNames) {
        const servicesToggles = globalObj._dom._serviceCheckboxInputs[categoryName];
        const enabledServices = state._acceptedServices[categoryName];

        for (const serviceName in servicesToggles) {
            const serviceInput = servicesToggles[serviceName];
            serviceInput.checked = elContains(enabledServices, serviceName);
        }
    }
    //{{END: GUI}}

    if (!state._consentTimestamp)
        state._consentTimestamp = new Date();

    if (!state._consentId)
        state._consentId = uuidv4();

    state._savedCookieContent = {
        categories: deepCopy(state._acceptedCategories),
        revision: globalObj._config.revision,
        data: state._cookieData,
        consentTimestamp: state._consentTimestamp.toISOString(),
        consentId: state._consentId,
        services: deepCopy(state._acceptedServices),
        languageCode: globalObj._state._currentLanguageCode
    };

    if (state._lastConsentTimestamp) {
        state._savedCookieContent.lastConsentTimestamp = state._lastConsentTimestamp.toISOString();
    }

    let isFirstConsent = false;
    const stateChanged = categoriesWereChanged || servicesWereChanged;

    if (state._invalidConsent || stateChanged) {
        /**
         * Set consent as valid
         */
        if (state._invalidConsent) {
            state._invalidConsent = false;
            isFirstConsent = true;
        }

        state._lastConsentTimestamp = !state._lastConsentTimestamp
            ? state._consentTimestamp
            : new Date();

        state._savedCookieContent.lastConsentTimestamp = state._lastConsentTimestamp.toISOString();

        setCookie();

        const isAutoClearEnabled = globalObj._config.autoClearCookies;
        const shouldClearCookies = isFirstConsent || stateChanged;

        if (isAutoClearEnabled && shouldClearCookies)
            autoclearCookiesHelper(isFirstConsent);

        manageExistingScripts();
    }

    if (isFirstConsent) {
        fireEvent(globalObj._customEvents._onFirstConsent);
        fireEvent(globalObj._customEvents._onConsent);

        if (globalObj._config.mode === OPT_IN_MODE)
            return;
    }

    if (stateChanged)
        fireEvent(globalObj._customEvents._onChange);

    /**
     * Reload page if needed
     */
    if (state._reloadPage) {
        state._reloadPage = false;
        location.reload();
    }
};

/**
 * Set plugin's cookie
 * @param {boolean} [useRemainingExpirationTime]
 */
export const setCookie = (useRemainingExpirationTime) => {
    const { hostname, protocol } = location;
    const { name, path, domain, sameSite, useLocalStorage, secure } = globalObj._config.cookie;

    const expiresAfterMs = useRemainingExpirationTime
        ? getRemainingExpirationTimeMS()
        : getExpiresAfterDaysValue()*86400000;

    /**
     * Expiration date
     */
    const date = new Date();
    date.setTime(date.getTime() + expiresAfterMs);

    /**
     * Store the expiration date in the cookie (in case localstorage is used)
     */

    globalObj._state._savedCookieContent.expirationTime = date.getTime();

    const value = JSON.stringify(globalObj._state._savedCookieContent);

    /**
     * Encode value (RFC compliant)
     */
    const cookieValue = encodeURIComponent(value);

    let cookieStr = name + '='
        + cookieValue
        + (expiresAfterMs !== 0 ? '; expires=' + date.toUTCString() : '')
        + '; Path=' + path
        + '; SameSite=' + sameSite;

    /**
     * Set "domain" only if hostname contains a dot (e.g domain.com)
     * to ensure that cookie works with 'localhost'
     */
    if (elContains(hostname, '.'))
        cookieStr += '; Domain=' + domain;

    if (secure && protocol === 'https:')
        cookieStr += '; Secure';

    useLocalStorage
        ? localStorageManager._setItem(name, value)
        : document.cookie = cookieStr;

    debug('CookieConsent [SET_COOKIE]: ' + name + ':', globalObj._state._savedCookieContent);
};

/**
 * Parse cookie value using JSON.parse
 * @param {string} value
 */
export const parseCookie = (value, skipDecode) => {
    /**
     * @type {import('../../types').CookieValue}
     */
    let parsedValue;

    parsedValue = safeRun(() => JSON.parse(skipDecode
        ? value
        : decodeURIComponent(value)
    ), true) || {};

    return parsedValue;
};

/**
 * Delete cookie by name & path
 * @param {string[]} cookies Array of cookie names
 * @param {string} [customPath]
 * @param {string} [customDomain]
 */
export const eraseCookiesHelper = (cookies, customPath, customDomain) => {
    if (cookies.length === 0)
        return;

    const domain = customDomain || globalObj._config.cookie.domain;
    const path = customPath || globalObj._config.cookie.path;
    const isWwwSubdomain = domain.slice(0, 4) === 'www.';
    const mainDomain = isWwwSubdomain && domain.substring(4);

    /**
     * Helper function to erase cookie
     * @param {string} cookie
     * @param {string} [domain]
     */
    const erase = (cookie, domain) => {
        if (domain && domain.slice(0, 1) !== '.')
            domain = '.' + domain;
        document.cookie = cookie + '='
            + '; path=' + path
            + (domain ? '; domain=' + domain : '')
            + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    for (const cookieName of cookies) {
        erase(cookieName, customDomain);

        /**
         * If custom domain not specified,
         * also erase config domain
         */
        if (!customDomain) {
            erase(cookieName, domain);
        }

        /**
         * If domain starts with 'www.',
         * also erase the cookie for the
         * main domain (without www)
         */
        if (isWwwSubdomain)
            erase(cookieName, mainDomain);

        debug('CookieConsent [AUTOCLEAR]: deleting cookie: "' + cookieName + '" path: "' + path + '" domain:', domain);
    }
};

/**
 * Get plugin cookie
 * @param {string} [customName]
 */
export const getPluginCookie = (customName) => {
    const name = customName || globalObj._config.cookie.name;
    const useLocalStorage = globalObj._config.cookie.useLocalStorage;
    const valueStr = useLocalStorage
        ? localStorageManager._getItem(name)
        : getSingleCookie(name, true);
    return parseCookie(valueStr, useLocalStorage);
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
    for (const cookie of allCookies) {
        let name = cookie.split('=')[0];

        if (regex) {
            safeRun(() => {
                regex.test(name) && cookieNames.push(name);
            });
        } else {
            cookieNames.push(name);
        }
    }

    return cookieNames;
};
