import { state, dom } from '../../global';
import { _log, _createNode, _addClass, _setAttribute, _appendChild, _addEvent } from '../../../utils/general';
import { _guiManager } from '../../../utils/gui-manager';

/**
 * Create consent modal and append it to "cc-main" el.
 * @param {import("../../global").Api} api
 */
export const _createConsentModal = (api) => {
    /**
     * @type {import("../../global").ConsentModal}
     */
    var consentModalData = state._currentTranslation && state._currentTranslation.consentModal;

    if(!consentModalData) return;

    if(state._userConfig.disablePageInteraction === true)
        _addClass(dom._htmlDom, 'disable--interaction');

    var acceptAllBtnData = consentModalData.acceptAllBtn,
        acceptNecessaryBtnData = consentModalData.acceptNecessaryBtn,
        showPreferencesBtnData = consentModalData.showPreferencesBtn,
        closeIconLabelData = consentModalData.closeIconLabel,
        footerData = consentModalData.footer;

    // Create modal if it doesn't exist
    if(!dom._cmContainer){

        dom._cmContainer = _createNode('div');
        dom._consentModal = _createNode('div');
        dom._consentModalBody = _createNode('div');
        dom._consentModalTexts = _createNode('div');
        dom._consentModalBtns = _createNode('div');

        _addClass(dom._cmContainer, 'cm-wrapper');
        _addClass(dom._consentModal, 'cm');
        _addClass(dom._consentModalBody, 'cm__body');
        _addClass(dom._consentModalTexts, 'cm__texts');
        _addClass(dom._consentModalBtns, 'cm__btns');

        _setAttribute(dom._consentModal, 'role', 'dialog');
        _setAttribute(dom._consentModal, 'aria-modal', 'true');
        _setAttribute(dom._consentModal, 'aria-hidden', 'false');
        _setAttribute(dom._consentModal, 'aria-labelledby', 'cm__title');
        _setAttribute(dom._consentModal, 'aria-describedby', 'cm__desc');

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        dom._consentModal.style.visibility = 'hidden';

        /**
         * Close icon-button (visible only in the 'box' layout)
         */
        if(closeIconLabelData){
            if(!dom._cmCloseIconBtn){
                dom._cmCloseIconBtn = _createNode('button');
                dom._cmCloseIconBtn.className = 'cm__btn cm__btn--close';
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
        _appendChild(dom._ccMain, dom._cmContainer);
    }

    var consentModalTitle_value = consentModalData.title;

    if(consentModalTitle_value){

        if(!dom._consentModalTitle){
            dom._consentModalTitle = _createNode('div');
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
            dom._consentModalDescription = _createNode('div');
            dom._consentModalDescription.className = dom._consentModalDescription.id = 'cm__desc';
            _appendChild(dom._consentModalTexts, dom._consentModalDescription);
        }

        dom._consentModalDescription.innerHTML = description;
    }

    if(acceptAllBtnData){

        if(!dom._consentAcceptAllBtn){
            dom._consentAcceptAllBtn = _createNode('button');
            _addClass(dom._consentAcceptAllBtn, 'cm__btn');

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
            dom._consentAcceptNecessaryBtn = _createNode('button');
            _addClass(dom._consentAcceptNecessaryBtn, 'cm__btn');

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
            dom._consentShowPreferencesBtn = _createNode('button');
            dom._consentShowPreferencesBtn.className = 'cm__btn cm__btn--secondary';

            _addEvent(dom._consentShowPreferencesBtn, 'click', () => {
                api.showPreferences();
            });
        }

        dom._consentShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    if(!dom._consentModalBtnGroup2 && showPreferencesBtnData){
        dom._consentModalBtnGroup2 = _createNode('div');
        _addClass(dom._consentModalBtnGroup2, 'cm__btn-group');
        _appendChild(dom._consentModalBtnGroup2, dom._consentShowPreferencesBtn);
        _appendChild(dom._consentModalBtns, dom._consentModalBtnGroup2);
    }

    if(!dom._consentModalBtnGroup){
        dom._consentModalBtnGroup = _createNode('div');
        _addClass(dom._consentModalBtnGroup, 'cm__btn-group');

        acceptNecessaryBtnData && _appendChild(dom._consentModalBtnGroup, dom._consentAcceptNecessaryBtn);
        acceptAllBtnData && _appendChild(dom._consentModalBtnGroup, dom._consentAcceptAllBtn);

        (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(dom._consentModalBody, dom._consentModalBtnGroup);
        _appendChild(dom._consentModalBtns, dom._consentModalBtnGroup);
    }

    if(footerData){
        if(!dom._consentModalFooterLinksGroup){
            var _consentModalFooter = _createNode('div');
            var _consentModalFooterLinks = _createNode('div');
            dom._consentModalFooterLinksGroup = _createNode('div');

            _addClass(_consentModalFooter, 'cm__footer');
            _addClass(_consentModalFooterLinks, 'cm__links');
            _addClass(dom._consentModalFooterLinksGroup, 'cm__link-group');

            _appendChild(_consentModalFooterLinks, dom._consentModalFooterLinksGroup);
            _appendChild(_consentModalFooter, _consentModalFooterLinks);
            _appendChild(dom._consentModal, _consentModalFooter);
        }
        dom._consentModalFooterLinksGroup.innerHTML = footerData;
    }

    state._consentModalExists = true;

    _guiManager(0);
};