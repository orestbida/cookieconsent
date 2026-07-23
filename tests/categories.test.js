import * as CookieConsent from "../src/index"
import { setCookie } from "./config/mocks-utils";

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve(require('./config/it.json')),
    })
);

/**
 * A `readOnly` category that is also explicitly disabled: it must stay
 * non-editable in the UI, but must NOT be treated as accepted.
 * https://github.com/orestbida/cookieconsent/issues (readOnly + enabled:false)
 */
const lockedOffCategory = {
    readOnly: true,
    enabled: false,
    autoClear: {
        cookies: [
            { name: /^ad_/ }
        ]
    }
};

describe("readOnly + enabled:false categories", () => {
    let testConfig;

    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const mod = await import('./config/full-config');
            testConfig = mod.default;
        });

        testConfig = {
            ...testConfig,
            categories: {
                ...testConfig.categories,
                advertisement: lockedOffCategory
            },
            language: {
                ...testConfig.language,
                translations: {
                    ...testConfig.language.translations,
                    en: {
                        ...testConfig.language.translations.en,
                        preferencesModal: {
                            ...testConfig.language.translations.en.preferencesModal,
                            sections: [
                                ...testConfig.language.translations.en.preferencesModal.sections,
                                { title: 'Advertisement', linkedCategory: 'advertisement' }
                            ]
                        }
                    }
                }
            }
        };
    });

    afterEach(() => {
        CookieConsent.reset(true);
        fetch.mockClear();
    });

    it('Should not be accepted after accepting all other categories', async () => {
        await CookieConsent.run({ ...testConfig, mode: 'opt-in', autoShow: false });

        CookieConsent.acceptCategory('all');

        expect(CookieConsent.acceptedCategory('advertisement')).toBe(false);
        expect(CookieConsent.getUserPreferences().acceptedCategories).not.toContain('advertisement');
    });

    it('Should not appear in the saved cookie\'s categories', async () => {
        await CookieConsent.run({ ...testConfig, mode: 'opt-in', autoShow: false });

        CookieConsent.acceptCategory('all');

        const cookieMatch = document.cookie.match(/cc_cookie=([^;]+)/);
        const cookieValue = JSON.parse(decodeURIComponent(cookieMatch[1]));

        expect(cookieValue.categories).not.toContain('advertisement');
    });

    it('A normal readOnly category (enabled by default) should still always be accepted', async () => {
        await CookieConsent.run({ ...testConfig, mode: 'opt-in', autoShow: false });

        CookieConsent.acceptCategory([]);

        expect(CookieConsent.acceptedCategory('necessary')).toBe(true);
    });

    it('Should not be part of the opt-out mode defaults before any decision', async () => {
        await CookieConsent.run({ ...testConfig, mode: 'opt-out', autoShow: false });

        expect(CookieConsent.getUserPreferences().acceptedCategories).not.toContain('advertisement');
    });

    it('Should render unchecked and non-editable in the preferences modal', async () => {
        await CookieConsent.run({ ...testConfig, mode: 'opt-in', autoShow: false });

        const toggle = document.querySelector('.section__toggle[value="advertisement"]');

        expect(toggle.checked).toBe(false);
        expect(toggle.disabled).toBe(true);
    });

    it('A normal readOnly category should render checked and non-editable', async () => {
        await CookieConsent.run({ ...testConfig, mode: 'opt-in', autoShow: false });

        const toggle = document.querySelector('.section__toggle[value="necessary"]');

        expect(toggle.checked).toBe(true);
        expect(toggle.disabled).toBe(true);
    });

    it('Its cookies should be eligible for autoClear on first consent', async () => {
        setCookie('ad_tracking', '1');

        await CookieConsent.run({ ...testConfig, mode: 'opt-in', autoShow: false, autoClearCookies: true });

        CookieConsent.acceptCategory('all');

        expect(document.cookie).not.toMatch(/ad_tracking=/);
    });
});
