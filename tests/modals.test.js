import { dom } from "../src/core/global";
import CookieConsent from "../src/index"
import { _getKeys } from "../src/utils/general";
import testConfig from "./config/full-config";
import { defineCryptoRandom, resetCookieConsent, fireClickEvent } from "./config/mocs-utils";

let api;

describe("Consent Modal buttons test", () =>{

    beforeAll(()=>{
        defineCryptoRandom(global);
        api = CookieConsent.init();
    })

    beforeEach(()=>{
        api.run(testConfig);
    })

    afterEach(()=>{
        resetCookieConsent();
        api.eraseCookies('cc_cookie');
    })

    it('Modal accept necessary btn onClick', () => {
        fireClickEvent(dom._consentAcceptNecessaryBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Modal accept all btn onClick', () => {
        fireClickEvent(dom._consentAcceptAllBtn);
        const userPreferences = api.getUserPreferences();
        expect(api.validConsent()).toBe(true);
        expect(userPreferences.acceptType).toBe('all');
    })
})

// describe('Preferences Modal buttons test', () => {

// });

describe("Test data-cc attributes", () =>{

    beforeAll(()=>{
        defineCryptoRandom(global);

        document.body.innerHTML = `
            <button type="button" data-cc="show-preferencesModal">Show preferences modal</button>
            <button type="button" data-cc="show-consentModal">Show consent modal</button>
            <button type="button" data-cc="accept-all">Accept all</button>
            <button type="button" data-cc="accept-necessary">Accept necessary</button>
            <button type="button" data-cc="accept-custom">Accept current selection</button>
        `;

        api = CookieConsent.init();
    })

    beforeEach(()=>{
        api.run(testConfig);
    })

    afterEach(()=>{
        resetCookieConsent();
        api.eraseCookies('cc_cookie');
    })

    it('Should show the preferences modal onClick', () => {
        const showPreferencesBtn = document.querySelector('button[data-cc="show-preferencesModal"]');
        fireClickEvent(showPreferencesBtn)
        expect(document.documentElement.classList.contains('show--preferences')).toBe(true);
    })

    it('Should show the consent modal onClick', () => {
        document.documentElement.classList.remove('show--consent')
        const showConsentModal = document.querySelector('button[data-cc="show-consentModal"]');
        fireClickEvent(showConsentModal)
        expect(document.documentElement.classList.contains('show--consent')).toBe(true);
    })

    it('Should accept all categories onClick', () => {
        const acceptAllBtn = document.querySelector('button[data-cc="accept-all"]');
        fireClickEvent(acceptAllBtn)
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.acceptedCategories.length).toBe(_getKeys(testConfig.categories).length);
    })

    it('Should accept necessary categories onClick', () => {
        const acceptNecessaryBtn = document.querySelector('button[data-cc="accept-necessary"]');
        fireClickEvent(acceptNecessaryBtn)
        console.log(acceptNecessaryBtn)
        const userPreferences = api.getUserPreferences();

        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Should accept custom categories onClick', () => {
        const acceptCustomBtn = document.querySelector('button[data-cc="accept-custom"]');
        const checkbox = document.querySelector('.section__toggle[value="analytics"]');
        checkbox.checked = true;
        fireClickEvent(acceptCustomBtn)
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('custom');
        expect(userPreferences.acceptedCategories.length).toBe(2);
    })
});