import { _state } from "../global";
import { _log, _inArray, _getKeys, _xhr } from "./general";

/**
 * Get a valid language code
 * (assumes that there is at least one translation defined)
 * @param {string} languageCode - desired language
 * @returns {string} validated language
 */
export const _getValidLanguageCode = function(languageCode){

    var allLanguageCodes = _getKeys(_state.allTranslations);

    if(_inArray(allLanguageCodes, languageCode) > -1) return languageCode;
    if(_inArray(allLanguageCodes, _state.currentLanguageCode) > -1) return _state.currentLanguageCode;

    /**
     * If we got here, return the very first language code (hopefully there is one)
     */
    return allLanguageCodes[0];
}

/**
 * Get current client's browser language
 * @returns {string}
 */
export const _getBrowserLanguageCode = function(){
    var browserLanguage = navigator.language || navigator.browserLanguage;
    browserLanguage.length > 2 && (browserLanguage = browserLanguage[0]+browserLanguage[1]);
    _log("CookieConsent [LANG]: browser language is '"+ browserLanguage + "'");
    return browserLanguage.toLowerCase();
}

/**
 * Resolve which language should be used.
 */
export const _resolveCurrentLanguageCode = function () {
    var autoDetect = _state.userConfig['language']['autoDetect'];

    if(autoDetect){
        _log("CookieConsent [LANG]: autoDetect strategy: '" + autoDetect + "'");

        if (autoDetect === 'browser')
            return _getValidLanguageCode(_getBrowserLanguageCode());

        if(autoDetect === 'document')
            return _getValidLanguageCode(document.documentElement.lang);
    }

    /**
     * If we got here, autoDetect value is not valid,
     * use default language
     */
    return _getValidLanguageCode(_state.userConfig['language']['default']);
}

/**
 *
 * @param {string | null} desiredLanguageCode
 * @param {Function} callback
 */
export const _loadTranslationData = function(desiredLanguageCode, callback){

    /**
     * Make sure languageCode is valid before retrieving the translation object
     */
    desiredLanguageCode && (_state.currentLanguageCode = _getValidLanguageCode(desiredLanguageCode));
    _state.currentTranslation = _state.allTranslations[_state.currentLanguageCode];

    /**
     * If translation is a string, fetch the external json file and replace
     * the string (path to json file) with parsed language object
     */
    if(typeof _state.currentTranslation === 'string'){
        _xhr({
            method: 'GET',
            path: _state.currentTranslation
        }, function(status, translationData){
            if(status === 200){
                _state.currentTranslation = translationData;
                _state.allTranslations[_state.currentLanguageCode] = translationData;
                callback();
            }
        });
    }else{
        _state.currentTranslation = _state.allTranslations[_state.currentLanguageCode];
        callback();
    }
}