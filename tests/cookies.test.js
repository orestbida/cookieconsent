import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { setCookie } from "./config/mocks-utils";

import {
    eraseCookiesHelper,
    getAllCookies,
    getSingleCookie,
    parseCookie
}from '../src/utils/cookies';

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Cookie should be created successfully", () => {
    beforeAll(async () => {
        api = CookieConsent;
        await api.run(testConfig);
        api.acceptCategory('all');
    })

    it('Should retrieve the cookie with all the fields', () => {
        /**
         * @type {import("../src/core/global").CookieValue}
         */
        const ccCookie = parseCookie(getSingleCookie('cc_cookie', true));

        expect(ccCookie).toBeDefined();
        expect(ccCookie.data).toBeDefined();
        expect(typeof ccCookie.consentId).toBe('string');
        expect(ccCookie.consentTimestamp).toBeDefined();
        expect(ccCookie.lastConsentTimestamp).toBeDefined();
        expect(ccCookie.categories).toEqual(['necessary', 'analytics', 'ads']);
        expect(ccCookie.services).toMatchObject({
            necessary: ['service1'],
            analytics: ['service1', 'service2'],
            ads: []
        });
    });

    it('Should erase cookie', () => {
        setCookie('test_cookie', '{"ciao": 21}');
        eraseCookiesHelper(['test_cookie'], '/', [location.host]);
        const ccCookie = getSingleCookie('test_cookie');
        expect(ccCookie).toBeFalsy();
    });

    it('Should set the cookie', () => {
        setCookie('test_cookie', '{"ciao": 21}');
        const cookieValue = parseCookie(getSingleCookie('test_cookie', true));
        expect(cookieValue.ciao).toBe(21);
        eraseCookiesHelper(['test_cookie']);
    })

    it('Should return all cookies', () => {
        const allCookies = getAllCookies();
        expect(allCookies.length).toBe(4);  // 3 service cookies + cc_cookie
    })

    it('Should return only the cookies that match the regex', () => {
        const allCookies = getAllCookies(/^service1Cookie/);
        expect(allCookies.length).toBe(2);
        expect(allCookies).toContain('service1Cookie1', 'service1Cookie2');
    })
})