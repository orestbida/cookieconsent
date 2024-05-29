import { globalObj } from '../global';

import {
    ARIA_HIDDEN,
    BTN_GROUP_CLASS,
    BUTTON_TAG,
    CLICK_EVENT,
    DATA_ROLE,
    DIV_TAG,
    H2_TAG,
    H4_TAG,
    SPAN_TAG,
    VENDORS_MODAL_NAME
} from '../../utils/constants';

import {
    addClass,
    addClassVm,
    addEvent,
    appendChild,
    createNode,
    debug,
    fireEvent,
    getModalFocusableData,
    getSvgIcon,
    handleFocusTrap,
    hasClass,
    removeClass,
    setAttribute
} from '../../utils/general';
import { guiManager } from '../../utils/gui-manager';
import { convertSecondsIntoMonths } from '../../utils/time';
import { replaceTextSpacesWithSymbol } from '../../utils/text';
import { createPreferencesModal } from './preferencesModal';

/**
 * @callback CreateMainContainer
 */

/**
 * Generates the vendors modal and appends it to "cc-main" el.
 *
 * @param {import("../global").Api} api 
 * @param {CreateMainContainer} createMainContainer 
 */
export const createVendorsModal = (api, createMainContainer) => {
    const config = globalObj._config;
    const state = globalObj._state;
    const dom = globalObj._dom;
    const { hideVendors, showPreferences } = api;

    // No need to create a vendors modal if the cookie consent is not TCF compliant
    if (!config.isTcfCompliant) return;

    /**
     * Handles the back arrow click action.
     */
    const handleBackArrowClick = () => {
        hideVendors();
        showPreferences();
    };

    /**
     * @type {import("../global").VendorsModalOptions}
     */
    const modalData = state._currentTranslation?.vendorsModal ?? {};

    console.log('[createVendorsModal] config', config);
    console.log('[createVendorsModal] state', state);
    console.log('[createVendorsModal] dom', dom);
    console.log('[createVendorsModal] modalData', modalData);

    const { extendedVendors } = state._gvlData;

    console.log('[createVendorsModal] gvlData', state._gvlData);

    const {
        title = 'IAB Vendors List',
        closeIconLabel = '',
        backIconLabel = '',
        allowAllConsentBtn = 'Allow all',
        rejectAllConsentBtn = 'Reject all',
        allowSelectionBtn = 'Allow current selection',
        viewPrivacyPolicyLabel = 'View Privacy Policy',
        viewLegitimateInterestClaimLabel = 'View Legitimate Interest Claim',
        viewDeviceStorageDisclosureLabel = 'View Device Storage Disclosure'
    } = modalData;

    console.log('[createVendorsModal] title', title);
    console.log('[createVendorsModal] closeIconLabel', closeIconLabel);
    console.log('[createVendorsModal] allowAllConsentBtn', allowAllConsentBtn);
    console.log('[createVendorsModal] rejectAllConsentBtn', rejectAllConsentBtn);
    console.log('[createVendorsModal] allowSelectionBtn', allowSelectionBtn);
    console.log('[createVendorsModal] viewPrivacyPolicyLabel', viewPrivacyPolicyLabel);
    console.log('[createVendorsModal] viewLegitimateInterestClaimLabel', viewLegitimateInterestClaimLabel);
    console.log('[createVendorsModal] viewDeviceStorageDisclosureLabel', viewDeviceStorageDisclosureLabel);

    // Create modal if it doesn't exist
    if (!dom._vmContainer) {
        dom._vmContainer = createNode(DIV_TAG);
        addClass(dom._vmContainer, 'vm-wrapper');

        const vmOverlay = createNode(DIV_TAG);
        addClass(vmOverlay, 'vm-overlay');
        appendChild(dom._vmContainer, vmOverlay);

        // Hide modal when overlay / backdrop is clicked
        addEvent(vmOverlay, CLICK_EVENT, hideVendors);

        // Vendors modal
        dom._vm = createNode(DIV_TAG);
        addClass(dom._vm, 'vm');
        setAttribute(dom._vm, 'role', 'dialog');
        setAttribute(dom._vm, ARIA_HIDDEN, true);
        setAttribute(dom._vm, 'aria-modal', true);
        setAttribute(dom._vm, 'aria-labelledby', 'vm__title');

        // Hide vendors modal on 'ESC' key press
        addEvent(dom._htmlDom, 'keydown', (event) => {
            if (event.keyCode === 27) {
                hideVendors();
            }
        }, true);

        dom._vmHeader = createNode(DIV_TAG);
        addClassVm(dom._vmHeader, 'header');

        const vmTitleContainer = createNode(DIV_TAG);
        addClassVm(vmTitleContainer, 'title-container');

        const vendorBackArrow = createNode(SPAN_TAG);
        vendorBackArrow.innerHTML = getSvgIcon('arrow', 4);
        addClassVm(vendorBackArrow, 'back-arrow');
        setAttribute(vendorBackArrow, 'aria-label', backIconLabel);
        addEvent(vendorBackArrow, 'mouseenter', () => {
            if (!state._preferencesModalExists)
                createPreferencesModal(api, createMainContainer);
        });
        addEvent(vendorBackArrow, CLICK_EVENT, handleBackArrowClick);
        appendChild(vmTitleContainer, vendorBackArrow);

        dom._vmTitle = createNode(H2_TAG);
        dom._vmTitle.className = dom._vmTitle.id = 'vm__title';
        appendChild(vmTitleContainer, dom._vmTitle);

        dom._vmCloseBtn = createNode(BUTTON_TAG);
        addClassVm(dom._vmCloseBtn, 'close-btn');
        setAttribute(dom._vmCloseBtn, 'aria-label', closeIconLabel);
        addEvent(dom._vmCloseBtn, CLICK_EVENT, hideVendors);

        dom._vmFocusSpan = createNode(SPAN_TAG);
        dom._vmFocusSpan.innerHTML = getSvgIcon('x');
        appendChild(dom._vmCloseBtn, dom._vmFocusSpan);

        dom._vmBody = createNode(DIV_TAG);
        addClassVm(dom._vmBody, 'body');

        dom._vmFooter = createNode(DIV_TAG);
        addClassVm(dom._vmFooter, 'footer');

        var _vmBtnGroup1 = createNode(DIV_TAG);
        var _vmBtnGroup2 = createNode(DIV_TAG);
        addClassVm(_vmBtnGroup1, BTN_GROUP_CLASS);
        addClassVm(_vmBtnGroup2, BTN_GROUP_CLASS);

        appendChild(dom._vmFooter, _vmBtnGroup1);
        appendChild(dom._vmFooter, _vmBtnGroup2);

        appendChild(dom._vmHeader, vmTitleContainer);
        appendChild(dom._vmHeader, dom._vmCloseBtn);
        
        dom._vmDivTabIndex = createNode(DIV_TAG);
        setAttribute(dom._vmDivTabIndex, 'tabIndex', -1);
        appendChild(dom._vm, dom._vmDivTabIndex);

        appendChild(dom._vm, dom._vmHeader);
        appendChild(dom._vm, dom._vmBody);
        appendChild(dom._vm, dom._vmFooter);

        appendChild(dom._vmContainer, dom._vm);
    }

    let vendorsContainer;

    extendedVendors.forEach((vendor) => {
        const {
            id,
            name,
            usesNonCookieAccess,
            cookieMaxAgeSeconds,
            urls,
            deviceStorageDisclosureUrl
        } = vendor;


        // Try to get the additional information links in the correct language
        let localizedUrls = urls.find((url) => url.langId === state._currentLanguageCode);
        if (!localizedUrls) {
            localizedUrls = urls.find((url) => url.langId === 'en');
        }

        console.log('[vendor] vendor', vendor);
        console.log('[vendor] id', id);
        console.log('[vendor] name', name);
        console.log('[vendor] usesNonCookieAccess', usesNonCookieAccess);
        console.log('[vendor] cookieMaxAgeSeconds', cookieMaxAgeSeconds);
        console.log('[vendor] localizedUrls', localizedUrls);
        console.log('[vendor] deviceStorageDisclosureUrl', deviceStorageDisclosureUrl);

        // Main toggle container
        var vendorToggle = createNode(DIV_TAG);
        addClassVm(vendorToggle, 'vendor--toggle');
        addClassVm(vendorToggle, 'vendor--expandable');

        var vendorTitleContainer = createNode(DIV_TAG);
        addClassVm(vendorTitleContainer, 'vendor-title-wrapper');

        var vendorTitle = createNode(BUTTON_TAG);
        addClassVm(vendorTitle, 'vendor-title');
        vendorTitle.innerHTML = name;

        appendChild(vendorTitleContainer, vendorTitle);

        // Arrow icon
        const vendorTitleIcon = createNode(SPAN_TAG);
        vendorTitleIcon.innerHTML = getSvgIcon('arrow', 3.5);
        addClassVm(vendorTitleIcon, 'vendor-arrow');
        appendChild(vendorTitleContainer, vendorTitleIcon);

        const toggleLabel = createToggle(name, 'value');
        appendChild(vendorTitleContainer, toggleLabel);

        var expandableDivId = `${replaceTextSpacesWithSymbol(name, '-').toLowerCase()}-desc`;
        setAttribute(vendorTitle, 'aria-expanded', false);
        setAttribute(vendorTitle, 'aria-controls', expandableDivId);

        appendChild(vendorToggle, vendorTitleContainer);

        // Description container
        var vendorDescription = createNode(DIV_TAG);
        vendorDescription.id = expandableDivId;
        addClassVm(vendorDescription, 'vendor-desc-wrapper');
        setAttribute(vendorDescription, ARIA_HIDDEN, 'true');

        if (localizedUrls.privacy) {
            var vendorPrivacyPolicyAnchor = createNode('a');
            vendorPrivacyPolicyAnchor.innerHTML = viewPrivacyPolicyLabel;
            setAttribute(vendorPrivacyPolicyAnchor, 'href', localizedUrls.privacy);
            setAttribute(vendorPrivacyPolicyAnchor, 'target', '_blank');

            appendChild(vendorDescription, vendorPrivacyPolicyAnchor);
        }

        if (localizedUrls.legIntClaim) {
            var vendorLegitClaimAnchor = createNode('a');
            vendorLegitClaimAnchor.innerHTML = viewLegitimateInterestClaimLabel;
            setAttribute(vendorLegitClaimAnchor, 'href', localizedUrls.legIntClaim);
            setAttribute(vendorLegitClaimAnchor, 'target', '_blank');

            appendChild(vendorDescription, vendorLegitClaimAnchor);
        }

        if (deviceStorageDisclosureUrl) {
            var vendorDeviceStorageDisclosureAnchor = createNode('a');
            vendorDeviceStorageDisclosureAnchor.innerHTML = viewDeviceStorageDisclosureLabel;
            setAttribute(vendorDeviceStorageDisclosureAnchor, 'href', deviceStorageDisclosureUrl);
            setAttribute(vendorDeviceStorageDisclosureAnchor, 'target', '_blank');

            appendChild(vendorDescription, vendorDeviceStorageDisclosureAnchor);
        }

        addEvent(vendorTitle, CLICK_EVENT, () => {
            if (!hasClass(vendorToggle, 'is-expanded')) {
                addClass(vendorToggle, 'is-expanded');
                setAttribute(vendorTitle, 'aria-expanded', 'true');
                setAttribute(vendorDescription, ARIA_HIDDEN, 'false');
            } else {
                removeClass(vendorToggle, 'is-expanded');
                setAttribute(vendorTitle, 'aria-expanded', 'false');
                setAttribute(vendorDescription, ARIA_HIDDEN, 'true');
            }
        });

        const vendorInformationList = createVendorInformationList(vendor, modalData);
        appendChild(vendorDescription, vendorInformationList);

        appendChild(vendorToggle, vendorDescription);

        if (!vendorsContainer) {
            vendorsContainer = createNode(DIV_TAG);
            addClassVm(vendorsContainer, 'vendors-wrapper');
        }

        appendChild(vendorsContainer, vendorToggle);

        appendChild(dom._vmBody, vendorsContainer);
    });

    if (title) {
        dom._vmTitle.innerHTML = title;
    }

    if (!dom._vmAllowAllBtn) {
        dom._vmAllowAllBtn = createNode(BUTTON_TAG);
        addClassVm(dom._vmAllowAllBtn, 'btn');
        setAttribute(dom._vmAllowAllBtn, DATA_ROLE, 'all');
        appendChild(_vmBtnGroup1, dom._vmAllowAllBtn);

        addEvent(dom._vmAllowAllBtn, CLICK_EVENT, () => {
            console.log('ALLOW ALL CONSENTS');
        });

        dom._vmAllowAllBtn.innerHTML = allowAllConsentBtn;
    }

    if (!dom._vmRejectAllBtn) {
        dom._vmRejectAllBtn = createNode(BUTTON_TAG);
        addClassVm(dom._vmRejectAllBtn, 'btn');
        setAttribute(dom._vmRejectAllBtn, DATA_ROLE, 'all');
        appendChild(_vmBtnGroup1, dom._vmRejectAllBtn);

        addEvent(dom._vmRejectAllBtn, CLICK_EVENT, () => {
            console.log('REJECT ALL CONSENTS');
        });

        dom._vmRejectAllBtn.innerHTML = rejectAllConsentBtn;
    }

    if (!dom._vmAllowSelectionBtn) {
        dom._vmAllowSelectionBtn = createNode(BUTTON_TAG);
        addClassVm(dom._vmAllowSelectionBtn, 'btn');
        addClassVm(dom._vmAllowSelectionBtn, 'btn--secondary');
        setAttribute(dom._vmAllowSelectionBtn, DATA_ROLE, 'save');
        appendChild(_vmBtnGroup2, dom._vmAllowSelectionBtn);

        addEvent(dom._vmAllowSelectionBtn, CLICK_EVENT, () => {
            console.log('ALLOW SELECTED CONSENTS');
        });

        dom._vmAllowSelectionBtn.innerHTML = allowSelectionBtn;
    }

    // Set the modal's layout
    guiManager('vendors');

    // Append the modal to the main DOM structure
    if (!state._vendorsModalExists) {
        state._vendorsModalExists = true;
      
        debug('CookieConsent [HTML] created', VENDORS_MODAL_NAME);

        fireEvent(globalObj._customEvents._onModalReady, VENDORS_MODAL_NAME, dom._vm);
        createMainContainer(api);
        appendChild(dom._ccMain, dom._vmContainer);
        handleFocusTrap(dom._vm);

        /**
         * Enable transition.
         */
        setTimeout(() => addClass(dom._vmContainer, 'cc--anim'), 100);
    }

    getModalFocusableData('vendors');
};

