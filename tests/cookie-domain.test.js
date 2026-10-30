/**
 * @jest-environment-options {"url": "http://www.example.com/"}
 */
import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Cookie domain", () => {

    let cookieWrites;

    beforeAll(() => {
        api = CookieConsent;

        const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');

        jest.spyOn(document, 'cookie', 'set').mockImplementation((value) => {
            cookieWrites.push(value);
            descriptor.set.call(document, value);
        });
    })

    beforeEach(() => {
        cookieWrites = [];
    })

    afterEach(() => {
        api.reset(true);
    })

    const pluginCookieWrite = () => cookieWrites.find(cookie => cookie.startsWith('cc_cookie='));

    it('Should set the domain by default', async () => {
        await api.run({...testConfig, cookie: {}});
        api.acceptCategory('all');
        expect(pluginCookieWrite()).toContain('; Domain=www.example.com');
    })

    it.each(['', null, undefined])('Should leave out the domain when it is %p', async (domain) => {
        await api.run({...testConfig, cookie: {domain}});
        api.acceptCategory('all');
        expect(pluginCookieWrite()).not.toContain('Domain=');
        expect(api.validCookie('cc_cookie')).toBe(true);
    })

    it('Should erase the cookie when the domain is left out', async () => {
        await api.run({...testConfig, cookie: {domain: null}});
        api.acceptCategory('all');
        expect(api.validCookie('cc_cookie')).toBe(true);
        expect(() => api.reset(true)).not.toThrow();
        expect(api.validCookie('cc_cookie')).toBe(false);
    })
})
