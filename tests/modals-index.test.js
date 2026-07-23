import * as CookieConsent from "../src/index"
import { globalObj } from "../src/core/global";
import testConfig from "./config/full-config";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Modal generation orchestration (modals/index.js)", () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should not create the preferences modal eagerly when lazyHtmlGeneration=true (default)', async () => {
        testConfig.lazyHtmlGeneration = true;
        await api.run(testConfig);

        expect(globalObj._state._preferencesModalExists).toBe(false);
        expect(document.querySelector('.pm')).toBeNull();

        testConfig.lazyHtmlGeneration = false;
    })

    it('Should create the preferences modal eagerly when lazyHtmlGeneration=false', async () => {
        testConfig.lazyHtmlGeneration = false;
        await api.run(testConfig);

        expect(globalObj._state._preferencesModalExists).toBe(true);
        expect(document.querySelector('.pm')).not.toBeNull();

        testConfig.lazyHtmlGeneration = true;
    })

    it('Should not create the consent modal when consent is already valid', async () => {
        await api.run(testConfig);
        api.acceptCategory('all');
        api.reset();
        await api.run(testConfig);

        expect(globalObj._state._consentModalExists).toBe(false);
        expect(document.querySelector('.cm')).toBeNull();
    })

    it('Should not create #cc-main more than once', async () => {
        await api.run(testConfig);
        const firstMain = document.getElementById('cc-main');

        // triggering another html-generating action shouldn't duplicate #cc-main
        api.show(true);

        expect(document.querySelectorAll('#cc-main').length).toBe(1);
        expect(document.getElementById('cc-main')).toBe(firstMain);
    })
})
