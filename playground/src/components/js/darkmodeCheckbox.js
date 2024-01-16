import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent, addEvent, getById } from './utils';
import { toggleTheme } from './customThemes';

const DEFAULT_DARK_THEME = 'cc--darkmode';
const DEFAULT_LIGHT_THEME = 'default-light';

/**
 * @type {HTMLInputElement}
 */
const checkbox = getById('darkmode-checkbox');

onEvent(customEvents._PLAYGROUND_READY, () => {
    toggleDarkmode(getState()._theme === DEFAULT_DARK_THEME);
});

addEvent(checkbox, 'change', () => {
    const state = getState();
    const currTheme = state._theme;

    /**
     * Remove current theme
     */
    document.documentElement.classList.remove(currTheme);

    state._theme = checkbox.checked
        ? DEFAULT_DARK_THEME
        : DEFAULT_LIGHT_THEME;

    toggleDarkmode(checkbox.checked);
    toggleTheme(state._theme);

    saveState(state);

    window.CookieConsent.show(true);
});

/**
 * @param {boolean} enable
 */
export function toggleDarkmode(enable) {
    const classListAction = enable
        ? 'add'
        : 'remove';

    checkbox.checked = enable;
    document.documentElement.classList[classListAction]('cc--darkmode');
}

onEvent(customEvents._RESET, () => {
    toggleDarkmode(defaultState._theme === DEFAULT_DARK_THEME);
});