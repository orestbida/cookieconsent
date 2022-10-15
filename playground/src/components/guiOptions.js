import '../assets/guiOptions.scss';
import defaultConfig from './defaultConfig';
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

const cmLayoutYValues = ['top', 'bottom', 'middle'];
const cmLayoutXValues = ['left', 'center', 'right'];

/**
 * @type {string}
 */
let previousLayout;

addEvent(htmlElements[CONSENT_MODAL_NAME].layout, CHANGE_EVENT, function(){

    /**
     * @type {string}
     */
    const layout = this.value;
    const isBarLayout = layout.startsWith('bar');

    setGuiOptionsField(CONSENT_MODAL_NAME, 'layout', layout);

    if(previousLayout.startsWith('bar') !== isBarLayout){
        previousLayout = layout;
        generateCMPositionOptions(!isBarLayout);

        const state = getState();
        const consentModal = state.cookieConsentConfig.guiOptions.consentModal;

        if(isBarLayout){
            if(consentModal.position !== 'top' || consentModal.position !== 'bottom'){
                consentModal.position = htmlElements[CONSENT_MODAL_NAME].position.value = 'bottom';
            }
        }else{
            consentModal.position = htmlElements[CONSENT_MODAL_NAME].position.value = defaultConfig.guiOptions.consentModal.position;
        }

        saveState(state);
    }

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
    previousLayout = layout;
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

    if(modalName === CONSENT_MODAL_NAME)
        generateCMPositionOptions(!layout.startsWith('bar'));

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

/**
 * @param {string[]} yAlignments
 * @param {string[]} [xAlignments]
 */
function generateOptions(yAlignments, xAlignments){

    const allOptions = document.createDocumentFragment();

    yAlignments.forEach(y => {
        let optionValue = y;

        if(xAlignments){
            xAlignments.forEach(x => {
                optionValue = y + ' ' + x;
                generateOption(optionValue);
            })
        }else{
            generateOption(optionValue);
        }

    })

    function generateOption(value){
        let option = document.createElement('option');
        option.text = option.value = value;
        allOptions.appendChild(option);
    }

    return allOptions;
}

/**
 * @param {boolean} all
 */
function generateCMPositionOptions(all){
    let newOptions;

    if(all){
        newOptions = generateOptions(
            cmLayoutYValues,
            cmLayoutXValues
        )
    }else{
        newOptions = generateOptions(cmLayoutYValues.slice(0, 2))
    }

    htmlElements[CONSENT_MODAL_NAME].position.replaceChildren(newOptions);
}