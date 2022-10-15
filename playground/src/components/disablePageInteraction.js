import { defaultState, getState, saveState } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

/**
 * @type {HTMLInputElement}
 */
const checkbox = getById('disablePageInteraction');

checkbox.checked = !!getState().cookieConsentConfig.disablePageInteraction;

addEvent(checkbox, 'change', () => {

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