import { globalObj } from '../global';
import { createNode, appendChild, addDataButtonListeners, closeModalOnOutsideClick } from '../../utils/general';
import { createConsentModal } from './consentModal';
import { createPreferencesModal } from './preferencesModal';
import { DIV_TAG } from '../../utils/constants';
import { handleRtlLanguage } from '../../utils/language';

/**
 * @param {import('../global').Api} api
 */
export const createMainContainer = (api) => {
    const dom = globalObj._dom;

    if(!dom._ccMain){
        dom._ccMain = createNode(DIV_TAG);
        dom._ccMain.id = 'cc-main';

        dom._ccMain.style.position = 'fixed';
        dom._ccMain.style.zIndex = '2147483647';

        handleRtlLanguage();

        let root = globalObj._state._userConfig.root;

        if(root && typeof root === 'string')
            root = document.querySelector(root);

        // Append main container to dom
        appendChild(root || dom._document.body, dom._ccMain);

        closeModalOnOutsideClick(api);
    }
};

/**
 * Generate cookie consent html markup
 * @param {import('../global').Api} api
 */
export const createCookieConsentHTML = (api) => {
    const state = globalObj._state;

    // Create consent modal
    if(state._invalidConsent)
        createConsentModal(api, createMainContainer);

    // Create preferences modal
    if(!globalObj._config.lazyHtmlGeneration)
        createPreferencesModal(api, createMainContainer);

    addDataButtonListeners(null, api, createPreferencesModal, createMainContainer);
};

export * from './consentModal';
export * from './preferencesModal';