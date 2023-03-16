import { globalObj } from '../global';
import { createNode, closeModalOnOutsideClick, handleFocusTrap, isString, addDataButtonListeners } from '../../utils/general';
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

        if(root && isString(root))
            root = document.querySelector(root);

        // Prepend main container to dom
        (root || dom._document.body).prepend(dom._ccMain);

        closeModalOnOutsideClick(api);
    }
};

/**
 * @param {import('../global').Api} api
 */
export const generateHtml = async (api) => {

    addDataButtonListeners(null, api, createPreferencesModal, createMainContainer);

    if(globalObj._state._invalidConsent)
        createConsentModal(api, createMainContainer);

    if(!globalObj._config.lazyHtmlGeneration)
        createPreferencesModal(api, createMainContainer);

    handleFocusTrap();
};

export * from './consentModal';
export * from './preferencesModal';