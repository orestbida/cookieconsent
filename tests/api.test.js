import * as CookieConsent from "../src/index"
import { globalObj } from "../src/core/global";
import { htmlHasClass } from "./config/mocks-utils";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

const consentModalClassToggle = 'show--consent';
const preferencesModalClassToggle = 'show--preferences'

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve(require('./config/it.json')),
    })
);

describe("API tests", () => {
    let testConfig;

    beforeAll(async () => {

        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics">console.log("enabled analytics")</script>
            <script type="text/plain" data-category="!analytics">console.log("disabled analytics")</script>
            <script type="text/plain" data-category="analytics" data-service="my-service">console.log("enabled my-service")</script>
            <script type="text/plain" data-category="analytics" data-service="!my-service">console.log("disabled my-service")</script>
        `;

        api = CookieConsent;
    })

    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const mod = await import('./config/full-config');
            testConfig = mod.default;
        })
        await api.run(testConfig);
    });

    afterEach( async () => {
        api.reset(true);
        fetch.mockClear();
    })

    it('User preferences object should contain all the props.', () => {
        const userPreferences = api.getUserPreferences();
        expect(userPreferences).toMatchObject({
            acceptType: '',
            acceptedCategories: [],
            rejectedCategories: [],
            acceptedServices: {},
            rejectedServices: {}
        })
    })

    it('Consent modal should be hidden when autoShow=false', async () => {
        api.reset(true);
        testConfig.autoShow = false;
        await api.run(testConfig)
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

    it('Should return valid consent', () => {
        api.acceptCategory();
        expect(api.validConsent()).toBe(true);
    })

    it('Should accept only the necessary categories', () => {
        api.acceptCategory([]);
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(false)
    })

    it('Should accept all categories', () => {
        api.acceptCategory('all');
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(true)
    })

    it('Should accept the current selection inside the preferences modal', () => {
        const analyticsToggle = document.querySelector('.section__toggle[value="analytics"]');
        analyticsToggle.checked = false;
        api.acceptCategory();
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(false)
    })

    it('Should accept a specific category', () => {
        api.acceptCategory('analytics');
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(true)
    })

    it('Should accept all categories except one', () => {
        api.acceptCategory('all', ['analytics']);
        expect(api.acceptedCategory('necessary')).toBe(true)
        expect(api.acceptedCategory('analytics')).toBe(false)
    })

    it("Should return the plugin's cookie", () => {
        api.acceptCategory();
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
        expect(userPreferences).toHaveProperty('acceptedCategories');
        expect(userPreferences).toHaveProperty('rejectedCategories');
        expect(userPreferences).toHaveProperty('acceptType');
        expect(userPreferences).toHaveProperty('acceptedServices');
        expect(userPreferences).toHaveProperty('rejectedServices');
    })

    it('Should return true when cookie exists', () => {
        api.acceptCategory();
        expect(api.validCookie('cc_cookie')).toBe(true);
    })

    it('Should return false when cookie has an empty value', () => {
        document.cookie = 'empty_cookie=; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        expect(api.validCookie('empty_cookie')).toBe(false);
    })

    it('Should return false when cookie does not exist', () => {
        expect(api.validCookie('non_existing_cookie')).toBe(false);
    })

    it('Should erase cookie by string', () => {
        document.cookie = 'test_cookie=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        expect(api.validCookie('test_cookie')).toBe(true);
        api.eraseCookies('test_cookie');
        expect(api.validCookie('test_cookie')).toBe(false);
    })

    it('Should erase cookie by regex', () => {
        document.cookie = 'test_cookie1=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        document.cookie = 'test_cookie2=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        expect(api.validCookie('test_cookie1')).toBe(true);
        expect(api.validCookie('test_cookie2')).toBe(true);
        api.eraseCookies(/^test_cookie/);
        expect(api.validCookie('test_cookie1')).toBe(false);
        expect(api.validCookie('test_cookie2')).toBe(false);
    })

    it('Should erase array of cookies by regex and string', () => {
        document.cookie = 'test_cookie1=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        document.cookie = 'test_cookie2=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        document.cookie = 'new_cookie=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/';
        expect(api.validCookie('test_cookie1')).toBe(true);
        expect(api.validCookie('test_cookie2')).toBe(true);
        expect(api.validCookie('new_cookie')).toBe(true);
        api.eraseCookies([/^test_cookie/, 'new_cookie']);
        expect(api.validCookie('test_cookie1')).toBe(false);
        expect(api.validCookie('test_cookie2')).toBe(false);
        expect(api.validCookie('new_cookie')).toBe(false);
    })

    it('Should erase cookie with specific path and domain', () => {
        document.cookie = 'test_cookie5=21; expires=Sun, 1 Jan 2063 00:00:00 UTC; path=/; domain='+location.host;
        expect(api.validCookie('test_cookie5')).toBe(true);
        api.eraseCookies('test_cookie5', '/', location.host);
        expect(api.validCookie('test_cookie5')).toBe(false);
    });

    it('Should not erase cookie with wrong path', () => {
        document.cookie = 'test_cookie6=28; expires=Mon, 1 Jan 2064 00:00:00 UTC; path=/; domain='+location.host;
        expect(api.validCookie('test_cookie6')).toBe(true);
        api.eraseCookies('test_cookie6', '/other', location.host);
        expect(api.validCookie('test_cookie6')).toBe(true);
    });

    it('Should not erase cookie with wrong domain', () => {
        document.cookie = 'test_cookie7=35; expires=Wed, 1 Jan 2065 00:00:00 UTC; path=/; domain='+location.host;
        expect(api.validCookie('test_cookie7')).toBe(true);
        api.eraseCookies('test_cookie7', '/', 'wrong.domain');
        expect(api.validCookie('test_cookie7')).toBe(true);
    });

    it('Should show the consent modal', async () => {
        api.reset(true);
        testConfig.autoShow = false;
        await api.run(testConfig)
        api.show();
        expect(htmlHasClass(consentModalClassToggle)).toBe(true);
        expect(globalObj._dom._cm.getAttribute('aria-hidden')).toBeNull();
    })

    it('Should hide the consent modal', async () => {
        api.reset(true);
        testConfig.autoShow = true;
        await api.run(testConfig)
        api.hide();
        expect(htmlHasClass(consentModalClassToggle)).toBe(false);
        expect(globalObj._dom._cm.getAttribute('aria-hidden')).toBe('true');
    })

    it('Should create the consent modal if it does not exist', async () => {

        /**
         * Remove consent modal (simulate page reload)
         */
        api.acceptCategory();

        api.reset();
        await api.run(testConfig);

        let modal = document.querySelector('#cc-main .cm')
        expect(modal).toBeNull();

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
        const numAcceptedServices = api.getUserPreferences().acceptedServices['analytics'].length;
        const numDefinedServices = Object.keys(api.getConfig('categories')['analytics'].services).length;
        expect(numAcceptedServices).toBe(numDefinedServices+1);
    })

    it('Should reject all services', () => {
        api.setAcceptedServices([], 'analytics');
        const numAcceptedServices = api.getUserPreferences().acceptedServices['analytics'].length;
        expect(numAcceptedServices).toBe(0);
    })

    it('Should accept a specific service', () => {
        api.acceptService('service1', 'analytics');
        const numAcceptedServices = api.getUserPreferences().acceptedServices['analytics'].length;
        expect(numAcceptedServices).toBe(1);
    })

    it('Setting a non existing service should reject all services', async () => {
        api.setAcceptedServices('does_not_exist', 'analytics');
        const numAcceptedServices = api.getUserPreferences().acceptedServices['analytics'].length;
        expect(numAcceptedServices).toBe(0);
    });

    it('acceptService should set the cookie', async () => {
        api.acceptService('all', 'analytics');
        expect(api.getCookie('consentId')).toBeTruthy();
    })

    it('Should return true when service is enabled', async () => {
        api.acceptService('service1', 'analytics');
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
    })

    it('Accepting a service in a non existing category should not do anything', async () => {
        expect(api.acceptService('service1', 'category_does_not_exist')).toBe(false);
    })

    it('Should return false when service is disabled', async () => {
        expect(api.acceptedService('service2', 'analytics')).toBe(false);
    })

    it('Should set the language to "it"', async () => {
        expect(globalObj._state._currentLanguageCode).toBe('en');
        const set = await api.setLanguage('it');
        expect(set).toBe(true);
        expect(globalObj._state._currentLanguageCode).toBe('it');
    })

    it('Should return false when desired language is not defined', async () => {
        const result = await api.setLanguage('fr');
        expect(result).toBe(false);
        expect(globalObj._state._currentLanguageCode).not.toBe('fr');
    })

    it('Should throw error when fetch fails', async () => {
        fetch.mockImplementationOnce(() => Promise.reject("json file not found"));
        api.getConfig('language').translations.it = './it.json';
        await api.setLanguage('en');

        try {
            await api.setLanguage('it');
        } catch (ex) {
            expect(ex).toBe(`Could not load translation for the 'it' language`);
        }

        expect(globalObj._state._currentLanguageCode).not.toBe('it');
    })

    it('Should fail when trying to set a language already in use', async () => {
        await api.setLanguage('en');
        const set = await api.setLanguage('en');
        expect(set).toBe(false);
    })

    it('Should set cookie data', () => {
        api.setCookieData({
            value: {id: 21}
        });
        expect(api.getCookie('data').id).toBe(21)
    })

    it('Should add new prop. to cookie data', () => {
        api.setCookieData({
            value: {id: 21}
        });
        api.setCookieData({
            value: {new_prop: 'new_value'},
            mode: 'update'
        });
        const cookieData = api.getCookie('data');
        expect(cookieData).toHaveProperty('id');
        expect(cookieData).toHaveProperty('new_prop');
    })

    it('Should erase cookies when category is rejected', () => {
        api.acceptCategory('analytics');
        expect(api.validCookie('service1Cookie1')).toBe(true);
        expect(api.validCookie('service1Cookie2')).toBe(true);
        expect(api.validCookie('service2Cookie')).toBe(true);
        api.acceptCategory([]);
        expect(api.validCookie('service1Cookie1')).toBe(false);
        expect(api.validCookie('service1Cookie2')).toBe(false);
        expect(api.validCookie('service2Cookie')).toBe(false);
    })

    it('Should erase specific service cookie when service is rejected', () => {
        api.acceptService('service1', 'analytics');
        expect(api.validCookie('service1Cookie1')).toBe(true);
        expect(api.validCookie('service1Cookie2')).toBe(true);
        api.setAcceptedServices([], 'analytics');
        expect(api.validCookie('service1Cookie1')).toBe(false);
        expect(api.validCookie('service1Cookie2')).toBe(false);
    })

    it('acceptService should not affect the state of the category\'s other services', () => {
        api.acceptService(['service1', 'service2'], 'analytics');
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
        expect(api.acceptedService('service2', 'analytics')).toBe(true);

        api.acceptService('service1', 'analytics');
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
        expect(api.acceptedService('service2', 'analytics')).toBe(true);
    })

    it('setAcceptedServices should reject any service not included', () => {
        api.setAcceptedServices(['service1', 'service2'], 'analytics');
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
        expect(api.acceptedService('service2', 'analytics')).toBe(true);

        api.setAcceptedServices('service1', 'analytics');
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
        expect(api.acceptedService('service2', 'analytics')).toBe(false);
    })

    it('Should mark service as accepted regardless of callback/script', async () => {
        api.reset(true);
        testConfig.categories.analytics.services.service2.label = 'service2';
        testConfig.categories.analytics.services.service2.onReject = undefined;
        testConfig.categories.analytics.services.service2.onReject = undefined;
        await api.run(testConfig);

        api.acceptService('service2', 'analytics');
        expect(api.acceptedService('service2', 'analytics')).toBe(true);
    })

    it('Should mark service as rejected regardless of callback/script', async () => {
        api.reset(true);
        testConfig.categories.analytics.services.service2.label = 'service2';
        testConfig.categories.analytics.services.service2.onReject = undefined;
        testConfig.categories.analytics.services.service2.onReject = undefined;
        await api.run(testConfig);

        api.acceptService('service2', 'analytics');
        expect(api.acceptedService('service2', 'analytics')).toBe(true);
        api.setAcceptedServices([], 'analytics');
        expect(api.acceptedService('service2', 'analytics')).toBe(false);
    })

    it('Should call service onAccept once', async () => {
        api.reset(true);
        const onAccept = jest.fn();
        testConfig.categories.analytics.services.service2.onAccept = onAccept;
        await api.run(testConfig);

        api.acceptService('service2', 'analytics');
        api.acceptService('service2', 'analytics');
        api.acceptCategory('analytics');
        expect(onAccept).toHaveBeenCalledTimes(1);
    })

    it('Should call service onReject once, if previously accepted', async () => {
        api.reset(true);
        const onReject = jest.fn();
        testConfig.categories.analytics.services.service2.onAccept = undefined;
        testConfig.categories.analytics.services.service2.onReject = onReject;
        await api.run(testConfig);

        api.setAcceptedServices([], 'analytics');
        expect(onReject).toHaveBeenCalledTimes(0)

        api.acceptCategory('all');
        api.setAcceptedServices([], 'analytics');
        api.acceptCategory([]);
        expect(onReject).toHaveBeenCalledTimes(1)
    })

    it('Should do nothing when the consent modal is already visible', async () => {
        api.reset(true);
        testConfig.autoShow = false;
        await api.run(testConfig);
        api.show();
        expect(htmlHasClass(consentModalClassToggle)).toBe(true);

        // second call while already visible must be a no-op (early return)
        api.show();
        expect(htmlHasClass(consentModalClassToggle)).toBe(true);
    })

    it('Should not create/show the consent modal when it does not exist and createModal is not set', async () => {
        api.acceptCategory();
        api.reset();
        await api.run(testConfig);

        expect(document.querySelector('#cc-main .cm')).toBeNull();

        api.show();
        expect(document.querySelector('#cc-main .cm')).toBeNull();
        expect(htmlHasClass(consentModalClassToggle)).toBe(false);
    })

    it('Should do nothing when the preferences modal is already visible', () => {
        api.showPreferences();
        expect(htmlHasClass(preferencesModalClassToggle)).toBe(true);

        api.showPreferences();
        expect(htmlHasClass(preferencesModalClassToggle)).toBe(true);
    })

    it('Should reject acceptService/setAcceptedServices calls for a category with no services', () => {
        expect(api.acceptService('all', 'ads')).toBe(false);
        expect(api.setAcceptedServices('all', 'ads')).toBe(false);
    })

    it('Should reject acceptService/setAcceptedServices calls for a non-existing category', () => {
        expect(api.acceptService('all', 'does-not-exist')).toBe(false);
        expect(api.setAcceptedServices('all', 'does-not-exist')).toBe(false);
    })

    it('Should set cookie data in "update" mode when there is no existing data yet', () => {
        const result = api.setCookieData({ value: 'hello', mode: 'update' });
        expect(result).toBe(true);
        expect(api.getCookie('data')).toBe('hello');
    })

    it('Should replace (not merge) cookie data in "update" mode when both values are non-object primitives', () => {
        api.setCookieData({ value: 'old value' });
        expect(api.getCookie('data')).toBe('old value');

        const result = api.setCookieData({ value: 'new value', mode: 'update' });
        expect(result).toBe(true);
        expect(api.getCookie('data')).toBe('new value');
    })

    describe('loadScript', () => {
        const src = 'https://example.com/loadscript-test.js';

        afterEach(() => {
            document.querySelector(`script[src="${src}"]`)?.remove();
        })

        it('Should resolve true immediately if a script with the same src already exists', async () => {
            const existing = document.createElement('script');
            existing.src = src;
            document.head.appendChild(existing);

            await expect(api.loadScript(src)).resolves.toBe(true);
        })

        it('Should append the script, apply custom attributes, and resolve true on load', async () => {
            const promise = api.loadScript(src, { id: 'my-script', 'data-test': 'x' });

            const script = document.querySelector(`script[src="${src}"]`);
            expect(script).not.toBeNull();
            expect(script.id).toBe('my-script');
            expect(script.getAttribute('data-test')).toBe('x');

            script.onload();
            await expect(promise).resolves.toBe(true);
        })

        it('Should remove the script and resolve false on error', async () => {
            const promise = api.loadScript(src);
            const script = document.querySelector(`script[src="${src}"]`);

            script.onerror();
            await expect(promise).resolves.toBe(false);
            expect(document.querySelector(`script[src="${src}"]`)).toBeNull();
        })
    })
})