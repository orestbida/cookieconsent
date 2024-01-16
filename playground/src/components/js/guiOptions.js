import { defaultConfig } from './defaultConfig';
import { getState, reRunPlugin, saveState } from './stateManager';
import { onEvent, customEvents, addEvent, getById } from './utils';

const CHANGE_EVENT = 'change';
const CONSENT_MODAL_NAME = 'consentModal';
const PREFERENCES_MODAL_NAME = 'preferencesModal';

const htmlElements = {
    consentModal: {
        /** @type {HTMLSelectElement} **/   layout: getById('cm-layout'),
        /** @type {HTMLSelectElement} **/   position: getById('cm-position'),
        /** @type {HTMLInputElement} **/    flipButtons: getById('cm-flip'),
        /** @type {HTMLInputElement} **/    equalWeightButtons: getById('cm-weight')
    },
    preferencesModal: {
        /** @type {HTMLSelectElement} **/   layout: getById('pm-layout'),
        /** @type {HTMLSelectElement} **/   position: getById('pm-position'),
        /** @type {HTMLInputElement} **/    flipButtons: getById('pm-flip'),
        /** @type {HTMLInputElement} **/    equalWeightButtons: getById('pm-weight')
    }
};

const cmLayoutYValues = ['top', 'middle', 'bottom'];
const cmLayoutXValues = ['left', 'center', 'right'];

/**
 * @type {import('../../../types').ConsentModalLayout}
 */
let currentCMLayoutValue = '';

/**
 * @type {import('../../../types').PreferencesModalLayout}
 */
let currentPMLayoutValue = '';

/**
 * @param {import('../../../types').ConsentModalPosition} position
 */
const validBarPositions = (position) => position === 'top' || position === 'bottom';

let pmPositionOptionsDisabled = false;

addEvent(htmlElements[CONSENT_MODAL_NAME].layout, CHANGE_EVENT, function() {
    currentCMLayoutValue = this.value;
    updateGuiOptionsState(CONSENT_MODAL_NAME, 'layout', currentCMLayoutValue);
});

addEvent(htmlElements[CONSENT_MODAL_NAME].position, CHANGE_EVENT, function() {
    updateGuiOptionsState(CONSENT_MODAL_NAME, 'position', this.value);
});

addEvent(htmlElements[CONSENT_MODAL_NAME].flipButtons, CHANGE_EVENT, function() {
    updateGuiOptionsState(CONSENT_MODAL_NAME, 'flipButtons', this.checked);
});

addEvent(htmlElements[CONSENT_MODAL_NAME].equalWeightButtons, CHANGE_EVENT, function() {
    updateGuiOptionsState(CONSENT_MODAL_NAME, 'equalWeightButtons', this.checked);
});


addEvent(htmlElements[PREFERENCES_MODAL_NAME].layout, CHANGE_EVENT, function() {
    currentPMLayoutValue = this.value;
    updateGuiOptionsState(PREFERENCES_MODAL_NAME, 'layout', currentPMLayoutValue);
});

addEvent(htmlElements[PREFERENCES_MODAL_NAME].position, CHANGE_EVENT, function() {
    updateGuiOptionsState(PREFERENCES_MODAL_NAME, 'position', this.value);
});

addEvent(htmlElements[PREFERENCES_MODAL_NAME].flipButtons, CHANGE_EVENT, function() {
    updateGuiOptionsState(PREFERENCES_MODAL_NAME, 'flipButtons', this.checked);
});

addEvent(htmlElements[PREFERENCES_MODAL_NAME].equalWeightButtons, CHANGE_EVENT, function() {
    updateGuiOptionsState(PREFERENCES_MODAL_NAME, 'equalWeightButtons', this.checked);
});

onEvent(customEvents._INIT, () => {
    setAllValues(CONSENT_MODAL_NAME);
    setAllValues(PREFERENCES_MODAL_NAME);
});

onEvent(customEvents._RESET, () => {
    setAllValues(CONSENT_MODAL_NAME);
    setAllValues(PREFERENCES_MODAL_NAME);
});

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {string} key
 * @param {any} value
 */
