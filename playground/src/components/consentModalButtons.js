import '../assets/enableCloseIcon.scss';
import '../assets/hideFooter.scss';
import defaultConfig from './defaultConfig';
import { getState, saveState, defaultState } from './stateManager';
import { addEvent, getById, customEvents, reRunPlugin } from './utils';

const state = getState();

/** @type {HTMLInputElement} **/ const enableXIconCheckbox = getById('close-icon');
/** @type {HTMLInputElement} **/ const removeAcceptNecessaryBtnCheckbox = getById('accept-necessary-btn');
/** @type {HTMLInputElement} **/ const removeShowPreferencesBtnCheckbox = getById('show-preferences-btn');
/** @type {HTMLInputElement} **/ const removeFooterCheckbox = getById('remove-footer');

toggleCloseIcon(state.enableCloseIcon);
toggleRemoveAcceptNecessaryBtn(state.removeAcceptNecessaryBtn);
toggleRemoveShowPreferencesBtn(state.removeShowPrefrencesBtn);
toggleRemoveFooter(state.removeFooter);

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

addEvent(removeAcceptNecessaryBtnCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    toggleRemoveAcceptNecessaryBtn(remove);

    const state = getState();
    state.removeAcceptNecessaryBtn = remove;

    toggleBtn(state, 'acceptNecessaryBtn', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal');
});

addEvent(removeShowPreferencesBtnCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    toggleRemoveShowPreferencesBtn(remove);

    const state = getState();
    state.removeShowPrefrencesBtn = remove;
    
    toggleBtn(state, 'showPreferencesBtn', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal');
});

addEvent(removeFooterCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    toggleRemoveFooter(remove);

    const state = getState();
    state.removeFooter = remove;
    saveState(state);
    window.CookieConsent.show(true);
});

addEvent(window, customEvents._RESET, () => {
    toggleCloseIcon(defaultState.enableCloseIcon);
    toggleRemoveAcceptNecessaryBtn(defaultState.removeAcceptNecessaryBtn);
    toggleRemoveShowPreferencesBtn(defaultState.removeShowPrefrencesBtn);
    toggleRemoveFooter(defaultState.removeFooter);
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
 * @param {boolean} remove 
 */
function toggleRemoveAcceptNecessaryBtn(remove) {
    removeAcceptNecessaryBtnCheckbox.checked = remove;
}

/**
 * @param {boolean} remove 
 */
function toggleRemoveShowPreferencesBtn(remove) {
    removeShowPreferencesBtnCheckbox.checked = remove;
}

/**
 * @param {boolean} remove 
 */
function toggleRemoveFooter(remove) {
    removeFooterCheckbox.checked = remove;
    const classListAction = remove 
        ? 'add'
        : 'remove';

    document.body.classList[classListAction]('cc-hideFooter');
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