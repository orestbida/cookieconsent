import { globalObj } from '../global';
import {
    createNode,
    addClass,
    addClassPm,
    setAttribute,
    removeClass,
    addEvent,
    appendChild,
    getKeys,
    hasClass,
    elContains,
    getModalFocusableData,
    isString,
    isObject,
    fireEvent,
    getSvgIcon,
    handleFocusTrap,
    debug,
    replaceChild,
    focus,
    getElementById
} from '../../utils/general';

import { guiManager } from '../../utils/gui-manager';
import {
    PREFERENCES_MODAL_NAME,
    SCRIPT_TAG_SELECTOR,
    DIV_TAG,
    ARIA_HIDDEN,
    BUTTON_TAG,
    BTN_GROUP_CLASS,
    CLICK_EVENT,
    DATA_ROLE,
    H2_TAG,
    SPAN_TAG,
    H3_TAG
} from '../../utils/constants';
import { generateVendorPreferenceModalData } from '../../utils/gvl';
import { replaceTextSpacesWithSymbol } from '../../utils/text';
import { createVendorsModal } from './vendorsModal';

/**
 * @callback CreateMainContainer
 */

/**
 * Generates preferences modal and appends it to "cc-main" el.
 *
 * @param {import("../global").Api} api
 * @param {CreateMainContainer} createMainContainer
 */
