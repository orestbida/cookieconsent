import { defaultState, getState, saveState } from './stateManager';
import { customEvents, onEvent } from './utils';

/**
 * @type {HTMLInputElement}
 */
const checkbox = document.getElementById('disablePageInteraction');

checkbox.checked = !!getState().cookieConsentConfig.disablePageInteraction;

checkbox.addEventListener('change', () => {

    const state = getState();
    state.cookieConsentConfig.disablePageInteraction = checkbox.checked;
    saveState(state);

    const cookieconsent = window.CookieConsent;

    cookieconsent.reset();
    cookieconsent
        .run(state.cookieConsentConfig)
        .then(() => {
            cookieconsent.show(true);
        });
});

onEvent(customEvents._RESET, () => {
    checkbox.checked = defaultState.cookieConsentConfig.disablePageInteraction;
});