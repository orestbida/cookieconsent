import CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { defineCryptoRandom, resetCookieConsent } from "./config/mocs-utils";

let api;

describe("CookieConsent Clean state", () =>{

    beforeAll(()=>{
        defineCryptoRandom(global);
        api = CookieConsent.init();
    })

    afterEach(()=>{
        resetCookieConsent()
    });

    it('Should add the box layout', () => {
        testConfig.guiOptions.consentModal.layout = 'box wide';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--box')).toBe(true);
        expect(classList.contains('cm--wide')).toBe(true);
    })

    it('Should add the bar layout', () => {
        testConfig.guiOptions.consentModal.layout = 'bar inline';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--bar')).toBe(true);
        expect(classList.contains('cm--inline')).toBe(true);
    })

    it('Should add the cloud layout', () => {
        testConfig.guiOptions.consentModal.layout = 'cloud';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--cloud')).toBe(true);
    })

    it('Should set the preferences modal layout to "bar"', () => {
        testConfig.guiOptions.preferencesModal.layout = 'bar';
        api.run(testConfig);
        const classList = getModalClassList('.pm');
        expect(classList.contains('pm--bar')).toBe(true);
    })

    it('Should set position to "top"', () => {
        testConfig.guiOptions.consentModal.position = 'top';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
    })

    it('Should set position to "middle"', () => {
        testConfig.guiOptions.consentModal.position = 'middle';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--middle')).toBe(true);
    })

    it('Should set position to "bottom"', () => {
        testConfig.guiOptions.consentModal.position = 'bottom';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--bottom')).toBe(true);
    })

    it('Should set position to "top-left"', () => {
        testConfig.guiOptions.consentModal.position = 'top left';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
        expect(classList.contains('cm--left')).toBe(true);
    })

    it('Should set position to "top-center"', () => {
        testConfig.guiOptions.consentModal.position = 'top center';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
        expect(classList.contains('cm--center')).toBe(true);
    })

    it('Should set position to "top-right"', () => {
        testConfig.guiOptions.consentModal.position = 'top right';
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        expect(classList.contains('cm--top')).toBe(true);
        expect(classList.contains('cm--right')).toBe(true);
    })

    it('Should flip buttons', () => {
        testConfig.guiOptions.consentModal.flipButtons = true;
        testConfig.guiOptions.preferencesModal.flipButtons = true;
        api.run(testConfig);
        const classList = getModalClassList('.cm');
        const classList2 = getModalClassList('.pm');
        expect(classList.contains('cm--flip')).toBe(true);
        expect(classList2.contains('pm--flip')).toBe(true);
    })
})

function getModalClassList(selector){
    return document.querySelector(selector).classList;
}