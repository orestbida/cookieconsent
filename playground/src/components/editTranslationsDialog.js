import '../assets/translationsEditor.scss';
import A11yDialog from 'a11y-dialog';
import { getById, addEvent } from './utils';
// eslint-disable-next-line no-unused-vars
import { getState, defaultState } from './stateManager';

const container = getById('edit-translations-dialog');

/**
 * @type {HTMLSelectElement}
 */
const selectEditorTranslation = getById('editor-language-codes');

const dialog = new A11yDialog(container);

const cmTitle = getById('consent-modal-title');
const cmDescription = getById('consent-modal-description');
const cmAcceptBtn = getById('consent-modal-accept-btn');
const cmRejectBtn = getById('consent-modal-reject-btn');
const cmManageBtn = getById('consent-modal-manage-btn');
const cmFooter = getById('consent-modal-footer');


const pmTitle = getById('pm-title');
const pmCloseIcon = getById('pm-close-icon-label');
const pmAcceptBtn = getById('pm-accept-btn');
const pmRejectBtn = getById('pm-reject-btn');
const pmSaveBtn = getById('pm-save-btn');
const pmServiceConterLabel = getById('pm-service-counter-label');

/**
 * @type {HTMLButtonElement}
 */
const editBtn = getById('edit-translations-btn');


/**
 * @type {HTMLButtonElement}
 */
const addSectionBtn = getById('add-section-btn');
const pmSections = getById('pm-sections');

let lastEnabledTranslations = [];
let selectedTranslation = '';

/**
 * @type {typeof defaultState}
 */
let state = null;

/**
 * Show dialog on click
 */
addEvent(editBtn, 'click', () => {
    if(editBtn.disabled)
        return;

    /**
     * Retrieve the current state
     */
    state = getState();

    if(updateEditor() !== false)
        dialog.show();
});

addEvent(addSectionBtn, 'click', () => {
    const section = createSection();
    appendSection(section);
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

    const { consentModal, preferencesModal } = translation;

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
     */
    pmTitle.value = preferencesModal.title || '';
    pmCloseIcon.value = preferencesModal.closeIconLabel || '';
    pmAcceptBtn.value = preferencesModal.acceptAllBtn || '';
    pmRejectBtn.value = preferencesModal.acceptNecessaryBtn || '';
    pmSaveBtn.value = preferencesModal.savePreferencesBtn || '';
    pmServiceConterLabel.value = preferencesModal.serviceCounterLabel || '';


    /**
     * Update sections
     */
    const sections = preferencesModal.sections || [];
    const newSections = [];

    for(const section of sections) {
        if(state._enabledCategories.includes(section.linkedCategory))
            newSections.push(createSection(section));
    }

    pmSections.replaceChildren(...newSections);
}

/**
 * @param {string[]} enabledTranslations
 * @param {typeof defaultState} state
 */
function updateAvailableTranslations(enabledTranslations, state) {

    const options = [];

    for(const translation of enabledTranslations) {
        const option = document.createElement('option');
        option.value = translation;
        option.textContent = translation;
        option.className = `translation-btn--${translation}`;
        options.push(option);
    }

    selectEditorTranslation.addEventListener('change', () => {
        setActiveTranslation(selectEditorTranslation.value);
        updateEditorFields(state);
    });

    selectEditorTranslation.replaceChildren(...options);
}

/**
 * @param {string} translation
 */
function setActiveTranslation(translation) {
    selectedTranslation = translation;
    selectEditorTranslation.setAttribute('data-current-translation', translation);
}

/**
 * @param {string[]} arr1
 * @param {string[]} arr2
 */
function equalArrays(arr1, arr2) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
}

/**
 * @param {HTMLDivElement} sectionDiv
 */
function appendSection(sectionDiv) {
    pmSections.appendChild(sectionDiv);
}

/**
 * @param {{
 *  title: string,
 *  description: string,
 *  linkedCategory: string
 * }} [sectionData]
 *
 * @returns {HTMLLIElement}
 */
function createSection(sectionData) {

    const section = document.createElement('li');
    section.className = 'pm-section';

    const title = document.createElement('textarea');
    title.value = sectionData?.title || '';
    title.placeholder = 'Title';
    title.className = 'pm-section-title';
    section.appendChild(title);

    const description = document.createElement('textarea');
    description.value = sectionData?.description || '';
    description.placeholder = 'Description';
    description.className = 'pm-section-description';
    section.appendChild(description);

    const select = document.createElement('select');
    select.className = 'pm-section-linked-category';

    const linkedCategory = sectionData?.linkedCategory;
    const categories = ['disabled', ...state._enabledCategories];

    for(const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;

        if(category === linkedCategory && state._enabledCategories.includes(linkedCategory)){
            option.selected = true;
            option.textContent = linkedCategory;
        } else if(category === 'disabled'){
            option.selected = true;
            option.textContent = 'No linked category';
        }

        select.appendChild(option);
    }
    section.appendChild(select);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'pm-section-delete-btn';
    addEvent(deleteBtn, 'click', () => section.remove());
    section.appendChild(deleteBtn);

    return section;
}