export const createPreferencesModal = (api, createMainContainer) => {
    const config = globalObj._config;
    const state = globalObj._state;
    const dom = globalObj._dom;
    const { hide, hidePreferences, acceptCategory } = api;

    const isTcfCompliant = config.isTcfCompliant;

    /**
     * @param {string|string[]} [categories]
     */
    const acceptHelper = (categories) => {
        acceptCategory(categories);
        hidePreferences();
        hide();
    };

    /**
     * @type {import("../global").PreferencesModalOptions}
     */
    const modalData = state._currentTranslation && state._currentTranslation?.preferencesModal;

    if (!modalData)
        return;

    console.log('[createPreferencesModal] config', config);
    console.log('[createPreferencesModal] state', state);
    console.log('[createPreferencesModal] dom', dom);
    console.log('[createPreferencesModal] modalData', modalData);
    console.log('[createPreferencesModal] isTcfCompliant', isTcfCompliant);

    const {
        title,
        closeIconLabel = '',
        acceptAllBtn,
        acceptNecessaryBtn,
        savePreferencesBtn,
        sections = []
    } = modalData;

    const createFooter = acceptAllBtn || acceptAllBtn || savePreferencesBtn;

    // Create modal if it doesn't exist
    if (!dom._pmContainer) {
        dom._pmContainer = createNode(DIV_TAG);
        addClass(dom._pmContainer, 'pm-wrapper');

        const pmOverlay = createNode(DIV_TAG);
        addClass(pmOverlay, 'pm-overlay');
        appendChild(dom._pmContainer, pmOverlay);

        // Hide modal when overlay / backdrop is clicked
        addEvent(pmOverlay, CLICK_EVENT, hidePreferences);

        // Preferences modal
        dom._pm = createNode(DIV_TAG);

        addClass(dom._pm, 'pm');
        setAttribute(dom._pm, 'role', 'dialog');
        setAttribute(dom._pm, ARIA_HIDDEN, true);
        setAttribute(dom._pm, 'aria-modal', true);
        setAttribute(dom._pm, 'aria-labelledby', 'pm__title');

        // Hide preferences on 'esc' key press
        addEvent(dom._htmlDom, 'keydown', (event) => {
            if (event.keyCode === 27)
                hidePreferences();
        }, true);

        dom._pmHeader = createNode(DIV_TAG);
        addClassPm(dom._pmHeader, 'header');

        dom._pmTitle = createNode(H2_TAG);
        addClassPm(dom._pmTitle, 'title');
        dom._pmTitle.id = 'pm__title';

        dom._pmCloseBtn = createNode(BUTTON_TAG);
        addClassPm(dom._pmCloseBtn, 'close-btn');
        setAttribute(dom._pmCloseBtn, 'aria-label', closeIconLabel);
        addEvent(dom._pmCloseBtn, CLICK_EVENT, hidePreferences);
        
        dom._pmFocusSpan = createNode(SPAN_TAG);
        dom._pmFocusSpan.innerHTML = getSvgIcon('x');
        appendChild(dom._pmCloseBtn, dom._pmFocusSpan);
        
        dom._pmBody = createNode(DIV_TAG);
        addClassPm(dom._pmBody, 'body');
        
        dom._pmFooter = createNode(DIV_TAG);
        addClassPm(dom._pmFooter, 'footer');
        
        var _pmBtnGroup1 = createNode(DIV_TAG);
        var _pmBtnGroup2 = createNode(DIV_TAG);
        addClassPm(_pmBtnGroup1, BTN_GROUP_CLASS);
        addClassPm(_pmBtnGroup2, BTN_GROUP_CLASS);

        appendChild(dom._pmFooter, _pmBtnGroup1);
        appendChild(dom._pmFooter, _pmBtnGroup2);

        appendChild(dom._pmHeader, dom._pmTitle);
        appendChild(dom._pmHeader, dom._pmCloseBtn);
        
        dom._pmDivTabindex = createNode(DIV_TAG);
        setAttribute(dom._pmDivTabindex, 'tabIndex', -1);
        appendChild(dom._pm, dom._pmDivTabindex);
        
        appendChild(dom._pm, dom._pmHeader);
        appendChild(dom._pm, dom._pmBody);

        createFooter && appendChild(dom._pm, dom._pmFooter);

        appendChild(dom._pmContainer, dom._pm);
    } else {
        dom._pmNewBody = createNode(DIV_TAG);
        addClassPm(dom._pmNewBody, 'body');
    }

    if (title) {
        dom._pmTitle.innerHTML = title;
        setAttribute(dom._pmCloseBtn, 'aria-label', closeIconLabel);
    }

    sections.forEach((section, sectionIndex) => {
        const
            sTitleData = section.title,
            sDescriptionData = section.description,
            sLinkedCategory = section.linkedCategory,
            sCurrentCategoryObject = sLinkedCategory && state._allDefinedCategories[sLinkedCategory],
            sCookieTableData = section.cookieTable,
            sCookieTableBody = sCookieTableData && sCookieTableData.body,
            sCookieTableCaption = sCookieTableData && sCookieTableData.caption,
            sCreateCookieTable = sCookieTableBody && sCookieTableBody.length > 0,
            hasToggle = !!sCurrentCategoryObject,

            /**
             * @type {Object.<string, import('../global').Service>}
             */
            sServices = hasToggle && state._allDefinedServices[sLinkedCategory],
            sServiceNames = isObject(sServices) && getKeys(sServices) || [],
            sIsExpandableToggle = hasToggle && (!!sDescriptionData || !!sCreateCookieTable || getKeys(sServices).length>0);

        // section
        var s = createNode(DIV_TAG);
        addClassPm(s, 'section');

        if (sIsExpandableToggle || sDescriptionData) {
            var sDescContainer = createNode(DIV_TAG);
            addClassPm(sDescContainer, 'section-desc-wrapper');
        }

        let nServices = sServiceNames.length;

        if (sIsExpandableToggle) {
            if (nServices > 0) {

                const servicesContainer = createNode(DIV_TAG);
                addClassPm(servicesContainer, 'section-services');

                for (const serviceName of sServiceNames) {
                    const service = sServices[serviceName];
                    const serviceLabel = service && service.label || serviceName;
                    const serviceDiv = createNode(DIV_TAG);
                    const serviceHeader = createNode(DIV_TAG);
                    const serviceIconContainer = createNode(DIV_TAG);
                    const serviceTitle = createNode(DIV_TAG);

                    addClassPm(serviceDiv, 'service');
                    addClassPm(serviceTitle, 'service-title');
                    addClassPm(serviceHeader, 'service-header');
                    addClassPm(serviceIconContainer, 'service-icon');

                    const toggleLabel = createToggleLabel(serviceLabel, serviceName, sCurrentCategoryObject, true, sLinkedCategory);

                    serviceTitle.innerHTML = serviceLabel;

                    appendChild(serviceHeader, serviceIconContainer);
                    appendChild(serviceHeader, serviceTitle);
                    appendChild(serviceDiv, serviceHeader);
                    appendChild(serviceDiv, toggleLabel);
                    appendChild(servicesContainer, serviceDiv);
                }

                appendChild(sDescContainer, servicesContainer);
            }
        }

        if (sTitleData) {
            var sTitleContainer = createNode(DIV_TAG);

            var sTitle = hasToggle
                ? createNode(BUTTON_TAG)
                : createNode(DIV_TAG);

            addClassPm(sTitleContainer, 'section-title-wrapper');
            addClassPm(sTitle, 'section-title');

            sTitle.innerHTML = sTitleData;
            appendChild(sTitleContainer, sTitle);

            if (hasToggle) {

                /**
                 * Arrow icon span
                 */
                const sTitleIcon = createNode(SPAN_TAG);
                sTitleIcon.innerHTML = getSvgIcon('arrow', 3.5);
                addClassPm(sTitleIcon, 'section-arrow');
                appendChild(sTitleContainer, sTitleIcon);

                s.className += '--toggle';

                const toggleLabel = createToggleLabel(sTitleData, sLinkedCategory, sCurrentCategoryObject);

                let serviceCounterLabel = modalData.serviceCounterLabel;

                if (nServices > 0 && isString(serviceCounterLabel)) {
                    let serviceCounter = createNode('span');

                    addClassPm(serviceCounter, 'badge');
                    addClassPm(serviceCounter, 'service-counter');
                    setAttribute(serviceCounter, ARIA_HIDDEN, true);
                    setAttribute(serviceCounter, 'data-servicecounter', nServices);

                    if (serviceCounterLabel) {
                        serviceCounterLabel = serviceCounterLabel.split('|');

                        if (serviceCounterLabel.length > 1 && nServices > 1)
                            serviceCounterLabel = serviceCounterLabel[1];
                        else
                            serviceCounterLabel = serviceCounterLabel[0];

                        setAttribute(serviceCounter, 'data-counterlabel', serviceCounterLabel);
                    }

                    serviceCounter.innerHTML = nServices + (serviceCounterLabel
                        ? ' ' + serviceCounterLabel
                        : '');

                    appendChild(sTitle, serviceCounter);
                }

                if (sIsExpandableToggle) {
                    addClassPm(s, 'section--expandable');
                    var expandableDivId = sLinkedCategory + '-desc';
                    setAttribute(sTitle, 'aria-expanded', false);
                    setAttribute(sTitle, 'aria-controls', expandableDivId);
                }

                appendChild(sTitleContainer, toggleLabel);

            } else {
                setAttribute(sTitle, 'role', 'heading');
                setAttribute(sTitle, 'aria-level', '3');
            }

            appendChild(s, sTitleContainer);
        }

        if (sDescriptionData) {
            var sDesc = createNode('p');
            addClassPm(sDesc, 'section-desc');
            sDesc.innerHTML = sDescriptionData;
            appendChild(sDescContainer, sDesc);
        }

        if (sIsExpandableToggle) {
            setAttribute(sDescContainer, ARIA_HIDDEN, 'true');
            sDescContainer.id = expandableDivId;

            /**
             * On button click handle the following :=> aria-expanded, aria-hidden and act class for current section
             */
            ((accordion, section, btn) => {
                addEvent(sTitle, CLICK_EVENT, () => {
                    if (!hasClass(section, 'is-expanded')) {
                        addClass(section, 'is-expanded');
                        setAttribute(btn, 'aria-expanded', 'true');
                        setAttribute(accordion, ARIA_HIDDEN, 'false');
                    } else {
                        removeClass(section, 'is-expanded');
                        setAttribute(btn, 'aria-expanded', 'false');
                        setAttribute(accordion, ARIA_HIDDEN, 'true');
                    }
                });
            })(sDescContainer, s, sTitle);

            if (sCreateCookieTable) {
                const table = createNode('table');
                const thead = createNode('thead');
                const tbody = createNode('tbody');

                if (sCookieTableCaption) {
                    const caption = createNode('caption');
                    addClassPm(caption, 'table-caption');
                    caption.innerHTML = sCookieTableCaption;
                    table.appendChild(caption);
                }

                addClassPm(table, 'section-table');
                addClassPm(thead, 'table-head');
                addClassPm(tbody, 'table-body');

                const headerData = sCookieTableData.headers;
                const tableHeadersKeys = getKeys(headerData);

                /**
                 * Create table headers
                 */
                const trHeadFragment = dom._document.createDocumentFragment();
                const trHead = createNode('tr');

                for (const headerKey of tableHeadersKeys) {
                    const headerValue = headerData[headerKey];
                    const th = createNode('th');

                    th.id = 'cc__row-' + headerValue + sectionIndex;
                    setAttribute(th, 'scope', 'col');
                    addClassPm(th, 'table-th');

                    th.innerHTML = headerValue;
                    appendChild(trHeadFragment, th);
                }

                appendChild(trHead, trHeadFragment);
                appendChild(thead, trHead);

                /**
                 * Create table body
                 */
                const bodyFragment = dom._document.createDocumentFragment();

                for (const bodyItem of sCookieTableBody) {
                    const tr = createNode('tr');
                    addClassPm(tr, 'table-tr');

                    for (const tdKey of tableHeadersKeys) {
                        const tdHeader = headerData[tdKey];
                        const tdValue = bodyItem[tdKey];

                        const td = createNode('td');
                        const tdInner = createNode(DIV_TAG);

                        addClassPm(td, 'table-td');
                        setAttribute(td, 'data-column', tdHeader);
                        setAttribute(td, 'headers', 'cc__row-' + tdHeader + sectionIndex);

                        tdInner.insertAdjacentHTML('beforeend', tdValue);

                        appendChild(td, tdInner);
                        appendChild(tr, td);
                    }

                    appendChild(bodyFragment, tr);
                }

                appendChild(tbody, bodyFragment);
                appendChild(table, thead);
                appendChild(table, tbody);
                appendChild(sDescContainer, table);
            }
        }

        if (sIsExpandableToggle || sDescriptionData)
            appendChild(s, sDescContainer);

        const currentBody = dom._pmNewBody || dom._pmBody;

        if (hasToggle) {
            if (!dom._pmSectionToggleContainer) {
                dom._pmSectionToggleContainer = createNode(DIV_TAG);
                addClassPm(dom._pmSectionToggleContainer, 'section-toggles');
            }

            dom._pmSectionToggleContainer.appendChild(s);

            appendChild(currentBody, dom._pmSectionToggleContainer);
        } else {
            appendChild(currentBody, s);
        }
    });

    // If the modal is TCF compliant, show the disclosed vendor purposes
    if (isTcfCompliant) {
        const {
            purposeIdsToShow,
            purposes,
            specialFeatureIdsToShow,
            specialFeatures,
            stacksToShow,
            specialPurposes,
            features
        } = generateVendorPreferenceModalData();

        console.log('[specialPurposes]', specialPurposes);
        console.log('[features]', features);

        // Step 1: Show purposes that did not fit in any stack
        for (const purposeId of purposeIdsToShow) {
            const {
                data,
                count
            } = purposes[purposeId];
  
            const purposeToggle = createPurposeToggleContainer(data, count, false, modalData, api, createMainContainer);
            appendChild(dom._pmSectionToggleContainer, purposeToggle);
        }

        // Step 2: Show special features that did not fit in any stack
        for (const specFeatureId of specialFeatureIdsToShow) {
            const {
                data,
                count
            } = specialFeatures[specFeatureId];
  
            const purposeToggle = createPurposeToggleContainer(data, count, false, modalData, api, createMainContainer, true);
            appendChild(dom._pmSectionToggleContainer, purposeToggle);
        }

        // Step 3: Show stacks used
        for (const stack of stacksToShow) {
            const {
                data,
                count
            } = stack;
  
            const purposeToggle = createPurposeToggleContainer(data, count, false, modalData, api, createMainContainer);
            appendChild(dom._pmSectionToggleContainer, purposeToggle);
        }

        // Step 4: Show special purposes as readonly (user has no choice)
        for (const specialPurpose of specialPurposes) {
            const {
                data,
                count
            } = specialPurpose;
  
            const purposeToggle = createPurposeToggleContainer(data, count, true, modalData, api, createMainContainer);
            appendChild(dom._pmSectionToggleContainer, purposeToggle);
        }

        // Step 5: Show features as readonly (user has no choice)
        for (const feature of features) {
            const {
                data,
                count
            } = feature;
  
            const purposeToggle = createPurposeToggleContainer(data, count, true, modalData, api, createMainContainer);
            appendChild(dom._pmSectionToggleContainer, purposeToggle);
        }
    }

    if (acceptAllBtn) {
        if (!dom._pmAcceptAllBtn) {
            dom._pmAcceptAllBtn = createNode(BUTTON_TAG);
            addClassPm(dom._pmAcceptAllBtn, 'btn');
            setAttribute(dom._pmAcceptAllBtn, DATA_ROLE, 'all');
            appendChild(_pmBtnGroup1, dom._pmAcceptAllBtn);
            addEvent(dom._pmAcceptAllBtn, CLICK_EVENT, () =>
                acceptHelper('all')
            );
        }

        dom._pmAcceptAllBtn.innerHTML = acceptAllBtn;
    }

    if (acceptNecessaryBtn) {
        if (!dom._pmAcceptNecessaryBtn) {
            dom._pmAcceptNecessaryBtn = createNode(BUTTON_TAG);
            addClassPm(dom._pmAcceptNecessaryBtn, 'btn');
            setAttribute(dom._pmAcceptNecessaryBtn, DATA_ROLE, 'necessary');
            appendChild(_pmBtnGroup1, dom._pmAcceptNecessaryBtn);
            addEvent(dom._pmAcceptNecessaryBtn, CLICK_EVENT, () =>
                acceptHelper([])
            );
        }

        dom._pmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtn;
    }

    if (savePreferencesBtn) {
        if (!dom._pmSavePreferencesBtn) {
            dom._pmSavePreferencesBtn = createNode(BUTTON_TAG);
            addClassPm(dom._pmSavePreferencesBtn, 'btn');
            addClassPm(dom._pmSavePreferencesBtn, 'btn--secondary');
            setAttribute(dom._pmSavePreferencesBtn, DATA_ROLE, 'save');
            appendChild(_pmBtnGroup2, dom._pmSavePreferencesBtn);

            addEvent(dom._pmSavePreferencesBtn, CLICK_EVENT, () =>
                acceptHelper()
            );
        }

        dom._pmSavePreferencesBtn.innerHTML = savePreferencesBtn;
    }

    if (dom._pmNewBody) {
        dom._pm.replaceChild(dom._pmNewBody, dom._pmBody);
        dom._pmBody = dom._pmNewBody;
    }

    // Set the modal's layout
    guiManager('preferences');

    if (!state._preferencesModalExists) {
        state._preferencesModalExists = true;

        debug('CookieConsent [HTML] created', PREFERENCES_MODAL_NAME);

        fireEvent(globalObj._customEvents._onModalReady, PREFERENCES_MODAL_NAME, dom._pm);
        createMainContainer(api);
        appendChild(dom._ccMain, dom._pmContainer);
        handleFocusTrap(dom._pm);

        /**
         * Enable transition
         */
        setTimeout(() => addClass(dom._pmContainer, 'cc--anim'), 100);
    }

    getModalFocusableData('preferences');
};

