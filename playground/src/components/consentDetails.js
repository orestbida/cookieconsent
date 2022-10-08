/**
 * @callback callbackFn
 */

/**
 * @param {string} e
 * @param {callbackFn} fn
 */
const addListener = (e, fn) => window.addEventListener(e, fn)

/**
 * @param {HTMLElement} modal
 */
const updateFields = (modal) => {

    if(!window.CookieConsent.validConsent() || !modal)
        return;

    const {consentId, consentTimestamp, lastConsentTimestamp} = CookieConsent.getCookie();

    const id = modal.querySelector('#consent-id');
    const timestamp = modal.querySelector('#consent-timestamp');
    const lastTimestamp = modal.querySelector('#last-consent-timestamp');

    id && (id.textContent = consentId);
    timestamp && (timestamp.textContent = new Date(consentTimestamp).toLocaleString());
    lastTimestamp && (lastTimestamp.textContent = new Date(lastConsentTimestamp).toLocaleString());
}

addListener('cc:onChange', () => {
    updateFields(getPreferencesModal())
});

addListener('cc:onConsent', () => {
    updateFields(getPreferencesModal())
});

addListener('cc:onModalShow', ({detail}) => {
    if(detail.modalName === 'preferencesModal')
        updateFields(getPreferencesModal());
});

function getPreferencesModal() {
    return document.querySelector('#cc-main .pm')
}