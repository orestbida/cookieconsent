import { defaultFullConfig } from './defaultConfig';
import { getState, saveState, defaultState, reRunPlugin } from './stateManager';
import { addEvent, customEvents, getById, onEvent } from './utils';

/** @type {HTMLInputElement} **/ const enableXIconCheckbox = getById('close-icon-checkbox');

const onChangeHandler = () => {
    const enabled = enableXIconCheckbox.checked;

    const state = getState();
    state._enableCloseIcon = enabled;

    toggleConsentModalElement(state, 'closeIconLabel', !enabled);
    saveState(state);
    reRunPlugin(state, 1);
};

addEvent(enableXIconCheckbox, 'change', onChangeHandler);

onEvent(customEvents._PLAYGROUND_READY, () => {
    toggleCloseIcon(getState()._enableCloseIcon);
});

addEvent(window, customEvents._RESET, () => {
    toggleCloseIcon(defaultState._enableCloseIcon);
});

/**
 * @param {boolean} enable
 */
const toggleCloseIcon = (enable) => {
    enableXIconCheckbox.checked = enable;
}

/**
 * @param {typeof defaultState} state
 * @param {keyof import('../../../types').ConsentModalOptions} elementName
 * @param {boolean} remove
 */
const toggleConsentModalElement = (state, elementName, remove) => {
    const translations = state._cookieConsentConfig.language.translations;

    for (const lang in translations) {
        /**
         * @type {import('../../../types').Translation}
         */
        const translation = translations[lang];
        translation.consentModal[elementName] = remove
            ? undefined
            : defaultFullConfig.language.translations[lang].consentModal[elementName];
    }
}