/**
 * Generate toggle
 * @param {string} label block title
 * @param {string} value category/service
 * @param {import('../global').Category} sCurrentCategoryObject
 * @param {boolean} [isService]
 * @param {string} categoryName
 */
function createToggleLabel(label, value, sCurrentCategoryObject, isService, categoryName) {
    const state = globalObj._state;
    const dom = globalObj._dom;

    /** @type {HTMLLabelElement} */ const toggleLabel = createNode('label');
    /** @type {HTMLInputElement} */ const toggle = createNode('input');
    /** @type {HTMLSpanElement} */  const toggleIcon = createNode(SPAN_TAG);
    /** @type {HTMLSpanElement} */  const toggleIconCircle = createNode(SPAN_TAG);
    /** @type {HTMLSpanElement} */  const toggleLabelSpan = createNode(SPAN_TAG);

    // each will contain 2 pseudo-elements to generate 'tick' and 'x' icons
    /** @type {HTMLSpanElement} */  const toggleOnIcon = createNode(SPAN_TAG);
    /** @type {HTMLSpanElement} */  const toggleOffIcon = createNode(SPAN_TAG);

    toggleOnIcon.innerHTML = getSvgIcon('tick', 3);
    toggleOffIcon.innerHTML = getSvgIcon('x', 3);

    toggle.type = 'checkbox';

    addClass(toggleLabel, 'section__toggle-wrapper');
    addClass(toggle, 'section__toggle');
    addClass(toggleOnIcon, 'toggle__icon-on');
    addClass(toggleOffIcon, 'toggle__icon-off');
    addClass(toggleIcon, 'toggle__icon');
    addClass(toggleIconCircle, 'toggle__icon-circle');
    addClass(toggleLabelSpan, 'toggle__label');

    setAttribute(toggleIcon, ARIA_HIDDEN, 'true');

    console.log('[createToggleLabel] categoryCheckboxInputs', dom._categoryCheckboxInputs);
    console.log('[createToggleLabel] serviceCheckboxInputs', dom._serviceCheckboxInputs);

    if (isService) {
        addClass(toggleLabel, 'toggle-service');
        setAttribute(toggle, SCRIPT_TAG_SELECTOR, categoryName);

        // Save reference to toggles to avoid using document.querySelector later on
        dom._serviceCheckboxInputs[categoryName][value] = toggle;
    } else {
        dom._categoryCheckboxInputs[value] = toggle;
    }

    if (!isService) {
        ((value)=> {
            addEvent(toggle, CLICK_EVENT, () => {
                const categoryServicesToggles = dom._serviceCheckboxInputs[value];
                const checked = toggle.checked;
                state._enabledServices[value] = [];

                /**
                 * Enable/disable all services
                 */
                for (let serviceName in categoryServicesToggles) {
                    categoryServicesToggles[serviceName].checked = checked;
                    checked && state._enabledServices[value].push(serviceName);
                }
            });
        })(value);
    } else {
        ((categoryName) => {
            addEvent(toggle, 'change', () => {
                const categoryServicesToggles = dom._serviceCheckboxInputs[categoryName];
                const categoryToggle = dom._categoryCheckboxInputs[categoryName];

                state._enabledServices[categoryName] = [];

                for (let serviceName in categoryServicesToggles) {
                    const serviceInput = categoryServicesToggles[serviceName];

                    if (serviceInput.checked) {
                        state._enabledServices[categoryName].push(serviceInput.value);
                    }
                }

                categoryToggle.checked = state._enabledServices[categoryName].length > 0;
            });
        })(categoryName);

    }

    toggle.value = value;
    toggleLabelSpan.textContent = label.replace(/<.*>.*<\/.*>/gm, '');

    appendChild(toggleIconCircle, toggleOffIcon);
    appendChild(toggleIconCircle, toggleOnIcon);
    appendChild(toggleIcon, toggleIconCircle);

    console.log('[createToggleLabel] acceptedCategories', state._acceptedCategories);
    console.log('[createToggleLabel] acceptedServices', state._acceptedServices);

    /**
     * If consent is valid => retrieve category states from cookie
     * Otherwise use states defined in the userConfig. object
     */
    if (!state._invalidConsent) {
        if (isService) {
            const enabledServices = state._acceptedServices[categoryName];
            toggle.checked = sCurrentCategoryObject.readOnly || elContains(enabledServices, value);
        } else if (elContains(state._acceptedCategories, value)) {
            toggle.checked = true;
        }
    } else if (sCurrentCategoryObject.readOnly || sCurrentCategoryObject.enabled) {
        toggle.checked = true;
    }

    /**
     * Set toggle as readonly if true (disable checkbox)
     */
    if (sCurrentCategoryObject.readOnly) {
        toggle.disabled = true;
    }

    appendChild(toggleLabel, toggle);
    appendChild(toggleLabel, toggleIcon);
    appendChild(toggleLabel, toggleLabelSpan);

    return toggleLabel;
}

