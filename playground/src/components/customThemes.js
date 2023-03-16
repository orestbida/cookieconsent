import '../assets/custom-themes/dark-turquoise.scss';
import '../assets/custom-themes/light-funky.scss';
import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent, addEvent, getById } from './utils';

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

        state._theme = currTheme;
        saveState(state);

        toggleTheme(currTheme);

        CookieConsent.show(true);
    });
}

/**
 * @param {typeof defaultState._theme} currTheme
 */
function toggleTheme(currTheme) {
    getById(currTheme).checked = true;

    html.classList.add(currTheme);
    theme !== currTheme && html.classList.remove(theme);
    theme = currTheme;
};

onEvent(customEvents._RESET, () => toggleTheme(defaultState._theme));