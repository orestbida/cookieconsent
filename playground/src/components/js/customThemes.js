import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent, addEvent, getById } from './utils';
import { toggleDarkmode } from './darkmodeCheckbox';

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const inputs = document.querySelectorAll('input[name="theme"]');

/**
 * @type {typeof defaultState._theme}
 */
let theme = '';

onEvent(customEvents._PLAYGROUND_READY, () => {
    theme = getState()._theme;
    toggleTheme(theme);

    for (const input of inputs) {
        addEvent(input, 'change', () => {
            const state = getState();
            const currTheme = input.id;
            theme = state._theme;

            const isDefaultDarkMode = currTheme === 'cc--darkmode';

            state._theme = currTheme;
            saveState(state);

            toggleTheme(currTheme);
            toggleDarkmode(isDefaultDarkMode);

            window.CookieConsent.show(true);
        });
    }
});

/**
 * @param {typeof defaultState._theme} currTheme
 */
export const toggleTheme = (currTheme) => {
    getById(currTheme).checked = true;

    const { classList } = document.documentElement;

    classList.add(currTheme);

    if (theme && theme !== currTheme) {
        classList.remove(theme);
    }

    theme = currTheme;
}

onEvent(customEvents._RESET, () => toggleTheme(defaultState._theme));