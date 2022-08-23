import { globalObj } from '../src/core/global';
import {
    _getBrowserLanguageCode,
    _resolveCurrentLanguageCode,
    _getCurrentLanguageCode,
    _getDocumentLanguageCode,
    _validLanguageCode
} from '../src/utils/language'

describe('Test language utils', () => {

    beforeAll(()=>{
        Object.defineProperty(global.navigator, 'language', {value: 'it-IT', configurable: true});
    })

    it("Should return true when translation is defined", () => {
        globalObj._state._allTranslations = {
            en: {}
        }
        expect(_validLanguageCode('en')).toBe(true);
    });

    it("Should return false when translation is not defined", () => {
        globalObj._state._allTranslations = {
            en: {}
        }
        expect(_validLanguageCode('it')).toBe(false);
    });

    it("Should return current language", () => {
        globalObj._state._currentLanguageCode = 'de';
        expect(_getCurrentLanguageCode()).toBe('de');
    });

    it("Should return the browser's language code", () => {
        const language = _getBrowserLanguageCode();
        expect(language).toBe('it');
    });

    it("Should return the document's 'lang' attribute", () => {
        document.documentElement.lang = 'es';
        const language = _getDocumentLanguageCode();
        expect(language).toBe('es');
    });

    it("Should fallback to 'default' language when autoDetect language is not defined", () => {
        document.documentElement.lang = 'es';
        globalObj._state._allTranslations = {
            en: {}
        }
        globalObj._state._userConfig = {};
        globalObj._state._currentLanguageCode = '';
        globalObj._state._userConfig.language = {};
        globalObj._state._userConfig.language.default = 'en';
        globalObj._state._userConfig.language.autoDetect = 'document';
        const language = _resolveCurrentLanguageCode();
        expect(language).toBe('en');
    });

    it("Should use the browser's language", () => {
        globalObj._state._allTranslations = {
            it: {},
            en: {}
        }
        globalObj._state._userConfig = {};
        globalObj._state._currentLanguageCode = '';
        globalObj._state._userConfig.language = {};
        globalObj._state._userConfig.language.default = 'en';
        globalObj._state._userConfig.language.autoDetect = 'browser';
        expect(_resolveCurrentLanguageCode()).toBe('it');
    })
});