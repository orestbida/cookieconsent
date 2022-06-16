import CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import { _elContains, _getKeys, _isObject } from "../src/utils/general";
import { _setCookie } from "../src/utils/cookies";
import { dom } from "../src/core/global";
import { defineCryptoRandom } from "./config/mocs-utils";

let api;

const guiOptions = {
    consentModal: {
        equalWeightButtons: false,
    },
    preferencesModal: {
        equalWeightButtons: false
    }
}

describe("CookieConsent Clean state", () =>{

    beforeAll(()=>{
        defineCryptoRandom(global);

        testConfig.guiOptions = guiOptions;
        api = CookieConsent.init();
    })

    afterEach(()=>{
        destroyPluginHTML();
        api = CookieConsent.init();
    });

    it('Should add the box layout', () => {
        testConfig.guiOptions.consentModal.layout = 'box wide';
        api.run(testConfig);
        const modal = document.querySelector('.cm');
        expect(modal.classList.contains('cm--box')).toBe(true);
        expect(modal.classList.contains('cm--wide')).toBe(true);
    })

    it('Should add the cloud layout', () => {
        testConfig.guiOptions.consentModal.layout = 'cloud';
        api.run(testConfig);
        const modal = document.querySelector('.cm');
        expect(modal.classList.contains('cm--cloud')).toBe(true);
    })

})

function htmlHasClass(className){
    return document.documentElement.className.includes(className);
}

function resetConsentModal(){
    dom._cmContainer = 0;
    dom._consentModal = 0;
    dom._consentModalBody = 0;
    dom._consentModalTexts = 0;
    dom._consentModalTitle = 0;
    dom._consentModalDescription = 0;
    dom._consentModalBtns = 0;
    dom._consentModalBtnGroup = 0;
    dom._consentModalBtnGroup2 = 0;
    dom._consentAcceptAllBtn = 0;
    dom._consentAcceptNecessaryBtn = 0;
    dom._consentShowPreferencesBtn = 0;
    dom._consentModalFooterLinksGroup = 0;
    dom._cmCloseIconBtn = 0;
    const modal = document.querySelector('.cm-wrapper');
    modal && modal.remove();
}

function resetPreferencesModal(){
    dom._pmContainer = 0;
    dom._pm = 0;
    dom._pmHeader = 0;
    dom._pmTitle = 0;
    dom._pmCloseBtn = 0;
    dom._pmBody = 0;
    dom._pmNewBody = 0;
    dom._pmSections = 0;
    dom._pmFooter = 0;
    dom._pmAcceptAllBtn = 0;
    dom._pmAcceptNecessaryBtn = 0;
    dom._pmSavePreferencesBtn = 0;
    const modal = document.querySelector('.pm-wrapper');
    modal && modal.remove();
}

function destroyPluginHTML(){
    resetConsentModal();
    resetPreferencesModal();
    dom._ccMain = 0;
    dom._categoryCheckboxInputs = {};
    dom._serviceCheckboxInputs = {};
    const ccMain = document.getElementById('cc-main');
    ccMain && ccMain.remove();
}