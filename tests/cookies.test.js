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


describe("Cookie should be created successfully", () =>{
    beforeAll(()=>{
        defineCryptoRandom(global);
        const cc = CookieConsent.init();
        cc.run(testConfig);
        cc.accept('all');
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

    it('Should erase cc_cookie', () => {
        _eraseCookies(['cc_cookie'], '/', [location.host]);
        const ccCookie = _getSingleCookie('cc_cookie');
        expect(ccCookie).toBeFalsy();
    });

    it('Should set the cookie', () => {
        _setCookie('test_cookie', '{"ciao": 21}');
        const cookieValue = _parseCookie(_getSingleCookie('test_cookie', true));
        expect(cookieValue.ciao).toBe(21);
    })
})