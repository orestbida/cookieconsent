import { globalObj, fireEvent } from '../../global';

import {
    _log,
    createNode,
    addClass,
    addClassCm,
    setAttribute,
    appendChild,
    addEvent,
    getModalFocusableData,
    addDataButtonListeners
} from '../../../utils/general';

import {
    CONSENT_MODAL_NAME,
    TOGGLE_DISABLE_INTERACTION_CLASS,
    DIV_TAG,
    BUTTON_TAG
} from '../../../utils/constants';

import { guiManager } from '../../../utils/gui-manager';
import { createPreferencesModal } from './preferences-modal';

/**
 * Create consent modal and append it to "cc-main" el.
 * @param {import("../../global").Api} api
 */
export const createConsentModal = (api) => {

    const state = globalObj._state;
    const dom = globalObj._dom;

    /**
     * @type {import("../../global").ConsentModalOptions}
     */
    const consentModalData = state._currentTranslation && state._currentTranslation.consentModal;

    if(!consentModalData)
        return;

    if(state._userConfig.disablePageInteraction === true)
        addClass(dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);

    var acceptAllBtnData = consentModalData.acceptAllBtn,
        acceptNecessaryBtnData = consentModalData.acceptNecessaryBtn,
        showPreferencesBtnData = consentModalData.showPreferencesBtn,
        closeIconLabelData = consentModalData.closeIconLabel,
        footerData = consentModalData.footer;

    // Create modal if it doesn't exist
    if(!dom._cmContainer){

        dom._cmContainer = createNode(DIV_TAG);
        dom._consentModal = createNode(DIV_TAG);
        dom._consentModalBody = createNode(DIV_TAG);
        dom._consentModalTexts = createNode(DIV_TAG);
        dom._consentModalBtns = createNode(DIV_TAG);

        addClass(dom._cmContainer, 'cm-wrapper');
        addClass(dom._consentModal, 'cm');
        addClassCm(dom._consentModalBody, 'body');
        addClassCm(dom._consentModalTexts, 'texts');
        addClassCm(dom._consentModalBtns, 'btns');

        setAttribute(dom._consentModal, 'role', 'dialog');
        setAttribute(dom._consentModal, 'aria-modal', 'true');
        setAttribute(dom._consentModal, 'aria-hidden', 'false');
        setAttribute(dom._consentModal, 'aria-labelledby', 'cm__title');
        setAttribute(dom._consentModal, 'aria-describedby', 'cm__desc');

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        dom._consentModal.style.visibility = 'hidden';

        const boxLayout = 'box',
            guiOptions = state._userConfig.guiOptions,
            consentModalOptions = guiOptions && guiOptions.consentModal,
            consentModalLayout = consentModalOptions && consentModalOptions.layout || boxLayout,
            isBoxLayout = consentModalLayout.split(' ')[0] === boxLayout;

        /**
         * Close icon-button (visible only in the 'box' layout)
         */
        if(closeIconLabelData && isBoxLayout){
            if(!dom._cmCloseIconBtn){
                dom._cmCloseIconBtn = createNode(BUTTON_TAG);
                addClassCm(dom._cmCloseIconBtn, 'btn');
                addClassCm(dom._cmCloseIconBtn, 'btn--close');
                addEvent(dom._cmCloseIconBtn, 'click', ()=>{
                    _log('CookieConsent [ACCEPT]: necessary');
                    api.hide();
                    api.acceptCategory([]);
                });
                appendChild(dom._consentModalBody, dom._cmCloseIconBtn);
            }

            setAttribute(dom._cmCloseIconBtn, 'aria-label', closeIconLabelData);
        }

        // Append consent modal to main container
        appendChild(dom._consentModalBody, dom._consentModalTexts);

        if(acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            appendChild(dom._consentModalBody, dom._consentModalBtns);

        appendChild(dom._consentModal, dom._consentModalBody);
        appendChild(dom._cmContainer, dom._consentModal);
    }

    var consentModalTitle_value = consentModalData.title;

    if(consentModalTitle_value){

        if(!dom._consentModalTitle){
            dom._consentModalTitle = createNode(DIV_TAG);
            dom._consentModalTitle.className = dom._consentModalTitle.id = 'cm__title';
            setAttribute(dom._consentModalTitle, 'role', 'heading');
            setAttribute(dom._consentModalTitle, 'aria-level', '2');
            appendChild(dom._consentModalTexts, dom._consentModalTitle);
        }

        dom._consentModalTitle.innerHTML = consentModalTitle_value;
    }

    var description = consentModalData.description;

    if(description){
        if(state._revisionEnabled){
            description = description.replace(
                '{{revisionMessage}}',
                state._validRevision
                    ? ''
                    : consentModalData.revisionMessage || ''
            );
        }

        if(!dom._consentModalDescription){
            dom._consentModalDescription = createNode(DIV_TAG);
            dom._consentModalDescription.className = dom._consentModalDescription.id = 'cm__desc';
            appendChild(dom._consentModalTexts, dom._consentModalDescription);
        }

        dom._consentModalDescription.innerHTML = description;
    }

    if(acceptAllBtnData){

        if(!dom._consentAcceptAllBtn){
            dom._consentAcceptAllBtn = createNode(BUTTON_TAG);
            addClassCm(dom._consentAcceptAllBtn, 'btn');

            addEvent(dom._consentAcceptAllBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: all');
                api.hide();
                api.acceptCategory('all');
            });
        }

        dom._consentAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    if(acceptNecessaryBtnData){

        if(!dom._consentAcceptNecessaryBtn){
            dom._consentAcceptNecessaryBtn = createNode(BUTTON_TAG);
            addClassCm(dom._consentAcceptNecessaryBtn, 'btn');

            addEvent(dom._consentAcceptNecessaryBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: necessary');
                api.hide();
                api.acceptCategory([]); // accept necessary only
            });
        }

        dom._consentAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if(showPreferencesBtnData){
        if(!dom._consentShowPreferencesBtn){
            dom._consentShowPreferencesBtn = createNode(BUTTON_TAG);
            addClassCm(dom._consentShowPreferencesBtn, 'btn');
            addClassCm(dom._consentShowPreferencesBtn, 'btn--secondary');

            addEvent(dom._consentShowPreferencesBtn, 'mouseover', () => {
                createPreferencesModal(api);
            });
            addEvent(dom._consentShowPreferencesBtn, 'click', api.showPreferences);
        }

        dom._consentShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    if(!dom._consentModalBtnGroup2 && showPreferencesBtnData){
        dom._consentModalBtnGroup2 = createNode(DIV_TAG);
        addClassCm(dom._consentModalBtnGroup2, 'btn-group');
        appendChild(dom._consentModalBtnGroup2, dom._consentShowPreferencesBtn);
        appendChild(dom._consentModalBtns, dom._consentModalBtnGroup2);
    }

    if(!dom._consentModalBtnGroup){
        dom._consentModalBtnGroup = createNode(DIV_TAG);
        addClassCm(dom._consentModalBtnGroup, 'btn-group');

        acceptNecessaryBtnData && appendChild(dom._consentModalBtnGroup, dom._consentAcceptNecessaryBtn);
        acceptAllBtnData && appendChild(dom._consentModalBtnGroup, dom._consentAcceptAllBtn);

        (acceptAllBtnData || acceptNecessaryBtnData ) && appendChild(dom._consentModalBody, dom._consentModalBtnGroup);
        appendChild(dom._consentModalBtns, dom._consentModalBtnGroup);
    }

    if(footerData){
        if(!dom._consentModalFooterLinksGroup){
            var _consentModalFooter = createNode(DIV_TAG);
            var _consentModalFooterLinks = createNode(DIV_TAG);
            dom._consentModalFooterLinksGroup = createNode(DIV_TAG);

            addClassCm(_consentModalFooter, 'footer');
            addClassCm(_consentModalFooterLinks, 'links');
            addClassCm(dom._consentModalFooterLinksGroup, 'link-group');

            appendChild(_consentModalFooterLinks, dom._consentModalFooterLinksGroup);
            appendChild(_consentModalFooter, _consentModalFooterLinks);
            appendChild(dom._consentModal, _consentModalFooter);
        }
        dom._consentModalFooterLinksGroup.innerHTML = footerData;
    }

    guiManager(0);

    if(!state._consentModalExists){
        state._consentModalExists = true;
        fireEvent(globalObj._customEvents._onModalReady, CONSENT_MODAL_NAME, dom._cmContainer);
        getModalFocusableData();
        appendChild(dom._ccMain, dom._cmContainer);

        _log('CookieConsent [HTML] created', CONSENT_MODAL_NAME);

        /**
         * Enable transition
         */
        setTimeout(() => addClass(dom._cmContainer, 'c--anim'), 100);
    }

    addDataButtonListeners(dom._consentModalBody, api, createPreferencesModal);
};