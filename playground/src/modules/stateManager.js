import { defaultConfig } from './defaultConfig';
import { deepCopy, fireEvent, customEvents } from './utils';

export const DEMO_ITEM_NAME = 'demoState';

export const defaultState = {
    _cookieConsentConfig: defaultConfig,
    _currLanguage: defaultConfig.language.default,

    _enabledTranslations: ['en'],
    _enabledCategories: ['necessary', 'analytics'],

    _disableTransitions: false,

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
    _demoRevision: 34
};

/**
 * Get current state
 * @returns {typeof defaultState} State
 */
export const getState = () => {
    const savedState = localStorage.getItem(DEMO_ITEM_NAME);

    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (e) {
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

    if (cc.validConsent())
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
    try {
        newState && localStorage.setItem(
            DEMO_ITEM_NAME,
            JSON.stringify(newState)
        );
    } catch (e) {
        console.error('Failed to save state:', e);
    }
};

export function clearInvalidDemoState() {
    /**
     * @type {typeof defaultState}
     */
    let savedState = localStorage.getItem(DEMO_ITEM_NAME);

    if (savedState) {
        try {
            savedState = JSON.parse(savedState);

            for (let key in defaultState) {
                if (typeof savedState[key] !== typeof defaultState[key])
                    return resetState();
            }

            if (savedState._demoRevision !== defaultState._demoRevision)
                return resetState();

        } catch (e) {
            return resetState();
        }
    }
}

/**
 * @param {typeof defaultState} state
 */
export const getCurrentUserConfig = (state) => {
    /**
     * @type {import('../../../types').CookieConsentConfig}
     */
    const config = deepCopy(state._cookieConsentConfig);
    const allTranslations = config.language.translations;

    /**
     * Remove unneeded fields
     */
    delete config.root;
    delete config.cookie;

    if (!config.disablePageInteraction)
        delete config.disablePageInteraction;

    /**
     * Remove unselected translations
     */
    for (const languageCode in allTranslations) {

        if (!state._enabledTranslations.includes(languageCode)) {
            delete allTranslations[languageCode];
        } else {

            /**
             * @type {import('../../../types').Translation}
             */
            const translation = allTranslations[languageCode];

            /**
             * TODO: label not implemented
             */
            delete translation.consentModal.label;

            const preferencesModal = translation.preferencesModal;

            /**
             * Remove all sections with a 'linkedCategory' that is not selected by the user
             */
            const filteredSections = preferencesModal.sections.filter(section => {
                /**
                 * TODO: cookieTable not implemented
                 */
                delete section.cookieTable;

                return !section.linkedCategory
                    || state._enabledCategories.includes(section.linkedCategory);
            });

            preferencesModal.sections = filteredSections;
        }
    }

    if (!('ar' in allTranslations))
        delete config.language.rtl;

    /**
     * Remove unselected categories
     */
    for (const category in config.categories) {
        if (!state._enabledCategories.includes(category)) {
            delete config.categories[category];
        }
    }

    return config;
};

/**
 * @param {typeof defaultState} state
 * @param {1 | 2} [showModal]
 */
export const reRunPlugin = (state, showModal) => {
    const cc = window.CookieConsent;

    cc.reset();
    const config = getCurrentUserConfig(state);

    cc.run(config).then(() => {
        showModal === 1 && cc.show(true);
        showModal === 2 && cc.showPreferences();
    });
};