/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "http://example.com"}
 */

import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { setCookie } from "./config/mocks-utils";

import {
    eraseCookiesHelper,
    getAllCookies,
    getSingleCookie,
    parseCookie,
    setCookie as setPluginCookie
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
        expect(ccCookie.languageCode).toEqual('en');
        expect(ccCookie.categories).toEqual(['necessary', 'analytics', 'ads']);
        expect(ccCookie.services).toMatchObject({
            necessary: ['service1'],
            analytics: ['service1', 'service2'],
            ads: []
        });
    });

    it('Should erase cookies', () => {
        const name1 = 'test_cookie1';
        const name2 = 'test_cookie2';
        setCookie(name1, '{"ciao": 11}');
        setCookie(name2, '{"aloha": 22}');
        expect(getSingleCookie(name1)).toBeTruthy();
        expect(getSingleCookie(name2)).toBeTruthy();
        eraseCookiesHelper([name1, name2]);
        expect(getSingleCookie(name1)).toBeFalsy();
        expect(getSingleCookie(name2)).toBeFalsy();
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

/**
 * Intercepts raw strings written to document.cookie.
 * @returns {{ written: string[], restore: () => void }}
 */
const spyOnCookieSetter = () => {
    const written = [];
    const proto = Object.getPrototypeOf(document); // Document.prototype
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'cookie');
    Object.defineProperty(proto, 'cookie', {
        set(val) { written.push(val); descriptor.set.call(this, val); },
        get() { return descriptor.get.call(this); },
        configurable: true
    });
    return {
        written,
        restore() { Object.defineProperty(proto, 'cookie', descriptor); }
    };
};

describe("Cookie domain attribute", () => {
    afterEach(() => {
        CookieConsent.reset(true);
    });

    it('Should include "; Domain=" when domain is set to a non-empty string', async () => {
        await CookieConsent.run({
            ...testConfig,
            cookie: { ...testConfig.cookie, domain: 'example.com' }
        });

        const spy = spyOnCookieSetter();
        try {
            setPluginCookie();
            expect(spy.written.some(s => s.includes('; Domain=example.com'))).toBe(true);
        } finally {
            spy.restore();
        }
    });

    it('Should omit "; Domain=" when domain is empty string', async () => {
        await CookieConsent.run({
            ...testConfig,
            cookie: { ...testConfig.cookie, domain: '' }
        });

        const spy = spyOnCookieSetter();
        try {
            setPluginCookie();
            expect(spy.written.some(s => s.includes('; Domain='))).toBe(false);
        } finally {
            spy.restore();
        }
    });

    it('Should omit "; Domain=" when domain is null', async () => {
        await CookieConsent.run({
            ...testConfig,
            cookie: { ...testConfig.cookie, domain: null }
        });

        const spy = spyOnCookieSetter();
        try {
            setPluginCookie();
            expect(spy.written.some(s => s.includes('; Domain='))).toBe(false);
        } finally {
            spy.restore();
        }
    });

    it('Should not throw when erasing cookies and domain is empty string', async () => {
        await CookieConsent.run({
            ...testConfig,
            cookie: { ...testConfig.cookie, domain: '' }
        });
        setCookie('erase_test', 'val');
        expect(() => eraseCookiesHelper(['erase_test'])).not.toThrow();
        expect(getSingleCookie('erase_test')).toBeFalsy();
    });

    it('Should not throw when erasing cookies and domain is null', async () => {
        await CookieConsent.run({
            ...testConfig,
            cookie: { ...testConfig.cookie, domain: null }
        });
        setCookie('erase_test_null', 'val');
        expect(() => eraseCookiesHelper(['erase_test_null'])).not.toThrow();
        expect(getSingleCookie('erase_test_null')).toBeFalsy();
    });
})
