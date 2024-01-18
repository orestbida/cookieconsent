import { defaultState, getState, reRunPlugin, saveState } from './stateManager';
import {addEvent, customEvents, getById, onEvent } from './utils';

/**
 * @type {HTMLInputElement}
 */
const checkbox = getById('disableTransitions-checkbox');
const CLASS_NAME = 'cc--disable-transitions';

addEvent(checkbox, 'change', () => {
    const state = getState();
    const checked = checkbox.checked;
    state._disableTransitions = checked;
    toggleClass(CLASS_NAME, checked);
    saveState(state);
    reRunPlugin(state, 1);
});

onEvent(customEvents._PLAYGROUND_READY, () => {
    const checked = getState()._disableTransitions;
    checkbox.checked = checked;
    toggleClass(CLASS_NAME, checked);
});

onEvent(customEvents._RESET, () => {
    const checked = defaultState._disableTransitions;
    checkbox.checked = checked;
    toggleClass(CLASS_NAME, checked);
});

/**
 * @param {string} className
 * @param {boolean} enable
 */
const toggleClass = (className, enable) => {
    document.body.classList[enable ? 'add' : 'remove'](className);
}