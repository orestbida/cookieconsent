import { globalObj } from "../src/core/global";
import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { fireClickEvent, htmlHasClass } from "./config/mocks-utils";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Consent Modal buttons test", () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Modals should exist', async () => {
        await api.run(testConfig);
        const cm = document.querySelector('.cm');
        const pm = document.querySelector('.pm');
        expect(cm).toBeInstanceOf(HTMLElement);
        expect(pm).toBeInstanceOf(HTMLElement);
    })

    it('All toggle checkboxes should have a unique name attribute', async () => {
        await api.run(testConfig);

        const names = Array.from(document.querySelectorAll('.section__toggle'))
            .map(toggle => toggle.name);

        expect(names.every(name => !!name)).toBe(true);
        expect(new Set(names).size).toBe(names.length);
    })

    it('Modal accept necessary btn onClick', async () => {
        await api.run(testConfig);
        fireClickEvent(globalObj._dom._cmAcceptNecessaryBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Modal accept all btn onClick', async () => {
        await api.run(testConfig);
        fireClickEvent(globalObj._dom._cmAcceptAllBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.rejectedCategories.length).toBe(0);
    })

    it('Should accept necessary when closeIconLabel (x) is pressed', async () => {
        testConfig.guiOptions.consentModal.layout = 'box';
        testConfig.language.translations.en.consentModal.closeIconLabel = 'Reject all';
        await api.run(testConfig);
        fireClickEvent(globalObj._dom._cmCloseIconBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
    })
})

describe('Preferences Modal buttons test', () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    beforeEach(async () => {
        await api.run(testConfig);
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should accept necessary only on acceptNecessaryBtn click', () => {
        fireClickEvent(globalObj._dom._pmAcceptNecessaryBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Should accept all categories on acceptAllBtn click', () => {
        fireClickEvent(globalObj._dom._pmAcceptAllBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.rejectedCategories.length).toBe(0);
    })

    it('Should accept selected only categories on savePreferencesBtn click', () => {
        api.acceptCategory('all');
        document.querySelector('.section__toggle[value="analytics"]').checked = false;
        fireClickEvent(globalObj._dom._pmSavePreferencesBtn);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('custom');
        expect(userPreferences.rejectedCategories).toContain('analytics');
    })

    it('Should close the preferences modal when (x) icon is pressed', () => {
        api.showPreferences();
        expect(htmlHasClass('show--preferences')).toBe(true)
        fireClickEvent(globalObj._dom._pmCloseBtn);
        expect(htmlHasClass('show--preferences')).toBe(false)
    })

    const withPreferencesModal = (preferencesModal) => ({
        ...testConfig,
        language: {
            ...testConfig.language,
            translations: {
                ...testConfig.language.translations,
                en: {
                    ...testConfig.language.translations.en,
                    preferencesModal
                }
            }
        }
    });

    it('Preferences close button should fall back to the title when closeIconLabel is missing', async () => {
        api.reset(true);
        const { closeIconLabel, ...pmWithoutCloseLabel } = testConfig.language.translations.en.preferencesModal;
        await api.run(withPreferencesModal(pmWithoutCloseLabel));

        expect(globalObj._dom._pmCloseBtn.getAttribute('aria-label')).toBe(pmWithoutCloseLabel.title);
    })

    it('Preferences close button should never have an empty/missing aria-label', async () => {
        api.reset(true);
        const { closeIconLabel, title, ...pmWithoutLabels } = testConfig.language.translations.en.preferencesModal;
        await api.run(withPreferencesModal(pmWithoutLabels));

        expect(globalObj._dom._pmCloseBtn.getAttribute('aria-label')).toBeTruthy();
    })
})