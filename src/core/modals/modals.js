import { globalObj } from '../global';
import { _createNode, _appendChild } from '../../utils/general';
import { _createConsentModal } from './components/consent-modal';
import { _createPreferencesModal } from './components/preferences-modal';
import { DIV_TAG } from '../../utils/constants';
/**
 * Generate cookie consent html markup
 * @param {import("../global").Api} api
 */
export const _createCookieConsentHTML = (api) => {

    if(globalObj._dom._ccMain) return;

    // Create main container which holds both consent modal & preferences modal
    globalObj._dom._ccMain = _createNode(DIV_TAG);
    globalObj._dom._ccMain.id = 'cc-main';

    globalObj._dom._ccMain.style.position = 'fixed';
    globalObj._dom._ccMain.style.zIndex = '1000000';

    // Create consent modal
    if(globalObj._state._consentModalExists)
        _createConsentModal(api);

    // Always create preferences modal
    _createPreferencesModal(api);

    // Finally append everything (_ccMain holds both modals)
    _appendChild((globalObj._state._userConfig.root || globalObj._dom._document.body), globalObj._dom._ccMain);
};

export {
    _createConsentModal,
    _createPreferencesModal
};