import { globalObj } from '../global';

import {
    _log,
    createNode,
    addClass,
    addClassCm,
    setAttribute,
    appendChild,
    addEvent,
    getModalFocusableData,
    addDataButtonListeners,
    fireEvent
} from '../../utils/general';

import {
    CONSENT_MODAL_NAME,
    DIV_TAG,
    ARIA_HIDDEN,
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

    if(!consentModalData)
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
    if(!dom._cmContainer){

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

        if(consentModalLabelValue)
            setAttribute(dom._cm, 'aria-label', consentModalLabelValue);
        else if(consentModalTitleValue)
            setAttribute(dom._cm, 'aria-labelledby', 'cm__title');

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        dom._cm.style.visibility = 'hidden';

        const
            boxLayout = 'box',
            guiOptions = state._userConfig.guiOptions,
            consentModalOptions = guiOptions?.consentModal,
            consentModalLayout = consentModalOptions?.layout || boxLayout,
            isBoxLayout = consentModalLayout.split(' ')[0] === boxLayout;

        /**
         * Close icon-button (visible only in the 'box' layout)
         */
        if(consentModalTitleValue && closeIconLabelData && isBoxLayout){
            if(!dom._cmCloseIconBtn){
                dom._cmCloseIconBtn = createNode(BUTTON_TAG);
                addClassCm(dom._cmCloseIconBtn, 'btn');
                addClassCm(dom._cmCloseIconBtn, 'btn--close');
                addEvent(dom._cmCloseIconBtn, CLICK_EVENT, () => {
                    _log('CookieConsent [ACCEPT]: necessary');
                    acceptAndHide([]);
                });
                appendChild(dom._cmBody, dom._cmCloseIconBtn);
            }

            setAttribute(dom._cmCloseIconBtn, 'aria-label', closeIconLabelData);
        }

        appendChild(dom._cmBody, dom._cmTexts);

        if(acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            appendChild(dom._cmBody, dom._cmBtns);

        appendChild(dom._cm, dom._cmBody);
        appendChild(dom._cmContainer, dom._cm);
    }

    if(consentModalTitleValue){

        if(!dom._cmTitle){
            dom._cmTitle = createNode(DIV_TAG);
            dom._cmTitle.className = dom._cmTitle.id = 'cm__title';
            setAttribute(dom._cmTitle, 'role', 'heading');
            setAttribute(dom._cmTitle, 'aria-level', '2');
            appendChild(dom._cmTexts, dom._cmTitle);
        }

        dom._cmTitle.innerHTML = consentModalTitleValue;
    }

    let description = consentModalData.description;

    if(description){
        if(state._revisionEnabled){
            description = description.replace(
                '{{revisionMessage}}',
                state._validRevision
                    ? ''
                    : consentModalData.revisionMessage || ''
            );
        }

        if(!dom._cmDescription){
            dom._cmDescription = createNode(DIV_TAG);
            dom._cmDescription.className = dom._cmDescription.id = 'cm__desc';
            appendChild(dom._cmTexts, dom._cmDescription);
        }

        dom._cmDescription.innerHTML = description;
    }

    if(acceptAllBtnData){

        if(!dom._cmAcceptAllBtn){
            dom._cmAcceptAllBtn = createNode(BUTTON_TAG);
            addClassCm(dom._cmAcceptAllBtn, 'btn');
            setAttribute(dom._cmAcceptAllBtn, DATA_ROLE, 'all');

            addEvent(dom._cmAcceptAllBtn, CLICK_EVENT, () => {
                _log('CookieConsent [ACCEPT]: all');
                acceptAndHide('all');
            });
        }

        dom._cmAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    if(acceptNecessaryBtnData){

        if(!dom._cmAcceptNecessaryBtn){
            dom._cmAcceptNecessaryBtn = createNode(BUTTON_TAG);
            addClassCm(dom._cmAcceptNecessaryBtn, 'btn');
            setAttribute(dom._cmAcceptNecessaryBtn, DATA_ROLE, 'necessary');

            addEvent(dom._cmAcceptNecessaryBtn, CLICK_EVENT, () => {
                _log('CookieConsent [ACCEPT]: necessary');
                acceptAndHide([]);
            });
        }

        dom._cmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if(showPreferencesBtnData){
        if(!dom._cmShowPreferencesBtn){
            dom._cmShowPreferencesBtn = createNode(BUTTON_TAG);
            addClassCm(dom._cmShowPreferencesBtn, 'btn');
            addClassCm(dom._cmShowPreferencesBtn, 'btn--secondary');
            setAttribute(dom._cmShowPreferencesBtn, DATA_ROLE, 'show');

            addEvent(dom._cmShowPreferencesBtn, 'mouseenter', () => {
                if(!state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            });
            addEvent(dom._cmShowPreferencesBtn, CLICK_EVENT, showPreferences);
        }

        dom._cmShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    if(!dom._cmBtnGroup){
        dom._cmBtnGroup = createNode(DIV_TAG);
        addClassCm(dom._cmBtnGroup, BTN_GROUP_CLASS);

        acceptNecessaryBtnData && appendChild(dom._cmBtnGroup, dom._cmAcceptNecessaryBtn);
        acceptAllBtnData && appendChild(dom._cmBtnGroup, dom._cmAcceptAllBtn);

        (acceptAllBtnData || acceptNecessaryBtnData) && appendChild(dom._cmBody, dom._cmBtnGroup);
        appendChild(dom._cmBtns, dom._cmBtnGroup);
    }

    if(dom._cmShowPreferencesBtn && !dom._cmBtnGroup2){

        dom._cmBtnGroup2 = createNode(DIV_TAG);

        if((!dom._cmAcceptNecessaryBtn || !dom._cmAcceptAllBtn)){
            appendChild(dom._cmBtnGroup, dom._cmShowPreferencesBtn);
            addClassCm(dom._cmBtnGroup, BTN_GROUP_CLASS + '--uneven');
        }else {
            addClassCm(dom._cmBtnGroup2, BTN_GROUP_CLASS);
            appendChild(dom._cmBtnGroup2, dom._cmShowPreferencesBtn);
            appendChild(dom._cmBtns, dom._cmBtnGroup2);
        }
    }

    if(footerData){
        if(!dom._cmFooterLinksGroup){
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

        dom._cmFooterLinksGroup.innerHTML = footerData;
    }

    guiManager(0);

    if(!state._consentModalExists){
        state._consentModalExists = true;

        _log('CookieConsent [HTML] created', CONSENT_MODAL_NAME);

        fireEvent(globalObj._customEvents._onModalReady, CONSENT_MODAL_NAME, dom._cm);
        createMainContainer(api);
        setTimeout(getModalFocusableData, 10);
        appendChild(dom._ccMain, dom._cmContainer);

        /**
         * Enable transition
         */
        setTimeout(() => addClass(dom._cmContainer, 'cc--anim'), 100);
    }

    addDataButtonListeners(dom._cmBody, api, createPreferencesModal, createMainContainer);
};