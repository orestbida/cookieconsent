import { globalObj } from '../global';

import { debug } from '../../utils/debug';
import { createNode, addClass, addClassCm, setAttribute, appendChild, addEvent, getOrCreateNode } from '../../utils/dom';
import { getModalFocusableData, handleFocusTrap } from '../../utils/focus-trap';
import { addDataButtonListeners } from '../../utils/data-buttons';
import { getSvgIcon } from '../../utils/svg-icons';
import { fireEvent } from '../../utils/events';

import {
    CONSENT_MODAL_NAME,
    DIV_TAG,
    BUTTON_TAG,
    BTN_GROUP_CLASS,
    CLICK_EVENT,
    DATA_ROLE
} from '../../utils/constants';

import { guiManager } from '../../utils/gui-manager';
import { createPreferencesModal } from './preferencesModal';

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
 * @param {import("../global").Api} api
 * @param {CreateMainContainer} createMainContainer
 */
export const createConsentModal = (api, createMainContainer) => {
    const state = globalObj._state;
    const dom = globalObj._dom;
    const {hide, showPreferences, acceptCategory} = api;

    /**
     * @type {import("../global").ConsentModalOptions}
     */
    const consentModalData = state._currentTranslation && state._currentTranslation.consentModal;

    if (!consentModalData)
        return;

    const acceptAllBtnData = consentModalData.acceptAllBtn,
        acceptNecessaryBtnData = consentModalData.acceptNecessaryBtn,
        showPreferencesBtnData = consentModalData.showPreferencesBtn,
        closeIconLabelData = consentModalData.closeIconLabel,
        footerData = consentModalData.footer,
        consentModalLabelValue = consentModalData.label,
        consentModalTitleValue = consentModalData.title;

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

        if (state._disablePageInteraction) {
            setAttribute(dom._cm, 'role', 'dialog');
            setAttribute(dom._cm, 'aria-modal', 'true');
        } else {
            setAttribute(dom._cm, 'role', 'region');
        }

        if (consentModalLabelValue) {
            setAttribute(dom._cm, 'aria-label', consentModalLabelValue);
        } else if (consentModalTitleValue) {
            setAttribute(dom._cm, 'aria-labelledby', 'cm__title');
            setAttribute(dom._cm, 'aria-describedby', 'cm__desc');
        }
        const
            boxLayout = 'box',
            guiOptions = state._userConfig.guiOptions,
            consentModalOptions = guiOptions && guiOptions.consentModal,
            consentModalLayout = consentModalOptions && consentModalOptions.layout || boxLayout,
            isBoxLayout = consentModalLayout.split(' ')[0] === boxLayout;

        /**
         * Close icon-button (visible only in the 'box' layout)
         */
        if (consentModalTitleValue && closeIconLabelData && isBoxLayout) {
            const closeIconBtn = getOrCreateNode(() => dom._cmCloseIconBtn, (el) => dom._cmCloseIconBtn = el, BUTTON_TAG, (el) => {
                el.innerHTML = getSvgIcon();
                addClassCm(el, 'btn');
                addClassCm(el, 'btn--close');
                addEvent(el, CLICK_EVENT, () => {
                    debug('CookieConsent [ACCEPT]: necessary');
                    acceptAndHide([]);
                });
                appendChild(dom._cmBody, el);
            });

            setAttribute(closeIconBtn, 'aria-label', closeIconLabelData);
        }

        appendChild(dom._cmBody, dom._cmTexts);

        if (acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            appendChild(dom._cmBody, dom._cmBtns);

        appendChild(dom._cm, dom._cmBody);
        appendChild(dom._cmContainer, dom._cm);

        dom._cmDivTabindex = dom._cm;
        setAttribute(dom._cmDivTabindex, 'tabIndex', -1);
    }

    if (consentModalTitleValue) {
        const title = getOrCreateNode(() => dom._cmTitle, (el) => dom._cmTitle = el, 'h2', (el) => {
            el.className = el.id = 'cm__title';
            appendChild(dom._cmTexts, el);
        });

        title.innerHTML = consentModalTitleValue;
    }

    let description = consentModalData.description;

    if (description) {
        if (state._revisionEnabled) {
            description = description.replace(
                '{{revisionMessage}}',
                state._validRevision
                    ? ''
                    : consentModalData.revisionMessage || ''
            );
        }

        const descriptionEl = getOrCreateNode(() => dom._cmDescription, (el) => dom._cmDescription = el, 'p', (el) => {
            el.className = el.id = 'cm__desc';
            appendChild(dom._cmTexts, el);
        });

        descriptionEl.innerHTML = description;
    }

    if (acceptAllBtnData) {
        const acceptAllBtn = getOrCreateNode(() => dom._cmAcceptAllBtn, (el) => dom._cmAcceptAllBtn = el, BUTTON_TAG, (el) => {
            appendChild(el, createFocusSpan());
            addClassCm(el, 'btn');
            setAttribute(el, DATA_ROLE, 'all');

            addEvent(el, CLICK_EVENT, () => {
                debug('CookieConsent [ACCEPT]: all');
                acceptAndHide('all');
            });
        });

        acceptAllBtn.firstElementChild.innerHTML = acceptAllBtnData;
    }

    if (acceptNecessaryBtnData) {
        const acceptNecessaryBtn = getOrCreateNode(() => dom._cmAcceptNecessaryBtn, (el) => dom._cmAcceptNecessaryBtn = el, BUTTON_TAG, (el) => {
            appendChild(el, createFocusSpan());
            addClassCm(el, 'btn');
            setAttribute(el, DATA_ROLE, 'necessary');

            addEvent(el, CLICK_EVENT, () => {
                debug('CookieConsent [ACCEPT]: necessary');
                acceptAndHide([]);
            });
        });

        acceptNecessaryBtn.firstElementChild.innerHTML = acceptNecessaryBtnData;
    }

    if (showPreferencesBtnData) {
        const showPreferencesBtn = getOrCreateNode(() => dom._cmShowPreferencesBtn, (el) => dom._cmShowPreferencesBtn = el, BUTTON_TAG, (el) => {
            appendChild(el, createFocusSpan());
            addClassCm(el, 'btn');
            addClassCm(el, 'btn--secondary');
            setAttribute(el, DATA_ROLE, 'show');
            setAttribute(el, 'aria-haspopup', 'dialog');

            addEvent(el, 'mouseenter', () => {
                if (!state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            });
            addEvent(el, CLICK_EVENT, showPreferences);
        });

        showPreferencesBtn.firstElementChild.innerHTML = showPreferencesBtnData;
    }

    if (!dom._cmBtnGroup) {
        dom._cmBtnGroup = createNode(DIV_TAG);
        addClassCm(dom._cmBtnGroup, BTN_GROUP_CLASS);

        acceptAllBtnData && appendChild(dom._cmBtnGroup, dom._cmAcceptAllBtn);
        acceptNecessaryBtnData && appendChild(dom._cmBtnGroup, dom._cmAcceptNecessaryBtn);

        (acceptAllBtnData || acceptNecessaryBtnData) && appendChild(dom._cmBody, dom._cmBtnGroup);
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

    if (footerData) {
        const footerLinksGroup = getOrCreateNode(() => dom._cmFooterLinksGroup, (el) => dom._cmFooterLinksGroup = el, DIV_TAG, (el) => {
            const footer = createNode(DIV_TAG);
            const footerLinks = createNode(DIV_TAG);

            addClassCm(footer, 'footer');
            addClassCm(footerLinks, 'links');
            addClassCm(el, 'link-group');

            appendChild(footerLinks, el);
            appendChild(footer, footerLinks);
            appendChild(dom._cm, footer);
        });

        footerLinksGroup.innerHTML = footerData;
    }

    guiManager(0);

    if (!state._consentModalExists) {
        state._consentModalExists = true;

        debug('CookieConsent [HTML] created', CONSENT_MODAL_NAME);

        fireEvent(globalObj._customEvents._onModalReady, CONSENT_MODAL_NAME, dom._cm);
        createMainContainer(api);
        appendChild(dom._ccMain, dom._cmContainer);
        handleFocusTrap(dom._cm);
    }

    getModalFocusableData(1);

    addDataButtonListeners(dom._cmBody, api, createPreferencesModal, createMainContainer);
};
