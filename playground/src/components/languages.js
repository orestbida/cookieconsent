import { defaultConfig } from './defaultConfig';
import { defaultState, getState, saveState } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

const browserLanguage = getBrowserLanguage();

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const translationInputs = document.querySelectorAll('input[name="language-code"]');

const currentActiveLanguageSpan = getById('current-language');

/** @type {HTMLInputElement} **/ const autoDetectCheckbox = getById('auto-language');
/** @type {HTMLInputElement} **/ const detectedLanguageSpan = getById('detected-language');
/** @type {HTMLInputElement} **/ const translationFoundSpan = getById('translation-found');

const state = getState();
const allLanguages = Object.keys(state.cookieConsentConfig.language.translations);
const currentLanguage = state.currLanguage || state.cookieConsentConfig.language.default;

let autoDetectEnabled = state.cookieConsentConfig.language.autoDetect === 'browser';

if(autoDetectEnabled)
    setAutoDetectLanguage(getBrowserLanguage());
else
    setActiveLanguage(currentLanguage);

toggleTranslations(state.enabledTranslations);

translationInputs.forEach(input => {
    addEvent(input, 'change', () => {
        const languageCode = input.value;
        const enabled = input.checked;

        const state = getState();
        const translations = state.enabledTranslations;

        const languageFound = translations.includes(languageCode);

        if(enabled) {
            !languageFound && translations.push(languageCode);
        } else {
            languageFound && (state.enabledTranslations = state.enabledTranslations.filter(language => language !== languageCode));
        }

        saveState(state);
    });
});

addEvent(autoDetectCheckbox, 'change', () => {

    const state = getState();
    const language = state.cookieConsentConfig.language;

    if(autoDetectCheckbox.checked){

        language.autoDetect = 'browser';

        if(allLanguages.includes(browserLanguage)){
            state.currLanguage = browserLanguage;
            setActiveLanguage(browserLanguage);
        }

        setAutoDetectLanguage(browserLanguage);
    }else {
        language.autoDetect = undefined;
        state.currLanguage = language.default;

        setAutoDetectLanguage(false);
        setActiveLanguage(language.default);
    }

    saveState(state);

    window.CookieConsent
        .setLanguage(state.currLanguage)
        .then(()=>{
            window.CookieConsent.show(true);
        });
});


function getBrowserLanguage(){
    return navigator.language.slice(0,2);
}

/**
 * @param {string} languageCode
 */
function setActiveLanguage(languageCode){
    if(allLanguages.includes(languageCode))
        currentActiveLanguageSpan.textContent = languageCode;
}

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

        setActiveLanguage(languageCode);

        return;
    }

    if(autoDetectEnabled){
        autoDetectEnabled = false;
        autoDetectCheckbox.checked = false;
        detectedLanguageSpan.textContent = '-';
        translationFoundSpan.textContent = '-';
    }
}

onEvent(customEvents._RESET, () => {
    const language = defaultConfig.language;
    autoDetectEnabled = language.autoDetect === 'browser';

    const currentLanguage = autoDetectEnabled
        ? browserLanguage
        : language.default;

    setActiveLanguage(currentLanguage);

    if(autoDetectEnabled)
        setAutoDetectLanguage(currentLanguage);

    toggleTranslations(defaultState.enabledTranslations)
});

/**
 * @param {string[]} enabledTranslations
 */
function toggleTranslations(enabledTranslations) {
    for(const input of translationInputs) {
        input.checked = enabledTranslations.includes(input.value);
    }
}