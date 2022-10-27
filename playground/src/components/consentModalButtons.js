import '../assets/enableCloseIcon.scss'
import defaultConfig from './defaultConfig';
import { getState, saveState, defaultState } from "./stateManager";
import { addEvent, getById, customEvents, reRunPlugin } from "./utils";

const state = getState();
const enableXIconCheckbox = getById('close-icon');
const removeAcceptNecessaryBtnCheckbox = getById('accept-necessary-btn');
const removeShowPreferencesBtnCheckbox = getById('show-preferences-btn');

toggleCloseIcon(state.enableCloseIcon);
toggleRemoveAcceptNecessaryBtn(state.removeAcceptNecessaryBtn);
toggleRemoveShowPreferencesBtn(state.removeShowPrefrencesBtn);

addEvent(enableXIconCheckbox, 'change', function(){

    /**
     * @type {boolean}
     */
    const enabled = this.checked;

    toggleCloseIcon(enabled);

    const state = getState();
    state.enableCloseIcon = enabled;
    saveState(state);

    window.CookieConsent.show(true);
});

addEvent(removeAcceptNecessaryBtnCheckbox, 'change', function(){

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    toggleRemoveAcceptNecessaryBtn(remove);

    const state = getState();
    state.removeAcceptNecessaryBtn = remove;

    toggleBtn(state, 'acceptNecessaryBtn', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal')
});

addEvent(removeShowPreferencesBtnCheckbox, 'change', function(){

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    toggleRemoveShowPreferencesBtn(remove);

    const state = getState();
    state.removeShowPrefrencesBtn = remove;
    
    toggleBtn(state, 'showPreferencesBtn', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal')
});

addEvent(window, customEvents._RESET, () => {
    toggleCloseIcon(defaultState.enableCloseIcon);
    toggleRemoveAcceptNecessaryBtn(defaultState.removeAcceptNecessaryBtn);
    toggleRemoveShowPreferencesBtn(defaultState.removeShowPrefrencesBtn);
});

/**
 * @param {boolean} enable 
 */
function toggleCloseIcon(enable) {
    const classListAction = enable 
        ? 'add'
        : 'remove';

    document.body.classList[classListAction]('cc-showIcon');
    enableXIconCheckbox.checked = enable;
}

/**
 * @param {boolean} enable 
 */
function toggleRemoveAcceptNecessaryBtn(enable) {
    removeAcceptNecessaryBtnCheckbox.checked = enable;
}

/**
 * @param {boolean} enable 
 */
function toggleRemoveShowPreferencesBtn(enable) {
    removeShowPreferencesBtnCheckbox.checked = enable;
}

/**
 * @param {typeof defaultState} state 
 * @param {'showPreferencesBtn' | 'acceptNecessaryBtn'} btnName 
 * @param {boolean} remove 
 */
 function toggleBtn(state, btnName, remove){

    const translations = state.cookieConsentConfig.language.translations;
    
    for(let lang in translations){

        /**
         * @type {import('vanilla-cookieconsent').Translation}
         */
        const translation = translations[lang];
        translation.consentModal[btnName] = remove
            ? undefined
            : defaultConfig.language.translations[lang].consentModal[btnName];
    }
}