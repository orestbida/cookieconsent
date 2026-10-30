import { customEvents, getById, highlightCode, onEvent } from './utils';

/** @type {HTMLElement} **/          const cookieJson = getById('cookie-json');
/** @type {HTMLPreElement} **/       const cookieJsonPre = getById('cookie-json-pre');
/** @type {HTMLParagraphElement} **/ const emptyMessage = getById('cookie-empty');
/** @type {HTMLSpanElement} **/      const cookieName = getById('cookie-name');

const statusElements = document.querySelectorAll('[data-consent-status]');

/**
 * Show the saved consent cookie and whether consent was given
 */
const updateConsentCookie = () => {
    const cc = window.CookieConsent;

    if (!cc || !cc.getConfig)
        return;

    const validConsent = cc.validConsent();

    cookieName.textContent = cc.getConfig('cookie').name;
    cookieJson.innerHTML = validConsent ? highlightCode(JSON.stringify(cc.getCookie(), null, 4)) : '';
    cookieJsonPre.hidden = !validConsent;
    emptyMessage.hidden = validConsent;

    for (const element of statusElements) {
        element.dataset.consentStatus = validConsent ? 'given' : 'none';
        element.querySelector('.consent-status__text').textContent = validConsent
            ? 'Consent saved'
            : 'No consent yet';
    }
};

onEvent(customEvents._RUN, updateConsentCookie);
onEvent(customEvents._RESET, updateConsentCookie);
onEvent('cc:onConsent', updateConsentCookie);
onEvent('cc:onChange', updateConsentCookie);
