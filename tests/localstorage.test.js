import * as CookieConsent from "../src/index"
import { localStorageManager } from "../src/utils/localstorage"
import { parseCookie, getPluginCookie } from "../src/utils/cookies"
import { globalObj } from "../src/core/global";

describe("Cookie should be created successfully", () => {

    /**
     * @type {import("../src/core/global").Api}
     */
    let api;
    let testConfig;

    beforeAll(async () => {
        api = CookieConsent;
        await jest.isolateModulesAsync(async () => {
            const mod = await import('./config/full-config');
            testConfig = mod.default;
            testConfig.cookie.useLocalStorage = true;
        })
    })

    beforeEach(async () => {
        api.reset(true);
        await api.run(testConfig);
    });

    it('`cookie.useLocalStorage` option should be enabled', () => {
        expect(api.getConfig("cookie").useLocalStorage).toBe(true)
    });

    it('Should save the cookie in localstorage', () => {
        api.acceptCategory('all');

        const name = api.getConfig("cookie").name;
        const localStorageItem = parseCookie(localStorageManager._getItem(name));
        const cookieObj = getPluginCookie();

        expect(cookieObj).toEqual(localStorageItem);
        expect(cookieObj.categories.length).toBeGreaterThanOrEqual(1);
        expect(cookieObj).toHaveProperty('expirationTime');
    });

    it('Consent should be valid after accept/reject', () => {
        api.reset(true);
        expect(globalObj._state._invalidConsent).toBe(true);

        api.acceptCategory('all');
        expect(globalObj._state._invalidConsent).toBe(false);
    })

    it('Consent should be invalid after `reset`', () => {
        api.acceptCategory('all');
        expect(globalObj._state._invalidConsent).toBe(false);

        api.reset(true);
        expect(globalObj._state._invalidConsent).toBe(true);
    });

    it('Should erase the localstorage item on reset', () => {
        api.acceptCategory('all');
        expect(getPluginCookie()).toBeDefined();

        api.reset(true);
        expect(getPluginCookie()).toEqual({})
    });
})