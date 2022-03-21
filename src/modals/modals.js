import { dom, state } from "../core/global";
import { _createNode, _appendChild } from "../utils/general"
import { _createConsentModal } from "./components/consent-modal";
import { _createPreferencesModal } from "./components/preferences-modal";

/**
 * Generate cookie consent html markup
 */
export const _createCookieConsentHTML = (api) => {

    // Create main container which holds both consent modal & preferences modal
    dom._mainContainer = _createNode('div');
    dom._mainContainer.id = 'cc--main';

    dom._allModalsContainer = _createNode('div');
    dom._allModalsContainer.className = dom._allModalsContainer.id = 'cc_div';

    dom._mainContainer.style.position = "fixed";
    dom._mainContainer.style.zIndex = "1000000";
    dom._mainContainer.appendChild(dom._allModalsContainer);

    // Create consent modal
    if(state._consentModalExists)
        _createConsentModal(api);

    // Always create preferences modal
    _createPreferencesModal(api);

    // Finally append everything (_mainContainer holds both modals)
    _appendChild((state._userConfig.root || document.body), dom._mainContainer);
}

export {
    _createConsentModal,
    _createPreferencesModal
}