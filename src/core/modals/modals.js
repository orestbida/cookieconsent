import { globalObj } from '../global';
import { createNode, appendChild, addDataButtonListeners } from '../../utils/general';
import { createConsentModal } from './components/consent-modal';
import { createPreferencesModal } from './components/preferences-modal';
import { DIV_TAG } from '../../utils/constants';
/**
 * Generate cookie consent html markup
 * @param {import('../global').Api} api
 */
export const createCookieConsentHTML = (api) => {
    const dom = globalObj._dom;
    const state = globalObj._state;

    // Create main container which holds both consent modal & preferences modal
    dom._ccMain = createNode(DIV_TAG);
    dom._ccMain.id = 'cc-main';

    dom._ccMain.style.position = 'fixed';
    dom._ccMain.style.zIndex = '2147483647';

    // Create consent modal
    if(state._invalidConsent)
        createConsentModal(api);

    // Create preferences modal
    if(!globalObj._config.lazyHtmlGeneration)
        createPreferencesModal(api);

    addDataButtonListeners(null, api, createPreferencesModal);

    let root = state._userConfig.root;

    if(root && typeof root === 'string')
        root = document.querySelector(root);

    // Append main container to dom
    appendChild((root || dom._document.body), dom._ccMain);
};

export {
    createConsentModal,
    createPreferencesModal
};