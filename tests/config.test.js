import { globalObj } from "../src/core/global";
import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { htmlHasClass, setUserAgent, botUserAgent } from "./config/mocks-utils";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Check modals' html generation under different settings", () => {

    beforeAll(() => {
        api = CookieConsent;
        testConfig.autoShow = true;
    })

    beforeEach(() => {
        api.reset(true);
    })

    it('Consent Modal should not appear if consent is valid', async () => {
        await api.run(testConfig);
        api.acceptCategory();
        api.reset();
        await api.run(testConfig);
        expect(api.validConsent()).toBe(true);
        expect(htmlHasClass('show--consent')).toBe(false)
    })

    it('Revision change should cause invalid consent', async () => {
        testConfig.revision = 2;
        await api.run(testConfig);
        expect(api.validConsent()).toBe(false);
    })

    it('Consent modal should not appear if autoShow=false', async () => {
        api.eraseCookies('cc_cookie');
        testConfig.autoShow = false;
        await api.run(testConfig);
        expect(api.validConsent()).toBe(false);
        expect(htmlHasClass('show--consent')).toBe(false);
    })

    it('Plugin should stop if bot is detected', async () => {
        setUserAgent(botUserAgent);
        testConfig.hideFromBots = true;
        await api.run(testConfig);
        expect(globalObj._state._botAgentDetected).toBe(true);
        expect(document.querySelector('#cc-main')).toBeNull();
    })

    it('Plugin should not detect bot if hideFromBots=false', async () => {
        setUserAgent(botUserAgent);
        testConfig.hideFromBots = false;
        await api.run(testConfig);
        expect(globalObj._state._botAgentDetected).toBe(false);
        expect(document.querySelector('#cc-main')).toBeInstanceOf(HTMLElement);
    })

    it('Should not manage scripts when manageScriptTags=false', async () => {
        document.body.innerHTML = '<script type="text/plain" data-category="analytics" data-service="my_service"></script>';
        testConfig.manageScriptTags = false;
        await api.run(testConfig);
        api.acceptCategory('all');
        expect(globalObj._state._allScriptTags.length).toBe(0);
        expect(document.body.querySelectorAll('script[data-category]').length).toBe(1);
    })

    it('Should append the html markup inside the "#app" root element', async () => {
        document.body.innerHTML = '<div id="app"></div>';
        testConfig.root = '#app';
        await api.run(testConfig);
        const app = document.getElementById('app');
        const ccMain = document.getElementById('cc-main');
        expect(ccMain.parentElement).toBe(app);
    })

    it('Should automatically enable & execute scripts when mode="opt-out"', async () => {
        testConfig.mode = 'opt-out';
        api.eraseCookies('cc_cookie');
        await api.run(testConfig);
        expect(window.__service1Enabled).toBe(true);
    })

    it('equalWeightButtons option should be enabled by default', async () => {
        delete testConfig.guiOptions;
        await api.run(testConfig);
        const necessaryBtnClasses = [...document.querySelector('.cm__btn[data-role="necessary"]').classList];
        expect(necessaryBtnClasses).not.toContain('cm__btn--secondary');
    })
})