import { globalObj } from '../src/core/global';
import {
    getBrowserLanguageCode,
    getBrowserLanguageCodes,
    resolveCurrentLanguageCode,
    getCurrentLanguageCode,
    getDocumentLanguageCode,
    getAvailableLanguage,
    loadTranslationData
} from '../src/utils/language'

describe('Test language utils', () => {

    beforeAll(() => {
        Object.defineProperty(global.navigator, 'language', {value: 'it-IT', configurable: true});
        Object.defineProperty(global.navigator, 'languages', {value: ['it-IT'], configurable: true});
    })

    const setBrowserLanguages = (languages) => {
        Object.defineProperty(global.navigator, 'language', {value: languages[0], configurable: true});
        Object.defineProperty(global.navigator, 'languages', {value: languages, configurable: true});
    };

    const resolveBrowserLanguage = (translations, defaultLanguage = 'en') => {
        globalObj._state._allTranslations = translations;
        globalObj._state._currentLanguageCode = '';
        globalObj._state._userConfig = {
            language: {
                default: defaultLanguage,
                autoDetect: 'browser'
            }
        };

        return resolveCurrentLanguageCode();
    };

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

    it("Should return null for inherited object properties", () => {
        globalObj._state._allTranslations = {
            en: {}
        }
        expect(getAvailableLanguage('constructor')).toBe(null);
        expect(getAvailableLanguage('toString')).toBe(null);
        expect(getAvailableLanguage('hasOwnProperty')).toBe(null);
    });

    it("Should return current language", () => {
        globalObj._state._currentLanguageCode = 'de';
        expect(getCurrentLanguageCode()).toBe('de');
    });

    it("Should return the browser's language code", () => {
        const language = getBrowserLanguageCode();
        expect(language).toBe('it-IT');
    });

    it("Should return the browser's preferred languages", () => {
        expect(getBrowserLanguageCodes()).toEqual(['it-IT']);
    });

    it("Should fall back to navigator.language when navigator.languages is empty", () => {
        Object.defineProperty(global.navigator, 'languages', {value: [], configurable: true});
        expect(getBrowserLanguageCodes()).toEqual(['it-IT']);
        setBrowserLanguages(['it-IT']);
    });

    it("Should use the next preferred browser language when the first one has no translation", () => {
        setBrowserLanguages(['fr-CH', 'de-CH', 'en']);
        expect(resolveBrowserLanguage({it: {}, de: {}, en: {}})).toBe('de');
        setBrowserLanguages(['it-IT']);
    });

    it("Should respect the order of the preferred browser languages", () => {
        setBrowserLanguages(['de-CH', 'en-US']);
        expect(resolveBrowserLanguage({'en-US': {}, de: {}}, 'en-US')).toBe('de');
        setBrowserLanguages(['it-IT']);
    });

    it("Should use the default language when no preferred browser language has a translation", () => {
        setBrowserLanguages(['fr-FR', 'es']);
        expect(resolveBrowserLanguage({de: {}, en: {}})).toBe('en');
        setBrowserLanguages(['it-IT']);
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

    it('Should throw if the translation file responds with an error status', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
            })
        );

        globalObj._state._allTranslations = {
            it: './it.json'
        }
        globalObj._state._currentLanguageCode = '';
        globalObj._state._userConfig = {
            language: {
                default: 'it'
            }
        };

        await expect(loadTranslationData('it')).rejects.toBe(`Could not load translation for the 'it' language`);
        delete global.fetch;
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
