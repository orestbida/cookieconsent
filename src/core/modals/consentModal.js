import { globalObj } from '../global';

import {
    debug,
    createNode,
    addClass,
    addClassCm,
    setAttribute,
    appendChild,
    addEvent,
    getModalFocusableData,
    addDataButtonListeners,
    getSvgIcon,
    handleFocusTrap,
    fireEvent
} from '../../utils/general';

import {
    CONSENT_MODAL_NAME,
    H2_TAG,
    H3_TAG,
    SPAN_TAG,
    DIV_TAG,
    ARIA_HIDDEN,
    BUTTON_TAG,
    BTN_GROUP_CLASS,
    CLICK_EVENT,
    DATA_ROLE
} from '../../utils/constants';

import { guiManager } from '../../utils/gui-manager';
import { createPreferencesModal } from './preferencesModal';
import { createVendorsModal } from './vendorsModal';
import { generateVendorDescription } from '../../utils/gvl';

/**
 * @callback CreateMainContainer
 */

/**
 * @returns {HTMLSpanElement}
 */
const createFocusSpan = () => {
    const span = createNode('span');

    if (!globalObj._dom._focusSpan)
        globalObj._dom._focusSpan = span;

    return span;
};

/**
 * Create consent modal and append it to "cc-main" el.
 *
 * @param {import("../global").Api} api
 * @param {CreateMainContainer} createMainContainer
 */
