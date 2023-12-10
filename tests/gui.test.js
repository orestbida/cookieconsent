import { globalObj } from "../src/core/global";
import { getActiveElement } from "../src/utils/general";
import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Test UI options", () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    });

    it('Should set the "box" layout', async () => {
        testConfig.guiOptions.consentModal.layout = 'box wide';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--box')).toBe(true);
        expect(classList.contains('cm--wide')).toBe(true);
    })

    it('Should add a closeIconLabel (x) when the layout="box"', async () => {
        testConfig.guiOptions.consentModal.layout = 'box wide';
        testConfig.language.translations.en.consentModal.closeIconLabel = 'Reject all';
        await api.run(testConfig);
        expect(globalObj._dom._cmCloseIconBtn).toBeInstanceOf(HTMLElement);
    })

    it('Should set the "bar" layout', async () => {
        testConfig.guiOptions.consentModal.layout = 'bar inline';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--bar')).toBe(true);
        expect(classList.contains('cm--inline')).toBe(true);
    })

    it('Should set the "cloud" layout', async () => {
        testConfig.guiOptions.consentModal.layout = 'cloud';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--cloud')).toBe(true);
    })

    it('Should set the preferences modal\'s layout to "bar"', async () => {
        testConfig.guiOptions.preferencesModal.layout = 'bar';
        await api.run(testConfig);
        const classList = getModalClassList('.pm');
        expect(classList.contains('pm--bar')).toBe(true);
    })

    it('Should set position to "top"', async () => {
        testConfig.guiOptions.consentModal.position = 'top';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
    })

    it('Should set position to "middle"', async () => {
        testConfig.guiOptions.consentModal.position = 'middle';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--middle')).toBe(true);
    })

    it('Should set position to "bottom"', async () => {
        testConfig.guiOptions.consentModal.position = 'bottom';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--bottom')).toBe(true);
    })

    it('Should set position to "top-left"', async () => {
        testConfig.guiOptions.consentModal.position = 'top left';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
        expect(classList.contains('cm--left')).toBe(true);
    })

    it('Should set position to "top-center"', async () => {
        testConfig.guiOptions.consentModal.position = 'top center';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
        expect(classList.contains('cm--center')).toBe(true);
    })

    it('Should set position to "top-right"', async () => {
        testConfig.guiOptions.consentModal.position = 'top right';
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
        expect(classList.contains('cm--right')).toBe(true);
    })

    it('Buttons should have different weight', async () => {
        testConfig.guiOptions.consentModal.equalWeightButtons = false;
        await api.run(testConfig);
        const classList = document.querySelector('[data-role="necessary"]').classList;
        expect(classList.contains('cm__btn--secondary')).toBe(true);
    })

    it('Buttons should same weight', async () => {
        testConfig.guiOptions.consentModal.equalWeightButtons = true;
        await api.run(testConfig);
        const classList = document.querySelector('[data-role="necessary"]').classList;
        expect(classList.contains('cm__btn--secondary')).toBe(false);
    })

    it('Should flip buttons', async () => {
        testConfig.guiOptions.consentModal.flipButtons = true;
        testConfig.guiOptions.preferencesModal.flipButtons = true;
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        const classList2 = getModalClassList('.pm');
        expect(classList.contains('cm--flip')).toBe(true);
        expect(classList2.contains('pm--flip')).toBe(true);
    })

    it('Should use "box" layout by default if no layout value is provided', async () => {
        testConfig.guiOptions = undefined;
        await api.run(testConfig);
        const classList = getModalClassList('.cm');
        const classList2 = getModalClassList('.pm');
        expect(classList.contains('cm--box')).toBe(true);
        expect(classList2.contains('pm--box')).toBe(true);
    });

    it('consentModal should receive focus when it is shown', async () => {
        await api.run(testConfig);
        const prevActiveElement = getActiveElement();
        api.show();
        await new Promise(r => setTimeout(r, 300));
        const currActiveElement = getActiveElement();
        expect(currActiveElement).not.toBe(prevActiveElement);
        expect(document.querySelector('.cm > div[tabIndex="-1"]')).toBe(currActiveElement);
    });

    it('preferencesModal should receive focus when it is shown', async () => {
        await api.run(testConfig);
        const prevActiveElement = getActiveElement();
        api.showPreferences();
        await new Promise(r => setTimeout(r, 300));
        const currActiveElement = getActiveElement();
        expect(currActiveElement).not.toBe(prevActiveElement);
        expect(document.querySelector('.pm > div[tabIndex="-1"]')).toBe(currActiveElement);
    });
})

function getModalClassList(selector) {
    return document.querySelector(selector).classList;
}