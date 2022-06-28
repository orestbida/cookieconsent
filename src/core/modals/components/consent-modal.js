import { globalObj } from '../../global';
import { _log, _createNode, _addClass, _setAttribute, _appendChild, _addEvent } from '../../../utils/general';
import { _guiManager } from '../../../utils/gui-manager';
import { TOGGLE_DISABLE_INTERACTION_CLASS, DIV_TAG, BUTTON_TAG } from '../../../utils/constants';

/**
 * Create consent modal and append it to "cc-main" el.
 * @param {import("../../global").Api} api
 */
export const _createConsentModal = (api) => {
    /**
     * @type {import("../../global").ConsentModal}
     */
    var consentModalData = globalObj._state._currentTranslation && globalObj._state._currentTranslation.consentModal;

    if(!consentModalData) return;

    if(globalObj._state._userConfig.disablePageInteraction === true)
        _addClass(globalObj._dom._htmlDom, TOGGLE_DISABLE_INTERACTION_CLASS);

    var acceptAllBtnData = consentModalData.acceptAllBtn,
        acceptNecessaryBtnData = consentModalData.acceptNecessaryBtn,
        showPreferencesBtnData = consentModalData.showPreferencesBtn,
        closeIconLabelData = consentModalData.closeIconLabel,
        footerData = consentModalData.footer;

    // Create modal if it doesn't exist
    if(!globalObj._dom._cmContainer){

        globalObj._dom._cmContainer = _createNode(DIV_TAG);
        globalObj._dom._consentModal = _createNode(DIV_TAG);
        globalObj._dom._consentModalBody = _createNode(DIV_TAG);
        globalObj._dom._consentModalTexts = _createNode(DIV_TAG);
        globalObj._dom._consentModalBtns = _createNode(DIV_TAG);

        _addClass(globalObj._dom._cmContainer, 'cm-wrapper');
        _addClass(globalObj._dom._consentModal, 'cm');
        _addClass(globalObj._dom._consentModalBody, 'cm__body');
        _addClass(globalObj._dom._consentModalTexts, 'cm__texts');
        _addClass(globalObj._dom._consentModalBtns, 'cm__btns');

        _setAttribute(globalObj._dom._consentModal, 'role', 'dialog');
        _setAttribute(globalObj._dom._consentModal, 'aria-modal', 'true');
        _setAttribute(globalObj._dom._consentModal, 'aria-hidden', 'false');
        _setAttribute(globalObj._dom._consentModal, 'aria-labelledby', 'cm__title');
        _setAttribute(globalObj._dom._consentModal, 'aria-describedby', 'cm__desc');

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        globalObj._dom._consentModal.style.visibility = 'hidden';

        /**
         * Close icon-button (visible only in the 'box' layout)
         */
        if(closeIconLabelData){
            if(!globalObj._dom._cmCloseIconBtn){
                globalObj._dom._cmCloseIconBtn = _createNode(BUTTON_TAG);
                globalObj._dom._cmCloseIconBtn.className = 'cm__btn cm__btn--close';
                _addEvent(globalObj._dom._cmCloseIconBtn, 'click', ()=>{
                    _log('CookieConsent [ACCEPT]: necessary');
                    api.hide();
                    api.acceptCategory([]);
                });
                _appendChild(globalObj._dom._consentModalBody, globalObj._dom._cmCloseIconBtn);
            }

            _setAttribute(globalObj._dom._cmCloseIconBtn, 'aria-label', closeIconLabelData);
        }

        // Append consent modal to main container
        _appendChild(globalObj._dom._consentModalBody, globalObj._dom._consentModalTexts);

        if(acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            _appendChild(globalObj._dom._consentModalBody, globalObj._dom._consentModalBtns);

        _appendChild(globalObj._dom._consentModal, globalObj._dom._consentModalBody);
        _appendChild(globalObj._dom._cmContainer, globalObj._dom._consentModal);
        _appendChild(globalObj._dom._ccMain, globalObj._dom._cmContainer);
    }

    var consentModalTitle_value = consentModalData.title;

    if(consentModalTitle_value){

        if(!globalObj._dom._consentModalTitle){
            globalObj._dom._consentModalTitle = _createNode(DIV_TAG);
            globalObj._dom._consentModalTitle.className = globalObj._dom._consentModalTitle.id = 'cm__title';
            _setAttribute(globalObj._dom._consentModalTitle, 'role', 'heading');
            _setAttribute(globalObj._dom._consentModalTitle, 'aria-level', '2');
            _appendChild(globalObj._dom._consentModalTexts, globalObj._dom._consentModalTitle);
        }

        globalObj._dom._consentModalTitle.innerHTML = consentModalTitle_value;
    }

    var description = consentModalData.description;

    if(description){
        if(globalObj._state._revisionEnabled){
            description = description.replace(
                '{{revisionMessage}}',
                globalObj._state._validRevision
                    ? ''
                    : consentModalData.revisionMessage || ''
            );
        }

        if(!globalObj._dom._consentModalDescription){
            globalObj._dom._consentModalDescription = _createNode(DIV_TAG);
            globalObj._dom._consentModalDescription.className = globalObj._dom._consentModalDescription.id = 'cm__desc';
            _appendChild(globalObj._dom._consentModalTexts, globalObj._dom._consentModalDescription);
        }

        globalObj._dom._consentModalDescription.innerHTML = description;
    }

    if(acceptAllBtnData){

        if(!globalObj._dom._consentAcceptAllBtn){
            globalObj._dom._consentAcceptAllBtn = _createNode(BUTTON_TAG);
            _addClass(globalObj._dom._consentAcceptAllBtn, 'cm__btn');

            _addEvent(globalObj._dom._consentAcceptAllBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: all');
                api.hide();
                api.acceptCategory('all');
            });
        }

        globalObj._dom._consentAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    if(acceptNecessaryBtnData){

        if(!globalObj._dom._consentAcceptNecessaryBtn){
            globalObj._dom._consentAcceptNecessaryBtn = _createNode(BUTTON_TAG);
            _addClass(globalObj._dom._consentAcceptNecessaryBtn, 'cm__btn');

            _addEvent(globalObj._dom._consentAcceptNecessaryBtn, 'click', () => {
                _log('CookieConsent [ACCEPT]: necessary');
                api.hide();
                api.acceptCategory([]); // accept necessary only
            });
        }

        globalObj._dom._consentAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if(showPreferencesBtnData){
        if(!globalObj._dom._consentShowPreferencesBtn){
            globalObj._dom._consentShowPreferencesBtn = _createNode(BUTTON_TAG);
            globalObj._dom._consentShowPreferencesBtn.className = 'cm__btn cm__btn--secondary';

            _addEvent(globalObj._dom._consentShowPreferencesBtn, 'click', () => {
                api.showPreferences();
            });
        }

        globalObj._dom._consentShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    if(!globalObj._dom._consentModalBtnGroup2 && showPreferencesBtnData){
        globalObj._dom._consentModalBtnGroup2 = _createNode(DIV_TAG);
        _addClass(globalObj._dom._consentModalBtnGroup2, 'cm__btn-group');
        _appendChild(globalObj._dom._consentModalBtnGroup2, globalObj._dom._consentShowPreferencesBtn);
        _appendChild(globalObj._dom._consentModalBtns, globalObj._dom._consentModalBtnGroup2);
    }

    if(!globalObj._dom._consentModalBtnGroup){
        globalObj._dom._consentModalBtnGroup = _createNode(DIV_TAG);
        _addClass(globalObj._dom._consentModalBtnGroup, 'cm__btn-group');

        acceptNecessaryBtnData && _appendChild(globalObj._dom._consentModalBtnGroup, globalObj._dom._consentAcceptNecessaryBtn);
        acceptAllBtnData && _appendChild(globalObj._dom._consentModalBtnGroup, globalObj._dom._consentAcceptAllBtn);

        (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(globalObj._dom._consentModalBody, globalObj._dom._consentModalBtnGroup);
        _appendChild(globalObj._dom._consentModalBtns, globalObj._dom._consentModalBtnGroup);
    }

    if(footerData){
        if(!globalObj._dom._consentModalFooterLinksGroup){
            var _consentModalFooter = _createNode(DIV_TAG);
            var _consentModalFooterLinks = _createNode(DIV_TAG);
            globalObj._dom._consentModalFooterLinksGroup = _createNode(DIV_TAG);

            _addClass(_consentModalFooter, 'cm__footer');
            _addClass(_consentModalFooterLinks, 'cm__links');
            _addClass(globalObj._dom._consentModalFooterLinksGroup, 'cm__link-group');

            _appendChild(_consentModalFooterLinks, globalObj._dom._consentModalFooterLinksGroup);
            _appendChild(_consentModalFooter, _consentModalFooterLinks);
            _appendChild(globalObj._dom._consentModal, _consentModalFooter);
        }
        globalObj._dom._consentModalFooterLinksGroup.innerHTML = footerData;
    }

    globalObj._state._consentModalExists = true;

    _guiManager(0);
};