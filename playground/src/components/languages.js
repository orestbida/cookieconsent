import { defaultConfig } from './defaultConfig';
import { getState, saveState } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

const browserLanguage = getBrowserLanguage();

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const inputs = document.querySelectorAll('input[name="language-code"]');

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

inputs.forEach(input => {
    addEvent(input, 'change', () => {
        const currLanguage = input.value;

        const state = getState();
        state.cookieConsentConfig.language.default = currLanguage;
        state.cookieConsentConfig.language.autoDetect = undefined;
        state.currLanguage = currLanguage;

        saveState(state);
        setAutoDetectLanguage(false);

        window.CookieConsent
            .setLanguage(currLanguage)
            .then(() => {
                window.CookieConsent.show(true);
            });
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
        getById(`language-${languageCode}`).checked = true;
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
});