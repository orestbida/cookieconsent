import { fireEvent, globalObj, shallowCopy } from '../core/global';
import { OPT_OUT_MODE, OPT_IN_MODE } from './constants';
import { _log, indexOf, uuidv4, updateAcceptType, getRemainingExpirationTimeMS, getExpiresAfterDaysValue, elContains, arrayDiff } from './general';
import { manageExistingScripts } from './scripts';

/**
 * Delete all cookies which are unused (based on selected preferences)
 * @param {boolean} [clearOnFirstConsent]
 */
export const autoclearCookiesHelper = (clearOnFirstConsent) => {

    var domain = '';

    // reset reload state
    globalObj._state._reloadPage = false;

    // Retrieve all cookies
    var allCookiesArray = getAllCookies();

    var categoriesToCheck = clearOnFirstConsent ? globalObj._state._allCategoryNames : globalObj._state._lastChangedCategoryNames;

    /**
     * Filter out categories with readOnly=true or don't have an autoClear object
     */
    categoriesToCheck = categoriesToCheck.filter((categoryName) => {
        var currentCategoryObject = globalObj._state._allDefinedCategories[categoryName];

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

    // For each category that is not readOnly
    for(var i=0; i<categoriesToCheck.length; i++){

        var
            currentCategoryName = categoriesToCheck[i],
            currentCategoryObject = globalObj._state._allDefinedCategories[currentCategoryName],
            currentCategoryAutoClear = currentCategoryObject.autoClear,
            currentAutoClearCookies = currentCategoryAutoClear && currentCategoryAutoClear.cookies || [],

            categoryWasJustChanged = elContains(globalObj._state._lastChangedCategoryNames, currentCategoryName),
            categoryIsDisabled = !elContains(globalObj._state._acceptedCategories, currentCategoryName),
            categoryWasJustDisabled = categoryWasJustChanged && categoryIsDisabled;

        if((clearOnFirstConsent && categoryIsDisabled) || (!clearOnFirstConsent && categoryWasJustDisabled)){

            // Get number of cookies defined in cookie_table
            var cookiesToClear = currentAutoClearCookies.length;

            // check if page needs to be reloaded after autoClear (if category was just disabled)
            if(currentCategoryAutoClear.reloadPage === true && categoryWasJustDisabled)
                globalObj._state._reloadPage = true;

            // delete each cookie in the cookies array
            for(var j=0; j<cookiesToClear; j++){

                /**
                 * List of all cookies matching the current cookie name
                 * @type {string[]}
                 */
                var foundCookies = [];

                var currCookieName = currentAutoClearCookies[j].name;
                var isRegex = !!currCookieName && typeof currCookieName !== 'string';
                var currCookieDomain = currentAutoClearCookies[j].domain || null;
                var currCookiePath = currentAutoClearCookies[j].path || false;

                // set domain to the specified domain
                currCookieDomain && (domain = currCookieDomain);

                // If regex provided => filter cookie array
                if(isRegex){
                    for(var n=0; n<allCookiesArray.length; n++){
                        if(currCookieName.test(allCookiesArray[n]))
                            foundCookies.push(allCookiesArray[n]);
                    }
                }else{
                    var foundCookieIndex = indexOf(allCookiesArray, currCookieName);
                    if(foundCookieIndex > -1) foundCookies.push(allCookiesArray[foundCookieIndex]);
                }

                _log('CookieConsent [AUTOCLEAR]: search cookie: \'' + currCookieName + '\', found:', foundCookies);

                // Delete cookie(s)
                if(foundCookies.length > 0){
                    eraseCookiesHelper(foundCookies, currCookiePath, domain);
                }
            }
        }
    }
};


export const saveCookiePreferences = () => {

    /**
     * Determine if categories were changed from last state (saved in the cookie)
     */
    if(globalObj._config.mode === OPT_OUT_MODE && globalObj._state._invalidConsent){
        globalObj._state._lastChangedCategoryNames = arrayDiff(globalObj._state._defaultEnabledCategories, globalObj._state._acceptedCategories);
    }else{
        globalObj._state._lastChangedCategoryNames = arrayDiff(globalObj._state._acceptedCategories, globalObj._state._savedCookieContent.categories || []);
    }


    var categoriesWereChanged = globalObj._state._lastChangedCategoryNames.length > 0,
        servicesWereChanged = false;

    /**
     * Determine if services were changed from last state
     */
    globalObj._state._allCategoryNames.forEach(categoryName => {

        globalObj._state._lastChangedServices[categoryName] = arrayDiff(
            globalObj._state._enabledServices[categoryName],
            globalObj._state._lastEnabledServices[categoryName] || []
        );

        if(globalObj._state._lastChangedServices[categoryName].length > 0) servicesWereChanged = true;
    });

    var categoryToggles = globalObj._dom._categoryCheckboxInputs;

    /**
     * If the category is accepted check checkbox,
     * otherwise uncheck it
     */
    for(var categoryName in categoryToggles){
        if(elContains(globalObj._state._acceptedCategories, categoryName))
            categoryToggles[categoryName].checked = true;
        else
            categoryToggles[categoryName].checked = false;
    }

    globalObj._state._allCategoryNames.forEach(categoryName => {

        var servicesToggles = globalObj._dom._serviceCheckboxInputs[categoryName];
        var enabledServices = globalObj._state._enabledServices[categoryName];

        for(var serviceName in servicesToggles){
            const serviceInput = servicesToggles[serviceName];
            if(elContains(enabledServices, serviceName))
                serviceInput.checked = true;
            else
                serviceInput.checked = false;
        }
    });


    if(!globalObj._state._consentTimestamp) globalObj._state._consentTimestamp = new Date();
    if(!globalObj._state._consentId) globalObj._state._consentId = uuidv4();

    globalObj._state._savedCookieContent = {
        categories: shallowCopy(globalObj._state._acceptedCategories),
        revision: globalObj._config.revision,
        data: globalObj._state._cookieData,
        consentTimestamp: globalObj._state._consentTimestamp.toISOString(),
        consentId: globalObj._state._consentId,
        services: shallowCopy(globalObj._state._enabledServices)
    };

    var firstUserConsent = false;

    if(globalObj._state._invalidConsent || categoriesWereChanged || servicesWereChanged){

        /**
         * Set consent as valid
         */
        if(globalObj._state._invalidConsent) {
            globalObj._state._invalidConsent = false;
            firstUserConsent = true;
        }

        updateAcceptType();

        if(!globalObj._state._lastConsentTimestamp)
            globalObj._state._lastConsentTimestamp = globalObj._state._consentTimestamp;
        else
            globalObj._state._lastConsentTimestamp = new Date();

        globalObj._state._savedCookieContent.lastConsentTimestamp = globalObj._state._lastConsentTimestamp.toISOString();

        setCookie(globalObj._config.cookie.name, JSON.stringify(globalObj._state._savedCookieContent));

        /**
         * Clear cookies:
         * - on first consent
         * - on category change (consent must be valid)
         */
        if(globalObj._config.autoClearCookies && (firstUserConsent || (!globalObj._state._invalidConsent && categoriesWereChanged)))
            autoclearCookiesHelper(firstUserConsent);

        manageExistingScripts();
    }

    if(firstUserConsent){

        fireEvent(globalObj._customEvents._onFirstConsent);
        fireEvent(globalObj._customEvents._onConsent);

        if(globalObj._config.mode === OPT_IN_MODE) return;
    }

    if(categoriesWereChanged || servicesWereChanged)
        fireEvent(globalObj._customEvents._onChange);

    /**
     * Reload page if needed
     */
    if(globalObj._state._reloadPage)
        window.location.reload();
};

/**
 * Set cookie, by specifying name and value
 * @param {string} name
 * @param {string} value
 * @param {boolean} [useRemainingExpirationTime]
 */
export const setCookie = (name, value, useRemainingExpirationTime) => {

    /**
     * Encode value (RFC compliant)
     */
    var cookieValue = encodeURIComponent(value);
    var expiresAfterMs = useRemainingExpirationTime ? getRemainingExpirationTimeMS() : getExpiresAfterDaysValue()*86400000;

    var date = new Date();
    date.setTime(date.getTime() + expiresAfterMs);

    /**
     * Specify "expires" field only if expiresAfterMs != 0
     * (allow cookie to have same duration as current session)
     */
    var expires = expiresAfterMs !== 0 ? '; expires=' + date.toUTCString() : '';

    var cookieStr = name + '=' + (cookieValue || '') + expires + '; Path=' + globalObj._config.cookie.path + ';';
    cookieStr += ' SameSite=' + globalObj._config.cookie.sameSite + ';';

    /**
     * Specify "domain" only if hostname contains a dot (e.g domain.com)
     * to ensure that cookie works with 'localhost'
     */
    if(elContains(window.location.hostname, '.')){
        cookieStr += ' Domain=' + globalObj._config.cookie.domain + ';';
    }

    if(window.location.protocol === 'https:') {
        cookieStr += ' Secure;';
    }

    document.cookie = cookieStr;

    _log('CookieConsent [SET_COOKIE]: ' + name + ':', JSON.parse(decodeURIComponent(cookieValue)));
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

    cookies.forEach(cookieName => {

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
    });
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
    for(var i=0; i<allCookies.length; i++){
        let name = allCookies[i].split('=')[0];

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