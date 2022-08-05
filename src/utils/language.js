import { globalObj } from '../core/global';
import { _log, _getKeys, _elContains, _fetchJson } from './general';

/**
 * Get a valid language code
 * (assumes that there is at least one translation defined)
 * @param {string} languageCode desired language
 * @returns {string} validated language
 */
export const _getValidLanguageCode = (languageCode) => {

    const allLanguageCodes = _getKeys(globalObj._state._allTranslations);

    if(_elContains(allLanguageCodes, languageCode)) return languageCode;
    if(_elContains(allLanguageCodes, globalObj._state._currentLanguageCode)) return globalObj._state._currentLanguageCode;

    /**
     * If we got here, return the very first language code (hopefully there is one)
     */
    return allLanguageCodes[0];
};

/**
 * Get current client's browser language
 * returns only the first 2 chars: en-US => en
 * @returns {string} language
 */
export const _getBrowserLanguageCode = () => {
    const browserLanguage = navigator.language.slice(0, 2).toLowerCase();
    _log('CookieConsent [LANG]: browser language is "'+ browserLanguage + '"');

    return browserLanguage;
};

/**
 * Resolve which language should be used.
 */
export const _resolveCurrentLanguageCode = function () {
    const autoDetect = globalObj._state._userConfig.language.autoDetect;

    if(autoDetect){
        _log('CookieConsent [LANG]: autoDetect strategy: "' + autoDetect + '"');

        if (autoDetect === 'browser')
            return _getValidLanguageCode(_getBrowserLanguageCode());

        if(autoDetect === 'document')
            return _getValidLanguageCode(globalObj._dom._document.documentElement.lang);
    }

    /**
     * If we got here, autoDetect value is not valid,
     * use default language
     */
    return _getValidLanguageCode(globalObj._state._userConfig.language.default);
};

/**
 * Load translation (asynchronously using xhr if needed)
 * @param {string | null} desiredLanguageCode
 */
export const _loadTranslationData = async (desiredLanguageCode) => {

    let validatedLanguageCode = globalObj._state._currentLanguageCode;

    /**
     * Make sure languageCode is valid before retrieving the translation object
     */
    desiredLanguageCode && (validatedLanguageCode = _getValidLanguageCode(desiredLanguageCode));
    globalObj._state._currentTranslation = globalObj._state._allTranslations[validatedLanguageCode];

    if(!globalObj._state._currentTranslation) return false;

    /**
     * If translation is a string, fetch the external json file and replace
     * the string (path to json file) with parsed language object
     */
    if(typeof globalObj._state._currentTranslation === 'string'){
        const translationData = await _fetchJson(globalObj._state._currentTranslation);
        if(!translationData) return false;
        globalObj._state._currentTranslation = translationData;
        globalObj._state._allTranslations[validatedLanguageCode] = translationData;
    }else{
        globalObj._state._currentTranslation = globalObj._state._allTranslations[validatedLanguageCode];
    }
    globalObj._state._currentLanguageCode = validatedLanguageCode;

    return true;
};