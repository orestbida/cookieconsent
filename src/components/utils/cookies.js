import { _state, _config, cookieConfig, _callbacks } from "../global";
import { _log, _inArray, _uuidv4, _updateAcceptType, _getRemainingExpirationTimeMS, _getExpiresAfterDaysValue } from "./general";
import { _manageExistingScripts } from "./scripts";
import { api } from "../api";


/**
 * Delete all cookies which are unused (based on selected preferences)
 *
 * @param {boolean} [clearOnFirstConsent]
 */
export const _autoclearCookies = function(clearOnFirstConsent){

    /**
     *  @type {string}
     */
    var currentDomain = cookieConfig.domain;

    // reset reload state
    _state.reloadPage = false;

    // Retrieve all cookies
    var allCookiesArray = _getCookie('', 'all');

    // delete cookies on current domain
    var domains = [currentDomain, '.'+currentDomain];

    // if domain has the "www" prefix, delete cookies also for 'domain.com' and '.domain.com'
    if(currentDomain.slice(0, 4) === 'www.'){
        var domainWithoutPrefix = currentDomain.substring(4);  // remove first 4 chars (www.)
        domains.push(domainWithoutPrefix, '.' + domainWithoutPrefix);
    }

    var categoriesToCheck = clearOnFirstConsent ? _state.allCategoryNames : _state.lastChangedCategoryNames;

    /**
     * Filter out categories with readOnly=true or don't have an autoClear object
     */
    categoriesToCheck = categoriesToCheck.filter(function(categoryName){
        var currentCategoryObject = _state.allDefinedCategories[categoryName];

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

    // For each category that was just changed (enabled/disabled)
    for(var i=0; i<categoriesToCheck.length; i++){

        var currentCategoryName = categoriesToCheck[i],
            currentCategoryObject = _state.allDefinedCategories[currentCategoryName],
            currentCategoryAutoClear = currentCategoryObject['autoClear'],
            currentAutoClearCookies = currentCategoryAutoClear && currentCategoryAutoClear['cookies'] || [],

            categoryWasJustChanged = _inArray(_state.lastChangedCategoryNames, currentCategoryName) > -1,
            categoryIsDisabled = _inArray(_state.acceptedCategories, currentCategoryName) === -1,
            categoryWasJustDisabled = categoryWasJustChanged && categoryIsDisabled;

        if((clearOnFirstConsent && categoryIsDisabled) || (!clearOnFirstConsent && categoryWasJustDisabled)){

            // Get number of cookies defined in cookie_table
            var cookiesToClear = currentAutoClearCookies.length;

            // check if page needs to be reloaded after autoClear (if category was just disabled)
            if(currentCategoryAutoClear['reloadPage'] === true && categoryWasJustDisabled)
                _state.reloadPage = true;

            // delete each cookie in the cookies array
            for(var j=0; j<cookiesToClear; j++){

                /**
                 * List of all cookies matching the current cookie name
                 * @type {string[]}
                 */
                var foundCookies = [];

                /**
                 * @type {string|RegExp}
                 */
                var currCookieName = currentAutoClearCookies[j]['name'];
                var isRegex = currCookieName && typeof currCookieName !== 'string';
                var currCookieDomain = currentAutoClearCookies[j]['domain'] || null;
                var currCookiePath = currentAutoClearCookies[j]['path'] || false;

                // set domain to the specified domain
                currCookieDomain && ( domains = [currCookieDomain, '.'+currCookieDomain]);

                // If regex provided => filter cookie array
                if(isRegex){
                    for(var n=0; n<allCookiesArray.length; n++){
                        if(currCookieName.test(allCookiesArray[n]))
                            foundCookies.push(allCookiesArray[n]);
                    }
                }else{
                    var foundCookieIndex = _inArray(allCookiesArray, currCookieName);
                    if(foundCookieIndex > -1) foundCookies.push(allCookiesArray[foundCookieIndex]);
                }

                _log("CookieConsent [AUTOCLEAR]: search cookie: '" + currCookieName + "', found:", foundCookies);

                // Delete cookie(s)
                if(foundCookies.length > 0){
                    _eraseCookies(foundCookies, currCookiePath, domains);
                }
            }
        }
    }
}

/**
 * Set toggles/checkboxes based on accepted categories and save cookie
 * @param {string[]} acceptedCategories - Array of categories to accept
 */
export const _saveCookiePreferences = function(acceptedCategories){

    _state.lastChangedCategoryNames = [];

    // Retrieve all toggle/checkbox values
    var categoryToggle = document.querySelectorAll('.c-tgl') || [];

    // If there are opt in/out toggles ...
    if(categoryToggle.length > 0){

        for(var i=0; i<categoryToggle.length; i++){
            if(_inArray(acceptedCategories, _state.allCategoryNames[i]) !== -1){
                categoryToggle[i].checked = true;
                if(!_state.allToggleStates[i]){
                    _state.lastChangedCategoryNames.push(_state.allCategoryNames[i]);
                    _state.allToggleStates[i] = true;
                }
            }else{
                categoryToggle[i].checked = false;
                if(_state.allToggleStates[i]){
                    _state.lastChangedCategoryNames.push(_state.allCategoryNames[i]);
                    _state.allToggleStates[i] = false;
                }
            }
        }
    }

    /**
     * Clear cookies when preferences/preferences change
     */
    if(!_state.invalidConsent && _config.autoClearCookies && _state.lastChangedCategoryNames.length > 0)
        _autoclearCookies();

    if(!_state.consentTimestamp) _state.consentTimestamp = new Date();
    if(!_state.consentId) _state.consentId = _uuidv4();

    _state.savedCookieContent = {
        'categories': acceptedCategories,
        'revision': _config.revision,
        'data': _state.cookieData,
        'consentTimestamp': _state.consentTimestamp.toISOString(),
        'consentId': _state.consentId
    }

    var firstUserConsent = false;

    if(_state.invalidConsent || _state.lastChangedCategoryNames.length > 0){
        /**
         * Set consent as valid
         */
        if(_state.invalidConsent) {
            _state.invalidConsent = false;
            firstUserConsent = true;
        }

        _updateAcceptType();

        /**
         * Update "lastConsentTimestamp"
         */
        if(!_state.lastConsentTimestamp)
            _state.lastConsentTimestamp = _state.consentTimestamp;
        else
            _state.lastConsentTimestamp = new Date();

        _state.savedCookieContent['lastConsentTimestamp'] = _state.lastConsentTimestamp.toISOString();

        _setCookie(cookieConfig.name, JSON.stringify(_state.savedCookieContent));
        _manageExistingScripts();
    }

    if(firstUserConsent){
        /**
         * Delete unused/"zombie" cookies if consent is not valid (not yet expressed or cookie has expired)
         */
        if(_config.autoClearCookies)
            _autoclearCookies(true);

        if(typeof _onFirstConsent === 'function')
            _callbacks._onFirstConsent(api.getUserPreferences(), _state.savedCookieContent);

        if(typeof _onConsent === 'function')
            _callbacks._onConsent(_state.savedCookieContent);

        if(_config.mode === 'opt-in') return;
    }

    // Fire _onChange only if preferences were changed
    if(typeof _onChange === 'function' && _state.lastChangedCategoryNames.length > 0)
        _callbacks._onChange(_state.savedCookieContent, _state.lastChangedCategoryNames);

    /**
     * Reload page if needed
     */
    if(_state.reloadPage)
        window.location.reload();
}

/**
 * Set cookie, by specifying name and value
 * @param {string} name
 * @param {string} value
 * @param {number} [useRemainingExpirationTime]
 */
export const _setCookie = function(name, value, useRemainingExpirationTime) {

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
    var expires = expiresAfterMs !== 0 ? "; expires=" + date.toUTCString() : '';

    var cookieStr = name + "=" + (cookieValue || "") + expires + "; Path=" + cookieConfig.path + ";";
    cookieStr += " SameSite=" + cookieConfig.sameSite + ";";

    // assures cookie works with localhost (=> don't specify domain if on localhost)
    if(window.location.hostname.indexOf(".") > -1){
        cookieStr += " Domain=" + cookieConfig.domain + ";";
    }

    if(window.location.protocol === "https:") {
        cookieStr += " Secure;";
    }

    document.cookie = cookieStr;

    _log("CookieConsent [SET_COOKIE]: " + name + ":", JSON.parse(decodeURIComponent(cookieValue)));
}

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
export const _getCookie = function(name, filter, getValue, ignoreName) {
    var found;

    if(filter === 'one'){
        found = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
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
}

/**
 * Delete cookie by name & path
 * @param {string[]} cookies
 * @param {string} [customPath] - optional
 * @param {string[]} domains - example: ['domain.com', '.domain.com']
 */
export const _eraseCookies = function(cookies, customPath, domains) {
    var path = customPath ? customPath : '/';
    var expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    for(var i=0; i<cookies.length; i++){
        for(var j=0; j<domains.length; j++){
            document.cookie = cookies[i] + '=; path=' + path +
            (domains[j].indexOf('.') > -1 ? '; domain=' + domains[j] : "") + '; ' + expires;
        }
        _log("CookieConsent [AUTOCLEAR]: deleting cookie: '" + cookies[i] + "' path: '" + path + "' domain:", domains);
    }
}