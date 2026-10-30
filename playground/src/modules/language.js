import { defaultFullConfig } from './defaultConfig';
import { defaultConfig } from './defaultConfig';
import { defaultState, getState, reRunPlugin, saveState } from './stateManager';
import { enabledTranslation } from './translations';
import { addEvent, customEvents, getById, onEvent } from './utils';

const autoDetectModes = ['document', 'browser'];

/**
 * @type {string[]}
 */
let allLanguages = [];

/** @type {HTMLSpanElement} **/     const currentActiveLanguageSpan = getById('current-active-language');
/** @type {HTMLInputElement} **/    const autoDetectCheckbox        = getById('auto-language');
/** @type {HTMLInputElement} **/    const detectedLanguageSpan      = getById('detected-language');
/** @type {HTMLInputElement} **/    const translationFoundSpan      = getById('translation-found');
/** @type {HTMLSelectElement} **/   const autoDetectModeSelect      = getById('autodetect-mode');
/** @type {HTMLSelectElement} **/   const defaultLanguageSelect     = getById('default-language');

onEvent(customEvents._PLAYGROUND_READY, () => {
    const state = getState();
    const language = state._cookieConsentConfig.language;
    allLanguages = Object.keys(defaultFullConfig.language.translations);

    const autoDetectMode = language.autoDetect;
    const autoDetect = autoDetectEnabled(autoDetectMode);
    const detectedLanguage = detectLanguage(autoDetectMode, state);

    const currLang = autoDetect && enabledTranslation(detectedLanguage, state)
        ? detectedLanguage
        : language.default;

    if (autoDetect) {
        setAutoDetectMode(autoDetectMode);
        updateDetectedLanguage(detectedLanguage, state);
    } else {
        setAutoDetectMode('');
    }

    toggleAutoDetectCheckbox(autoDetect);
    updateDefaultLanguageOptions(state._enabledTranslations);
    updateDefaultLanguage(language.default);
    updateCurrentLanguage(currLang, false);
});

onEvent(customEvents._RESET, () => {
    const language = defaultConfig.language;
    const defaultLang = defaultConfig.language.default;
    updateDefaultLanguage(defaultLang);
    setAutoDetectMode(language.autoDetect);
    updateDetectedLanguage(detectLanguage(language.autoDetect, defaultState), defaultState);
    toggleAutoDetectCheckbox(true);
    updateDefaultLanguageOptions(defaultState._enabledTranslations);
    updateCurrentLanguage(defaultLang, defaultState);
});

addEvent(autoDetectCheckbox, 'change', () => {
    const state = getState();
    const language = state._cookieConsentConfig.language;
    const enable = autoDetectCheckbox.checked;

    if (enable) {

        language.autoDetect = language.autoDetect || defaultConfig.language.autoDetect;
        const detectedLang = detectLanguage(language.autoDetect, state);
        updateDetectedLanguage(detectedLang, state);

        if (enabledTranslation(detectedLang, state)) {
            updateCurrentLanguage(detectedLang, state);
        }

        setAutoDetectMode(language.autoDetect);
    }else {
        language.autoDetect = undefined;
        updateDetectedLanguage('', state);
        setAutoDetectMode('');
        updateCurrentLanguage(language.default, state);
    }

    saveState(state);
});

addEvent(autoDetectModeSelect, 'change', () => {
    const mode = autoDetectModeSelect.value;

    if (autoDetectEnabled(mode)) {
        const state = getState();
        state._cookieConsentConfig.language.autoDetect = mode;

        const detectedLanguage = detectLanguage(mode, state);
        updateDetectedLanguage(detectedLanguage, state);

        if (enabledTranslation(detectedLanguage, state)) {
            updateCurrentLanguage(detectedLanguage, state);
        }

        saveState(state);
    }
});

addEvent(defaultLanguageSelect, 'change', () => {
    const lang = defaultLanguageSelect.value;
    const state = getState();
    const language = state._cookieConsentConfig.language;

    if (enabledTranslation(lang, state)) {
        language.default = lang;
        const autoDetect = autoDetectEnabled(language.autoDetect);

        if (!autoDetect || !enabledTranslation(detectLanguage(language.autoDetect, state), state)) {
            updateCurrentLanguage(lang, state);
        }

        saveState(state);
    }
});


/**
     * @param {string|boolean} languageCode
     * @param {typeof defaultState} [state]
     */
export function updateDetectedLanguage(languageCode, state) {
    if (languageCode && typeof languageCode === 'string') {
        const validLanguage = enabledTranslation(languageCode, state || getState());
        updateTranslationFound(validLanguage);
        detectedLanguageSpan.textContent = languageCode;
        return;
    }

    detectedLanguageSpan.textContent = '-';
    translationFoundSpan.textContent = '-';
}

/**
 * @param {boolean} enable
 */
function toggleAutoDetectCheckbox(enable) {
    autoDetectCheckbox.checked = enable;
}

/**
 * @param {string} mode
 */
function setAutoDetectMode(mode) {
    const validMode = autoDetectEnabled(mode);
    validMode && (autoDetectModeSelect.value = mode);
    autoDetectModeSelect.disabled = !validMode;
}

/**
 * @param {string} lang
 */
export function updateDefaultLanguage(lang) {

    if (!lang)
        defaultLanguageSelect.value = 'disabled';

    if (allLanguages.includes(lang))
        defaultLanguageSelect.value = lang;
}

/**
 * @param {string[]} languages
 */
export function updateDefaultLanguageOptions(languages) {
    /**
     * @type {HTMLOptionElement[]}
     */
    const options = defaultLanguageSelect.children;

    for (const option of options) {
        option.style.display = languages.includes(option.value)
            ? ''
            : 'none';
    }
}

/**
 * @param {boolean} found
 */
export function updateTranslationFound(found) {
    translationFoundSpan.textContent = found
        ? 'yes'
        : 'no';
}

/**
 * @param {string} mode
 */
export function autoDetectEnabled(mode) {
    return autoDetectModes.includes(mode);
}

/**
 * The user's preferred languages, in the same order the plugin checks them
 * @returns {string[]}
 */
function getBrowserLanguages() {
    const languages = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language];

    return languages.map(language => language.slice(0,2));
}

function getDocumentLanguage() {
    return document.documentElement.lang.slice(0,2);
}

/**
 * @param {string} mode
 * @param {typeof defaultState} [state]
 */
export function detectLanguage(mode, state) {
    if (mode === 'browser') {
        const languages = getBrowserLanguages();
        return languages.find(language => enabledTranslation(language, state)) || languages[0];
    }

    if (mode === 'document')
        return getDocumentLanguage();

    return '';
}

/**
 * @param {string} languageCode
 */
export function updateCurrentLanguage(languageCode, newState) {
    const state = newState || getState();
    const currLanguage = enabledTranslation(languageCode, state)
        ? languageCode
        : '-';

    currentActiveLanguageSpan.textContent = currLanguage;

    if (currLanguage === '-') {
        window.CookieConsent && window.CookieConsent.reset();
        return;
    }

    if (newState === false)
        return;

    if (!getById('cc-main')) {
        setTimeout(() => {
            reRunPlugin(state, 1);
        }, 100);
    } else {
        reRunPlugin(state, 1);
    }
}