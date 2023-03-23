import '../assets/custom-themes/dark-turquoise.scss';
import '../assets/custom-themes/light-funky.scss';
import '../assets/custom-themes/elegant-black.scss';
import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent, addEvent, getById } from './utils';
import { toggleDarkmode } from './darkmode';

const html = document.documentElement;

let theme = getState()._theme;

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const inputs = document.querySelectorAll('input[name="theme"]');

toggleTheme(theme);

for(const input of inputs) {
    addEvent(input, 'change', () => {

        const state = getState();
        const currTheme = input.id;
        theme = state._theme;

        const isDefaultDarkMode = currTheme === 'cc--darkmode';

        state._theme = currTheme;
        saveState(state);

        toggleTheme(currTheme);
        toggleDarkmode(isDefaultDarkMode)

        CookieConsent.show(true);
    });
}

/**
 * @param {typeof defaultState._theme} currTheme
 */
export function toggleTheme(currTheme) {
    getById(currTheme).checked = true;

    html.classList.add(currTheme);
    theme !== currTheme && html.classList.remove(theme);
    theme = currTheme;
};

onEvent(customEvents._RESET, () => toggleTheme(defaultState._theme));