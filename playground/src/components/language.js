import { defaultFullConfig } from './defaultConfig';
import { defaultConfig } from './defaultConfig';
import { defaultState, getState, saveState } from './stateManager';
import { enabledTranslation } from './translations';
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

const autoDetectMode = language.autoDetect;
const autoDetect = autoDetectEnabled(autoDetectMode);
const detectedLanguage = detectLanguage(autoDetectMode);

const currLang = autoDetect && enabledTranslation(detectedLanguage, state)
    ? detectedLanguage
    : language.default;

if(autoDetect) {
    setAutoDetectMode(autoDetectMode);
    updateDetectedLanguage(detectedLanguage, state)
} else {
    setAutoDetectMode('');
}

toggleAutoDetectCheckbox(autoDetect)
updateDefaultLanguageOptions(state.enabledTranslations);
updateDefaultLanguage(language.default);
updateCurrentLanguage(currLang);

addEvent(autoDetectCheckbox, 'change', () => {

    const state = getState();
    const language = state.cookieConsentConfig.language;
    const enable = autoDetectCheckbox.checked;



    if(enable){

        language.autoDetect ||= defaultConfig.language.autoDetect;
        const detectedLang = detectLanguage(language.autoDetect);
        updateDetectedLanguage(detectedLang, state);

        if(enabledTranslation(detectedLang, state)){
            updateCurrentLanguage(detectedLang);
        }

        setAutoDetectMode(language.autoDetect);

    }else {
        language.autoDetect = undefined;
        updateDetectedLanguage('', state);
        setAutoDetectMode('');
        updateCurrentLanguage(language.default);
    }

    saveState(state);
});

addEvent(autoDetectModeSelect, 'change', () => {
    const mode = autoDetectModeSelect.value;

    if(autoDetectEnabled(mode)) {
        const state = getState();

        const detectedLanguage = detectLanguage(mode);
        updateDetectedLanguage(detectedLanguage);

        if(enabledTranslation(detectedLanguage, state)){
            updateCurrentLanguage(detectedLanguage);
        }

        state.cookieConsentConfig.language.autoDetect = mode;
        saveState(state);
    }
});

addEvent(defaultLanguageSelect, 'change', () => {
    const lang = defaultLanguageSelect.value;
    const state = getState();
    const language = state.cookieConsentConfig.language;

    if(enabledTranslation(lang, state)){
        language.default = lang;
        const autoDetect = autoDetectEnabled(language.autoDetect);

        if(!autoDetect || !enabledTranslation(detectLanguage(language.autoDetect), state)) {
            updateCurrentLanguage(lang, state);
        }

        saveState(state);
    }
});

onEvent(customEvents._RESET, () => {
    const language = defaultConfig.language;
    const defaultLang = defaultConfig.language.default;
    updateDefaultLanguage(defaultLang);
    setAutoDetectMode(language.autoDetect);
    updateDetectedLanguage(defaultLang, defaultState);
    updateCurrentLanguage(defaultLang, defaultState);
    toggleAutoDetectCheckbox(true);
    updateDefaultLanguageOptions(defaultState.enabledTranslations);
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
export function updateCurrentLanguage(languageCode, newState){

    const state = newState || getState();

    const currLanguage = enabledTranslation(languageCode, state)
        ? languageCode
        : '-';

    currentActiveLanguageSpan.textContent = currLanguage;
}

/**
 * @param {string|boolean} languageCode
 */
function updateDetectedLanguage(languageCode, state){

    if(languageCode && typeof languageCode === 'string'){

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

    if(validMode) {
        autoDetectModeSelect.value = mode;
    }

    autoDetectModeSelect.disabled = !validMode;
}

/**
 * @param {string} lang
 */
export function updateDefaultLanguage(lang) {

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

/**
 * @param {boolean} found
 */
export function updateTranslationFound(found) {
    translationFoundSpan.textContent = found
        ? 'true'
        : 'false';
}

export function autoDetectEnabled(mode) {
    return autoDetectModes.includes(mode);
}