import { saveState, getState, defaultState } from './stateManager';
import { customEvents, onEvent } from './utils';

/**
 * @type {HTMLInputElement}
 */
const checkbox = document.getElementById('darkmode');

toggleDarkmode(getState().darkmode);

checkbox.addEventListener('click', () => {
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
    if(enable){
        checkbox.checked = true;
        document.documentElement.classList.add('cc--darkmode');
    }else {
        checkbox.checked = false;
        document.documentElement.classList.remove('cc--darkmode');
    }
}

onEvent(customEvents._RESET, () => {
    toggleDarkmode(defaultState.darkmode);
});