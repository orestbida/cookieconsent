import { globalObj } from '../core/global';
import { _log, _getKeys, _elContains, _fetchJson } from './general';

/**
 * Check if language is valid/defined
 * @param {string} languageCode
 * @returns {boolean} True if language is defined
 */
export const _validLanguageCode = (languageCode) => {
    return !!languageCode && _elContains(_getKeys(globalObj._state._allTranslations), languageCode);
};

/**
 * Returns the current language code
 * @returns {string}
 */
export const _getCurrentLanguageCode = () => {
    const state = globalObj._state;
    return state._currentLanguageCode || state._userConfig.language.default;
};

export const _setCurrentLanguageCode = (newLanguageCode) => {
    newLanguageCode && (globalObj._state._currentLanguageCode = newLanguageCode);
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

export const _getDocumentLanguageCode = () => {
    return document.documentElement.lang;
};

/**
 * Resolve which language should be used.
 */
export const _resolveCurrentLanguageCode = () =>  {

    const autoDetect = globalObj._state._userConfig.language.autoDetect;

    if(autoDetect){

        _log('CookieConsent [LANG]: autoDetect strategy: "' + autoDetect + '"');

        let newLanguageCode;

        if (autoDetect === 'browser')
            newLanguageCode = _getBrowserLanguageCode();

        else if(autoDetect === 'document')
            newLanguageCode = _getDocumentLanguageCode();

        if(_validLanguageCode(newLanguageCode))
            return newLanguageCode;
    }

    /**
     * Use current language
     */
    return _getCurrentLanguageCode();
};

/**
 * Load translation (asynchronously using xhr if needed)
 * @param {string | null} desiredLanguageCode
 */
export const _loadTranslationData = async (desiredLanguageCode) => {
    const state = globalObj._state;

    let currentLanguageCode;

    /**
     * Make sure languageCode is valid before retrieving the translation object
     */
    if(desiredLanguageCode && _validLanguageCode(desiredLanguageCode))
        currentLanguageCode = desiredLanguageCode;
    else
        currentLanguageCode = _getCurrentLanguageCode();

    let currentTranslation = state._allTranslations[currentLanguageCode];

    if(!currentTranslation)
        return false;

    /**
     * If translation is a string, fetch the external json file and replace
     * the string (path to json file) with parsed language object
     */
    if(typeof currentTranslation === 'string'){

        const fetchedTranslation = await _fetchJson(currentTranslation);

        if(!fetchedTranslation)
            return false;

        currentTranslation = fetchedTranslation;
    }

    state._currentTranslation = currentTranslation;
    _setCurrentLanguageCode(currentLanguageCode);

    _log('CookieConsent [LANG]: set language: "' + currentLanguageCode + '"');

    return true;
};