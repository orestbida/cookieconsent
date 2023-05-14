import { defaultFullConfig } from './defaultConfig';
import { getState, saveState, defaultState, reRunPlugin } from './stateManager';
import { addEvent, getById, customEvents } from './utils';

const state = getState();

/** @type {HTMLInputElement} **/ const enableXIconCheckbox = getById('close-icon');
/** @type {HTMLInputElement} **/ const removeAcceptNecessaryBtnCheckbox = getById('accept-necessary-btn');
/** @type {HTMLInputElement} **/ const removeShowPreferencesBtnCheckbox = getById('show-preferences-btn');
/** @type {HTMLInputElement} **/ const removeFooterCheckbox = getById('remove-footer');
/** @type {HTMLInputElement} **/ const removeTitleCheckbox = getById('remove-title');

toggleCloseIcon(state._enableCloseIcon);
toggleRemoveAcceptNecessaryBtn(state._removeAcceptNecessaryBtn);
toggleRemoveShowPreferencesBtn(state._removeShowPrefrencesBtn);
toggleRemoveFooter(state._removeFooter);
toggleRemoveTitle(state._removeTitle);

addEvent(enableXIconCheckbox, 'change', function(){

    /**
     * @type {boolean}
     */
    const enabled = this.checked;

    const state = getState();
    state._enableCloseIcon = enabled;

    toggleConsentModalElement(state, 'closeIconLabel', !enabled);
    saveState(state);
    reRunPlugin(state, 'consentModal');
});

addEvent(removeAcceptNecessaryBtnCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    const state = getState();
    state._removeAcceptNecessaryBtn = remove;

    toggleConsentModalElement(state, 'acceptNecessaryBtn', remove);
    saveState(state);
    reRunPlugin(state, 'consentModal');
});

addEvent(removeShowPreferencesBtnCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    const state = getState();
    state._removeShowPrefrencesBtn = remove;

    toggleConsentModalElement(state, 'showPreferencesBtn', remove);
    saveState(state);
    reRunPlugin(state, 'consentModal');
});

addEvent(removeFooterCheckbox, 'change', function() {

    /**
     * @type {boolean}
     */
    const remove = this.checked;

    const state = getState();
    state._removeFooter = remove;

    toggleConsentModalElement(state, 'footer', remove);
    saveState(state);
    reRunPlugin(state, 'consentModal');
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
    state._removeTitle = remove;

    toggleConsentModalElement(state, 'title', remove);
    saveState(state);
    reRunPlugin(state, 'consentModal');
});

addEvent(window, customEvents._RESET, () => {
    toggleCloseIcon(defaultState._enableCloseIcon);
    toggleRemoveAcceptNecessaryBtn(defaultState._removeAcceptNecessaryBtn);
    toggleRemoveShowPreferencesBtn(defaultState._removeShowPrefrencesBtn);
    toggleRemoveFooter(defaultState._removeFooter);
    toggleRemoveTitle(defaultState._removeTitle);
});

/**
 * @param {boolean} enable
 */
function toggleCloseIcon(enable) {
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

/**
 * @param {boolean} remove
 */
function toggleRemoveTitle(remove) {
    removeTitleCheckbox.checked = remove;

    /**
     * Disable close icon checkbox if title is removed
     */
    enableXIconCheckbox.disabled = remove;
}


/**
 * @param {typeof defaultState} state
 * @param {keyof import('../../../types').ConsentModalOptions} elementName
 * @param {boolean} remove
 */
function toggleConsentModalElement(state, elementName, remove){
    const translations = state._cookieConsentConfig.language.translations;

    for(let lang in translations){

        /**
         * @type {import('../../../types').Translation}
         */
        const translation = translations[lang];
        translation.consentModal[elementName] = remove
            ? undefined
            : defaultFullConfig.language.translations[lang].consentModal[elementName];
    }
}