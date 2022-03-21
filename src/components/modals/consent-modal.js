import { _state, _dom } from "../global";
import { _log, _createNode, _addClass, _setAttribute, _appendChild, _addEvent } from "../utils/general";
import { api } from "../api";
import { _guiManager } from "../utils/gui-manager";

/**
 * Create consent modal and append it to main div
 * @param {string} lang
 */
export const _createConsentModal = function(){

    if(_state.userConfig['disablePageInteraction'] === true)
        _addClass(_dom.htmlDom, 'force--consent');

    var consentModalData = _state.currentTranslation['_dom.consentModal'];

    // Create modal if it doesn't exist
    if(!_dom.consentModal){

        _dom.consentModal = _createNode('div');
        var consentModalInner_inner = _createNode('div');
        var overlay = _createNode('div');

        _dom.consentModal.id = 'cm';
        consentModalInner_inner.id = 'c-inr-i';
        overlay.id = 'cm-ov';

        _setAttribute(_dom.consentModal, 'role', 'dialog');
        _setAttribute(_dom.consentModal, 'aria-modal', 'true');
        _setAttribute(_dom.consentModal, 'aria-hidden', 'false');
        _setAttribute(_dom.consentModal, 'aria-labelledby', 'c-ttl');
        _setAttribute(_dom.consentModal, 'aria-describedby', 'c-txt');

        // Append consent modal to main container
        _appendChild(_dom.allModalsContainer, _dom.consentModal);
        _appendChild(_dom.allModalsContainer, overlay);

        /**
         * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
         */
        _dom.consentModal.style.visibility = overlay.style.visibility = "hidden";
        overlay.style.opacity = 0;
    }

    // Use insertAdjacentHTML instead of innerHTML
    var consentModalTitle_value = consentModalData['title'];

    // Add title (if valid)
    if(consentModalTitle_value){

        if(!_dom.consentModalTitle){
            _dom.consentModalTitle = _createNode('div');
            _dom.consentModalTitle.id = 'c-ttl';
            _setAttribute(_dom.consentModalTitle, 'role', 'heading');
            _setAttribute(_dom.consentModalTitle, 'aria-level', '2');
            _appendChild(consentModalInner_inner, _dom.consentModalTitle);
        }

        _dom.consentModalTitle.innerHTML = consentModalTitle_value;
    }

    var description = consentModalData['description'];

    if(_state.revisionEnabled){
        description = description.replace(
            '{{revisionMessage}}',
            _state.validRevision
                ? ''
                : consentModalData['revisionMessage'] || ''
        );
    }

    if(!_dom.consentModalDescription){
        _dom.consentModalDescription = _createNode('div');
        _dom.consentModalDescription.id = 'c-txt';
        _appendChild(consentModalInner_inner, _dom.consentModalDescription);
    }

    // Set description content
    _dom.consentModalDescription.innerHTML = description;

    var acceptAllBtnData = consentModalData['acceptAllBtn'],   // accept current selection
        acceptNecessaryBtnData = consentModalData['acceptNecessaryBtn'];
    

    // Add primary button if not falsy
    if(acceptAllBtnData){

        if(!_dom.consentAcceptAllBtn){
            _dom.consentAcceptAllBtn = _createNode('button');
            _dom.consentAcceptAllBtn.id = 'c-p-bn';
            _dom.consentAcceptAllBtn.className =  "c-bn";

            _addEvent(_dom.consentAcceptAllBtn, "click", function(){
                api.hide();
                _log("CookieConsent [ACCEPT]: all");
                api.accept('all');
            });
        }

        _dom.consentAcceptAllBtn.innerHTML = acceptAllBtnData;
    }

    // Add secondary button if not falsy
    if(acceptNecessaryBtnData){

        if(!_dom.consentAcceptNecessaryBtn){
            _dom.consentAcceptNecessaryBtn = _createNode('button');
            _dom.consentAcceptNecessaryBtn.id = 'c-s-bn';
            _dom.consentAcceptNecessaryBtn.className = "c-bn c_link";

            _addEvent(_dom.consentAcceptNecessaryBtn, 'click', function(){
                api.hide();
                _log("CookieConsent [ACCEPT]: necessary");
                api.accept([]); // accept necessary only
            });
        }

        _dom.consentAcceptNecessaryBtn.innerHTML = consentModalData['acceptNecessaryBtn'];
    }

    // Swap buttons
    var guiOptionsData = _state.userConfig['guiOptions'];

    if(!_dom.consentModalInner){
        _dom.consentModalInner = _createNode('div');
        _dom.consentModalInner.id = 'c-inr';

        _appendChild(_dom.consentModalInner, consentModalInner_inner);
    }

    if(!_dom.consentButtonsContainer){
        _dom.consentButtonsContainer = _createNode('div');
        _dom.consentButtonsContainer.id = "c-bns";

        if(guiOptionsData && guiOptionsData['consentModal'] && guiOptionsData['consentModal']['swapButtons'] === true){
            acceptNecessaryBtnData && _appendChild(_dom.consentButtonsContainer, _dom.consentAcceptNecessaryBtn);
            acceptAllBtnData && _appendChild(_dom.consentButtonsContainer, _dom.consentAcceptAllBtn);
            _dom.consentButtonsContainer.className = 'swap';
        }else{
            acceptAllBtnData && _appendChild(_dom.consentButtonsContainer, _dom.consentAcceptAllBtn);
            acceptNecessaryBtnData && _appendChild(_dom.consentButtonsContainer, _dom.consentAcceptNecessaryBtn);
        }

        (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(_dom.consentModalInner, _dom.consentButtonsContainer);
        _appendChild(_dom.consentModal, _dom.consentModalInner);
    }

    _state.consentModalExists = true;

    _guiManager(0);
}