import crypto from 'crypto';
import { dom, state } from '../../src/core/global';

export const defineCryptoRandom = () => {
    if(!global.crypto){
        Object.defineProperty(global, 'crypto', {
            value: {
              getRandomValues: (arr) => crypto.randomBytes(arr.length)
            }
        });
    }
}

export const resetConsentModal = () => {
    dom._cmContainer = 0;
    dom._consentModal = 0;
    dom._consentModalBody = 0;
    dom._consentModalTexts = 0;
    dom._consentModalTitle = 0;
    dom._consentModalDescription = 0;
    dom._consentModalBtns = 0;
    dom._consentModalBtnGroup = 0;
    dom._consentModalBtnGroup2 = 0;
    dom._consentAcceptAllBtn = 0;
    dom._consentAcceptNecessaryBtn = 0;
    dom._consentShowPreferencesBtn = 0;
    dom._consentModalFooterLinksGroup = 0;
    dom._cmCloseIconBtn = 0;
    const modal = document.querySelector('.cm-wrapper');
    modal && modal.remove();
}

export const resetPreferencesModal = () => {
    dom._pmContainer = 0;
    dom._pm = 0;
    dom._pmHeader = 0;
    dom._pmTitle = 0;
    dom._pmCloseBtn = 0;
    dom._pmBody = 0;
    dom._pmNewBody = 0;
    dom._pmSections = 0;
    dom._pmFooter = 0;
    dom._pmAcceptAllBtn = 0;
    dom._pmAcceptNecessaryBtn = 0;
    dom._pmSavePreferencesBtn = 0;
    const modal = document.querySelector('.pm-wrapper');
    modal && modal.remove();
}

export const resetCookieConsent = () => {
    resetConsentModal();
    resetPreferencesModal();
    dom._ccMain = 0;
    dom._categoryCheckboxInputs = {};
    dom._serviceCheckboxInputs = {};
    const ccMain = document.getElementById('cc-main');
    ccMain && ccMain.remove();
    document.documentElement.classList.remove('show--consent');
    document.documentElement.classList.remove('show--preferences');
    state._userConfig = null;
    state._currentLanguageCode = '';
    state._allTranslations = {},
    state._currentTranslation = null;
    state._botAgentDetected = false;
    state._savedCookieContent = null;
    state._invalidConsent = true;
    state._cookieData = {};
    state._consentModalExists = false;
    state._consentModalVisible = false;
    state._preferencesModalVisible = false;
    state._clickedInsideModal = false;
    state._validRevision = true;
    state._preferencesModalVisibleDelayed = false;
    state._lastChangedCategoryNames = [];
    state._acceptType = '';
    state._allDefinedCategories= false,
    state._allCategoryNames= [];
    state._defaultEnabledCategories = []
    state._allToggleStates = [];
    state._allDefinedServices = {}
    state._enabledServices = {}
    state._customServicesSelection = {}
    state._lastChangedServices = {}
    state._lastEnabledServices = {}
    state._allScriptTags = [],
    state._allScriptTagsInfo = []
    state._readOnlyCategories = []
}

export function htmlHasClass(className){
    return document.documentElement.className.includes(className);
}

export function setUserAgent(userAgent) {
    Object.defineProperty(global.navigator, "userAgent", {
        get: function () {
            return userAgent; // customized user agent
        },
        configurable: true
    });
}

/**
 * Simulate user click
 * @param {HTMLElement} el
 */
export function fireClickEvent(el){
    el.dispatchEvent(new Event('click'));
}