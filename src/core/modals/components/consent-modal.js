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
        setAttribute(dom._cm, 'aria-hidden', 'false');
        setAttribute(dom._cm, 'aria-labelledby', 'cm__title');
        setAttribute(dom._cm, 'aria-describedby', 'cm__desc');

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        dom._cm.style.visibility = 'hidden';

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
                appendChild(dom._cmBody, dom._cmCloseIconBtn);
            }

            setAttribute(dom._cmCloseIconBtn, 'aria-label', closeIconLabelData);
        }

        // Append consent modal to main container
        appendChild(dom._cmBody, dom._cmTexts);

        if(acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            appendChild(dom._cmBody, dom._cmBtns);

        appendChild(dom._cm, dom._cmBody);
        appendChild(dom._cmContainer, dom._cm);
    }

    var consentModalTitle_value = consentModalData.title;

    if(consentModalTitle_value){

        if(!dom._cmTitle){
            dom._cmTitle = createNode(DIV_TAG);
            dom._cmTitle.className = dom._cmTitle.id = 'cm__title';
            setAttribute(dom._cmTitle, 'role', 'heading');
            setAttribute(dom._cmTitle, 'aria-level', '2');
            appendChild(dom._cmTexts, dom._cmTitle);
        }

        dom._cmTitle.innerHTML = consentModalTitle_value;
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

            addEvent(dom._cmAcceptAllBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: all');
                api.hide();
                api.acceptCategory('all');
            });
        }

        dom._cmAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    if(acceptNecessaryBtnData){

        if(!dom._cmAcceptNecessaryBtn){
            dom._cmAcceptNecessaryBtn = createNode(BUTTON_TAG);
            addClassCm(dom._cmAcceptNecessaryBtn, 'btn');

            addEvent(dom._cmAcceptNecessaryBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: necessary');
                api.hide();
                api.acceptCategory([]); // accept necessary only
            });
        }

        dom._cmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if(showPreferencesBtnData){
        if(!dom._cmShowPreferencesBtn){
            dom._cmShowPreferencesBtn = createNode(BUTTON_TAG);
            addClassCm(dom._cmShowPreferencesBtn, 'btn');
            addClassCm(dom._cmShowPreferencesBtn, 'btn--secondary');

            addEvent(dom._cmShowPreferencesBtn, 'mouseover', () => {
                createPreferencesModal(api);
            });
            addEvent(dom._cmShowPreferencesBtn, 'click', api.showPreferences);
        }

        dom._cmShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    if(!dom._cmBtnGroup2 && showPreferencesBtnData){
        dom._cmBtnGroup2 = createNode(DIV_TAG);
        addClassCm(dom._cmBtnGroup2, 'btn-group');
        appendChild(dom._cmBtnGroup2, dom._cmShowPreferencesBtn);
        appendChild(dom._cmBtns, dom._cmBtnGroup2);
    }

    if(!dom._cmBtnGroup){
        dom._cmBtnGroup = createNode(DIV_TAG);
        addClassCm(dom._cmBtnGroup, 'btn-group');

        acceptNecessaryBtnData && appendChild(dom._cmBtnGroup, dom._cmAcceptNecessaryBtn);
        acceptAllBtnData && appendChild(dom._cmBtnGroup, dom._cmAcceptAllBtn);

        (acceptAllBtnData || acceptNecessaryBtnData ) && appendChild(dom._cmBody, dom._cmBtnGroup);
        appendChild(dom._cmBtns, dom._cmBtnGroup);
    }

    if(footerData){
        if(!dom._cmFooterLinksGroup){
            var _consentModalFooter = createNode(DIV_TAG);
            var _consentModalFooterLinks = createNode(DIV_TAG);
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
        getModalFocusableData();
        appendChild(dom._ccMain, dom._cmContainer);

        /**
         * Enable transition
         */
        setTimeout(() => addClass(dom._cmContainer, 'c--anim'), 100);
    }

    addDataButtonListeners(dom._cmBody, api, createPreferencesModal);
};