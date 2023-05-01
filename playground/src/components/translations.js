import { updateDefaultLanguageOptions, defaultLanguageSelect, setDefaultLanguage, setActiveLanguage, detectLanguage } from './language';
import { defaultState, getState, saveState } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const translationInputs = document.querySelectorAll('input[name="language-code"]');
const translationsSection = getById('translations-section');

/**
 * @type {HTMLButtonElement}
 */
const editTranslationsBtn = getById('edit-translations-btn');
const editTranslationsBtnText = editTranslationsBtn.textContent;

const enabledTranslations = getState().enabledTranslations;

toggleTranslations(enabledTranslations);
toggleMissingTranslationError(enabledTranslations);

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

        toggleMissingTranslationError(state.enabledTranslations)
        updateDefaultLanguageOptions(state.enabledTranslations);

        if(!state.enabledTranslations.includes(defaultLanguageSelect.value)) {
            const currentDefaultLang = state.enabledTranslations[0] || '';
            setDefaultLanguage(currentDefaultLang);
            state.cookieConsentConfig.language.default = currentDefaultLang;

            state.currLanguage = currentDefaultLang;
            currentDefaultLang && window.CookieConsent.setLanguage(currentDefaultLang);
        }

        /** [TODO: FIX ABOMINATION] */
        if(state.cookieConsentConfig.language.autoDetect && state.enabledTranslations.includes(detectLanguage(state.cookieConsentConfig.language.autoDetect))) {
            setActiveLanguage(detectLanguage(state.cookieConsentConfig.language.autoDetect), state);
        } else {
            setActiveLanguage(state.cookieConsentConfig.language.default, state, );
        }

        saveState(state);
    });
});

onEvent(customEvents._RESET, () => {
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

/**
 * @param {string[]} enabledTranslations
 */
function toggleMissingTranslationError(enabledTranslations) {

    const error = enabledTranslations.length === 0;

    translationsSection.classList[error
        ? 'add'
        : 'remove'
    ]('no-translations-error');

    editTranslationsBtn.disabled = error;
    editTranslationsBtn.textContent = error
        ? 'Translation required'
        : editTranslationsBtnText;
}