/**
 * Generate toggle.
 *
 * @param {string} label Toggle label
 * @param {string} value Toggle value
 */
function createToggle(label, value) {
    const state = globalObj._state;
    const dom = globalObj._dom;

    const toggleLabel = createNode('label');
    const toggle = createNode('input');
    const toggleIcon = createNode('span');
    const toggleIconCircle = createNode('span');
    const toggleLabelSpan = createNode('span');

    const toggleOnIcon = createNode('span');
    toggleOnIcon.innerHTML = getSvgIcon('tick', 3);

    const toggleOffIcon = createNode('span');
    toggleOffIcon.innerHTML = getSvgIcon('x', 3);
    
    toggle.type = 'checkbox';

    addClass(toggleLabel, 'vendor__toggle-wrapper');
    addClass(toggle, 'vendor__toggle');
    addClass(toggleOnIcon, 'toggle__icon-on');
    addClass(toggleOffIcon, 'toggle__icon-off');
    addClass(toggleIcon, 'toggle__icon');
    addClass(toggleIconCircle, 'toggle__icon-circle');
    addClass(toggleLabelSpan, 'toggle__label');

    setAttribute(toggleIcon, ARIA_HIDDEN, true);

    // TODO: Postavi ovo u neki state ili dom za kasniji dohvat
    // dom._categoryCheckboxInputs[value] = toggle;

    addEvent(toggle, CLICK_EVENT, () => {
        // TODO: Implementiraj ovo
        console.log('JA SAM TOGGLE', label, 'CLICKED');
    });

    toggle.value = value;
    toggleLabelSpan.textContent = label.replace(/<.*>.*<\/.*>/gm, '');

    appendChild(toggleIconCircle, toggleOffIcon);
    appendChild(toggleIconCircle, toggleOnIcon);
    appendChild(toggleIcon, toggleIconCircle);

    // If the consent is valid, retrieve checked states from a cookie
    // Otherwise set it to true
    if (!state._invalidConsent) {
        // TODO: Get is true or false from a state of somesorts.
        // if elContains(state._acceptedVendors, value)
        // toggle.checked = true;
    } else {
        toggle.checked = true;
    }

    appendChild(toggleLabel, toggle);
    appendChild(toggleLabel, toggleIcon);
    appendChild(toggleLabel, toggleLabelSpan);

    return toggleLabel;
}

