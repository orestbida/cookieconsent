import { defaultState, getState, saveState } from './stateManager';
import { addEvent, customEvents, onEvent } from './utils';

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const translationInputs = document.querySelectorAll('input[name="language-code"]');


toggleTranslations(getState().enabledTranslations);

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