/**
 * Generates the purpose toggle container DOM structure.
 *
 * @param {any} data
 * @param {number} count
 * @param {boolean} isReadonly
 * @param {import('../global').PreferencesModalOptions} modalData
 * @param {import("../global").Api} api
 * @param {CreateMainContainer} createMainContainer
 * @param {boolean} isSpecialFeature
 * @returns {HTMLElement}
 */
function createPurposeToggleContainer(data, count, isReadonly, modalData, api, createMainContainer, isSpecialFeature = false) {
    const {
        id,
        name,
        description,
        illustrations = [],
        purposes,
        specialFeatures
    } = data;

    const {
        hidePreferences,
        showVendors
    } = api;

    const isStack = 'purposes' in data || 'specialFeatures' in data;

    const {
        viewVendorsLabel = 'List of IAB Vendors',
        viewIllustrationsLabel = 'View Illustrations',
        purposeVendorCountLabel = '{{count}} partners can use this purpose',
        purposeVendorCountPlaceholder = '{{count}}'
    } = modalData;

    const state = globalObj._state;

    /**
     * Handles the show vendors list click action.
     */
    const handleShowVendorsList = () => {
        hidePreferences();
        showVendors();
    };

    console.log('[createPurposeToggleContainer] data', data, 'count', count, 'isreadonly', isReadonly, 'isStack', isStack);

    // Main toggle container
    var purposeToggle = createNode(DIV_TAG);
    addClassPm(purposeToggle, 'section--toggle');
    addClassPm(purposeToggle, 'section--expandable');
    addClassPm(purposeToggle, 'section--purpose');

    // Title container
    var purposeTitleContainer = createNode(DIV_TAG);
    addClassPm(purposeTitleContainer, 'section-title-wrapper');

    var purposeTitleBtn = createNode(BUTTON_TAG);
    addClassPm(purposeTitleBtn, 'section-title');

    var purposeTitleAndCountContainer = createNode(DIV_TAG);
    addClassPm(purposeTitleAndCountContainer, 'section-title-count-wrapper');

    var purposeTitle = createNode(SPAN_TAG);
    purposeTitle.innerHTML = name;

    var purposeVendorCount = createNode(SPAN_TAG);
    addClassPm(purposeVendorCount, 'vendor-count');
    purposeVendorCount.innerHTML = purposeVendorCountLabel.replace(purposeVendorCountPlaceholder, count);

    appendChild(purposeTitleAndCountContainer, purposeTitle);
    appendChild(purposeTitleAndCountContainer, purposeVendorCount);
    appendChild(purposeTitleBtn, purposeTitleAndCountContainer);

    appendChild(purposeTitleContainer, purposeTitleBtn);

    // Arrow icon
    const purposeTitleIcon = createNode(SPAN_TAG);
    purposeTitleIcon.innerHTML = getSvgIcon('arrow', 3.5);
    addClassPm(purposeTitleIcon, 'section-arrow');

    appendChild(purposeTitleContainer, purposeTitleIcon);

    // Toggle
    const toggle = createPurposeToggle(name, id, isReadonly, isSpecialFeature, isStack);
    appendChild(purposeTitleContainer, toggle);

    var expandableDivId = `${replaceTextSpacesWithSymbol(name, '-').toLowerCase()}-desc`;
    setAttribute(purposeTitleBtn, 'aria-expanded', false);
    setAttribute(purposeTitleBtn, 'aria-controls', expandableDivId);

    appendChild(purposeToggle, purposeTitleContainer);

    // Description container
    var purposeDescriptionContainer = createNode(DIV_TAG);
    purposeDescriptionContainer.id = expandableDivId;
    addClassPm(purposeDescriptionContainer, 'section-desc-wrapper');
    setAttribute(purposeDescriptionContainer, ARIA_HIDDEN, true);
    setAttribute(purposeDescriptionContainer, 'tabindex', -1);

    var purposeDescription = createNode(DIV_TAG);
    addClassPm(purposeDescription, 'section-desc');
    appendChild(purposeDescriptionContainer, purposeDescription);

    var purposeDesc = createNode('p');
    purposeDesc.innerHTML = description;
    appendChild(purposeDescription, purposeDesc);

    // If the current purpose is actually a stack, we need to display purposes and special features it contains
    if (isStack) {
        const stackToggles = createNode(DIV_TAG);
        addClassPm(stackToggles, 'stack-toggles');
        appendChild(purposeDescription, stackToggles);

        // Step 1: Show stack's purposes
        for (const { data, count } of purposes) {
            const stackPurposeToggleContainer = createStackPurposeToggleContainer(data, count, id, modalData);

            appendChild(stackToggles, stackPurposeToggleContainer);
        }

        // Step 2: Show stack's special features
        for ( const { data, count } of specialFeatures) {
            const stackPurposeToggleContainer = createStackPurposeToggleContainer(data, count, id, modalData, true);

            appendChild(stackToggles, stackPurposeToggleContainer);
        }
    }

    var purposeLinksContainer = createNode(DIV_TAG);
    addClassPm(purposeLinksContainer, 'purpose-links');
    appendChild(purposeDescription, purposeLinksContainer);

    var vendorsModalLink = createNode('p');
    vendorsModalLink.innerHTML = viewVendorsLabel;
    addClass(vendorsModalLink, 'cc__link');
    setAttribute(vendorsModalLink, 'aria-label', viewVendorsLabel);
    addEvent(vendorsModalLink, 'mouseenter', () => {
        if(!state._vendorsModalExists) {
            createVendorsModal(api, createMainContainer);
        }
    });
    addEvent(vendorsModalLink, CLICK_EVENT, handleShowVendorsList);
    appendChild(purposeLinksContainer, vendorsModalLink);

    if (illustrations.length) {
        var viewIllustrationsLink = createNode('p');
        viewIllustrationsLink.innerHTML = viewIllustrationsLabel;
        addClass(viewIllustrationsLink, 'cc__link');
        setAttribute(viewIllustrationsLink, 'aria-label', viewIllustrationsLabel);
        addEvent(viewIllustrationsLink, CLICK_EVENT, () => {
            showIllustrations(name, illustrations, modalData, expandableDivId);
        });
        appendChild(purposeLinksContainer, viewIllustrationsLink);
    }

    appendChild(purposeToggle, purposeDescriptionContainer);

    addEvent(purposeTitleBtn, CLICK_EVENT, () => {
        if (!hasClass(purposeToggle, 'is-expanded')) {
            addClass(purposeToggle, 'is-expanded');
            setAttribute(purposeTitleBtn, 'aria-expanded', true);
            setAttribute(purposeDescriptionContainer, ARIA_HIDDEN, false);
        } else {
            removeClass(purposeToggle, 'is-expanded');
            setAttribute(purposeTitleBtn, 'aria-expanded', false);
            setAttribute(purposeDescriptionContainer, ARIA_HIDDEN, true);
        }
    });

    return purposeToggle;
}

