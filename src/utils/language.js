import { state } from '../core/global';
import { _log, _getKeys, _xhr, _elContains } from './general';

/**
 * Get a valid language code
 * (assumes that there is at least one translation defined)
 * @param {string} languageCode desired language
 * @returns {string} validated language
 */
export const _getValidLanguageCode = (languageCode) => {

    var allLanguageCodes = _getKeys(state._allTranslations);

    if(_elContains(allLanguageCodes, languageCode)) return languageCode;
    if(_elContains(allLanguageCodes, state._currentLanguageCode)) return state._currentLanguageCode;

    /**
     * If we got here, return the very first language code (hopefully there is one)
     */
    return allLanguageCodes[0];
};

/**
 * Get current client's browser language
 * @returns {string}
 */
export const _getBrowserLanguageCode = () => {
    var browserLanguage = navigator.language || navigator.browserLanguage;
    browserLanguage.length > 2 && (browserLanguage = browserLanguage[0]+browserLanguage[1]);
    _log('CookieConsent [LANG]: browser language is \''+ browserLanguage + '\'');
    return browserLanguage.toLowerCase();
};

/**
 * Resolve which language should be used.
 */
export const _resolveCurrentLanguageCode = function () {
    var autoDetect = state._userConfig.language.autoDetect;

    if(autoDetect){
        _log('CookieConsent [LANG]: autoDetect strategy: \'' + autoDetect + '\'');

        if (autoDetect === 'browser')
            return _getValidLanguageCode(_getBrowserLanguageCode());

        if(autoDetect === 'document')
            return _getValidLanguageCode(document.documentElement.lang);
    }

    /**
     * If we got here, autoDetect value is not valid,
     * use default language
     */
    return _getValidLanguageCode(state._userConfig.language.default);
};

/**
 * Load translation (asynchronously using xhr if needed)
 * @param {string | null} desiredLanguageCode
 * @param {Function} callback
 */
export const _loadTranslationData = (desiredLanguageCode, callback) => {

    /**
     * Make sure languageCode is valid before retrieving the translation object
     */
    desiredLanguageCode && (state._currentLanguageCode = _getValidLanguageCode(desiredLanguageCode));
    state._currentTranslation = state._allTranslations[state._currentLanguageCode];

    /**
     * If translation is a string, fetch the external json file and replace
     * the string (path to json file) with parsed language object
     */
    if(typeof state._currentTranslation === 'string'){
        _xhr({
            method: 'GET',
            path: state._currentTranslation
        }, (status, translationData) => {
            if(status === 200){
                state._currentTranslation = translationData;
                state._allTranslations[state._currentLanguageCode] = translationData;
                callback();
            }
        });
    }else{
        state._currentTranslation = state._allTranslations[state._currentLanguageCode];
        callback();
    }
};