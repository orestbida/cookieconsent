import { state } from '../src/core/global';
import {
    _getBrowserLanguageCode,
    _resolveCurrentLanguageCode,
    _getValidLanguageCode
} from '../src/utils/language'


describe('Test language utils', () => {

    beforeAll(()=>{
        Object.defineProperty(global.navigator, 'language', {value: 'it-IT', configurable: true});
    })

    it("Should return the browser's language code", () => {
        const language = _getBrowserLanguageCode();
        expect(language).toBe('it');
    });

    it("Should use the browser's language", () => {
        state._allTranslations = {
            it: {},
            en: {}
        }
        state._userConfig = {};
        state._userConfig.language = {};
        state._userConfig.language.default = 'en';
        state._userConfig.language.autoDetect = 'browser';
        expect(_resolveCurrentLanguageCode()).toBe('it');
    })

    it('Should return the first valid language', () => {
        state._allTranslations = {
            it: {}
        }
        state._userConfig = {};
        state._userConfig.language = {};
        state._userConfig.language.autoDetect = 'browser';
        state._currentLanguageCode = 'en';
        state._userConfig.language.default = 'en';
        const currentLanguage = _getValidLanguageCode('en');
        expect(currentLanguage).toBe('it');
    })
});