import '../assets/guiOptions.scss';
import { getState, saveState } from './stateManager';
import { onEvent, customEvents, reRunPlugin, addEvent } from './utils';

const CHANGE_EVENT = 'change';
const CONSENT_MODAL_NAME = 'consentModal';
const PREFERENCES_MODAL_NAME = 'preferencesModal';

const htmlElements = {
    consentModal: {
        /** @type {HTMLSelectElement} **/   layout: document.getElementById('cm-layout'),
        /** @type {HTMLSelectElement} **/   position: document.getElementById('cm-position'),
        /** @type {HTMLInputElement} **/    flipButtons: document.getElementById('cm-flip'),
        /** @type {HTMLInputElement} **/    equalWeightButtons: document.getElementById('cm-weight')
    },
    preferencesModal: {
        /** @type {HTMLSelectElement} **/   layout: document.getElementById('pm-layout'),
        /** @type {HTMLSelectElement} **/   position: document.getElementById('pm-position'),
        /** @type {HTMLInputElement} **/    flipButtons: document.getElementById('pm-flip'),
        /** @type {HTMLInputElement} **/    equalWeightButtons: document.getElementById('pm-weight')
    }
};

onEvent(customEvents._INIT, () => {
    setAllValues(CONSENT_MODAL_NAME);
    setAllValues(PREFERENCES_MODAL_NAME);
});

onEvent(customEvents._RESET, () => {
    setAllValues(CONSENT_MODAL_NAME);
    setAllValues(PREFERENCES_MODAL_NAME);
});


/** START: consentModal options */

addEvent(htmlElements[CONSENT_MODAL_NAME].layout, CHANGE_EVENT, function(){
    setGuiOptionsField(CONSENT_MODAL_NAME, 'layout', this.value);
});

addEvent(htmlElements[CONSENT_MODAL_NAME].position, CHANGE_EVENT, function(){
    setGuiOptionsField(CONSENT_MODAL_NAME, 'position', this.value);
});

addEvent(htmlElements[CONSENT_MODAL_NAME].flipButtons, CHANGE_EVENT, function(){
    setGuiOptionsField(CONSENT_MODAL_NAME, 'flipButtons', this.checked);
});

addEvent(htmlElements[CONSENT_MODAL_NAME].equalWeightButtons, CHANGE_EVENT, function(){
    setGuiOptionsField(CONSENT_MODAL_NAME, 'equalWeightButtons', this.checked);
});
/** END: consentModal options */


/** START: preferencesModal options */

let pmPositionOptionsDisabled = false;

addEvent(htmlElements[PREFERENCES_MODAL_NAME].layout, CHANGE_EVENT, function(){

    const layout = this.value;

    if(layout === 'box')
        disablePMPositionOptions(true);
    else if(pmPositionOptionsDisabled)
        disablePMPositionOptions(false);

    setGuiOptionsField(PREFERENCES_MODAL_NAME, 'layout', layout);
});

addEvent(htmlElements[PREFERENCES_MODAL_NAME].position, CHANGE_EVENT, function(){
    setGuiOptionsField(PREFERENCES_MODAL_NAME, 'position', this.value);
});

addEvent(htmlElements[PREFERENCES_MODAL_NAME].flipButtons, CHANGE_EVENT, function(){
    setGuiOptionsField(PREFERENCES_MODAL_NAME, 'flipButtons', this.checked);
});

addEvent(htmlElements[PREFERENCES_MODAL_NAME].equalWeightButtons, CHANGE_EVENT, function(){
    setGuiOptionsField(PREFERENCES_MODAL_NAME, 'equalWeightButtons', this.checked);
});
/** END: preferencesModal options */

/**
 * @param {string} key
 * @param {any} value
 */
function setGuiOptionsField(modalName, key, value) {
    const state = getState();
    state.cookieConsentConfig.guiOptions[modalName][key] = value;
    saveState(state);
    reRunPlugin(state.cookieConsentConfig, modalName);
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 */
function setAllValues(modalName){
    const guiOptions = window.CookieConsent.getConfig('guiOptions');
    const modal = guiOptions[modalName];

    setLayout(modalName, modal.layout, modal.position);
    setFlip(modalName, modal.flipButtons);
    setEqualWeight(modalName, modal.equalWeightButtons);
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {string} layout
 */
function setLayout(modalName, layout, position){
    htmlElements[modalName].layout.value = layout;

    setPosition(modalName, position, layout);
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {string} position
 * @param {string} [layout]
 */
function setPosition(modalName, position, layout){

    if(modalName === PREFERENCES_MODAL_NAME){
        if(layout === 'box')
            disablePMPositionOptions(true);
        else if(pmPositionOptionsDisabled)
            disablePMPositionOptions(false);
    }

    htmlElements[modalName].position.value = position;
}

function disablePMPositionOptions(disable){
    pmPositionOptionsDisabled = disable;
    htmlElements[PREFERENCES_MODAL_NAME].position.disabled = disable;
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {boolean} flip
 */
function setFlip(modalName, flip){
    htmlElements[modalName].flipButtons.checked = flip;
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {boolean} equal
 */
function setEqualWeight(modalName, equal){
    htmlElements[modalName].equalWeightButtons.checked = equal;
}