function updateGuiOptionsState(modalName, key, value) {
    const state = getState();

    if (modalName === CONSENT_MODAL_NAME) {
        if (key === 'layout') {
            const layout = currentCMLayoutValue;
            const isBarLayout = layout.startsWith('bar');

            const consentModal = state._cookieConsentConfig.guiOptions.consentModal;
            const currentPosition = consentModal.position;

            if (validBarPositions(currentPosition)) {
                state._lastBarPosition = currentPosition;
            } else {
                state._lastNonBarPosition = currentPosition;
            }

            if (!isBarLayout && validBarPositions(currentPosition) || isBarLayout && !validBarPositions(currentPosition)) {
                generateCMPositionOptions(!isBarLayout);

                if (isBarLayout) {
                    if (!validBarPositions(currentPosition))
                        consentModal.position = htmlElements[CONSENT_MODAL_NAME].position.value = state._lastBarPosition || 'bottom';
                } else {
                    consentModal.position = htmlElements[CONSENT_MODAL_NAME].position.value = state._lastNonBarPosition || defaultConfig.guiOptions.consentModal.position;
                }
            }
        }

        if (key === 'position') {
            const currentPosition = state._cookieConsentConfig.guiOptions.consentModal.position;

            if (validBarPositions(currentPosition)) {
                state._lastBarPosition = currentPosition;
            } else {
                state._lastNonBarPosition = currentPosition;
            }
        }
    }else {
        if (key === 'layout') {
            if (currentPMLayoutValue === 'box')
                disablePMPositionOptions(true);
            else if (pmPositionOptionsDisabled)
                disablePMPositionOptions(false);
        }
    }

    state._cookieConsentConfig.guiOptions[modalName][key] = value;
    saveState(state);
    reRunPlugin(state, modalName === 'consentModal' ? 1 : 2);
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 */
function setAllValues(modalName) {
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
function setLayout(modalName, layout, position) {
    htmlElements[modalName].layout.value = layout;
    setPosition(modalName, position, layout);
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {string} position
 * @param {string} [layout]
 */
function setPosition(modalName, position, layout) {
    if (modalName === PREFERENCES_MODAL_NAME) {
        if (layout === 'box') {
            disablePMPositionOptions(true);
        } else if (pmPositionOptionsDisabled) {
            disablePMPositionOptions(false);
        }
    }

    if (modalName === CONSENT_MODAL_NAME)
        generateCMPositionOptions(!layout.startsWith('bar'));

    htmlElements[modalName].position.value = position;
}

function disablePMPositionOptions(disable) {
    pmPositionOptionsDisabled = disable;
    htmlElements[PREFERENCES_MODAL_NAME].position.disabled = disable;
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {boolean} flip
 */
function setFlip(modalName, flip) {
    htmlElements[modalName].flipButtons.checked = flip;
}

/**
 * @param {'consentModal' | 'preferencesModal'} modalName
 * @param {boolean} equal
 */
function setEqualWeight(modalName, equal) {
    htmlElements[modalName].equalWeightButtons.checked = equal;
}

/**
 * @param {string[]} yAlignments
 * @param {string[]} [xAlignments]
 */
function generateOptions(yAlignments, xAlignments) {
    const allOptions = document.createDocumentFragment();

    yAlignments.forEach(y => {
        let optionValue = y;

        if (xAlignments) {
            xAlignments.forEach(x => {
                optionValue = y + ' ' + x;
                generateOption(optionValue);
            });
        } else {
            generateOption(optionValue);
        }

    });

    function generateOption(value) {
        let option = document.createElement('option');
        option.text = option.value = value;
        allOptions.appendChild(option);
    }

    return allOptions;
}

/**
 * @param {boolean} all
 */
function generateCMPositionOptions(all) {
    let newOptions;

    if (all) {
        newOptions = generateOptions(
            cmLayoutYValues,
            cmLayoutXValues
        );
    } else {
        newOptions = generateOptions(['top', 'bottom']);
    }

    htmlElements[CONSENT_MODAL_NAME].position.textContent = '';
    htmlElements[CONSENT_MODAL_NAME].position.appendChild(newOptions);
}