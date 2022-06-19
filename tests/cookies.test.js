import CookieConsent from "../src/index"
import testConfig from "./config/full-config";

import {
    _eraseCookies,
    _getAllCookies,
    _getSingleCookie,
    _parseCookie,
    _setCookie
}from '../src/utils/cookies';
import { defineCryptoRandom } from "./config/mocs-utils";

let api;

describe("Cookie should be created successfully", () =>{
    beforeAll(async ()=>{
        defineCryptoRandom();
        api = CookieConsent.init();
        await api.run(testConfig);
        api.accept('all');
    })

    it('Should retrieve the cookie with all the fields', () => {
        /**
         * @type {import("../src/core/global").CookieStructure}
         */
        const ccCookie = _parseCookie(_getSingleCookie('cc_cookie', true));

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

    it('Should erase "cc_cookie"', () => {
        _setCookie('test_cookie', '{"ciao": 21}');
        _eraseCookies(['test_cookie'], '/', [location.host]);
        const ccCookie = _getSingleCookie('test_cookie');
        expect(ccCookie).toBeFalsy();
    });

    it('Should set the cookie', () => {
        _setCookie('test_cookie', '{"ciao": 21}');
        const cookieValue = _parseCookie(_getSingleCookie('test_cookie', true));
        expect(cookieValue.ciao).toBe(21);
    })

    it('Should return all cookies', () => {
        _setCookie('test_cookie_2', '{"ciao": 22}');
        const allCookies = _getAllCookies();
        expect(allCookies.length).toBe(3);
    })

    it('Should return only the cookies that match the regex', () => {
        const allCookies = _getAllCookies(/^test_/);
        expect(allCookies.length).toBe(2);
    })
})