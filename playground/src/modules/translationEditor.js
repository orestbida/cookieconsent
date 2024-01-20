import A11yDialog from 'a11y-dialog';
import { getById, addEvent } from './utils';
import { getState, defaultState, saveState, reRunPlugin } from './stateManager';

const container = getById('edit-translations-dialog');
const dialog = new A11yDialog(container);

/** @type {HTMLSelectElement} **/   const selectEditorTranslation = getById('editor-language-codes');

/** @type {HTMLInputElement} **/    const cmTitle = getById('consent-modal-title');
/** @type {HTMLTextAreaElement} **/ const cmDescription = getById('consent-modal-description');
/** @type {HTMLInputElement} **/    const cmAcceptBtn = getById('consent-modal-accept-btn');
/** @type {HTMLInputElement} **/    const cmCloseIconLabel = getById('close-icon-label');

/** @type {HTMLInputElement} **/    const cmRejectBtn = getById('consent-modal-reject-btn');
/** @type {HTMLInputElement} **/    const cmManageBtn = getById('consent-modal-manage-btn');
/** @type {HTMLTextAreaElement} **/ const cmFooter = getById('editing');

/** @type {HTMLInputElement} **/    const pmTitle = getById('pm-title');
/** @type {HTMLInputElement} **/    const pmCloseIcon = getById('pm-close-icon-label');
/** @type {HTMLInputElement} **/    const pmAcceptBtn = getById('pm-accept-btn');
/** @type {HTMLInputElement} **/    const pmRejectBtn = getById('pm-reject-btn');
/** @type {HTMLInputElement} **/    const pmSaveBtn = getById('pm-save-btn');
/** @type {HTMLInputElement} **/    const pmServiceCounterLabel = getById('pm-service-counter-label');

/** @type {HTMLButtonElement} **/   const editBtn = getById('edit-translations-btn');
/** @type {HTMLButtonElement} **/   const saveTranslationBtn = getById('save-translation-config-btn');

/** @type {HTMLButtonElement} **/   const addSectionBtn = getById('add-section-btn');
/** @type {HTMLButtonElement} **/   const pmSections = getById('pm-sections');
/** @type {HTMLButtonElement} **/   const pmSectionsCounter = getById('sections-counter');

/**
 * @type {string[]}
 */
let lastEnabledTranslations = [];
let currentLanguage = '';
let sectionsCounter = 0;

/**
 * @type {typeof defaultState}
 */
let state = null;

/**
 * Show dialog on click
 */
addEvent(editBtn, 'click', () => {
    if (editBtn.disabled)
        return;

    /**
     * Retrieve the current state
     */
    state = getState();

    if (updateEditor() !== false) {
        dialog.show();
        currentLanguage = selectEditorTranslation.value;
    }
});

addEvent(addSectionBtn, 'click', () => {
    const section = createSection();
    appendSection(section);
});

addEvent(saveTranslationBtn, 'click', () => {
    const currentLanguage = selectEditorTranslation.value;
    const state = getState();
    const translations = state._cookieConsentConfig.language.translations;

    translations[currentLanguage] = retrieveCurrentTranslationFromEditor();

    saveState(state);
    reRunPlugin(state, 1);
    window.CookieConsent.setLanguage(currentLanguage);
});

addEvent(selectEditorTranslation, 'change', () => {
    currentLanguage = selectEditorTranslation.value;
    setActiveTranslation(currentLanguage);
    updateEditorFields();

    if (isConsentModalVisible()) {
        window.CookieConsent.setLanguage(currentLanguage);
    }
});

const isConsentModalVisible = () => document.documentElement.classList.contains('show--consent');

/**
 * @param {string[]} [enabledTranslations]
 */
function updateEditor(enabledTranslations) {
    const state = getState();
    enabledTranslations = enabledTranslations || state._enabledTranslations;

    /**
     * Make sure there is at least one translation
     */
    if (enabledTranslations.length === 0)
        return false;

    /**
     * If there are no changes, don't recreate buttons
     */
    if (equalStrArrays(lastEnabledTranslations, enabledTranslations))
        return;

    /**
     * Mark the first translation as the one that
     * should be opened in the editor by default
     */
    if (!enabledTranslations.includes(currentLanguage)) {
        currentLanguage = enabledTranslations[0];
        setActiveTranslation(currentLanguage);
    }

    updateAvailableTranslations(enabledTranslations, state);
    updateEditorFields(state);
}

/**
 * @param {typeof defaultState} [_state]
 */
function updateEditorFields(_state) {
    const state = _state || getState();
    const config = state._cookieConsentConfig;

    /**
     * @type {import('../../../types').Translation}
     */
    const translation = config.language.translations[currentLanguage];

    const { consentModal, preferencesModal } = translation;

    /**
     * Consent modal fields
     */
    cmTitle.value = consentModal.title || '';
    cmDescription.value = consentModal.description || '';
    cmAcceptBtn.value = consentModal.acceptAllBtn || '';
    cmCloseIconLabel.value = consentModal.closeIconLabel || '';
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
    pmServiceCounterLabel.value = preferencesModal.serviceCounterLabel || '';

    /**
     * Update sections
     */
    const sections = preferencesModal.sections || [];
    const newSections = [];

    for (const section of sections) {
        const shouldCreateSection =
            !section.linkedCategory
            || state._enabledCategories.includes(section.linkedCategory);

        shouldCreateSection && newSections.push(createSection(section));
    }

    sectionsCounter = newSections.length;
    setSectionsCounter(sectionsCounter);

    pmSections.replaceChildren(...newSections);
}

