import { globalObj } from '../src/core/global';
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
        globalObj._state._allTranslations = {
            it: {},
            en: {}
        }
        globalObj._state._userConfig = {};
        globalObj._state._userConfig.language = {};
        globalObj._state._userConfig.language.default = 'en';
        globalObj._state._userConfig.language.autoDetect = 'browser';
        expect(_resolveCurrentLanguageCode()).toBe('it');
    })

    it('Should return the first valid language', () => {
        globalObj._state._allTranslations = {
            it: {}
        }
        globalObj._state._userConfig = {};
        globalObj._state._userConfig.language = {};
        globalObj._state._userConfig.language.autoDetect = 'browser';
        globalObj._state._currentLanguageCode = 'en';
        globalObj._state._userConfig.language.default = 'en';
        const currentLanguage = _getValidLanguageCode('en');
        expect(currentLanguage).toBe('it');
    })
});