import { _fireEvent, globalObj, _shallowCopy } from '../core/global';
import { OPT_OUT_MODE } from './constants';
import { _log, _indexOf, _uuidv4, _updateAcceptType, _getRemainingExpirationTimeMS, _getExpiresAfterDaysValue, _elContains, _arrayDiff } from './general';
import { _manageExistingScripts } from './scripts';

/**
 * Delete all cookies which are unused (based on selected preferences)
 *
 * @param {boolean} [clearOnFirstConsent]
 */
export const _autoclearCookies = (clearOnFirstConsent) => {

    /**
     *  @type {string}
     */
    var currentDomain = globalObj._config.cookie.domain;

    // reset reload state
    globalObj._state._reloadPage = false;

    // Retrieve all cookies
    var allCookiesArray = _getAllCookies();

    // delete cookies on current domain
    var domains = [currentDomain, '.'+currentDomain];

    // if domain has the "www" prefix, delete cookies also for 'domain.com' and '.domain.com'
    if(currentDomain.slice(0, 4) === 'www.'){
        var domainWithoutPrefix = currentDomain.substring(4);  // remove first 4 chars (www.)
        domains.push(domainWithoutPrefix, '.' + domainWithoutPrefix);
    }

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

        var currentCategoryName = categoriesToCheck[i],

            /**
             * @type {import("../core/global").Category}
             */
            currentCategoryObject = globalObj._state._allDefinedCategories[currentCategoryName],
            currentCategoryAutoClear = currentCategoryObject.autoClear,
            currentAutoClearCookies = currentCategoryAutoClear && currentCategoryAutoClear.cookies || [],

            categoryWasJustChanged = _elContains(globalObj._state._lastChangedCategoryNames, currentCategoryName),
            categoryIsDisabled = !_elContains(globalObj._state._acceptedCategories, currentCategoryName),
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
                currCookieDomain && ( domains = [currCookieDomain, '.'+currCookieDomain]);

                // If regex provided => filter cookie array
                if(isRegex){
                    for(var n=0; n<allCookiesArray.length; n++){
                        if(currCookieName.test(allCookiesArray[n]))
                            foundCookies.push(allCookiesArray[n]);
                    }
                }else{
                    var foundCookieIndex = _indexOf(allCookiesArray, currCookieName);
                    if(foundCookieIndex > -1) foundCookies.push(allCookiesArray[foundCookieIndex]);
                }

                _log('CookieConsent [AUTOCLEAR]: search cookie: \'' + currCookieName + '\', found:', foundCookies);

                // Delete cookie(s)
                if(foundCookies.length > 0){
                    _eraseCookies(foundCookies, currCookiePath, domains);
                }
            }
        }
    }
};


