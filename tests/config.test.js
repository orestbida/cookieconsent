import { state } from "../src/core/global";
import CookieConsent from "../src/index"
import config from "./config/full-config";
import testConfig from "./config/full-config";
import { defineCryptoRandom, resetCookieConsent, htmlHasClass, setUserAgent } from "./config/mocs-utils";

let api;
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36';
const botUserAgent = 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)';

describe("CookieConsent Clean state", () =>{

    beforeAll(()=>{
        defineCryptoRandom(global);
        api = CookieConsent.init();
        testConfig.autoShow = true;
    })

    it('Consent Modal should not appear if consent is valid', () => {
        api.run(testConfig);
        api.accept();
        resetCookieConsent();
        api.run(testConfig);
        expect(api.validConsent()).toBe(true);
        expect(htmlHasClass('show--consent')).toBe(false)
    })

    it('Revision change should cause invalid consent', () => {
        resetCookieConsent();
        testConfig.revision = 2;
        api.run(testConfig);
        expect(api.validConsent()).toBe(false);
    })

    it('Consent modal should not appear if autoShow=false', () => {
        api.eraseCookies('cc_cookie');
        resetCookieConsent();
        testConfig.autoShow = false;
        api.run(testConfig);
        expect(api.validConsent()).toBe(false);
        expect(htmlHasClass('show--consent')).toBe(false);
    })

    it('Plugin should stop if bot is detected', () => {
        setUserAgent(botUserAgent, global);
        resetCookieConsent();
        testConfig.hideFromBots = true;
        api = CookieConsent.init();
        api.run(testConfig);
        expect(state._botAgentDetected).toBe(true);
        expect(document.querySelector('#cc-main')).toBeNull();
    })

    it('Plugin should not detect bot if hideFromBots=false', () => {
        setUserAgent(botUserAgent, global);
        resetCookieConsent();
        testConfig.hideFromBots = false;
        api = CookieConsent.init();
        api.run(testConfig);
        expect(state._botAgentDetected).toBe(false);
        expect(document.querySelector('#cc-main')).toBeInstanceOf(HTMLElement);
    })

})