import { globalObj } from '../src/core/global';
import {
    getBrowserLanguageCode,
    resolveCurrentLanguageCode,
    getCurrentLanguageCode,
    getDocumentLanguageCode,
    getAvailableLanguage,
    loadTranslationData
} from '../src/utils/language'

describe('Test language utils', () => {

    beforeAll(() => {
        Object.defineProperty(global.navigator, 'language', {value: 'it-IT', configurable: true});
    })

    it("Should return the language when the exact translation is defined", () => {
        globalObj._state._allTranslations = {
            en: {}
        }
        expect(getAvailableLanguage('en')).toBe('en');
    });

    it("Should return the full language code when the translation is defined", () => {
        globalObj._state._allTranslations = {
            'en': {},
            'en-GB': {}
        }
        expect(getAvailableLanguage('en-GB')).toBe('en-GB');
    });

    it("Should return the fallback language when the translation is not defined", () => {
        globalObj._state._allTranslations = {
            en: {}
        }
        expect(getAvailableLanguage('en-GB')).toBe('en');
    });

    it("Should return null when translation is not defined", () => {
        globalObj._state._allTranslations = {
            en: {}
        }
        expect(getAvailableLanguage('it')).toBe(null);
    });

    it("Should return current language", () => {
        globalObj._state._currentLanguageCode = 'de';
        expect(getCurrentLanguageCode()).toBe('de');
    });

    it("Should return the browser's language code", () => {
        const language = getBrowserLanguageCode();
        expect(language).toBe('it-IT');
    });

    it("Should return the document's 'lang' attribute", () => {
        document.documentElement.lang = 'es';
        const language = getDocumentLanguageCode();
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
        const language = resolveCurrentLanguageCode();
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
        expect(resolveCurrentLanguageCode()).toBe('it');
    })

    it('Should use the language defined in the html tag', () => {
        document.documentElement.lang = 'en-US';

        globalObj._state._userConfig = {
            language : {
                default: 'it',
                autoDetect: 'document'
            }
        };

        globalObj._state._allTranslations = {
            it: {},
            en: {}
        }

        globalObj._state._currentLanguageCode = '';
        expect(resolveCurrentLanguageCode()).toBe('en');
    })

    it('Should return false if translation is not defined', async () => {
        globalObj._state._allTranslations = {}
        globalObj._state._currentLanguageCode = '';
        globalObj._state._userConfig = {
            language: {
                default: 'it'
            }
        };
        
        try {
            await loadTranslationData('it');
        } catch (ex) {
            expect(ex).toBe(`Could not load translation for the 'it' language`);
        }
    });

    it('Should return the default language if the detection method is not supported', () => {
        globalObj._state._allTranslations = {
            it: {}
        }
        globalObj._state._currentLanguageCode = '';
        globalObj._state._userConfig = {
            language: {
                default: 'it',
                autoDetect: 'not-supported'
            }
        };

        expect(resolveCurrentLanguageCode()).toBe('it')
    });
});
