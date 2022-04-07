import { state, config, cookieConfig, _fireEvent, customEvents } from '../core/global';
import { _log, _indexOf, _uuidv4, _updateAcceptType, _getRemainingExpirationTimeMS, _getExpiresAfterDaysValue, _elContains } from './general';
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
    var currentDomain = cookieConfig.domain;

    // reset reload state
    state._reloadPage = false;

    // Retrieve all cookies
    var allCookiesArray = _getCookie('', 'all');

    // delete cookies on current domain
    var domains = [currentDomain, '.'+currentDomain];

    // if domain has the "www" prefix, delete cookies also for 'domain.com' and '.domain.com'
    if(currentDomain.slice(0, 4) === 'www.'){
        var domainWithoutPrefix = currentDomain.substring(4);  // remove first 4 chars (www.)
        domains.push(domainWithoutPrefix, '.' + domainWithoutPrefix);
    }

    var categoriesToCheck = clearOnFirstConsent ? state._allCategoryNames : state._lastChangedCategoryNames;

    /**
     * Filter out categories with readOnly=true or don't have an autoClear object
     */
    categoriesToCheck = categoriesToCheck.filter((categoryName) => {
        var currentCategoryObject = state._allDefinedCategories[categoryName];

        /**
         * Make sure that:
         *  category != falsy
         *  readOnly = falsy
         *  autoClear = truthy (assuming that it is a valid object)
         */
        return(
            !!currentCategoryObject
            && !currentCategoryObject['readOnly']
            && !!currentCategoryObject['autoClear']
        );
    });

    // For each category that is not readOnly
    for(var i=0; i<categoriesToCheck.length; i++){

        var currentCategoryName = categoriesToCheck[i],

            /**
             * @type {import("../core/global").Category}
             */
            currentCategoryObject = state._allDefinedCategories[currentCategoryName],
            currentCategoryAutoClear = currentCategoryObject.autoClear,
            currentAutoClearCookies = currentCategoryAutoClear && currentCategoryAutoClear.cookies || [],

            categoryWasJustChanged = _elContains(state._lastChangedCategoryNames, currentCategoryName),
            categoryIsDisabled = !_indexOf(state._acceptedCategories, currentCategoryName),
            categoryWasJustDisabled = categoryWasJustChanged && categoryIsDisabled;

        if((clearOnFirstConsent && categoryIsDisabled) || (!clearOnFirstConsent && categoryWasJustDisabled)){

            // Get number of cookies defined in cookie_table
            var cookiesToClear = currentAutoClearCookies.length;

            // check if page needs to be reloaded after autoClear (if category was just disabled)
            if(currentCategoryAutoClear.reloadPage === true && categoryWasJustDisabled)
                state._reloadPage = true;

            // delete each cookie in the cookies array
            for(var j=0; j<cookiesToClear; j++){

                /**
                 * List of all cookies matching the current cookie name
                 * @type {string[]}
                 */
                var foundCookies = [];

                var currCookieName = currentAutoClearCookies[j].name;
                var isRegex = currCookieName && typeof currCookieName !== 'string';
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
    state._lastChangedCategoryNames = state._acceptedCategories
        .filter(x => !_elContains(state._savedCookieContent.categories || [], x))
        .concat((state._savedCookieContent.categories || [])
            .filter(x => !_elContains(state._acceptedCategories, x))
        );

    var categoriesWereChanged = state._lastChangedCategoryNames.length > 0;

    // Retrieve all checkboxes (toggles) from the modal
    var categoryToggles = document.querySelectorAll('.section__toggle');

    /**
     * For each checkbox, if its value is inside
     * the "state._acceptedCategories" array => enable checkbox
     * otherwise disable it
     */
    for(var i=0; i<categoryToggles.length; i++){
        if(_elContains(state._acceptedCategories, categoryToggles[i].value))
            categoryToggles[i].checked = true;
        else
            categoryToggles[i].checked = false;
    }

    if(!state._invalidConsent && config.autoClearCookies && categoriesWereChanged)
        _autoclearCookies();

    if(!state._consentTimestamp) state._consentTimestamp = new Date();
    if(!state._consentId) state._consentId = _uuidv4();

    state._savedCookieContent = {
        categories: JSON.parse(JSON.stringify(state._acceptedCategories)),
        revision: config.revision,
        data: state._cookieData,
        consentTimestamp: state._consentTimestamp.toISOString(),
        consentId: state._consentId
    };

    var firstUserConsent = false;

    if(state._invalidConsent || categoriesWereChanged){
        /**
         * Set consent as valid
         */
        if(state._invalidConsent) {
            state._invalidConsent = false;
            firstUserConsent = true;
        }

        _updateAcceptType();

        /**
         * Update "_lastConsentTimestamp"
         */
        if(!state._lastConsentTimestamp)
            state._lastConsentTimestamp = state._consentTimestamp;
        else
            state._lastConsentTimestamp = new Date();

        state._savedCookieContent.lastConsentTimestamp = state._lastConsentTimestamp.toISOString();

        _setCookie(cookieConfig.name, JSON.stringify(state._savedCookieContent));
        _manageExistingScripts();
    }

    if(firstUserConsent){
        /**
         * Delete unused/"zombie" cookies if consent
         * is not valid (not yet expressed or cookie has expired)
         */
        if(config.autoClearCookies)
            _autoclearCookies(true);

        _fireEvent(customEvents._onFirstConsent);
        _fireEvent(customEvents._onConsent);

        if(config.mode === 'opt-in') return;
    }

    if(categoriesWereChanged)
        _fireEvent(customEvents._onChange);

    /**
     * Reload page if needed
     */
    if(state._reloadPage)
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

    var cookieStr = name + '=' + (cookieValue || '') + expires + '; Path=' + cookieConfig.path + ';';
    cookieStr += ' SameSite=' + cookieConfig.sameSite + ';';

    // assures cookie works with localhost (=> don't specify domain if on localhost)
    if(_elContains(window.location.hostname, '.')){
        cookieStr += ' Domain=' + cookieConfig.domain + ';';
    }

    if(window.location.protocol === 'https:') {
        cookieStr += ' Secure;';
    }

    document.cookie = cookieStr;

    _log('CookieConsent [SET_COOKIE]: ' + name + ':', JSON.parse(decodeURIComponent(cookieValue)));
};

/**
 * Get cookie value by name,
 * returns the cookie value if found (or an array
 * of cookies if filter provided), otherwise empty string: ""
 * @param {string} name
 * @param {string} filter 'one' or 'all'
 * @param {boolean} [getValue] set to true to obtain its value
 * @param {boolean} [ignoreName]
 * @returns {string|string[]}
 */
export const _getCookie = (name, filter, getValue, ignoreName) => {
    var found;

    if(filter === 'one'){
        found = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        found = found ? (getValue ? found.pop() : name) : '';

        /**
         * If we are retrieving cookieconsent's own cookie
         * => verify that its value is a valid json string
         */
        if(found && (name === cookieConfig.name || ignoreName)){
            try{
                found = JSON.parse(decodeURIComponent(found));
            }catch(e){
                found = {}; // If I got here => cookie value is not valid
            }
            found = JSON.stringify(found);
        }
    }else if(filter === 'all'){

        // Get all existing cookies (<cookie_name>=<cookie_value>)
        var allCookies = document.cookie.split(/;\s*/); found = [];

        /**
         * Save only the cookie names
         */
        for(var i=0; i<allCookies.length; i++){
            found.push(allCookies[i].split('=')[0]);
        }
    }

    return found;
};

/**
 * Delete cookie by name & path
 * @param {string[]} cookies Array of cookie names
 * @param {string} [customPath]
 * @param {string[]} [domains] example: ['domain.com', '.domain.com']
 */
export const _eraseCookies = (cookies, customPath, domains) => {
    var path = customPath ? customPath : '/';
    var expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    for(var i=0; i<cookies.length; i++){
        for(var j=0; j<domains.length; j++){
            document.cookie = cookies[i] + '=; path=' + path +
            (_elContains(domains[j], '.') ? '; domain=' + domains[j] : '') + '; ' + expires;
        }
        _log('CookieConsent [AUTOCLEAR]: deleting cookie: \'' + cookies[i] + '\' path: \'' + path + '\' domain:', domains);
    }
};