import { globalObj, _fireEvent } from '../../global';
import {
    _log,
    _createNode,
    _addClass,
    _addClassCm,
    _setAttribute,
    _appendChild,
    _addEvent,
    _getModalFocusableData,
    _addDataButtonListeners
} from '../../../utils/general';
import { _guiManager } from '../../../utils/gui-manager';

import {
    CONSENT_MODAL_NAME,
    TOGGLE_DISABLE_INTERACTION_CLASS,
    DIV_TAG,
    BUTTON_TAG
} from '../../../utils/constants';
import { _createPreferencesModal } from './preferences-modal';

/**
 * Create consent modal and append it to "cc-main" el.
 * @param {import("../../../../types").CookieConsentAPI} api
 */
export const _createConsentModal = (api) => {

    const state = globalObj._state;
    const dom = globalObj._dom;

    /**
     * @type {import("../../global").ConsentModal}
     */
    const consentModalData = state._currentTranslation && state._currentTranslation.consentModal;

    if(!consentModalData)
        return;

    if(state._userConfig.disablePageInteraction === true)
        _addClass(dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);

    var acceptAllBtnData = consentModalData.acceptAllBtn,
        acceptNecessaryBtnData = consentModalData.acceptNecessaryBtn,
        showPreferencesBtnData = consentModalData.showPreferencesBtn,
        closeIconLabelData = consentModalData.closeIconLabel,
        footerData = consentModalData.footer;

    // Create modal if it doesn't exist
    if(!dom._cmContainer){

        dom._cmContainer = _createNode(DIV_TAG);
        dom._consentModal = _createNode(DIV_TAG);
        dom._consentModalBody = _createNode(DIV_TAG);
        dom._consentModalTexts = _createNode(DIV_TAG);
        dom._consentModalBtns = _createNode(DIV_TAG);

        _addClass(dom._cmContainer, 'cm-wrapper');
        _addClass(dom._consentModal, 'cm');
        _addClassCm(dom._consentModalBody, 'body');
        _addClassCm(dom._consentModalTexts, 'texts');
        _addClassCm(dom._consentModalBtns, 'btns');

        _setAttribute(dom._consentModal, 'role', 'dialog');
        _setAttribute(dom._consentModal, 'aria-modal', 'true');
        _setAttribute(dom._consentModal, 'aria-hidden', 'false');
        _setAttribute(dom._consentModal, 'aria-labelledby', 'cm__title');
        _setAttribute(dom._consentModal, 'aria-describedby', 'cm__desc');

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
                dom._cmCloseIconBtn = _createNode(BUTTON_TAG);
                _addClassCm(dom._cmCloseIconBtn, 'btn');
                _addClassCm(dom._cmCloseIconBtn, 'btn--close');
                _addEvent(dom._cmCloseIconBtn, 'click', ()=>{
                    _log('CookieConsent [ACCEPT]: necessary');
                    api.hide();
                    api.acceptCategory([]);
                });
                _appendChild(dom._consentModalBody, dom._cmCloseIconBtn);
            }

            _setAttribute(dom._cmCloseIconBtn, 'aria-label', closeIconLabelData);
        }

        // Append consent modal to main container
        _appendChild(dom._consentModalBody, dom._consentModalTexts);

        if(acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            _appendChild(dom._consentModalBody, dom._consentModalBtns);

        _appendChild(dom._consentModal, dom._consentModalBody);
        _appendChild(dom._cmContainer, dom._consentModal);
    }

    var consentModalTitle_value = consentModalData.title;

    if(consentModalTitle_value){

        if(!dom._consentModalTitle){
            dom._consentModalTitle = _createNode(DIV_TAG);
            dom._consentModalTitle.className = dom._consentModalTitle.id = 'cm__title';
            _setAttribute(dom._consentModalTitle, 'role', 'heading');
            _setAttribute(dom._consentModalTitle, 'aria-level', '2');
            _appendChild(dom._consentModalTexts, dom._consentModalTitle);
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
            dom._consentModalDescription = _createNode(DIV_TAG);
            dom._consentModalDescription.className = dom._consentModalDescription.id = 'cm__desc';
            _appendChild(dom._consentModalTexts, dom._consentModalDescription);
        }

        dom._consentModalDescription.innerHTML = description;
    }

    if(acceptAllBtnData){

        if(!dom._consentAcceptAllBtn){
            dom._consentAcceptAllBtn = _createNode(BUTTON_TAG);
            _addClassCm(dom._consentAcceptAllBtn, 'btn');

            _addEvent(dom._consentAcceptAllBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: all');
                api.hide();
                api.acceptCategory('all');
            });
        }

        dom._consentAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    if(acceptNecessaryBtnData){

        if(!dom._consentAcceptNecessaryBtn){
            dom._consentAcceptNecessaryBtn = _createNode(BUTTON_TAG);
            _addClassCm(dom._consentAcceptNecessaryBtn, 'btn');

            _addEvent(dom._consentAcceptNecessaryBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: necessary');
                api.hide();
                api.acceptCategory([]); // accept necessary only
            });
        }

        dom._consentAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if(showPreferencesBtnData){
        if(!dom._consentShowPreferencesBtn){
            dom._consentShowPreferencesBtn = _createNode(BUTTON_TAG);
            _addClassCm(dom._consentShowPreferencesBtn, 'btn');
            _addClassCm(dom._consentShowPreferencesBtn, 'btn--secondary');

            _addEvent(dom._consentShowPreferencesBtn, 'mouseover', () => {
                _createPreferencesModal(api);
            });
            _addEvent(dom._consentShowPreferencesBtn, 'click', api.showPreferences);
        }

        dom._consentShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    if(!dom._consentModalBtnGroup2 && showPreferencesBtnData){
        dom._consentModalBtnGroup2 = _createNode(DIV_TAG);
        _addClassCm(dom._consentModalBtnGroup2, 'btn-group');
        _appendChild(dom._consentModalBtnGroup2, dom._consentShowPreferencesBtn);
        _appendChild(dom._consentModalBtns, dom._consentModalBtnGroup2);
    }

    if(!dom._consentModalBtnGroup){
        dom._consentModalBtnGroup = _createNode(DIV_TAG);
        _addClassCm(dom._consentModalBtnGroup, 'btn-group');

        acceptNecessaryBtnData && _appendChild(dom._consentModalBtnGroup, dom._consentAcceptNecessaryBtn);
        acceptAllBtnData && _appendChild(dom._consentModalBtnGroup, dom._consentAcceptAllBtn);

        (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(dom._consentModalBody, dom._consentModalBtnGroup);
        _appendChild(dom._consentModalBtns, dom._consentModalBtnGroup);
    }

    if(footerData){
        if(!dom._consentModalFooterLinksGroup){
            var _consentModalFooter = _createNode(DIV_TAG);
            var _consentModalFooterLinks = _createNode(DIV_TAG);
            dom._consentModalFooterLinksGroup = _createNode(DIV_TAG);

            _addClassCm(_consentModalFooter, 'footer');
            _addClassCm(_consentModalFooterLinks, 'links');
            _addClassCm(dom._consentModalFooterLinksGroup, 'link-group');

            _appendChild(_consentModalFooterLinks, dom._consentModalFooterLinksGroup);
            _appendChild(_consentModalFooter, _consentModalFooterLinks);
            _appendChild(dom._consentModal, _consentModalFooter);
        }
        dom._consentModalFooterLinksGroup.innerHTML = footerData;
    }

    _guiManager(0);

    if(!state._consentModalExists){
        state._consentModalExists = true;
        _appendChild(dom._ccMain, dom._cmContainer);
        _getModalFocusableData();

        _log('CookieConsent [HTML] created', CONSENT_MODAL_NAME);
        _fireEvent(globalObj._customEvents._onModalReady, CONSENT_MODAL_NAME);

        /**
         * Enable transition
         */
        setTimeout(() => _addClass(dom._cmContainer, 'c--anim'), 100);
    }

    _addDataButtonListeners(dom._consentModalBody, api, _createPreferencesModal);
};