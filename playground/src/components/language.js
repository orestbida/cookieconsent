import { defaultConfig } from './defaultConfig';
import { getState, saveState } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

const autoDetectModes = ['document', 'browser'];
const currentActiveLanguageSpan = getById('current-language');

/** @type {HTMLInputElement} **/ const autoDetectCheckbox = getById('auto-language');
/** @type {HTMLInputElement} **/ const detectedLanguageSpan = getById('detected-language');
/** @type {HTMLInputElement} **/ const translationFoundSpan = getById('translation-found');
/** @type {HTMLSelectElement} **/ const autoDetectModeSelect = getById('autodetect-mode');

const state = getState();
const language = state.cookieConsentConfig.language;
const allLanguages = Object.keys(language.translations);

const browserLanguage = getBrowserLanguage();

let autoDetectEnabled = autoDetectModes.includes(language.autoDetect);

if(autoDetectEnabled) {
    setAutoDetectMode(language.autoDetect || defaultConfig.language.autoDetect);
} else {
    setAutoDetectMode('');
}

addEvent(autoDetectCheckbox, 'change', () => {

    const state = getState();
    const language = state.cookieConsentConfig.language;
    const enable = autoDetectCheckbox.checked;

    if(enable){

        language.autoDetect ||= defaultConfig.language.autoDetect;

        if(allLanguages.includes(browserLanguage)){
            state.currLanguage = browserLanguage;
            // setActiveLanguage(browserLanguage);
        }

        setAutoDetectMode(language.autoDetect);

        setAutoDetectLanguage(browserLanguage);
    }else {
        language.autoDetect = undefined;
        state.currLanguage = language.default;

        setAutoDetectLanguage(false);
        setAutoDetectMode('');
        // setActiveLanguage(language.default);
    }

    saveState(state);

    window.CookieConsent
        .setLanguage(state.currLanguage)
        .then(()=>{
            window.CookieConsent.show(true);
        });
});

addEvent(autoDetectModeSelect, 'change', () => {
    const mode = autoDetectModeSelect.value;

    if(autoDetectModes.includes(mode)) {
        setAutoDetectMode(mode);
        const state = getState();
        state.cookieConsentConfig.language.autoDetect = mode;
        saveState(state);
    }
});

onEvent(customEvents._RESET, () => {
    const language = defaultConfig.language;
    autoDetectEnabled = autoDetectModes.includes(language.autoDetect);

    const currentLanguage = autoDetectEnabled
        ? browserLanguage
        : language.default;

    // setActiveLanguage(currentLanguage);

    setAutoDetectMode(language.autoDetect);
});


function getBrowserLanguage(){
    return navigator.language.slice(0,2);
}

function getDocumentLanguage(){
    return document.documentElement.lang.slice(0,2);
}

// /**
//  * @param {string} languageCode
//  */
// function setActiveLanguage(languageCode){
//     if(allLanguages.includes(languageCode))
//         currentActiveLanguageSpan.textContent = languageCode;
// }

/**
 * @param {string|boolean} languageCode
 */
function setAutoDetectLanguage(languageCode){

    if(languageCode && typeof languageCode === 'string'){

        autoDetectEnabled = true;
        autoDetectCheckbox.checked = true;
        detectedLanguageSpan.textContent = languageCode;

        translationFoundSpan.textContent = allLanguages.includes(languageCode)
            ? 'true'
            : 'false';

        // setActiveLanguage(languageCode);

        return;
    }

    if(autoDetectEnabled){
        autoDetectEnabled = false;
        autoDetectCheckbox.checked = false;
        detectedLanguageSpan.textContent = '-';
        translationFoundSpan.textContent = '-';
    }
}

/**
 * @param {string} mode
 */
function setAutoDetectMode(mode) {

    const validMode = autoDetectModes.includes(mode);

    if(validMode) {
        autoDetectModeSelect.value = mode;
    }

    const detectedLanguage = mode === 'browser'
        ? getBrowserLanguage()
        : getDocumentLanguage();

    setAutoDetectLanguage(validMode ? detectedLanguage : false);

    autoDetectModeSelect.disabled = !validMode;
}