/**
 * Generates the stack's purpose toggle DOM structure.
 *
 * @param {any} data
 * @param {number} count
 * @param {number} stackId
 * @param {import('../global').PreferencesModalOptions} modalData
 * @param {boolean} isSpecialFeature
 * @returns {HTMLElement}
 */
function createStackPurposeToggleContainer(data, count, stackId, modalData, isSpecialFeature = false) {
    const {
        id,
        name: purposeName,
        description: purposeDescription,
        illustrations: purposeIllustrations = []
    } = data;

    const {
        viewIllustrationsLabel = 'View Illustrations',
        purposeVendorCountLabel = '{{count}} partners can use this purpose',
        purposeVendorCountPlaceholder = '{{count}}'
    } = modalData;

    const stackToggleContainer = createNode(DIV_TAG);
    addClassPm(stackToggleContainer, 'stack-toggle');

    // Header container
    const stackToggleHeader = createNode(DIV_TAG);
    addClassPm(stackToggleHeader, 'stack-toggle-header');
    appendChild(stackToggleContainer, stackToggleHeader);

    const stackTitleContainer = createNode(DIV_TAG);
    addClassPm(stackTitleContainer, 'stack-toggle-title-wrapper');

    var title = createNode(SPAN_TAG);
    addClassPm(title, 'stack-toggle-title');
    title.innerHTML = purposeName;
    appendChild(stackTitleContainer, title);

    var vendorCount = createNode(SPAN_TAG);
    addClassPm(vendorCount, 'vendor-count');
    vendorCount.innerHTML = purposeVendorCountLabel.replace(purposeVendorCountPlaceholder, count);
    appendChild(stackTitleContainer, vendorCount);

    appendChild(stackToggleHeader, stackTitleContainer);

    // Toggle
    const toggle = createPurposeToggle(purposeName, id, false, isSpecialFeature, false, stackId);
    appendChild(stackToggleHeader, toggle);

    // Description container
    var stackToggleDescription = createNode('p');
    stackToggleDescription.id = `${replaceTextSpacesWithSymbol(purposeName, '-').toLowerCase()}-desc`;
    stackToggleDescription.innerHTML = purposeDescription;
    addClassPm(stackToggleDescription, 'stack-toggle-description');
    setAttribute(stackToggleDescription, 'tabindex', -1);
    appendChild(stackToggleContainer, stackToggleDescription);

    // Links container
    if (purposeIllustrations.length) {
        var stackToggleLinksContainer = createNode(DIV_TAG);
        addClassPm(stackToggleLinksContainer, 'purpose-links');
        appendChild(stackToggleContainer, stackToggleLinksContainer);

        var link = createNode('p');
        link.innerHTML = viewIllustrationsLabel;
        addClass(link, 'cc__link');
        setAttribute(link, 'aria-label', viewIllustrationsLabel);
        addEvent(link, CLICK_EVENT, () => {
            var focusId = `${replaceTextSpacesWithSymbol(purposeName, '-').toLowerCase()}-desc`;
            showIllustrations(purposeName, purposeIllustrations, modalData, focusId);
        });
        appendChild(stackToggleLinksContainer, link);
    }

    return stackToggleContainer;
}

