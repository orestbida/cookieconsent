import { defaultConfig } from './defaultConfig';
import { deepCopy, fireEvent, customEvents, addEvent } from './utils';

export const DEMO_ITEM_NAME = 'demoState';

export const defaultState = {
    _cookieConsentConfig: defaultConfig,
    _currLanguage: defaultConfig.language.default,

    _enabledTranslations: ['en'],
    _enabledCategories: ['necessary', 'analytics'],
    _enableCloseIcon: false,

    _removeAcceptNecessaryBtn: false,
    _removeShowPrefrencesBtn: false,
    _removeFooter: false,
    _removeTitle: false,

    /**
     * @type {'default-light' | 'cc--darkmode' | 'dark-turquoise' | 'light-funky' | 'elegant-black'}
     */
    _theme: 'cc--darkmode',

    /**
     * @type {import('../../../types').ConsentModalPosition}
     */
    _lastNonBarPosition: '',

    /**
     * @type {import('../../../types').ConsentModalPosition}
     */
    _lastBarPosition: '',

    /**
     * Increase on every new playground update
     */
    _demoRevision: 20
};

addEvent(window, customEvents._INIT, clearInvalidDemoState)

/**
 * Get current state
 * @returns {typeof defaultState} State
 */
export const getState = () => {
    const savedState = localStorage.getItem(DEMO_ITEM_NAME);

    if(savedState){
        try{
            return JSON.parse(savedState);
        }catch(e){
            //invalid state
        }
    }

    return deepCopy(defaultState);
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

function clearInvalidDemoState() {
    /**
     * @type {typeof defaultState}
     */
    let savedState = localStorage.getItem(DEMO_ITEM_NAME);

    if(savedState){
        try{
            savedState = JSON.parse(savedState);

            for(let key in defaultState){
                if(typeof savedState[key] !== typeof defaultState[key])
                    return resetState();
            }

            if(savedState._demoRevision !== defaultState._demoRevision)
                return resetState();

        }catch(e){
            return resetState();
        }
    }
}