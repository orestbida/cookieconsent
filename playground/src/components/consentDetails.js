import { onEvent, customEvents } from './utils'

/**
 * @param {HTMLElement} modal
 */
const updateFields = (modal) => {

    if(!window.CookieConsent.validConsent() || !modal)
        return;

    const {
        consentId,
        consentTimestamp,
        lastConsentTimestamp
    } = window.CookieConsent.getCookie();

    const id = modal.querySelector('#consent-id');
    const timestamp = modal.querySelector('#consent-timestamp');
    const lastTimestamp = modal.querySelector('#last-consent-timestamp');

    id && (id.textContent = consentId);
    timestamp && (timestamp.textContent = new Date(consentTimestamp).toLocaleString());
    lastTimestamp && (lastTimestamp.textContent = new Date(lastConsentTimestamp).toLocaleString());
};

onEvent(customEvents._ON_CHANGE, () => {
    updateFields(getPreferencesModal());
});

onEvent(customEvents._ON_CONSENT, () => {
    updateFields(getPreferencesModal());
});

onEvent(customEvents._ON_MODAL_SHOW, ({detail}) => {
    if(detail.modalName === 'preferencesModal')
        updateFields(getPreferencesModal());
});

function getPreferencesModal() {
    return document.querySelector('#cc-main .pm');
}