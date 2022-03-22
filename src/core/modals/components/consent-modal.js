import { state, dom } from "../../global";
import { _log, _createNode, _addClass, _setAttribute, _appendChild, _addEvent } from "../../../utils/general";
import { _guiManager } from "../../../utils/gui-manager";

/**
 * Create consent modal and append it to main div
 * @param {import("../../global").Api} api
 */
export const _createConsentModal = (api) => {

    if(state._userConfig['disablePageInteraction'] === true)
        _addClass(dom._htmlDom, 'force--consent');

    var consentModalData = state._currentTranslation['consentModal'];

    var acceptAllBtnData = consentModalData['acceptAllBtn'],   // accept current selection
        acceptNecessaryBtnData = consentModalData['acceptNecessaryBtn'],
        showPreferencesBtnData = consentModalData['showPreferencesBtn'],
        footerData = consentModalData['footer'];

    // Create modal if it doesn't exist
    if(!dom._cmContainer){

        dom._cmContainer = _createNode('div');
        dom._consentModal = _createNode('div');
        dom._consentModalBody = _createNode('div');
        dom._consentModalTexts = _createNode('div');
        dom._consentModalBtns = _createNode('div');

        dom._cmContainer.className = 'cm-container';
        dom._consentModal.className = 'cm';
        dom._consentModalBody.className = 'cm__body';
        dom._consentModalTexts.className = 'cm__texts';
        dom._consentModalBtns.className = 'cm__btns';

        _setAttribute(dom._consentModal, 'role', 'dialog');
        _setAttribute(dom._consentModal, 'aria-modal', 'true');
        _setAttribute(dom._consentModal, 'aria-hidden', 'false');
        _setAttribute(dom._consentModal, 'aria-labelledby', 'cm__title');
        _setAttribute(dom._consentModal, 'aria-describedby', 'cm__desc');

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        dom._consentModal.style.visibility = "hidden";

        // Append consent modal to main container
        _appendChild(dom._consentModalBody, dom._consentModalTexts);

        if(acceptAllBtnData || acceptNecessaryBtnData || showPreferencesBtnData)
            _appendChild(dom._consentModalBody, dom._consentModalBtns);

        _appendChild(dom._consentModal, dom._consentModalBody);
        _appendChild(dom._cmContainer, dom._consentModal);
        _appendChild(dom._ccMain, dom._cmContainer);
    }

    // Use insertAdjacentHTML instead of innerHTML
    var consentModalTitle_value = consentModalData['title'];

    // Add title (if valid)
    if(consentModalTitle_value){

        if(!dom._consentModalTitle){
            dom._consentModalTitle = _createNode('div');
            dom._consentModalTitle.className = 'cm__title';
            _setAttribute(dom._consentModalTitle, 'role', 'heading');
            _setAttribute(dom._consentModalTitle, 'aria-level', '2');
            _appendChild(dom._consentModalTexts, dom._consentModalTitle);
        }

        dom._consentModalTitle.innerHTML = consentModalTitle_value;
    }

    var description = consentModalData['description'];

    if(description){
        if(state._revisionEnabled){
            description = description.replace(
                '{{revisionMessage}}',
                state._validRevision
                    ? ''
                    : consentModalData['revisionMessage'] || ''
            );
        }

        if(!dom._consentModalDescription){
            dom._consentModalDescription = _createNode('div');
            dom._consentModalDescription.className = 'cm__desc';
            _appendChild(dom._consentModalTexts, dom._consentModalDescription);
        }

        // Set description content
        dom._consentModalDescription.innerHTML = description;
    }

    // Add primary button if not falsy
    if(acceptAllBtnData){

        if(!dom._consentAcceptAllBtn){
            dom._consentAcceptAllBtn = _createNode('button');
            dom._consentAcceptAllBtn.className = 'cm__btn';

            _addEvent(dom._consentAcceptAllBtn, "click", () => {
                _log("CookieConsent [ACCEPT]: all");
                api.hide();
                api.accept('all');
            });
        }

        dom._consentAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    // Add secondary button if not falsy
    if(acceptNecessaryBtnData){

        if(!dom._consentAcceptNecessaryBtn){
            dom._consentAcceptNecessaryBtn = _createNode('button');
            dom._consentAcceptNecessaryBtn.className = "cm__btn";

            _addEvent(dom._consentAcceptNecessaryBtn, 'click', () => {
                _log("CookieConsent [ACCEPT]: necessary");
                api.hide();
                api.accept([]); // accept necessary only
            });
        }

        dom._consentAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
    }

    if(showPreferencesBtnData){
        if(!dom._consentShowPreferencesBtn){
            dom._consentShowPreferencesBtn = _createNode('button');
            dom._consentShowPreferencesBtn.className = "cm__btn cm__btn-preferences";

            _addEvent(dom._consentShowPreferencesBtn, 'click', () => {
                api.showPreferences();
            });
        }

        dom._consentShowPreferencesBtn.innerHTML = showPreferencesBtnData;
    }

    // [TODO] swapButtons option

    if(!dom._consentModalBtnGroup){
        dom._consentModalBtnGroup = _createNode('div');
        dom._consentModalBtnGroup.className = "cm__btn-group";

        acceptAllBtnData && _appendChild(dom._consentModalBtnGroup, dom._consentAcceptAllBtn);
        acceptNecessaryBtnData && _appendChild(dom._consentModalBtnGroup, dom._consentAcceptNecessaryBtn);

        (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(dom._consentModalBody, dom._consentModalBtnGroup);
        _appendChild(dom._consentModalBtns, dom._consentModalBtnGroup)
    }

    if(!dom._consentModalBtnGroup2 && showPreferencesBtnData){
        dom._consentModalBtnGroup2 = _createNode('div');
        dom._consentModalBtnGroup2.className = "cm__btn-group";
        _appendChild(dom._consentModalBtnGroup2, dom._consentShowPreferencesBtn);
        _appendChild(dom._consentModalBtns, dom._consentModalBtnGroup2);
    }

    if(footerData){
        if(!dom._consentModalFooterLinksGroup){
            var _consentModalFooter = _createNode('div');
            var _consentModalFooterLinks = _createNode('div');

            _consentModalFooter.className = "cm__footer";
            _consentModalFooterLinks.className = "cm__links";

            dom._consentModalFooterLinksGroup = _createNode('div');
            dom._consentModalFooterLinksGroup.className = "cm__link-group";
            _appendChild(_consentModalFooterLinks, dom._consentModalFooterLinksGroup);
            _appendChild(_consentModalFooter, _consentModalFooterLinks);
            _appendChild(dom._consentModal, _consentModalFooter);
        }
        dom._consentModalFooterLinksGroup.innerHTML = footerData;
    }

    state._consentModalExists = true;

    _guiManager(0);
}