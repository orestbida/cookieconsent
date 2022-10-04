import { globalObj } from '../global';
import { _createNode, _appendChild, _addDataButtonListeners } from '../../utils/general';
import { _createConsentModal } from './components/consent-modal';
import { _createPreferencesModal } from './components/preferences-modal';
import { DIV_TAG } from '../../utils/constants';
/**
 * Generate cookie consent html markup
 * @param {import('../global').Api} api
 */
export const _createCookieConsentHTML = (api) => {
    const dom = globalObj._dom;
    const state = globalObj._state;

    // Create main container which holds both consent modal & preferences modal
    dom._ccMain = _createNode(DIV_TAG);
    dom._ccMain.id = 'cc-main';

    dom._ccMain.style.position = 'fixed';
    dom._ccMain.style.zIndex = '2147483647';

    // Create consent modal
    if(state._invalidConsent)
        _createConsentModal(api);

    // Create preferences modal
    if(!globalObj._config.lazyHtmlGeneration)
        _createPreferencesModal(api);

    _addDataButtonListeners(null, api, _createPreferencesModal);

    // Finally append everything (_ccMain holds both modals)
    _appendChild((state._userConfig.root || dom._document.body), dom._ccMain);
};

export {
    _createConsentModal,
    _createPreferencesModal
};