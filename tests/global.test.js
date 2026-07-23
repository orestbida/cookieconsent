import { GlobalState, globalObj } from "../src/core/global";
import * as CookieConsent from "../src/index";
import testConfig from "./config/basic-config";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("GlobalState", () => {

    it('Should have the expected default state shape', () => {
        const state = new GlobalState();

        expect(state._config.mode).toBe('opt-in');
        expect(state._state._invalidConsent).toBe(true);
        expect(state._state._allScriptTags).toEqual([]);
        expect(state._dom._categoryCheckboxInputs).toEqual({});
        expect(state._customEvents._onConsent).toBe('cc:onConsent');
    })

    it('Should not share nested array/object references between instances', () => {
        const first = new GlobalState();
        const second = new GlobalState();

        first._state._allScriptTags.push({ _categoryName: 'analytics' });
        first._dom._categoryCheckboxInputs.analytics = {};
        first._state._acceptedServices.analytics = ['service1'];

        expect(second._state._allScriptTags).toEqual([]);
        expect(second._dom._categoryCheckboxInputs).toEqual({});
        expect(second._state._acceptedServices).toEqual({});
    })
})

describe("GlobalState reset via api.reset()", () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    it('Should not leak script tags/state from a previous run() into the next one', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics"></script>
        `;
        await api.run(testConfig);
        expect(globalObj._state._allScriptTags.length).toBe(1);

        api.reset(true);
        document.body.innerHTML = '';

        await api.run(testConfig);
        expect(globalObj._state._allScriptTags.length).toBe(0);

        api.reset(true);
    })

    it('Should not re-run while window._ccRun is already true', async () => {
        document.body.innerHTML = '';
        window._ccRun = true;

        await api.run(testConfig);
        expect(document.getElementById('cc-main')).toBeNull();

        window._ccRun = false;
    })

    it('reset() should set window._ccRun back to false', async () => {
        await api.run(testConfig);
        expect(window._ccRun).toBe(true);

        api.reset(true);
        expect(window._ccRun).toBe(false);
    })
})
