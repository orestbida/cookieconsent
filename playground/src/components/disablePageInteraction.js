import { defaultState, getState, saveState } from "./stateManager"

/**
 * @type {HTMLInputElement}
 */
const checkbox = document.getElementById('disablePageInteraction')

checkbox.checked = !!getState().cookieConsentConfig.disablePageInteraction

checkbox.addEventListener('change', () => {

    const state = getState()
    state.cookieConsentConfig.disablePageInteraction = checkbox.checked
    saveState(state)

    const cookieconsent = window.CookieConsent

    cookieconsent.reset()
    cookieconsent
        .run(state.cookieConsentConfig)
        .then(() => {
            cookieconsent.show(true)
        })
})

window.addEventListener('cc:reset', () => {
    checkbox.checked = defaultState.darkmode
})