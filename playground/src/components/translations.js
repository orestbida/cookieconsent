import { updateDefaultLanguageOptions, defaultLanguageSelect, updateDefaultLanguage, updateCurrentLanguage, detectLanguage, autoDetectEnabled, updateTranslationFound } from './language';
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
        const language = state.cookieConsentConfig.language;

        const languageFound = translations.includes(languageCode);

        if(enabled) {
            !languageFound && translations.push(languageCode);
        } else {
            languageFound && (state.enabledTranslations = state.enabledTranslations.filter(language => language !== languageCode));
        }

        toggleMissingTranslationError(state.enabledTranslations)
        updateDefaultLanguageOptions(state.enabledTranslations);

        const autoDetect = autoDetectEnabled(language.autoDetect);
        const autoDetectedLanguage = autoDetect ? detectLanguage(language.autoDetect) : '';

        const currLanguage =
            (enabledTranslation(autoDetectedLanguage, state) && autoDetectedLanguage)
            || (enabledTranslation(language.default, state) && language.default)
            || state.enabledTranslations[0]
            || '';

        if(autoDetect) {
            updateTranslationFound(currLanguage === autoDetectedLanguage);
        }

        if(!enabledTranslation(language.default, state)) {
            language.default = currLanguage;
            updateDefaultLanguage(currLanguage);
        }

        updateCurrentLanguage(currLanguage, state);

        saveState(state);

        currLanguage && CookieConsent.setLanguage(currLanguage);
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

/**
 *
 * @param {string} translation
 * @param {{}} [state]
 * @returns {boolean}
 */
export function enabledTranslation(translation, state) {
    return (state || getState()).enabledTranslations.includes(translation);
}