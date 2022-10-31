import '../assets/enableCloseIcon.scss';

import defaultConfig from './defaultConfig';
import { getState, saveState, defaultState } from './stateManager';
import { addEvent, getById, customEvents, reRunPlugin } from './utils';

const state = getState();

/** @type {HTMLInputElement} **/ const enableXIconCheckbox = getById('close-icon');
/** @type {HTMLInputElement} **/ const removeAcceptNecessaryBtnCheckbox = getById('accept-necessary-btn');
/** @type {HTMLInputElement} **/ const removeShowPreferencesBtnCheckbox = getById('show-preferences-btn');
/** @type {HTMLInputElement} **/ const removeFooterCheckbox = getById('remove-footer');
/** @type {HTMLInputElement} **/ const removeTitleCheckbox = getById('remove-title');

toggleCloseIcon(state.enableCloseIcon);
toggleRemoveAcceptNecessaryBtn(state.removeAcceptNecessaryBtn);
toggleRemoveShowPreferencesBtn(state.removeShowPrefrencesBtn);
toggleRemoveFooter(state.removeFooter);
toggleRemoveTitle(state.removeTitle);

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

    const state = getState();
    state.removeAcceptNecessaryBtn = remove;

    toggleConsentModalElement(state, 'acceptNecessaryBtn', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal');
});

addEvent(removeShowPreferencesBtnCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    const state = getState();
    state.removeShowPrefrencesBtn = remove;

    toggleConsentModalElement(state, 'showPreferencesBtn', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal');
});

addEvent(removeFooterCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    const state = getState();
    state.removeFooter = remove;

    toggleConsentModalElement(state, 'footer', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal');
});

addEvent(removeTitleCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    /**
     * Disable close icon checkbox if title is removed
     */
    enableXIconCheckbox.disabled = remove;

    const state = getState();
    state.removeTitle = remove;

    toggleConsentModalElement(state, 'title', remove);
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, 'consentModal');
});

addEvent(window, customEvents._RESET, () => {
    toggleCloseIcon(defaultState.enableCloseIcon);
    toggleRemoveAcceptNecessaryBtn(defaultState.removeAcceptNecessaryBtn);
    toggleRemoveShowPreferencesBtn(defaultState.removeShowPrefrencesBtn);
    toggleRemoveFooter(defaultState.removeFooter);
    toggleRemoveTitle(defaultState.removeTitle);
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
}

function toggleRemoveTitle(remove) {
    removeTitleCheckbox.checked = remove;

    /**
     * Disable close icon checkbox if title is removed
     */
    enableXIconCheckbox.disabled = remove;
}


/**
 * @param {typeof defaultState} state
 * @param {keyof import('vanilla-cookieconsent').ConsentModalOptions} elementName
 * @param {boolean} remove
 */
function toggleConsentModalElement(state, elementName, remove){
    const translations = state.cookieConsentConfig.language.translations;

    for(let lang in translations){

        /**
         * @type {import('vanilla-cookieconsent').Translation}
         */
        const translation = translations[lang];
        translation.consentModal[elementName] = remove
            ? undefined
            : defaultConfig.language.translations[lang].consentModal[elementName];
    }
}