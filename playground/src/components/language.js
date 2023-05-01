import { defaultFullConfig } from './defaultConfig';
import { defaultConfig } from './defaultConfig';
import { getState, saveState } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

const autoDetectModes = ['document', 'browser'];
const currentActiveLanguageSpan = getById('current-active-language');

/** @type {HTMLInputElement} **/ const autoDetectCheckbox = getById('auto-language');
/** @type {HTMLInputElement} **/ const detectedLanguageSpan = getById('detected-language');
/** @type {HTMLInputElement} **/ const translationFoundSpan = getById('translation-found');
/** @type {HTMLSelectElement} **/ const autoDetectModeSelect = getById('autodetect-mode');
/** @type {HTMLSelectElement} **/ export const defaultLanguageSelect = getById('default-language');

const state = getState();
const language = state.cookieConsentConfig.language;
const allLanguages = Object.keys(defaultFullConfig.language.translations);

let autoDetectEnabled = autoDetectModes.includes(language.autoDetect);
const detectedLanguage = autoDetectEnabled ? detectLanguage(language.autoDetect) : '';

/** [TODO: FIX ABOMINATION] */
const currLang = state.enabledTranslations.includes(detectedLanguage) ? detectedLanguage : state.currLanguage || state.cookieConsentConfig.language.default;

console.log('autoDetectEnabled', autoDetectEnabled)
console.log('detectedLanguage', detectedLanguage);

toggleAutoDetectCheckbox(autoDetectEnabled)

if(autoDetectEnabled) {
    setAutoDetectMode(language.autoDetect);
    setAutoDetectLanguage(detectedLanguage)
} else {
    setAutoDetectMode('');
}
console.log('currLang', currLang)
updateDefaultLanguageOptions(state.enabledTranslations);
setDefaultLanguage(language.default);
setActiveLanguage(currLang);

onEvent(customEvents._INIT, () => {
    window.CookieConsent.setLanguage(getState().currLanguage);
});

addEvent(autoDetectCheckbox, 'change', () => {

    const state = getState();
    const language = state.cookieConsentConfig.language;
    const enable = autoDetectCheckbox.checked;

    if(enable){

        language.autoDetect ||= defaultConfig.language.autoDetect;

        const detectedLang = detectLanguage(language.autoDetect);

        console.log('detected', detectedLang, state.enabledTranslations);

        if(state.enabledTranslations.includes(detectedLang)){
            state.currLanguage = detectedLang;
            setActiveLanguage(detectedLang);
        }

        setAutoDetectLanguage(detectedLang);
        setAutoDetectMode(language.autoDetect);

    }else {
        language.autoDetect = undefined;

        if(!state.enabledTranslations.includes(state.currLanguage))
            state.currLanguage = language.default;

        setAutoDetectLanguage(false);
        setAutoDetectMode('');
        setActiveLanguage(state.currLanguage);
    }

    saveState(state);
});

addEvent(autoDetectModeSelect, 'change', () => {
    const mode = autoDetectModeSelect.value;

    if(autoDetectModes.includes(mode)) {
        setAutoDetectMode(mode);
        const state = getState();

        const detectedLanguage = detectLanguage(mode);

        if(state.enabledTranslations.includes(detectedLanguage)){
            state.currLanguage = detectedLanguage;
            setActiveLanguage(detectedLanguage);
        }

        state.cookieConsentConfig.language.autoDetect = mode;
        saveState(state);
    }
});

addEvent(defaultLanguageSelect, 'change', () => {
    const lang = defaultLanguageSelect.value;
    const state = getState();

    if(state.enabledTranslations.includes(lang)){
        state.cookieConsentConfig.language.default = lang;
        state.currLanguage = lang;

        /** [TODO: FIX ABOMINATION] */
        (!state.cookieConsentConfig.language.autoDetect || !state.enabledTranslations.includes(detectLanguage(state.cookieConsentConfig.language.autoDetect))) && setActiveLanguage(lang, state);
        saveState(state);
    }
});

onEvent(customEvents._RESET, () => {
    const language = defaultConfig.language;
    const defaultLang = defaultConfig.language.default;
    autoDetectEnabled = autoDetectModes.includes(language.autoDetect);
    setDefaultLanguage(defaultLang);
    setAutoDetectMode(language.autoDetect);
    setAutoDetectLanguage(defaultLang)
    setActiveLanguage(defaultLang);
    toggleAutoDetectCheckbox(true);
});


function getBrowserLanguage(){
    return navigator.language.slice(0,2);
}

function getDocumentLanguage(){
    return document.documentElement.lang.slice(0,2);
}

/**
 * @param {string} mode
 */
export function detectLanguage(mode) {

    if(mode === 'browser')
        return getBrowserLanguage();
    else if(mode === 'document')
        return getDocumentLanguage()

    return '';
}

/**
 * @param {string} languageCode
 */
export function setActiveLanguage(languageCode, newState){

    const state = newState || getState();

    const currLanguage = state.enabledTranslations.includes(languageCode)
        ? languageCode
        : '-';

    currentActiveLanguageSpan.textContent = currLanguage;
}

/**
 * @param {string|boolean} languageCode
 */
function setAutoDetectLanguage(languageCode){

    if(languageCode && typeof languageCode === 'string'){

        const validLanguage = getState().enabledTranslations.includes(languageCode);

        translationFoundSpan.textContent = validLanguage
            ? 'true'
            : 'false';

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

    const validMode = autoDetectModes.includes(mode);

    if(validMode) {
        autoDetectModeSelect.value = mode;
    }

    autoDetectModeSelect.disabled = !validMode;
}

/**
 * @param {string} lang
 */
export function setDefaultLanguage(lang) {

    if(!lang)
        defaultLanguageSelect.value = 'disabled';

    if(allLanguages.includes(lang))
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

    for(const option of options) {

        option.style.display = languages.includes(option.value)
            ? ''
            : 'none';
    }
}