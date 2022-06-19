import { dom } from "../src/core/global";
import CookieConsent from "../src/index"
import { _getKeys } from "../src/utils/general";
import testConfig from "./config/full-config";
import { defineCryptoRandom, resetCookieConsent, fireClickEvent, htmlHasClass } from "./config/mocs-utils";

let api;

describe("Consent Modal buttons test", () =>{

    beforeAll(()=>{
        defineCryptoRandom();
        api = CookieConsent.init();
    })

    afterEach(()=>{
        resetCookieConsent();
        api.eraseCookies('cc_cookie');
    })

    it('Modal accept necessary btn onClick', async () => {
        await api.run(testConfig);
        fireClickEvent(dom._consentAcceptNecessaryBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Modal accept all btn onClick', async () => {
        await api.run(testConfig);
        fireClickEvent(dom._consentAcceptAllBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.rejectedCategories.length).toBe(0);
    })

    it('Should accept necessary when closeIconLabel (x) is pressed', async () => {
        testConfig.guiOptions.consentModal.layout = 'box';
        testConfig.language.translations.en.consentModal.closeIconLabel = 'Reject all';
        await api.run(testConfig);
        fireClickEvent(dom._cmCloseIconBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
    })
})

describe('Preferences Modal buttons test', () =>{

    beforeAll(()=>{
        defineCryptoRandom();
        api = CookieConsent.init();
    })

    beforeEach(async ()=>{
        await api.run(testConfig);
    })

    afterEach(()=>{
        resetCookieConsent();
        api.eraseCookies('cc_cookie');
    })

    it('Should accept necessary only on acceptNecessaryBtn click', () => {
        fireClickEvent(dom._pmAcceptNecessaryBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Should accept all categories on acceptAllBtn click', () => {
        fireClickEvent(dom._pmAcceptAllBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.rejectedCategories.length).toBe(0);
    })

    it('Should accept selected only categories on savePreferencesBtn click', () => {
        api.accept('all');
        document.querySelector('.section__toggle[value="analytics"]').checked = false;
        fireClickEvent(dom._pmSavePreferencesBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('custom');
        expect(userPreferences.rejectedCategories).toContain('analytics');
    })

    it('Should close the preferences modal when (x) icon is pressed', () => {
        api.showPreferences();
        expect(htmlHasClass('show--preferences')).toBe(true)
        fireClickEvent(dom._pmCloseBtn);
        expect(htmlHasClass('show--preferences')).toBe(false)
    })
})

describe("Test data-cc attributes", () =>{

    beforeAll(()=>{
        defineCryptoRandom();

        document.body.innerHTML = `
            <button type="button" data-cc="show-preferencesModal">Show preferences modal</button>
            <button type="button" data-cc="show-consentModal">Show consent modal</button>
            <button type="button" data-cc="accept-all">Accept all</button>
            <button type="button" data-cc="accept-necessary">Accept necessary</button>
            <button type="button" data-cc="accept-custom">Accept current selection</button>
        `;

        api = CookieConsent.init();
    })

    beforeEach(async ()=>{
        await api.run(testConfig);
    })

    afterEach(()=>{
        resetCookieConsent();
        api.eraseCookies('cc_cookie');
    })

    it('Should show the preferences modal onClick', () => {
        const showPreferencesBtn = document.querySelector('button[data-cc="show-preferencesModal"]');
        fireClickEvent(showPreferencesBtn)
        expect(htmlHasClass('show--preferences')).toBe(true);
    })

    it('Should show the consent modal onClick', () => {
        const showConsentModal = document.querySelector('button[data-cc="show-consentModal"]');
        fireClickEvent(showConsentModal)
        expect(htmlHasClass('show--consent')).toBe(true);
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