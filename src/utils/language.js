import { globalObj } from '../core/global';
import {
    _log,
    elContains,
    fetchJson,
    addClass,
    removeClass,
    isString,
    isArray
} from './general';

/**
 * Check if language is valid/defined
 * @param {string} languageCode
 * @returns {boolean} True if language is defined
 */
export const validLanguageCode = (languageCode) => {
    return isString(languageCode) && languageCode in globalObj._state._allTranslations;
};

/**
 * Returns the current language code
 * @returns {string}
 */
export const getCurrentLanguageCode = () => {
    return globalObj._state._currentLanguageCode || globalObj._state._userConfig.language.default;
};

/**
 * Set language code
 * @param {string} newLanguageCode
 */
export const setCurrentLanguageCode = (newLanguageCode) => {
    newLanguageCode && (globalObj._state._currentLanguageCode = newLanguageCode);
};

/**
 * Get current client's browser language
 * returns only the first 2 chars: en-US => en
 * @returns {string} language
 */
export const getBrowserLanguageCode = () => {
    const browserLanguage = navigator.language.slice(0, 2).toLowerCase();
    _log('CookieConsent [LANG]: browser language is "'+ browserLanguage + '"');

    return browserLanguage;
};

/**
 * Get the lang attribute
 * @returns lang attribute
 */
export const getDocumentLanguageCode = () => document.documentElement.lang;

/**
 * Resolve the language to use.
 * @returns {string} language code
 */
export const resolveCurrentLanguageCode = () =>  {

    const autoDetect = globalObj._state._userConfig.language.autoDetect;

    if(autoDetect){

        _log('CookieConsent [LANG]: autoDetect strategy: "' + autoDetect + '"');

        /**
         * @type {string}
         */
        let newLanguageCode;

        if (autoDetect === 'browser')
            newLanguageCode = getBrowserLanguageCode();

        else if(autoDetect === 'document')
            newLanguageCode = getDocumentLanguageCode();

        if(validLanguageCode(newLanguageCode))
            return newLanguageCode;
    }

    /**
     * Use current language
     */
    return getCurrentLanguageCode();
};

/**
 * Load translation
 * @param {string | null} desiredLanguageCode
 */
export const loadTranslationData = async (desiredLanguageCode) => {
    const state = globalObj._state;

    /**
     * @type {string}
     */
    let currentLanguageCode;

    /**
     * Make sure languageCode is valid before retrieving the translation object
     */
    if(desiredLanguageCode && validLanguageCode(desiredLanguageCode))
        currentLanguageCode = desiredLanguageCode;
    else
        currentLanguageCode = getCurrentLanguageCode();

    let currentTranslation = state._allTranslations[currentLanguageCode];

    if(!currentTranslation)
        return false;

    /**
     * If translation is a string, fetch the external json file and replace
     * the string (path to json file) with parsed language object
     */
    if(isString(currentTranslation)){

        const fetchedTranslation = await fetchJson(currentTranslation);

        if(!fetchedTranslation)
            return false;

        currentTranslation = fetchedTranslation;
    }

    state._currentTranslation = currentTranslation;
    setCurrentLanguageCode(currentLanguageCode);

    _log('CookieConsent [LANG]: set language: "' + currentLanguageCode + '"');

    return true;
};

/**
 * Toggle RTL class on/off based on current language
 */
export const handleRtlLanguage = () => {

    let rtlLanguages = globalObj._state._userConfig.language.rtl;
    let ccMain = globalObj._dom._ccMain;

    if(rtlLanguages && ccMain){

        if(!isArray(rtlLanguages))
            rtlLanguages = [rtlLanguages];

        if(elContains(rtlLanguages, globalObj._state._currentLanguageCode))
            addClass(ccMain, 'cc--rtl');
        else
            removeClass(ccMain, 'cc--rtl');
    }
};