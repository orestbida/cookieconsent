import { defaultState, getState, reRunPlugin, saveState } from './stateManager';
import {addEvent, customEvents, getById, onEvent } from './utils';

/**
 * @type {HTMLInputElement}
 */
const checkbox = getById('disablePageInteraction-checkbox');

addEvent(checkbox, 'change', () => {
    const state = getState();
    state._cookieConsentConfig.disablePageInteraction = checkbox.checked;
    saveState(state);
    reRunPlugin(state, 1);
});

onEvent(customEvents._PLAYGROUND_READY, () => {
    checkbox.checked = !!getState()._cookieConsentConfig.disablePageInteraction;
});

onEvent(customEvents._RESET, () => {
    checkbox.checked = defaultState._cookieConsentConfig.disablePageInteraction;
});