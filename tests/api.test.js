import CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { _elContains, _getKeys, _isObject } from "../src/utils/general";
import { _setCookie } from "../src/utils/cookies";
import { dom, state } from "../src/core/global";
import { defineCryptoRandom } from "./config/mocs-utils";

let api;
const consentModalClassToggle = 'show--consent';
const preferencesModalClassToggle = 'show--preferences'

describe("CookieConsent Clean state", () =>{

    beforeAll(()=>{
        defineCryptoRandom(global);
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics">console.log("enabled analytics")</script>
            <script type="text/plain" data-category="!analytics">console.log("disabled analytics")</script>
            <script type="text/plain" data-category="analytics" data-service="my-service">console.log("enabled my-service")</script>
            <script type="text/plain" data-category="analytics" data-service="!my-service">console.log("disabled my-service")</script>
        `;

        api = CookieConsent.init();
        api.run(testConfig);
    })

    it('Modals should exist', () => {
        const ccMain = document.getElementById('cc-main');
        expect(ccMain).toBeInstanceOf(HTMLElement);
    })

    it('Consent modal should be hidden when autoShow=false', () => {
        expect(htmlHasClass(consentModalClassToggle)).toBe(false);
    })

    it('Should return config.', () => {
        const cookieConfig = api.getConfig('cookie');
        const root = api.getConfig('root');

        expect(cookieConfig).toMatchObject({
            name: 'cc_cookie',
            expiresAfterDays: 200,
            path: '/',
            sameSite: 'Lax'
        })

        expect(root).toBeInstanceOf(HTMLElement);
    })

    it('Should return invalid consent', () => {
        expect(api.validConsent()).toBe(false);
    })

    it('Should accept only the necessary categories', () => {
        api.accept([]);
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(false)
    })

    it('Should return valid consent', () => {
        api.accept();
        expect(api.validConsent()).toBe(true);
    })

    it('Should accept all categories', () => {
        api.accept('all');
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(true)
    })

    it('Should accept current selection inside modal categories', () => {
        const analyticsToggle = document.querySelector('.section__toggle[value="analytics"]');
        analyticsToggle.checked = false;
        api.accept();
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(false)
    })

    it('Should accept a specific category ', () => {
        api.accept(['analytics']);
        api.accept('analytics');
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(true)
    })

    it('Should accept all categories except one', () => {
        api.accept('all', ['analytics']);
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(false)
    })

    it('Should return the plugin\'s cookie', () => {

        const cookie = api.getCookie();

        expect(cookie).toHaveProperty('categories');
        expect(cookie).toHaveProperty('revision');
        expect(cookie).toHaveProperty('data');
        expect(cookie).toHaveProperty('consentId');
        expect(cookie).toHaveProperty('consentTimestamp');
        expect(cookie).toHaveProperty('lastConsentTimestamp');
        expect(cookie).toHaveProperty('services');
    })

    it('Should return user preferences', () => {
        const userPreferences = api.getUserPreferences();
        expect(_isObject(userPreferences)).toBeTruthy();
        expect(userPreferences).toHaveProperty('acceptedCategories');
        expect(userPreferences).toHaveProperty('rejectedCategories');
        expect(userPreferences).toHaveProperty('acceptType');
        expect(userPreferences).toHaveProperty('acceptedServices');
        expect(userPreferences).toHaveProperty('rejectedServices');
    })

    it('Should return true if cookie exists', () => {
        expect(api.validCookie('cc_cookie')).toBe(true);
    })

    it('Should return false if cookie is empty', () => {
        document.cookie = 'empty_cookie=; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        expect(api.validCookie('empty_cookie')).toBe(false);
    })

    it('Should return false cookie if does not exist', () => {
        expect(api.validCookie('non_existing_cookie')).toBe(false);
    })

    it('Should erase cookie by string', () => {
        document.cookie = 'test_cookie=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        api.eraseCookies('test_cookie');
        expect(api.validCookie('test_cookie')).toBe(false);
    })

    it('Should erase cookie by regex', () => {
        document.cookie = 'test_cookie1=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        document.cookie = 'test_cookie2=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        api.eraseCookies(/^test_cookie/);
        expect(api.validCookie('test_cookie1')).toBe(false);
        expect(api.validCookie('test_cookie2')).toBe(false);
    })

    it('Should erase array of cookies by by regex and string', () => {
        document.cookie = 'test_cookie1=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        document.cookie = 'test_cookie2=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        document.cookie = 'new_cookie=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        api.eraseCookies([/^test_cookie/, 'new_cookie']);
        expect(api.validCookie('test_cookie1')).toBe(false);
        expect(api.validCookie('test_cookie2')).toBe(false);
        expect(api.validCookie('new_cookie')).toBe(false);
    })

    it('Should erase cookie with specific path and domain', () => {
        document.cookie = 'test_cookie5=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/ciao; domain='+location.host;
        api.eraseCookies('test_cookie5', '/', location.host);
        expect(api.validCookie('test_cookie5')).toBe(false);
    });

    it('Should show the consent modal', () => {
        api.show();
        expect(htmlHasClass(consentModalClassToggle)).toBe(true);
    })

    it('aria-hidden should be false when modal is visible', () => {
        expect(dom._consentModal.getAttribute('aria-hidden')).toBe('false');
    })

    it('Should hide the consent modal', () => {
        api.hide();
        expect(htmlHasClass(consentModalClassToggle)).toBe(false);
    })

    it('aria-hidden should be true when modal is not visible', () => {
        expect(dom._consentModal.getAttribute('aria-hidden')).toBe('true');
    })

    it('Should create the consent modal if it does not exist', () => {

        /**
         * Remove consent modal (simulate page reload)
         */
        resetConsentModal();

        let modal = document.querySelector('#cc-main .cm');
        expect(modal).toBeFalsy();

        /**
         * Create modal
         */
        api.show(true);
        modal = document.querySelector('#cc-main .cm')

        expect(modal).toBeDefined();
        expect(modal).toBeInstanceOf(HTMLElement);
    })

    it('Should hide the preferences modal', () => {
        api.hidePreferences();
        expect(htmlHasClass(preferencesModalClassToggle)).toBe(false);
    })

    it('Should show the preferences modal', () => {
        api.showPreferences();
        expect(htmlHasClass(preferencesModalClassToggle)).toBe(true);
    })

    it('Should accept all services', () => {
        api.acceptService('all', 'analytics');
        expect(state._enabledServices['analytics'].length).toBe(_getKeys(state._allDefinedServices['analytics']).length)
    })

    it('Should reject all services', () => {
        api.acceptService([], 'analytics');
        expect(state._enabledServices['analytics'].length).toBe(0);
    })

    it('Should accept specific service only', () => {
        api.acceptService('service1', 'analytics');
        expect(state._enabledServices['analytics'].length).toBe(1);
    })

    it('Should return true if service is enabled', () => {
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
    })

    it('Should return false if service is disabled', () => {
        expect(api.acceptedService('service2', 'analytics')).toBe(false);
    })

    it('Should change the language to "it"', () => {
        expect(state._currentLanguageCode).toBe('en');
        const set = api.setLanguage('it');
        expect(set).toBe(true);
        expect(state._currentLanguageCode).toBe('it');
    })

    it('Should set cookie data', () => {
        api.setCookieData({
            value: {id: 21}
        });
        expect(api.getCookie('data').id).toBe(21)
    })

    it('Should add new prop to cookie data', () => {
        api.setCookieData({
            value: {new_prop: 'new_value'},
            mode: 'update'
        });
        const cookieData = api.getCookie('data');
        expect(cookieData).toHaveProperty('id');
        expect(cookieData).toHaveProperty('new_prop');
    })

})

function htmlHasClass(className){
    return document.documentElement.className.includes(className);
}

function resetConsentModal(){
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