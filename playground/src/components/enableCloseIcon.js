import '../assets/enableCloseIcon.scss'
import { getState, saveState, defaultState } from "./stateManager";
import { addEvent, getById, customEvents } from "./utils";

const CLASS = 'cc-showIcon';
const enableCheckbox = getById('close-icon');

toggleCloseIcon(getState().enableCloseIcon);

addEvent(enableCheckbox, 'change', function(){
    const enabled = this.checked;

    toggleCloseIcon(enabled);

    const state = getState();
    state.enableCloseIcon = enabled;
    saveState(state);

    window.CookieConsent.show(true);
});

addEvent(window, customEvents._RESET, () => {
    toggleCloseIcon(defaultState.enableCloseIcon);
});

/**
 * @param {boolean} enable 
 */
function toggleCloseIcon(enable) {
    const classListAction = enable 
        ? 'add'
        : 'remove';

    document.body.classList[classListAction](CLASS);
    enableCheckbox.checked = enable;
}