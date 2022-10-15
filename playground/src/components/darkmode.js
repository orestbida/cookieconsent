import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent, addEvent, getById } from './utils';

/**
 * @type {HTMLInputElement}
 */
const checkbox = getById('darkmode');

toggleDarkmode(getState().darkmode);

addEvent(checkbox, 'click', () => {
    toggleDarkmode(checkbox.checked);

    const state = getState();
    state.darkmode = checkbox.checked;
    saveState(state);

    window.CookieConsent.show(true);
});

/**
 * Toggle darkmode on/off
 * @param {boolean} enable
 */
function toggleDarkmode(enable) {

    const classListAction = enable
        ? 'add'
        : 'remove';

    checkbox.checked = enable;
    document.documentElement.classList[classListAction]('cc--darkmode');
}

onEvent(customEvents._RESET, () => {
    toggleDarkmode(defaultState.darkmode);
});