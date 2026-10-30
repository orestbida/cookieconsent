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
});
