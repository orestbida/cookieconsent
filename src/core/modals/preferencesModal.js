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
    debug
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
    DATA_ROLE
} from '../../utils/constants';

/**
 * @callback CreateMainContainer
 */

/**
 * Generates preferences modal and appends it to "cc-main" el.
 * @param {import("../global").Api} api
 * @param {CreateMainContainer} createMainContainer
 */
export const createPreferencesModal = (api, createMainContainer) => {
    const state = globalObj._state;
    const dom = globalObj._dom;
    const {hide, hidePreferences, acceptCategory} = api;

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
    const modalData = state._currentTranslation && state._currentTranslation.preferencesModal;

    if (!modalData)
        return;

    const
        titleData = modalData.title,
        closeIconLabelData = modalData.closeIconLabel,
        acceptAllBtnData = modalData.acceptAllBtn,
        acceptNecessaryBtnData = modalData.acceptNecessaryBtn,
        savePreferencesBtnData = modalData.savePreferencesBtn,
        sectionsData = modalData.sections || [],
        createFooter = acceptAllBtnData
            || acceptNecessaryBtnData
            || savePreferencesBtnData;

    if (!dom._pmContainer) {
        dom._pmContainer = createNode(DIV_TAG);
        addClass(dom._pmContainer, 'pm-wrapper');

        const pmOverlay = createNode('div');
        addClass(pmOverlay, 'pm-overlay');
        appendChild(dom._pmContainer, pmOverlay);

        /**
         * Hide modal when overlay is clicked
         */
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

        dom._pmTitle = createNode('h2');
        addClassPm(dom._pmTitle, 'title');
        dom._pmTitle.id = 'pm__title';

        dom._pmCloseBtn = createNode(BUTTON_TAG);
        addClassPm(dom._pmCloseBtn, 'close-btn');
        setAttribute(dom._pmCloseBtn, 'aria-label', modalData.closeIconLabel || '');
        addEvent(dom._pmCloseBtn, CLICK_EVENT, hidePreferences);

        dom._pmFocusSpan = createNode('span');
        dom._pmFocusSpan.innerHTML = getSvgIcon();
        appendChild(dom._pmCloseBtn, dom._pmFocusSpan);

        dom._pmBody = createNode(DIV_TAG);
        addClassPm(dom._pmBody, 'body');

        dom._pmFooter = createNode(DIV_TAG);
        addClassPm(dom._pmFooter, 'footer');

        var _pmBtnContainer = createNode(DIV_TAG);
        addClass(_pmBtnContainer, 'btns');

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

    if (titleData) {
        dom._pmTitle.innerHTML = titleData;
        closeIconLabelData && setAttribute(dom._pmCloseBtn, 'aria-label', closeIconLabelData);
    }

    let sectionToggleContainer;

    sectionsData.forEach((section, sectionIndex) => {
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
                const sTitleIcon = createNode('span');
                sTitleIcon.innerHTML = getSvgIcon(2, 3.5);
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
            if (!sectionToggleContainer) {
                sectionToggleContainer = createNode(DIV_TAG);
                addClassPm(sectionToggleContainer, 'section-toggles');
            }
            sectionToggleContainer.appendChild(s);
        } else {
            sectionToggleContainer = null;
        }

        appendChild(currentBody, sectionToggleContainer || s);

    });

    if (acceptAllBtnData) {
        if (!dom._pmAcceptAllBtn) {
            dom._pmAcceptAllBtn = createNode(BUTTON_TAG);
            addClassPm(dom._pmAcceptAllBtn, 'btn');
            setAttribute(dom._pmAcceptAllBtn, DATA_ROLE, 'all');
            appendChild(_pmBtnGroup1, dom._pmAcceptAllBtn);
            addEvent(dom._pmAcceptAllBtn, CLICK_EVENT, () =>
                acceptHelper('all')
            );
        }

        dom._pmAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    if (acceptNecessaryBtnData) {
        if (!dom._pmAcceptNecessaryBtn) {
            dom._pmAcceptNecessaryBtn = createNode(BUTTON_TAG);
            addClassPm(dom._pmAcceptNecessaryBtn, 'btn');
            setAttribute(dom._pmAcceptNecessaryBtn, DATA_ROLE, 'necessary');
            appendChild(_pmBtnGroup1, dom._pmAcceptNecessaryBtn);
            addEvent(dom._pmAcceptNecessaryBtn, CLICK_EVENT, () =>
                acceptHelper([])
            );
        }

        dom._pmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if (savePreferencesBtnData) {
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

        dom._pmSavePreferencesBtn.innerHTML = savePreferencesBtnData;
    }

    if (dom._pmNewBody) {
        dom._pm.replaceChild(dom._pmNewBody, dom._pmBody);
        dom._pmBody = dom._pmNewBody;
    }

    guiManager(1);

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

    getModalFocusableData(2);
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
    /** @type {HTMLSpanElement} */  const toggleIcon = createNode('span');
    /** @type {HTMLSpanElement} */  const toggleIconCircle = createNode('span');
    /** @type {HTMLSpanElement} */  const toggleLabelSpan = createNode('span');

    // each will contain 2 pseudo-elements to generate 'tick' and 'x' icons
    /** @type {HTMLSpanElement} */  const toggleOnIcon = createNode('span');
    /** @type {HTMLSpanElement} */  const toggleOffIcon = createNode('span');

    toggleOnIcon.innerHTML = getSvgIcon(1, 3);
    toggleOffIcon.innerHTML = getSvgIcon(0, 3);

    toggle.type = 'checkbox';

    addClass(toggleLabel, 'section__toggle-wrapper');
    addClass(toggle, 'section__toggle');
    addClass(toggleOnIcon, 'toggle__icon-on');
    addClass(toggleOffIcon, 'toggle__icon-off');
    addClass(toggleIcon, 'toggle__icon');
    addClass(toggleIconCircle, 'toggle__icon-circle');
    addClass(toggleLabelSpan, 'toggle__label');

    setAttribute(toggleIcon, ARIA_HIDDEN, 'true');

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