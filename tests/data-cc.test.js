import * as CookieConsent from "../src/index"
import { getKeys } from "../src/utils/general";
import testConfig from "./config/full-config";
import { fireClickEvent, htmlHasClass } from "./config/mocks-utils";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Test data-cc attributes", () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    beforeAll(() => {

        document.body.innerHTML = `
            <button type="button" data-cc="show-preferencesModal">Show preferences modal</button>
            <button type="button" data-cc="show-consentModal">Show consent modal</button>
            <button type="button" data-cc="accept-all">Accept all</button>
            <button type="button" data-cc="accept-necessary">Accept necessary</button>
            <button type="button" data-cc="accept-custom">Accept current selection</button>
        `;

        api = CookieConsent;
    })

    beforeEach(async () => {
        await api.run(testConfig);
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should show the preferences modal onClick', () => {
        const showPreferencesBtn = document.querySelector('button[data-cc="show-preferencesModal"]');
        fireClickEvent(showPreferencesBtn)
        expect(htmlHasClass('show--preferences')).toBe(true);
    })

    it('Should show the consent modal onClick', () => {
        const showConsentModal = document.querySelector('button[data-cc="show-consentModal"]');
        fireClickEvent(showConsentModal)
        expect(htmlHasClass('show--consent')).toBe(true);
    })

    it('Should accept all categories onClick', () => {
        const acceptAllBtn = document.querySelector('button[data-cc="accept-all"]');
        fireClickEvent(acceptAllBtn)
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.acceptedCategories.length).toBe(getKeys(testConfig.categories).length);
    })

    it('Should accept necessary categories onClick', () => {
        const acceptNecessaryBtn = document.querySelector('button[data-cc="accept-necessary"]');
        fireClickEvent(acceptNecessaryBtn)
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Should accept custom categories onClick', () => {
        const acceptCustomBtn = document.querySelector('button[data-cc="accept-custom"]');
        const checkbox = document.querySelector('.section__toggle[value="analytics"]');
        checkbox.checked = true;
        fireClickEvent(acceptCustomBtn)
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('custom');
        expect(userPreferences.acceptedCategories.length).toBe(2);
    })
});