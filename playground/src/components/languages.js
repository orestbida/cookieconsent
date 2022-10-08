import defaultConfig from "./defaultConfig";
import { getState, saveState } from "./stateManager"

/**
 * @param {string} selector
 */
const getById = (selector) => document.getElementById(selector);
const browserLanguage = getBrowserLanguage();

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const inputs = document.querySelectorAll(`input[data-language]`)

/** @type {HTMLInputElement} **/ const autoDetectCheckbox = getById('auto-language')
/** @type {HTMLInputElement} **/ const detectedLanguageSpan = getById('detected-language')
/** @type {HTMLInputElement} **/ const translationFoundSpan = getById('translation-found')

const state = getState();
const allLanguages = Object.keys(state.cookieConsentConfig.language.translations)
const currentLanguage = state.currLanguage || state.cookieConsentConfig.language.default

let autoDetectEnabled = state.cookieConsentConfig.language.autoDetect === 'browser';

setActiveLanguage(currentLanguage)

if(autoDetectEnabled)
    setAutoDetectLanguage(currentLanguage)

inputs.forEach(input => {
    input.addEventListener('change', () => {
        const currLanguage = input.value

        const state = getState()
        state.cookieConsentConfig.language.default = currLanguage
        state.cookieConsentConfig.language.autoDetect = undefined
        state.currLanguage = currLanguage

        saveState(state)
        setAutoDetectLanguage(false)

        CookieConsent
            .setLanguage(currLanguage)
            .then(() => {
                CookieConsent.show(true)
            })
    })
})

autoDetectCheckbox.addEventListener('change', () => {

    const state = getState()
    const language = state.cookieConsentConfig.language

    if(autoDetectCheckbox.checked){

        language.autoDetect = 'browser'

        if(allLanguages.includes(browserLanguage)){
            state.currLanguage = browserLanguage;
            setActiveLanguage(browserLanguage)
        }

        setAutoDetectLanguage(browserLanguage)
    }else {
        language.autoDetect = undefined
        state.currLanguage = language.default

        setAutoDetectLanguage(false)
        setActiveLanguage(language.default)
    }

    saveState(state)

    CookieConsent
        .setLanguage(state.currLanguage)
        .then(()=>{
            CookieConsent.show(true)
        })
})


function getBrowserLanguage(){
    return navigator.language.slice(0,2);
}

/**
 * @param {string} languageCode
 */
function setActiveLanguage(languageCode){
    getById(`language-${languageCode}`).checked = true;
}

/**
 * @param {string|boolean} languageCode
 */
function setAutoDetectLanguage(languageCode){

    if(languageCode && typeof languageCode === 'string'){

        autoDetectEnabled = true
        autoDetectCheckbox.checked = true
        detectedLanguageSpan.textContent = languageCode

        translationFoundSpan.textContent = allLanguages.includes(languageCode)
            ? 'true'
            : 'false'

        return;
    }

    if(autoDetectEnabled){
        autoDetectEnabled = false;
        autoDetectCheckbox.checked = false
        detectedLanguageSpan.textContent = '-'
        translationFoundSpan.textContent = '-'
    }
}

window.addEventListener('cc:reset', () => {
    const language = defaultConfig.language;

    const currentLanguage = language.autoDetect === 'browser'
        ? browserLanguage
        : language.default

    setActiveLanguage(currentLanguage)

    if(autoDetectEnabled)
        setAutoDetectLanguage(currentLanguage)
});