export const createConsentModal = (api, createMainContainer) => {
    const config = globalObj._config;
    const state = globalObj._state;
    const dom = globalObj._dom;
    const { hide, showPreferences, showVendors, acceptCategory } = api;

    const isTcfCompliant = config.isTcfCompliant;

    /**
     * @type {import("../global").ConsentModalOptions}
     */
    const modalData = state._currentTranslation && state._currentTranslation.consentModal;

    console.log('[createConsentModal] config', config);
    console.log('[createConsentModal] state', state);
    console.log('[createConsentModal] dom', dom);
    console.log('[createConsentModal] modalData', modalData);

    if (!modalData)
        return;

    const {
        acceptAllBtn,
        acceptNecessaryBtn,
        showPreferencesBtn,
        closeIconLabel,
        footer,
        label,
        title,
        vendorTitle = 'We and our partners perform the following based on your settings',
        showVendorsBtn = 'List of partners (vendors)',
        descriptionCountPlaceholder = '{{count}}'
    } = modalData;

    /**
     * @param {string|string[]} [categories]
     */
    const acceptAndHide = (categories) => {
        hide();
        acceptCategory(categories);
    };

    // Create modal if it doesn't exist
    if (!dom._cmContainer) {
        dom._cmContainer = createNode(DIV_TAG);
        dom._cm = createNode(DIV_TAG);
        dom._cmBody = createNode(DIV_TAG);
        dom._cmTexts = createNode(DIV_TAG);
        dom._cmBtns = createNode(DIV_TAG);

        addClass(dom._cmContainer, 'cm-wrapper');
        addClass(dom._cm, 'cm');
        addClassCm(dom._cmBody, 'body');
        addClassCm(dom._cmTexts, 'texts');
        addClassCm(dom._cmBtns, 'btns');

        setAttribute(dom._cm, 'role', 'dialog');
        setAttribute(dom._cm, 'aria-modal', 'true');
        setAttribute(dom._cm, ARIA_HIDDEN, 'false');
        setAttribute(dom._cm, 'aria-describedby', 'cm__desc');

        if (label)
            setAttribute(dom._cm, 'aria-label', label);
        else if (title)
            setAttribute(dom._cm, 'aria-labelledby', 'cm__title');

        const boxLayout = 'box';
        const guiOptions = state._userConfig.guiOptions;
        const consentModalOptions = guiOptions && guiOptions.consentModal;
        const consentModalLayout = consentModalOptions && consentModalOptions.layout || boxLayout;
        const isBoxLayout = consentModalLayout.split(' ')[0] === boxLayout;

        // Create a close icon-button (visible only in the 'box' layout)
        if (title && closeIconLabel && isBoxLayout) {
            if (!dom._cmCloseIconBtn) {
                dom._cmCloseIconBtn = createNode(BUTTON_TAG);
                dom._cmCloseIconBtn.innerHTML = getSvgIcon('x');
                addClassCm(dom._cmCloseIconBtn, 'btn');
                addClassCm(dom._cmCloseIconBtn, 'btn--close');
                addEvent(dom._cmCloseIconBtn, CLICK_EVENT, () => {
                    debug('CookieConsent [ACCEPT]: necessary');
                    acceptAndHide([]);
                });
                appendChild(dom._cmBody, dom._cmCloseIconBtn);
            }

            setAttribute(dom._cmCloseIconBtn, 'aria-label', closeIconLabel);
        }

        appendChild(dom._cmBody, dom._cmTexts);

        // If there are any button labels, append the button div to the consent modal body
        if (acceptAllBtn || acceptNecessaryBtn || showPreferencesBtn) {
            appendChild(dom._cmBody, dom._cmBtns);
        }

        dom._cmDivTabindex = createNode(DIV_TAG);
        setAttribute(dom._cmDivTabindex, 'tabIndex', -1);
        appendChild(dom._cm, dom._cmDivTabindex);

        // Properly nest the rest of the modal body structure
        if (isTcfCompliant) {
            dom._cmBodyRow = createNode(DIV_TAG);
            addClassCm(dom._cmBodyRow, 'row');

            dom._cmVendorBody = createNode(DIV_TAG);
            addClassCm(dom._cmVendorBody, 'vendor-body');

            appendChild(dom._cmBodyRow, dom._cmBody);
            appendChild(dom._cmBodyRow, dom._cmVendorBody);
            appendChild(dom._cm, dom._cmBodyRow);
        } else {
            appendChild(dom._cm, dom._cmBody);
        }
        appendChild(dom._cmContainer, dom._cm);
    }

    // Append the consent modal title
    if (title) {
        if (!dom._cmTitle) {
            dom._cmTitle = createNode(H2_TAG);
            dom._cmTitle.className = dom._cmTitle.id = 'cm__title';
            appendChild(dom._cmTexts, dom._cmTitle);
        }

        dom._cmTitle.innerHTML = title;
    }

    // Append the modal description
    let description = modalData.description;
    if (description) {
        if (state._revisionEnabled) {
            description = description.replace(
                '{{revisionMessage}}',
                state._validRevision
                    ? ''
                    : modalData.revisionMessage || ''
            );
        }

        if (!dom._cmDescription) {
            dom._cmDescription = createNode('p');
            dom._cmDescription.className = dom._cmDescription.id = 'cm__desc';
            appendChild(dom._cmTexts, dom._cmDescription);
        }

        dom._cmDescription.innerHTML = description;
    }
    
    if (acceptAllBtn) {
        if (!dom._cmAcceptAllBtn) {
            dom._cmAcceptAllBtn = createNode(BUTTON_TAG);
            appendChild(dom._cmAcceptAllBtn, createFocusSpan());
            addClassCm(dom._cmAcceptAllBtn, 'btn');
            setAttribute(dom._cmAcceptAllBtn, DATA_ROLE, 'all');

            addEvent(dom._cmAcceptAllBtn, CLICK_EVENT, () => {
                debug('CookieConsent [ACCEPT]: all');
                acceptAndHide('all');
            });
        }

        dom._cmAcceptAllBtn.firstElementChild.innerHTML = acceptAllBtn;
    }

    if (acceptNecessaryBtn) {
        if (!dom._cmAcceptNecessaryBtn) {
            dom._cmAcceptNecessaryBtn = createNode(BUTTON_TAG);
            appendChild(dom._cmAcceptNecessaryBtn, createFocusSpan());
            addClassCm(dom._cmAcceptNecessaryBtn, 'btn');
            setAttribute(dom._cmAcceptNecessaryBtn, DATA_ROLE, 'necessary');

            addEvent(dom._cmAcceptNecessaryBtn, CLICK_EVENT, () => {
                debug('CookieConsent [ACCEPT]: necessary');
                acceptAndHide([]);
            });
        }

        dom._cmAcceptNecessaryBtn.firstElementChild.innerHTML = acceptNecessaryBtn;
    }

    if (showPreferencesBtn) {
        if (!dom._cmShowPreferencesBtn) {
            dom._cmShowPreferencesBtn = createNode(BUTTON_TAG);
            appendChild(dom._cmShowPreferencesBtn, createFocusSpan());
            addClassCm(dom._cmShowPreferencesBtn, 'btn');
            addClassCm(dom._cmShowPreferencesBtn, 'btn--secondary');
            setAttribute(dom._cmShowPreferencesBtn, DATA_ROLE, 'show');

            addEvent(dom._cmShowPreferencesBtn, 'mouseenter', () => {
                if (!state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            });
            addEvent(dom._cmShowPreferencesBtn, CLICK_EVENT, showPreferences);
        }

        dom._cmShowPreferencesBtn.firstElementChild.innerHTML = showPreferencesBtn;
    }

    if (!dom._cmBtnGroup) {
        dom._cmBtnGroup = createNode(DIV_TAG);
        addClassCm(dom._cmBtnGroup, BTN_GROUP_CLASS);

        acceptAllBtn && appendChild(dom._cmBtnGroup, dom._cmAcceptAllBtn);
        acceptNecessaryBtn && appendChild(dom._cmBtnGroup, dom._cmAcceptNecessaryBtn);

        (acceptAllBtn || acceptNecessaryBtn) && appendChild(dom._cmBody, dom._cmBtnGroup);
        appendChild(dom._cmBtns, dom._cmBtnGroup);
    }

    if (dom._cmShowPreferencesBtn && !dom._cmBtnGroup2) {
        dom._cmBtnGroup2 = createNode(DIV_TAG);

        if ((!dom._cmAcceptNecessaryBtn || !dom._cmAcceptAllBtn)) {
            appendChild(dom._cmBtnGroup, dom._cmShowPreferencesBtn);
            addClassCm(dom._cmBtnGroup, BTN_GROUP_CLASS + '--uneven');
        }else {
            addClassCm(dom._cmBtnGroup2, BTN_GROUP_CLASS);
            appendChild(dom._cmBtnGroup2, dom._cmShowPreferencesBtn);
            appendChild(dom._cmBtns, dom._cmBtnGroup2);
        }
    }

    if (footer) {
        if (!dom._cmFooterLinksGroup) {
            let _consentModalFooter = createNode(DIV_TAG);
            let _consentModalFooterLinks = createNode(DIV_TAG);
            dom._cmFooterLinksGroup = createNode(DIV_TAG);

            addClassCm(_consentModalFooter, 'footer');
            addClassCm(_consentModalFooterLinks, 'links');
            addClassCm(dom._cmFooterLinksGroup, 'link-group');

            appendChild(_consentModalFooterLinks, dom._cmFooterLinksGroup);
            appendChild(_consentModalFooter, _consentModalFooterLinks);
            appendChild(dom._cm, _consentModalFooter);
        }

        dom._cmFooterLinksGroup.innerHTML = footer;
    }

    // Configure the consent modal to be TCF compliant
    if (isTcfCompliant) {
        // Step 1: Display the vendor count in the consent description
        const { vendorCount } = state._gvlData;

        if (!dom._cmVendorCount) {
            dom._cmVendorCount = createNode(SPAN_TAG);
            addClassCm(dom._cmVendorCount, 'vendor-count');
            dom._cmVendorCount.innerHTML = vendorCount;
        }

        dom._cmDescription.innerHTML = dom._cmDescription.innerHTML.replace(descriptionCountPlaceholder, dom._cmVendorCount.outerHTML);

        // Step 2: Append the consent modal vendor title
        if (!dom._cmVendorText) {
            dom._cmVendorText = createNode(DIV_TAG);
            addClassCm(dom._cmVendorText, 'texts');
            appendChild(dom._cmVendorBody, dom._cmVendorText);
        }

        if (vendorTitle) {
            if (!dom._cmVendorTitle) {
                dom._cmVendorTitle = createNode(H3_TAG);
                dom._cmVendorTitle.className = dom._cmVendorTitle.id = 'cm__vendor-title';
                addClassCm(dom._cmVendorTitle, 'title');
                appendChild(dom._cmVendorText, dom._cmVendorTitle);
            }

            dom._cmVendorTitle.innerHTML = `${vendorTitle}:`;
        }

        // Step 3: Append the consent modal vendor description
        if (!dom._cmVendorDescription) {
            dom._cmVendorDescription = createNode('p');
            dom._cmVendorDescription.className = dom._cmVendorDescription.id = 'cm__desc';
            appendChild(dom._cmVendorText, dom._cmVendorDescription);
        }

        dom._cmVendorDescription.innerHTML = generateVendorDescription();

        // Step 4: Append the show vendors button
        if (showVendorsBtn) {
            dom._cmVendorBtns = createNode(DIV_TAG);
            addClassCm(dom._cmVendorBtns, 'btns');
            appendChild(dom._cmVendorBody, dom._cmVendorBtns);

            if (!dom._cmShowVendorsBtn) {
                dom._cmShowVendorsBtn = createNode(BUTTON_TAG);
                appendChild(dom._cmShowVendorsBtn, createFocusSpan());
                addClassCm(dom._cmShowVendorsBtn, 'btn');
                addClassCm(dom._cmShowVendorsBtn, 'btn--secondary');
                setAttribute(dom._cmShowVendorsBtn, DATA_ROLE, 'show-vendors');
  
                addEvent(dom._cmShowVendorsBtn, 'mouseenter', () => {
                    if (!state._vendorsModalExists) {
                        createVendorsModal(api, createMainContainer);
                    }
                });
                addEvent(dom._cmShowVendorsBtn, CLICK_EVENT, showVendors);
  
                dom._cmShowVendorsBtn.firstElementChild.innerHTML = showVendorsBtn;
                appendChild(dom._cmVendorBtns, dom._cmShowVendorsBtn);
            }
        }
    }

    // Set the modal's layout
    guiManager('consent');

    if (!state._consentModalExists) {
        state._consentModalExists = true;

        debug('CookieConsent [HTML] created', CONSENT_MODAL_NAME);

        fireEvent(globalObj._customEvents._onModalReady, CONSENT_MODAL_NAME, dom._cm);
        createMainContainer(api);
        appendChild(dom._ccMain, dom._cmContainer);
        handleFocusTrap(dom._cm);

        /**
         * Enable transition
         */
        setTimeout(() => addClass(dom._cmContainer, 'cc--anim'), 100);
    }

    getModalFocusableData('consent');

    addDataButtonListeners(dom._cmBody, api, createPreferencesModal, createVendorsModal, createMainContainer);
};