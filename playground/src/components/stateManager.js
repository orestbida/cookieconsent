import defaultConfig from './defaultConfig';
import { deepCopy, fireEvent, customEvents } from './utils';

export const DEMO_ITEM_NAME = 'demoState';

export const defaultState = {
    cookieConsentConfig: defaultConfig,
    darkmode: false,
    currLanguage: defaultConfig.language.default
};

/**
 * Get current state
 * @returns {typeof defaultState} State
 */
export const getState = () => {
    const savedState = localStorage.getItem(DEMO_ITEM_NAME);

    return savedState
        ? JSON.parse(savedState)
        : deepCopy(defaultState);
};

/**
 * Erase cookies
 */
export const resetCookies = () => {
    const cc = window.CookieConsent;

    if(cc.validConsent())
        cc.acceptCategory([]);

    cc.eraseCookies(cc.getConfig('cookie').name);
};

/**
 * Clear localstorage, cookies and re-run plugin
 */
export const resetState = () => {

    resetCookies();
    localStorage.removeItem(DEMO_ITEM_NAME);

    window.CookieConsent.reset(true);
    window.CookieConsent.run(defaultConfig);

    /**
     * Notify other components
     */
    fireEvent(customEvents._RESET);
};

/**
 * Save new state in localstorage
 * @param {typeof defaultState} newState
 */
export const saveState = (newState) => {
    newState && localStorage.setItem(
        DEMO_ITEM_NAME,
        JSON.stringify(newState)
    );
};