/**
 * @param {string[]} enabledTranslations
 * @param {typeof defaultState} state
 */
function updateAvailableTranslations(enabledTranslations) {
    /**
     * @type {HTMLOptionElement[]}
     */
    const options = [];

    for (const translation of enabledTranslations) {
        const option = document.createElement('option');
        option.value = translation;
        option.textContent = translation;
        option.className = `translation-btn--${translation}`;
        options.push(option);
    }

    selectEditorTranslation.replaceChildren(...options);
    selectEditorTranslation.value = currentLanguage;
}

/**
 * @param {string} translation
 */
function setActiveTranslation(translation) {
    currentLanguage = translation;
    selectEditorTranslation.setAttribute('data-current-translation', translation);
}

/**
 * @param {string[]} arr1
 * @param {string[]} arr2
 */
function equalStrArrays(arr1, arr2) {
    return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort());
}

/**
 * @param {HTMLDivElement} sectionDiv
 */
function appendSection(sectionDiv) {
    pmSections.appendChild(sectionDiv);
}

/**
 * @param {object} [sectionData]
 * @param {string} [sectionData.title]
 * @param {string} [sectionData.description]
 * @param {string} [sectionData.linkedCategory]
 */
function createSection(sectionData) {
    const section = document.createElement('li');
    section.className = 'pm-section';

    const title = document.createElement('textarea');
    title.value = sectionData?.title || '';
    title.placeholder = 'Title';
    title.className = 'pm-section-title small-textarea';
    section.appendChild(title);

    const description = document.createElement('textarea');
    description.value = sectionData?.description || '';
    description.placeholder = 'Description';
    description.className = 'pm-section-description';
    section.appendChild(description);

    const labelAndBtnContainer = document.createElement('div');
    labelAndBtnContainer.className = 'pm-section-label-btn-container';

    const selectLabel = document.createElement('label');
    const selectSpanTitle = document.createElement('span');
    const selectSpanContainer = document.createElement('span');
    const selectArrowSpan = document.createElement('span');
    const select = document.createElement('select');

    selectLabel.className = 'select-label';
    select.className = 'pm-section-linked-category';
    selectArrowSpan.className = 'arrow-icon';
    selectSpanTitle.textContent = 'Linked category';
    selectSpanContainer.className = 'select-input';

    const linkedCategory = sectionData?.linkedCategory;
    const categories = ['', ...state._enabledCategories];

    for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;

        if (category === linkedCategory && state._enabledCategories.includes(linkedCategory)) {
            option.selected = true;
            option.textContent = linkedCategory;
        } else if (!category) {
            option.selected = true;
            option.textContent = '—';
        }

        select.appendChild(option);
    }

    selectSpanContainer.appendChild(select);
    selectSpanContainer.appendChild(selectArrowSpan);
    selectLabel.appendChild(selectSpanTitle);
    selectLabel.appendChild(selectSpanContainer);
    labelAndBtnContainer.appendChild(selectLabel);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete section';
    deleteBtn.className = 'styled-btn pm-section__delete-btn';

    addEvent(deleteBtn, 'click', () => {
        sectionsCounter -= 1;
        section.remove();
        setSectionsCounter(sectionsCounter);
    });

    labelAndBtnContainer.appendChild(deleteBtn);
    section.appendChild(labelAndBtnContainer);

    sectionsCounter += 1;
    setSectionsCounter(sectionsCounter);

    return section;
}

/**
 * @param {number} value
 */
function setSectionsCounter(value) {
    pmSectionsCounter.textContent = value;
}

function retrieveCurrentTranslationFromEditor() {
    /**
     * @type {import('../../../types').ConsentModalOptions}
     */
    const consentModal = {};
    consentModal.title = cmTitle.value;
    consentModal.description = cmDescription.value;
    consentModal.closeIconLabel = cmCloseIconLabel.value;
    consentModal.acceptAllBtn = cmAcceptBtn.value;
    consentModal.acceptNecessaryBtn = cmRejectBtn.value;
    consentModal.showPreferencesBtn = cmManageBtn.value;
    consentModal.footer = cmFooter.value;

    /**
     * @type {import('../../../types').PreferencesModalOptions}
     */
    const preferencesModal = {};
    preferencesModal.title = pmTitle.value;
    preferencesModal.closeIconLabel = pmCloseIcon.value;
    preferencesModal.acceptAllBtn = pmAcceptBtn.value;
    preferencesModal.acceptNecessaryBtn = pmRejectBtn.value;
    preferencesModal.savePreferencesBtn = pmSaveBtn.value;
    preferencesModal.serviceCounterLabel = pmServiceCounterLabel.value;

    preferencesModal.sections = [];

    for (const sectionElement of pmSections.children) {
        const title = sectionElement.querySelector('.pm-section-title').value;
        const description = sectionElement.querySelector('.pm-section-description').value;
        const linkedCategory = sectionElement.querySelector('.pm-section-linked-category').value;

        const obj = {title, description};
        linkedCategory && (obj.linkedCategory = linkedCategory);

        preferencesModal.sections.push(obj);
    }

    return {
        consentModal,
        preferencesModal
    };
}