/**
 * Generates the purpose toggle DOM structure.
 *
 * @param {string} label Toggle label
 * @param {string} value Toggle value
 * @param {boolean} isReadonly Should toggle be disabled
 * @param {boolean} isSpecialFeature Is the toggle a special feature toggle
 * @param {boolean} isStack Is the toggle a stack toggle
 * @param {number | null} parentStackValue Parent stack toggle value
 * @returns {HTMLElement}
 */
function createPurposeToggle(label, value, isReadonly = false, isSpecialFeature = false, isStack = false, parentStackValue = null) {
    const state = globalObj._state;
    const dom = globalObj._dom;

    const {
        originalStacks
    } = state._gvlData;

    console.log('[createPurposeToggle] label', label, 'value', value, 'isReadonly', isReadonly, 'isSpecialFeature', isSpecialFeature, 'isStack', isStack, 'parentStackValue', parentStackValue);

    const toggleLabel = createNode('label');
    const toggle = createNode('input');
    const toggleIcon = createNode(SPAN_TAG);
    const toggleIconCircle = createNode(SPAN_TAG);
    const toggleLabelSpan = createNode(SPAN_TAG);

    const toggleOnIcon = createNode(SPAN_TAG);
    toggleOnIcon.innerHTML = getSvgIcon('tick', 3);

    const toggleOffIcon = createNode(SPAN_TAG);
    toggleOffIcon.innerHTML = getSvgIcon('x', 3);

    toggle.type = 'checkbox';

    addClass(toggleLabel, 'section__toggle-wrapper');
    addClass(toggle, 'section__toggle');
    addClass(toggleOnIcon, 'toggle__icon-on');
    addClass(toggleOffIcon, 'toggle__icon-off');
    addClass(toggleIcon, 'toggle__icon');
    addClass(toggleIconCircle, 'toggle__icon-circle');
    addClass(toggleLabelSpan, 'toggle__label');

    setAttribute(toggleIcon, ARIA_HIDDEN, true);

    // Save references for the inputs and appropriate events
    if (isStack) {
        dom._stackCheckboxInputs[value] = toggle;

        addEvent(toggle, CLICK_EVENT, () => {
            const isChecked = toggle.checked;

            const stackPurposeIds = originalStacks[value].purposes;
            const stackSpecialFeatureIds = originalStacks[value].specialFeatures;

            // Enable / disable all purposes in the current stack
            for (const purposeId of stackPurposeIds) {
                const purposeInput = dom._purposeCheckboxInputs[purposeId];
                purposeInput.checked = isChecked;

                if (state._acceptedPurposeIds.includes((purposeId))) {
                    state._acceptedPurposeIds = state._acceptedPurposeIds.filter((id) => id !== purposeId);
                } else {
                    state._acceptedPurposeIds.push(purposeId);
                }
            }

            // Enable / disable all special features in the current stack
            for (const specialFeatureId of stackSpecialFeatureIds) {
                const specialFeatureInput = dom._specialFeatureCheckboxInputs[specialFeatureId];
                specialFeatureInput.checked = isChecked;

                if (state._acceptedSpecialFeatureIds.includes((specialFeatureId))) {
                    state._acceptedSpecialFeatureIds = state._acceptedSpecialFeatureIds.filter((id) => id !== specialFeatureId);
                } else {
                    state._acceptedSpecialFeatureIds.push(specialFeatureId);
                }
            }
        });
    } else if (isSpecialFeature) {
        dom._specialFeatureCheckboxInputs[value] = toggle;

        addEvent(toggle, CLICK_EVENT, () => {
            // Enable / disable the special feature
            if (state._acceptedSpecialFeatureIds.includes((value))) {
                state._acceptedSpecialFeatureIds = state._acceptedSpecialFeatureIds.filter((id) => id !== value);
            } else {
                state._acceptedSpecialFeatureIds.push(value);
            }

            // Toggle the parent stack toggle if any child is checked and untoggle if nothing is checked
            if (parentStackValue) {
                const stackToggle = dom._stackCheckboxInputs[parentStackValue];

                const stackSpecialFeatureIds = originalStacks[parentStackValue].specialFeatures;
                stackToggle.checked = stackSpecialFeatureIds.some((id) => state._acceptedSpecialFeatureIds.includes(id));
            }
        });
    } else {
        if (!isReadonly) {
            dom._purposeCheckboxInputs[value] = toggle;

            addEvent(toggle, CLICK_EVENT, () => {
                // Enable / disable the purpose
                if (state._acceptedPurposeIds.includes((value))) {
                    state._acceptedPurposeIds = state._acceptedPurposeIds.filter((id) => id !== value);
                } else {
                    state._acceptedPurposeIds.push(value);
                }

                // Toggle the parent stack toggle if any child is checked and untoggle if nothing is checked
                if (parentStackValue) {
                    const stackToggle = dom._stackCheckboxInputs[parentStackValue];
  
                    const stackPurposeIds = originalStacks[parentStackValue].purposes;
                    stackToggle.checked = stackPurposeIds.some((id) => state._acceptedPurposeIds.includes(id));
                }
            });
        }
    }

    toggle.value = value;
    toggleLabelSpan.textContent = label.replace(/<.*>.*<\/.*>/gm, '');

    appendChild(toggleIconCircle, toggleOffIcon);
    appendChild(toggleIconCircle, toggleOnIcon);
    appendChild(toggleIcon, toggleIconCircle);

    // If the consent is valid, retrieve checked states from a cookie
    // Otherwise set it to false
    if (!state._invalidConsent) {
        // TODO: Get is true or false from a state of somesorts.
        // if elContains(state._acceptedVendors, value)
        // toggle.checked = true;
    } else {
        toggle.checked = false;
    }

    // Set toggle as readonly if necessary
    if (isReadonly) {
        toggle.checked = true;
        toggle.disabled = true;
    }

    appendChild(toggleLabel, toggle);
    appendChild(toggleLabel, toggleIcon);
    appendChild(toggleLabel, toggleLabelSpan);

    return toggleLabel;
}

