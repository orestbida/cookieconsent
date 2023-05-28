import '../assets/translationsEditor.scss';
import A11yDialog from 'a11y-dialog';
import { getById, addEvent } from './utils';
// eslint-disable-next-line no-unused-vars
import { getState, defaultState } from './stateManager';

const container = getById('edit-translations-dialog');
const translationsBtns = container.querySelector('.translation-btns');

const dialog = new A11yDialog(container);

const cmTitle = getById('consent-modal-title');
const cmDescription = getById('consent-modal-description');
const cmAcceptBtn = getById('consent-modal-accept-btn');
const cmRejectBtn = getById('consent-modal-reject-btn');
const cmManageBtn = getById('consent-modal-manage-btn');
const cmFooter = getById('consent-modal-footer');

let lastEnabledTranslations = [];
let selectedTranslation = '';

/**
 * Show dialog on click
 */
addEvent(getById('edit-translations-btn'), 'click', function () {
    if(this.disabled)
        return;

    if(updateEditor() !== false)
        dialog.show();
});

/**
 * @param {string[]} [enabledTranslations]
 */
function updateEditor(enabledTranslations) {

    const state = getState();

    enabledTranslations = enabledTranslations || state._enabledTranslations;

    /**
     * Make sure there is at least one translation
     */
    if(enabledTranslations.length === 0)
        return false;

    /**
     * If there are no changes, don't recreate buttons
     */
    if(equalArrays(lastEnabledTranslations, enabledTranslations))
        return;

    /**
     * Mark the first translation as the one that
     * should be opened in the editor by default
     */
    if(!enabledTranslations.includes(selectedTranslation)) {
        setActiveTranslation(enabledTranslations[0]);
    }

    updateAvailableTranslations(enabledTranslations, state);
    updateEditorFields(state);
}

/**
 * @param {typeof defaultState} [state]
 */
function updateEditorFields(state) {

    const config = (state || getState())._cookieConsentConfig;

    /**
     * @type {import('../../../types').Translation}
     */
    const translation = config.language.translations[selectedTranslation];

    const { consentModal } = translation;

    /**
     * Consent modal fields
     */
    cmTitle.value = consentModal.title || '';
    cmDescription.value = consentModal.description || '';
    cmAcceptBtn.value = consentModal.acceptAllBtn || '';
    cmRejectBtn.value = consentModal.acceptNecessaryBtn || '';
    cmManageBtn.value = consentModal.showPreferencesBtn || '';
    cmFooter.value = consentModal.footer || '';

    /**
     * Preferences modal fields
     * [TODO]
     */
}

/**
 * @param {string[]} enabledTranslations
 * @param {typeof defaultState} state
 */
function updateAvailableTranslations(enabledTranslations, state) {

    const fragment = document.createDocumentFragment();

    for(const translation of enabledTranslations) {
        const btn = document.createElement('button');
        btn.textContent = translation;
        btn.className = `translation-btn--${translation}`;
        fragment.appendChild(btn);

        addEvent(btn, 'click', () => {
            setActiveTranslation(translation);
            updateEditorFields(state);
        });
    }

    translationsBtns.textContent = '';
    translationsBtns.appendChild(fragment);
}

/**
 * @param {string} translation
 */
function setActiveTranslation(translation) {
    selectedTranslation = translation;
    translationsBtns.setAttribute('data-current-translation', translation);
}

/**
 *
 * @param {string[]} arr1
 * @param {string[]} arr2
 */
function equalArrays(arr1, arr2) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
}