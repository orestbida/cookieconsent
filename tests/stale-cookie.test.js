import * as CookieConsent from "../src/index"
import { setCookie } from "./config/mocks-utils";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

/**
 * Cookie saved by a previous version of the config,
 * with a category and a service that no longer exist
 */
const staleCookie = {
    categories: ['necessary', 'analytics', 'ads', 'oldCategory'],
    revision: 0,
    data: null,
    consentTimestamp: '2024-01-01T00:00:00.000Z',
    consentId: 'c1a6b7b5-1f66-4f7b-9d3d-7c5a9d7a1b2c',
    services: {
        necessary: ['service1'],
        analytics: ['service1', 'oldService'],
        ads: [],
        oldCategory: ['oldService']
    },
    lastConsentTimestamp: '2024-01-01T00:00:00.000Z'
};

describe('Cookie with categories and services removed from the config', () => {
    let testConfig;

    beforeAll(() => {
        api = CookieConsent;
    });

    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const mod = await import('./config/full-config');
            testConfig = mod.default;
        });
        setCookie('cc_cookie', encodeURIComponent(JSON.stringify(staleCookie)));
        await api.run(testConfig);
    });

    afterEach(() => {
        api.reset(true);
    });

    it('Should not throw when autoclearing after a removed service', () => {
        expect(api.validConsent()).toBe(true);
        expect(() => api.acceptCategory('all')).not.toThrow();
        expect(api.acceptedService('service1', 'analytics')).toBe(true);
    });

    it('Should ignore the removed category', () => {
        expect(api.acceptedCategory('oldCategory')).toBe(false);
        expect(api.getUserPreferences().acceptType).toBe('all');
        expect(api.getUserPreferences().acceptedCategories).toEqual(['necessary', 'analytics', 'ads']);
    });

    it('Should ignore the removed service', () => {
        const { acceptedServices, rejectedServices } = api.getUserPreferences();
        expect(acceptedServices.analytics).toEqual(['service1']);
        expect(rejectedServices.analytics).toEqual(['service2']);
        expect(acceptedServices.oldCategory).toBeUndefined();
    });

    it('Should not save the removed category and service again', () => {
        api.acceptCategory('all');
        const cookie = api.getCookie();
        expect(cookie.categories).toEqual(['necessary', 'analytics', 'ads']);
        expect(cookie.services.analytics).toEqual(['service1', 'service2']);
        expect(cookie.services.oldCategory).toBeUndefined();
    });

    it('Should accept a service added to a readOnly category after the consent', async () => {
        api.reset();
        const onAccept = jest.fn();
        testConfig.categories.necessary.services.service2 = { onAccept };
        await api.run(testConfig);

        expect(api.validConsent()).toBe(true);
        expect(api.acceptedService('service2', 'necessary')).toBe(true);
        expect(api.getUserPreferences().rejectedServices.necessary).toEqual([]);
        expect(onAccept).toHaveBeenCalledTimes(1);
    });

    it('Should run the scripts of a readOnly category missing from the cookie', async () => {
        api.reset();
        const cookie = { ...staleCookie, categories: ['analytics', 'ads'] };
        setCookie('cc_cookie', encodeURIComponent(JSON.stringify(cookie)));
        document.body.innerHTML = '<script type="text/plain" data-category="necessary">window.__necessaryScript = true</script>';
        window.__necessaryScript = false;
        await api.run(testConfig);

        expect(api.validConsent()).toBe(true);
        expect(api.acceptedCategory('necessary')).toBe(true);
        expect(window.__necessaryScript).toBe(true);
    });
});
