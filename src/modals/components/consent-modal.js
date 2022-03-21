import { state, dom } from "../../core/global";
import { _log, _createNode, _addClass, _setAttribute, _appendChild, _addEvent } from "../../utils/general";
import { _guiManager } from "../../utils/gui-manager";

/**
 * Create consent modal and append it to main div
 * @param {string} lang
 */
export const _createConsentModal = (api) => {

    if(state._userConfig['disablePageInteraction'] === true)
        _addClass(dom._htmlDom, 'force--consent');

    var consentModalData = state._currentTranslation['consentModal'];

    // Create modal if it doesn't exist
    if(!dom._consentModal){

        dom._consentModal = _createNode('div');
        var consentModalInner_inner = _createNode('div');
        var overlay = _createNode('div');

        dom._consentModal.id = 'cm';
        consentModalInner_inner.id = 'c-inr-i';
        overlay.id = 'cm-ov';

        _setAttribute(dom._consentModal, 'role', 'dialog');
        _setAttribute(dom._consentModal, 'aria-modal', 'true');
        _setAttribute(dom._consentModal, 'aria-hidden', 'false');
        _setAttribute(dom._consentModal, 'aria-labelledby', 'c-ttl');
        _setAttribute(dom._consentModal, 'aria-describedby', 'c-txt');

        // Append consent modal to main container
        _appendChild(dom._allModalsContainer, dom._consentModal);
        _appendChild(dom._allModalsContainer, overlay);

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        dom._consentModal.style.visibility = overlay.style.visibility = "hidden";
        overlay.style.opacity = 0;
    }

    // Use insertAdjacentHTML instead of innerHTML
    var consentModalTitle_value = consentModalData['title'];

    // Add title (if valid)
    if(consentModalTitle_value){

        if(!dom._consentModalTitle){
            dom._consentModalTitle = _createNode('div');
            dom._consentModalTitle.id = 'c-ttl';
            _setAttribute(dom._consentModalTitle, 'role', 'heading');
            _setAttribute(dom._consentModalTitle, 'aria-level', '2');
            _appendChild(consentModalInner_inner, dom._consentModalTitle);
        }

        dom._consentModalTitle.innerHTML = consentModalTitle_value;
    }

    var description = consentModalData['description'];

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
        dom._consentModalDescription.id = 'c-txt';
        _appendChild(consentModalInner_inner, dom._consentModalDescription);
    }

    // Set description content
    dom._consentModalDescription.innerHTML = description;

    var acceptAllBtnData = consentModalData['acceptAllBtn'],   // accept current selection
        acceptNecessaryBtnData = consentModalData['acceptNecessaryBtn'];


    // Add primary button if not falsy
    if(acceptAllBtnData){

        if(!dom._consentAcceptAllBtn){
            dom._consentAcceptAllBtn = _createNode('button');
            dom._consentAcceptAllBtn.id = 'c-p-bn';
            dom._consentAcceptAllBtn.className =  "c-bn";

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
            dom._consentAcceptNecessaryBtn.id = 'c-s-bn';
            dom._consentAcceptNecessaryBtn.className = "c-bn c_link";

            _addEvent(dom._consentAcceptNecessaryBtn, 'click', () => {
                _log("CookieConsent [ACCEPT]: necessary");
                api.hide();
                api.accept([]); // accept necessary only
            });
        }

        dom._consentAcceptNecessaryBtn.innerHTML = consentModalData['acceptNecessaryBtn'];
    }

    // Swap buttons
    var guiOptionsData = state._userConfig['guiOptions'];

    if(!dom._consentModalInner){
        dom._consentModalInner = _createNode('div');
        dom._consentModalInner.id = 'c-inr';

        _appendChild(dom._consentModalInner, consentModalInner_inner);
    }

    if(!dom._consentButtonsContainer){
        dom._consentButtonsContainer = _createNode('div');
        dom._consentButtonsContainer.id = "c-bns";

        if(guiOptionsData && guiOptionsData['consentModal'] && guiOptionsData['consentModal']['swapButtons'] === true){
            acceptNecessaryBtnData && _appendChild(dom._consentButtonsContainer, dom._consentAcceptNecessaryBtn);
            acceptAllBtnData && _appendChild(dom._consentButtonsContainer, dom._consentAcceptAllBtn);
            dom._consentButtonsContainer.className = 'swap';
        }else{
            acceptAllBtnData && _appendChild(dom._consentButtonsContainer, dom._consentAcceptAllBtn);
            acceptNecessaryBtnData && _appendChild(dom._consentButtonsContainer, dom._consentAcceptNecessaryBtn);
        }

        (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(dom._consentModalInner, dom._consentButtonsContainer);
        _appendChild(dom._consentModal, dom._consentModalInner);
    }

    state._consentModalExists = true;

    _guiManager(0);
}