/**
 * Generates the vendor information list DOM structure.
 *
 * @param {Object} vendor
 * @param {import('../global').VendorsModalOptions} modalData
 * @returns {HTMLElement}
 */
function createVendorInformationList(vendor, modalData) {
    const {
        usesCookies,
        cookieMaxAgeSeconds,
        usesNonCookieAccess,
        dataDeclaration,
        dataRetention,
        purposes,
        legIntPurposes,
        specialPurposes,
        features,
        specialFeatures
    } = vendor;

    const {
        cookieLifespanLabel = 'Cookie Lifespan',
        cookieLifespanMonthsLabel = 'Months',
        usesNonCookieAccessLabel = 'This vendor utilizes other methods of storage or accessing information in addition to cookies',
        dataDeclarationLabel = 'Data Declaration',
        dataRetentionLabel = 'Data Retention',
        standardRetentionLabel = 'Standard Retention',
        dataRetentionDaysLabel = 'Days',
        consentPurposesLabel = 'Consent Purposes',
        legitimateInterestPurposesLabel = 'Legitimate Interest Purposes',
        specialPurposesLabel = 'Special Purposes',
        featuresLabel = 'Features',
        specialFeaturesLabel = 'Special Features'
    } = modalData;

    const infoList = createNode('ul');
    addClassVm(infoList, 'info-list');

    const infoListItemClass = 'info-list-item';

    /**
     * Helper function for creating a list item HTML element.
     * 
     * @param {string} header
     * @returns {HTMLElement}
     */
    const createListItem = (header) => {
        const listItem = createNode('li');
        addClassVm(listItem, infoListItemClass);

        const listItemHeader = createNode(H4_TAG);
        listItemHeader.innerHTML = header;
        appendChild(listItem, listItemHeader);

        return listItem;
    };

    /**
     * Helper function for creating a list item description HTML element.
     *
     * @param {string} description 
     * @returns {HTMLElement}
     */
    const createListItemDescription = (description) => {
        const listItemDescription = createNode('li');
        const listItemParagraph = createNode('p');

        listItemParagraph.innerHTML = description;

        appendChild(listItemDescription, listItemParagraph);

        return listItemDescription;
    };

    // Cookie lifespan
    if (usesCookies && cookieMaxAgeSeconds) {
        const item = createListItem(cookieLifespanLabel);

        const cookieMonthsLifespan = convertSecondsIntoMonths(cookieMaxAgeSeconds);
        const cookieMonthsText = cookieMonthsLifespan === 1 ? cookieLifespanMonthsLabel.slice(0, cookieLifespanMonthsLabel.length - 1) : cookieLifespanMonthsLabel;
        const lifespanDescription = createListItemDescription(`${cookieMonthsLifespan} ${cookieMonthsText}`);

        appendChild(item, lifespanDescription);

        if (usesNonCookieAccess) {
            const nonCookieDescription = createListItemDescription(`${usesNonCookieAccessLabel}.`);
            appendChild(item, nonCookieDescription);
        }

        appendChild(infoList, item);
    }

    // Data declaration
    if (dataDeclaration?.length) {
        const item = createListItem(dataDeclarationLabel);

        const childList = createNode('ul');

        for (const dataDecl of dataDeclaration) {
            const description = createListItemDescription(dataDecl.name);
            appendChild(childList, description);
        }

        appendChild(item, childList);
        appendChild(infoList, item);
    }

    // Data retention
    if (dataRetention) {
        const item = createListItem(dataRetentionLabel);

        const dataRetentionText = `${standardRetentionLabel} (${dataRetention.stdRetention} ${dataRetentionDaysLabel})`;
        const description = createListItemDescription(dataRetentionText);

        appendChild(item, description);
        appendChild(infoList, item);
    }

    // Consent purposes
    if (purposes?.length) {
        const item = createListItem(consentPurposesLabel);

        const childList = createNode('ul');

        for (const purpose of purposes) {
            let descriptionText = purpose.name;

            if (purpose.id in dataRetention.purposes) {
                descriptionText = `${purpose.name} (${dataRetention.purposes[purpose.id]} ${dataRetentionDaysLabel})`;
            }

            const description = createListItemDescription(descriptionText);
            appendChild(childList, description);
        }

        appendChild(item, childList);
        appendChild(infoList, item);
    }

    // Legitimate interest purposes
    if (legIntPurposes?.length) {
        const item = createListItem(legitimateInterestPurposesLabel);

        const childList = createNode('ul');

        for (const purpose of legIntPurposes) {
            let descriptionText = purpose.name;

            if (purpose.id in dataRetention.purposes) {
                descriptionText = `${purpose.name} (${dataRetention.purposes[purpose.id]} ${dataRetentionDaysLabel})`;
            }

            const description = createListItemDescription(descriptionText);
            appendChild(childList, description);
        }

        appendChild(item, childList);
        appendChild(infoList, item);
    }

    // Special purposes
    if (specialPurposes?.length) {
        const item = createListItem(specialPurposesLabel);

        const childList = createNode('ul');

        for (const specialPurpose of specialPurposes) {
            let descriptionText = specialPurpose.name;

            if (specialPurpose.id in dataRetention.specialPurposes) {
                descriptionText = `${specialPurpose.name} (${dataRetention.specialPurposes[specialPurpose.id]} ${dataRetentionDaysLabel})`;
            }

            const description = createListItemDescription(descriptionText);
            appendChild(childList, description);
        }

        appendChild(item, childList);
        appendChild(infoList, item);
    }

    // Features
    if (features?.length) {
        const item = createListItem(featuresLabel);

        const childList = createNode('ul');

        for (const feature of features) {
            const description = createListItemDescription(feature.name);
            appendChild(childList, description);
        }

        appendChild(item, childList);
        appendChild(infoList, item);
    }

    // Special features
    if (specialFeatures?.length) {
        const item = createListItem(specialFeaturesLabel);

        const childList = createNode('ul');

        for (const specialFeature of specialFeatures) {
            const description = createListItemDescription(specialFeature.name);
            appendChild(childList, description);
        }

        appendChild(item, childList);
        appendChild(infoList, item);
    }

    return infoList;
}