export const _saveCookiePreferences = () => {

    /**
     * Determine if categories were changed from last state (saved in the cookie)
     */
    if(globalObj._config.mode === OPT_OUT_MODE && globalObj._state._invalidConsent){
        globalObj._state._lastChangedCategoryNames = _arrayDiff(globalObj._state._defaultEnabledCategories, globalObj._state._acceptedCategories);
    }else{
        globalObj._state._lastChangedCategoryNames = _arrayDiff(globalObj._state._acceptedCategories, globalObj._state._savedCookieContent.categories || []);
    }


    var categoriesWereChanged = globalObj._state._lastChangedCategoryNames.length > 0,
        servicesWereChanged = false;

    /**
     * Determine if services were changed from last state
     */
    globalObj._state._allCategoryNames.forEach(categoryName => {

        globalObj._state._lastChangedServices[categoryName] = _arrayDiff(
            globalObj._state._enabledServices[categoryName],
            globalObj._state._lastEnabledServices[categoryName] || []
        );

        if(globalObj._state._lastChangedServices[categoryName].length > 0) servicesWereChanged = true;
    });

    var categoryToggles = globalObj._dom._categoryCheckboxInputs;

    /**
     * For each checkbox, if its value is inside
     * the "globalObj._state._acceptedCategories" array => enable checkbox
     * otherwise disable it
     */
    for(var categoryName in categoryToggles){
        if(_elContains(globalObj._state._acceptedCategories, categoryName))
            categoryToggles[categoryName].checked = true;
        else
            categoryToggles[categoryName].checked = false;
    }

    globalObj._state._allCategoryNames.forEach(categoryName => {

        var servicesToggles = globalObj._dom._serviceCheckboxInputs[categoryName];
        var enabledServices = globalObj._state._enabledServices[categoryName];

        for(var serviceName in servicesToggles){
            const serviceInput = servicesToggles[serviceName];
            if(_elContains(enabledServices, serviceName))
                serviceInput.checked = true;
            else
                serviceInput.checked = false;
        }
    });


    if(!globalObj._state._consentTimestamp) globalObj._state._consentTimestamp = new Date();
    if(!globalObj._state._consentId) globalObj._state._consentId = _uuidv4();

    globalObj._state._savedCookieContent = {
        categories: _shallowCopy(globalObj._state._acceptedCategories),
        revision: globalObj._config.revision,
        data: globalObj._state._cookieData,
        consentTimestamp: globalObj._state._consentTimestamp.toISOString(),
        consentId: globalObj._state._consentId,
        services: _shallowCopy(globalObj._state._enabledServices)
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

        _updateAcceptType();

        /**
         * Update "_lastConsentTimestamp"
         */
        if(!globalObj._state._lastConsentTimestamp)
            globalObj._state._lastConsentTimestamp = globalObj._state._consentTimestamp;
        else
            globalObj._state._lastConsentTimestamp = new Date();

        globalObj._state._savedCookieContent.lastConsentTimestamp = globalObj._state._lastConsentTimestamp.toISOString();

        _setCookie(globalObj._config.cookie.name, JSON.stringify(globalObj._state._savedCookieContent));

        /**
         * Clear cookies:
         * - on first consent
         * - on category change (consent must be valid)
         */
        if(globalObj._config.autoClearCookies && (firstUserConsent || (!globalObj._state._invalidConsent && categoriesWereChanged)))
            _autoclearCookies(firstUserConsent);

        _manageExistingScripts();
    }

    if(firstUserConsent){

        _fireEvent(globalObj._customEvents._onFirstConsent);
        _fireEvent(globalObj._customEvents._onConsent);

        if(globalObj._config.mode === 'opt-in') return;
    }

    if(categoriesWereChanged || servicesWereChanged)
        _fireEvent(globalObj._customEvents._onChange);

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
export const _setCookie = (name, value, useRemainingExpirationTime) => {

    /**
     * Encode cookie's value so that it is rfcCompliant
     */
    var cookieValue = encodeURIComponent(value);
    var expiresAfterMs = useRemainingExpirationTime ? _getRemainingExpirationTimeMS() : _getExpiresAfterDaysValue()*86400000;

    var date = new Date();
    date.setTime(date.getTime() + expiresAfterMs);

    /**
     * Specify "expires" field only if expiresAfterMs != 0
     * (allow cookie to have same duration as current session)
     */
    var expires = expiresAfterMs !== 0 ? '; expires=' + date.toUTCString() : '';

    var cookieStr = name + '=' + (cookieValue || '') + expires + '; Path=' + globalObj._config.cookie.path + ';';
    cookieStr += ' SameSite=' + globalObj._config.cookie.sameSite + ';';

    // assures cookie works with localhost (=> don't specify domain if on localhost)
    if(_elContains(window.location.hostname, '.')){
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
 * @returns {any}
 */
export const _parseCookie = (value) => {
    let parsedValue;
    try{
        parsedValue = JSON.parse(decodeURIComponent(value));
    }catch(e){
        parsedValue = {}; // If I got here => cookie value is not valid
    }

    return parsedValue;
};

/**
 * Delete cookie by name & path
 * @param {string[]} cookies Array of cookie names
 * @param {string} [customPath]
 * @param {string[]} [domains] example: ['domain.com', '.domain.com']
 */
export const _eraseCookies = (cookies, customPath, domains) => {

    var path = customPath ? customPath : globalObj._config.cookie.path;
    var expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    for(var i=0; i<cookies.length; i++){
        for(var j=0; j<domains.length; j++){
            document.cookie = cookies[i] + '=; path=' + path +
            (_elContains(domains[j], '.') ? '; domain=' + domains[j] : '') + '; ' + expires;
        }
        _log('CookieConsent [AUTOCLEAR]: deleting cookie: \'' + cookies[i] + '\' path: \'' + path + '\' domain:', domains);
    }
};

/**
 * Returns the cookie name/value, if it exists
 * @param {string} name
 * @param {boolean} getValue
 * @returns {string}
 */
export const _getSingleCookie = (name, getValue) => {
    let found = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    found = found ? (getValue ? found.pop() : name) : '';

    return found;
};

/**
 * Returns array with all the cookie names
 * @param {RegExp} regex
 * @returns {string[]}
 */
export const _getAllCookies = (regex) => {
    // Get all existing cookies (<cookie_name>=<cookie_value>)

    const allCookies = document.cookie.split(/;\s*/);

    /**
     * @type {string[]}
     */
    let cookieNames = [];

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