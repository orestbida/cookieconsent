import { globalObj } from '../global';
import { createNode, addDataButtonListeners } from '../../utils/general';
import { createConsentModal } from './consentModal';
import { createPreferencesModal } from './preferencesModal';
import { DIV_TAG } from '../../utils/constants';
import { handleRtlLanguage } from '../../utils/language';

export const createMainContainer = () => {
    const dom = globalObj._dom;

    if (dom._ccMain) return;

    dom._ccMain = createNode(DIV_TAG);
    dom._ccMain.id = 'cc-main';
    dom._ccMain.setAttribute('data-nosnippet', '');

    handleRtlLanguage();

    // Append main container to dom
    dom._rootEl.appendChild(dom._ccMain);
};

/**
 * @param {import('../global').Api} api
 */
export const generateHtml = (api) => {
    addDataButtonListeners(null, api, createPreferencesModal, createMainContainer);

    if (globalObj._state._invalidConsent)
        createConsentModal(api, createMainContainer);

    if (!globalObj._config.lazyHtmlGeneration)
        createPreferencesModal(api, createMainContainer);
};

export * from './consentModal';
export * from './preferencesModal';