/**
 * Generates and shows the illustrations on the current modal.
 *
 * @param {string} purposeName
 * @param {string[]} illustrations
 * @param {import('../global').PreferencesModalOptions} modalData
 */
function showIllustrations(purposeName, illustrations, modalData, lastFocusedElementId) {
    const dom = globalObj._dom;

    const {
        illustrationsTitle = 'Illustrations'
    } = modalData;

    /**
     * Handles the back arrow click action.
     */
    const handleBackArrowClick = () => {
        replaceChild(dom._pm, dom._pmIllustrationsDom.header, dom._pmBeforeIllustrationsDom.header);
        replaceChild(dom._pm, dom._pmIllustrationsDom.body, dom._pmBeforeIllustrationsDom.body);
        replaceChild(dom._pm, dom._pmIllustrationsDom.footer, dom._pmBeforeIllustrationsDom.footer);

        focus(getElementById(lastFocusedElementId));
    };

    // Header
    const illHeader = createNode(DIV_TAG);
    addClassPm(illHeader, 'header');

    const illTitleContainer = createNode(DIV_TAG);
    addClassPm(illTitleContainer, 'title-container');

    const illBackArrow = createNode(SPAN_TAG);
    illBackArrow.innerHTML = getSvgIcon('arrow', 4);
    addClassPm(illBackArrow, 'back-arrow');
    addEvent(illBackArrow, CLICK_EVENT, handleBackArrowClick);
    appendChild(illTitleContainer, illBackArrow);

    const illTitle = createNode(H2_TAG);
    addClassPm(illTitle, 'title');
    illTitle.id = 'pm__title';
    illTitle.innerHTML = illustrationsTitle;
    appendChild(illTitleContainer, illTitle);

    appendChild(illHeader, illTitleContainer);

    // Body
    const illBody = createNode(DIV_TAG);
    addClassPm(illBody, 'body');

    const illPurposeName = createNode(H3_TAG);
    illPurposeName.innerHTML = purposeName;
    addClassPm(illPurposeName, 'ill-purpose-name');
    appendChild(illBody, illPurposeName);

    const illPurposeTextContainer = createNode(DIV_TAG);
    addClassPm(illPurposeTextContainer, 'ill-purpose-wrapper');
    appendChild(illBody, illPurposeTextContainer);

    for (const illustration of illustrations) {
        const illustrationText = createNode('p');
        illustrationText.innerHTML = illustration;
        appendChild(illPurposeTextContainer, illustrationText);
    }

    // Footer
    const illFooter = createNode(DIV_TAG);

    dom._pmIllustrationsDom = {
        header: illHeader,
        body: illBody,
        footer: illFooter
    };

    // Cache the current and show the illustrations DOM structure
    dom._pmBeforeIllustrationsDom = {
        header: dom._pmHeader,
        body: dom._pmBody,
        footer: dom._pmFooter
    };

    replaceChild(dom._pm, dom._pmBeforeIllustrationsDom.header, dom._pmIllustrationsDom.header);
    replaceChild(dom._pm, dom._pmBeforeIllustrationsDom.body, dom._pmIllustrationsDom.body);
    replaceChild(dom._pm, dom._pmBeforeIllustrationsDom.footer, dom._pmIllustrationsDom.footer);
}