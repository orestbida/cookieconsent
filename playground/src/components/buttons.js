import { resetState, resetCookies } from './stateManager';

/** @type {HTMLButtonElement} **/ const resetBtn = document.getElementById('resetBtn')
/** @type {HTMLButtonElement} **/ const revokeBtn = document.getElementById('revokeConsentBtn')

resetBtn.addEventListener('click', () => {
    resetState();
});

revokeBtn.addEventListener('click', () => {
    resetCookies()
    window.CookieConsent.show(true)
})