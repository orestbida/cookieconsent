import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent, addEvent, getById } from './utils';

const DEFAULT_DARK_THEME = 'cc--darkmode';
const DEFAULT_LIGHT_THEME = 'default-light';

/**
 * @type {HTMLInputElement}
 */
const checkbox = getById('darkmode');

toggleDarkmode(getState()._theme === DEFAULT_DARK_THEME);

addEvent(checkbox, 'click', () => {
    toggleDarkmode(checkbox.checked);

    const state = getState();

    state._theme = checkbox.checked
        ? DEFAULT_DARK_THEME
        : DEFAULT_LIGHT_THEME;

    saveState(state);

    CookieConsent.show(true);
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
    toggleDarkmode(defaultState._theme === DEFAULT_DARK_THEME);
});