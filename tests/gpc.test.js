import * as CookieConsent from "../src/index"
import { htmlHasClass, setGpcSignal } from "./config/mocks-utils";

const consentModalClassToggle = 'show--consent';

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve(require('./config/it.json')),
    })
);

describe("Global Privacy Control (GPC)", () => {
    let testConfig;

    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const mod = await import('./config/full-config');
            testConfig = mod.default;
        });
    });

    afterEach(() => {
        CookieConsent.reset(true);
        setGpcSignal(undefined);
        fetch.mockClear();
    });

    it('Should suppress the banner and disable non-essential categories on first visit', async () => {
        setGpcSignal(true);

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: true,
            respectGpc: true
        });

        expect(htmlHasClass(consentModalClassToggle)).toBe(false);
        expect(document.cookie).not.toMatch(/cc_cookie=/);

        const { acceptedCategories } = CookieConsent.getUserPreferences();
        expect(acceptedCategories).toContain('necessary');
        expect(acceptedCategories).not.toContain('analytics');

        const necessaryToggle = document.querySelector('.section__toggle[value="necessary"]');
        const analyticsToggle = document.querySelector('.section__toggle[value="analytics"]');
        expect(necessaryToggle.checked).toBe(true);
        expect(analyticsToggle.checked).toBe(false);
    });

    it('Should not affect anything when the GPC signal is absent', async () => {
        setGpcSignal(false);

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: true,
            respectGpc: true
        });

        expect(htmlHasClass(consentModalClassToggle)).toBe(true);

        const { acceptedCategories } = CookieConsent.getUserPreferences();
        expect(acceptedCategories).toContain('analytics');
    });

    it('Should not affect anything when respectGpc is disabled (default)', async () => {
        setGpcSignal(true);

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: true
        });

        expect(htmlHasClass(consentModalClassToggle)).toBe(true);

        const { acceptedCategories } = CookieConsent.getUserPreferences();
        expect(acceptedCategories).toContain('analytics');
    });

    it('Should not fire any consent callback because of the GPC signal alone', async () => {
        setGpcSignal(true);

        const onFirstConsent = jest.fn();
        const onConsent = jest.fn();
        const onChange = jest.fn();

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: true,
            respectGpc: true,
            onFirstConsent,
            onConsent,
            onChange
        });

        expect(onFirstConsent).not.toHaveBeenCalled();
        expect(onConsent).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('Should still allow the banner to be shown manually despite the GPC suppression', async () => {
        setGpcSignal(true);

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: true,
            respectGpc: true
        });

        expect(htmlHasClass(consentModalClassToggle)).toBe(false);

        CookieConsent.show(true);

        expect(htmlHasClass(consentModalClassToggle)).toBe(true);
    });

    it('Should ignore the GPC signal once an explicit consent decision was saved', async () => {
        setGpcSignal(false);

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: false,
            respectGpc: true
        });

        CookieConsent.acceptCategory(['necessary', 'analytics']);
        expect(document.cookie).toMatch(/cc_cookie=/);

        /**
         * Reset internal state only (keep the real cookie),
         * to simulate a fresh page load with an existing decision
         */
        CookieConsent.reset();
        setGpcSignal(true);

        await CookieConsent.run({
            ...testConfig,
            mode: 'opt-out',
            autoShow: true,
            respectGpc: true
        });

        expect(CookieConsent.validConsent()).toBe(true);
        expect(CookieConsent.acceptedCategory('analytics')).toBe(true);
        expect(htmlHasClass(consentModalClassToggle)).toBe(false);
    });
});
