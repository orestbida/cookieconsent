import { dom, state } from "../global";
import { _createNode, _appendChild } from "../../utils/general"
import { _createConsentModal } from "./components/consent-modal";
import { _createPreferencesModal } from "./components/preferences-modal";

/**
 * Generate cookie consent html markup
 */
export const _createCookieConsentHTML = (api) => {

    // Create main container which holds both consent modal & preferences modal
    dom._ccMain = _createNode('div');
    dom._ccMain.id = 'cc-main';

    dom._ccMain.style.position = "fixed";
    dom._ccMain.style.zIndex = "1000000";

    // Create consent modal
    if(state._consentModalExists)
        _createConsentModal(api);

    // Always create preferences modal
    _createPreferencesModal(api);

    // Finally append everything (_ccMain holds both modals)
    _appendChild((state._userConfig.root || document.body), dom._ccMain);
}

export {
    _createConsentModal,
    _createPreferencesModal
}