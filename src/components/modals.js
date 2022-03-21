import { _createConsentModal } from "./modals/consent-modal";
import { _createPreferencesModal } from "./modals/preferences-modal";

import { _dom, _state } from "./global";
import { _createNode, _appendChild } from "./utils/general";

/**
 * Generate cookie consent html markup
 */
const _createCookieConsentHTML = function(){

    // Create main container which holds both consent modal & preferences modal
    _dom.mainContainer = _createNode('div');
    _dom.mainContainer.id = 'cc--main';

    // Fix layout flash
    _dom.mainContainer.style.position = "fixed";
    _dom.mainContainer.style.zIndex = "1000000";
    _dom.mainContainer.innerHTML = '<div id="cc_div" class="cc_div"></div>';
    _dom.allModalsContainer = _dom.mainContainer.children[0];

    // Create consent modal
    if(_state.consentModalExists)
        _createConsentModal();

    // Always create preferences modal
    _createPreferencesModal();

    // Finally append everything (mainContainer holds both modals)
    _appendChild((_state.userConfig['root'] || document.body), _dom.mainContainer);
}

export {
    _createConsentModal,
    _createPreferencesModal,
    _createCookieConsentHTML
}