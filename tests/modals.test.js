import { globalObj } from "../src/core/global";
import * as CookieConsent from "../src/index"
import testConfig from "./config/full-config";
import basicConfig from "./config/basic-config";
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

    it('Should run scripts and callbacks after the next paint on click', async () => {
        jest.useFakeTimers();
        const onConsent = jest.fn();
        await api.run({...testConfig, onConsent});
        fireClickEvent(globalObj._dom._cmAcceptAllBtn);
        expect(api.validConsent()).toBe(true);
        expect(onConsent).not.toHaveBeenCalled();
        jest.runAllTimers();
        expect(onConsent).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
    })

    it('Should not run deferred callbacks after reset', async () => {
        jest.useFakeTimers();
        const onConsent = jest.fn();
        await api.run({...testConfig, onConsent});
        fireClickEvent(globalObj._dom._cmAcceptAllBtn);
        api.reset(true);
        jest.runAllTimers();
        expect(onConsent).not.toHaveBeenCalled();
        jest.useRealTimers();
    })

    it('acceptCategory should still run callbacks synchronously', async () => {
        const onConsent = jest.fn();
        await api.run({...testConfig, onConsent});
        api.acceptCategory('all');
        expect(onConsent).toHaveBeenCalledTimes(1);
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
})

describe("Discarded service selection", () => {

    const optInConfig = {
        ...basicConfig,
        mode: 'opt-in',
        language: {
            default: 'en',
            translations: {
                en: {
                    consentModal: {
                        title: 'Title',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        showPreferencesBtn: 'Manage'
                    },
                    preferencesModal: {
                        title: 'Preferences',
                        acceptAllBtn: 'Accept all',
                        acceptNecessaryBtn: 'Reject all',
                        savePreferencesBtn: 'Save',
                        closeIconLabel: 'Close',
                        sections: [
                            { title: 'Necessary', linkedCategory: 'necessary' },
                            { title: 'External', linkedCategory: 'external' }
                        ]
                    }
                }
            }
        },
        categories: {
            necessary: { enabled: true, readOnly: true },
            external: {
                services: {
                    serviceA: { label: 'Service A' },
                    serviceB: { label: 'Service B' }
                }
            }
        }
    };

    const serviceToggle = (name) => globalObj._dom._serviceCheckboxInputs['external'][name];

    afterEach(() => {
        api.reset(true);
    })

    it('Should not accept a discarded service when unchanged preferences are saved', async () => {
        await CookieConsent.run(optInConfig);
        api = CookieConsent;

        api.showPreferences();
        serviceToggle('serviceA').checked = true;
        serviceToggle('serviceA').dispatchEvent(new Event('change'));
        fireClickEvent(globalObj._dom._pmCloseBtn);

        api.showPreferences();
        expect(serviceToggle('serviceA').checked).toBe(false);
        fireClickEvent(globalObj._dom._pmSavePreferencesBtn);

        expect(api.acceptedService('serviceA', 'external')).toBe(false);
        expect(api.acceptedService('serviceB', 'external')).toBe(false);
    })

    it('Should not accept a discarded service when saving after a language switch', async () => {
        const { en } = optInConfig.language.translations;
        await CookieConsent.run({ ...optInConfig, language: { default: 'en', translations: { en, de: en } } });
        api = CookieConsent;

        api.showPreferences();
        serviceToggle('serviceA').checked = true;
        serviceToggle('serviceA').dispatchEvent(new Event('change'));
        await api.setLanguage('de');

        expect(serviceToggle('serviceA').checked).toBe(false);
        fireClickEvent(globalObj._dom._pmSavePreferencesBtn);

        expect(api.acceptedCategory('external')).toBe(false);
        expect(api.acceptedService('serviceA', 'external')).toBe(false);
    })
})

describe('Preferences modal toggle labels test', () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should strip html elements from the toggle labels', async () => {
        const titles = {
            necessary: 'Necessary <span class="pm__badge">Always Enabled</span>',
            analytics: 'Analytics <b>x</b> and stats <i>y</i>',
            ads: 'Ads<br>cookies'
        };

        await api.run({
            lazyHtmlGeneration: false,
            categories: {
                necessary: { readOnly: true },
                analytics: {},
                ads: {}
            },
            language: {
                default: 'en',
                translations: {
                    en: {
                        consentModal: {},
                        preferencesModal: {
                            sections: Object.keys(titles).map(category => ({
                                title: titles[category],
                                linkedCategory: category
                            }))
                        }
                    }
                }
            }
        });

        const labels = [...document.querySelectorAll('.pm .toggle__label')].map(label => label.textContent);
        expect(labels).toEqual(['Necessary ', 'Analytics  and stats ', 'Adscookies']);
    })
})

describe('Modals language switch test', () => {

    const translation = (extraButtons) => ({
        consentModal: {
            title: 'title',
            acceptAllBtn: 'accept all',
            showPreferencesBtn: 'show preferences',
            ...extraButtons
        },
        preferencesModal: {
            title: 'title',
            savePreferencesBtn: 'save',
            ...extraButtons,
            sections: []
        }
    });

    const config = {
        lazyHtmlGeneration: false,
        categories: {
            necessary: { readOnly: true }
        },
        language: {
            default: 'en',
            translations: {
                en: translation(),
                de: translation({ acceptNecessaryBtn: 'accept necessary' })
            }
        }
    };

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should add buttons missing in the previous language', async () => {
        await api.run(config);
        expect(await api.setLanguage('de')).toBe(true);

        const { _cmBtnGroup, _cmBtnGroup2, _cmAcceptNecessaryBtn, _cmShowPreferencesBtn, _pmBtnGroup1, _pmAcceptNecessaryBtn } = globalObj._dom;

        expect(_cmAcceptNecessaryBtn.parentNode).toBe(_cmBtnGroup);
        expect(_cmShowPreferencesBtn.parentNode).toBe(_cmBtnGroup2);
        expect(_cmBtnGroup.classList.contains('cm__btn-group--uneven')).toBe(false);
        expect(_pmAcceptNecessaryBtn.parentNode).toBe(_pmBtnGroup1);
    })
})

describe('Consent modal labels language switch test', () => {

    const translation = (label, closeIconLabel) => ({
        consentModal: {
            label,
            closeIconLabel,
            title: 'title',
            acceptAllBtn: 'accept all'
        }
    });

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should update aria labels on language change', async () => {
        await api.run({
            categories: {
                necessary: { readOnly: true }
            },
            language: {
                default: 'en',
                translations: {
                    en: translation('Cookie consent', 'Reject all'),
                    de: translation('Cookie-Einwilligung', 'Alle ablehnen')
                }
            }
        });

        await api.setLanguage('de');

        expect(globalObj._dom._cm.getAttribute('aria-label')).toBe('Cookie-Einwilligung');
        expect(globalObj._dom._cmCloseIconBtn.getAttribute('aria-label')).toBe('Alle ablehnen');
    })
})

describe('Preferences modal cookie table test', () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should link each cell to its column header', async () => {
        await api.run({
            lazyHtmlGeneration: false,
            categories: {
                analytics: {}
            },
            language: {
                default: 'en',
                translations: {
                    en: {
                        consentModal: {},
                        preferencesModal: {
                            sections: [{
                                title: 'Analytics',
                                linkedCategory: 'analytics',
                                cookieTable: {
                                    headers: {
                                        name: 'Name',
                                        expiration: 'Expiration <b>date</b>'
                                    },
                                    body: [
                                        { name: '_ga', expiration: '2 years' }
                                    ]
                                }
                            }]
                        }
                    }
                }
            }
        });

        const cells = document.querySelectorAll('.pm__table-td');
        expect(cells.length).toBe(2);

        for (const td of cells) {
            const headerIds = td.getAttribute('headers').split(/\s+/);
            expect(headerIds.length).toBe(1);

            const th = document.getElementById(headerIds[0]);
            expect(th).toBeInstanceOf(HTMLTableCellElement);
            expect(th.innerHTML).toBe(td.getAttribute('data-column'));
        }
    })
})

describe('Missing modal translation test', () => {
    let testConfig;

    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const mod = await import('./config/full-config');
            testConfig = mod.default;
        });
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should not throw when showing a preferences modal without translation', async () => {
        delete testConfig.language.translations.en.preferencesModal;
        await api.run(testConfig);

        expect(() => api.showPreferences()).not.toThrow();
        expect(htmlHasClass('show--preferences')).toBe(false);
        expect(() => fireClickEvent(globalObj._dom._cmShowPreferencesBtn)).not.toThrow();
    })

    it('Should not throw when showing a consent modal without translation', async () => {
        delete testConfig.language.translations.en.consentModal;
        testConfig.autoShow = true;
        await expect(api.run(testConfig)).resolves.not.toThrow();

        expect(() => api.show(true)).not.toThrow();
        expect(htmlHasClass('show--consent')).toBe(false);
        expect(() => api.showPreferences()).not.toThrow();
        expect(htmlHasClass('show--preferences')).toBe(true);
    })

    it('Should not throw for a section with a linked category but no title', async () => {
        testConfig.language.translations.en.preferencesModal.sections = [
            { description: 'no title', linkedCategory: 'analytics' }
        ];

        await expect(api.run(testConfig)).resolves.not.toThrow();
        expect(document.querySelector('.pm__section-desc').innerHTML).toBe('no title');
    })
})

describe('Modal timers after reset', () => {
    afterEach(() => {
        api.reset(true);
    })

    it('Should not throw when reset() runs before the show/hide timers', async () => {
        const errors = [];
        const onError = (event) => errors.push(event.error);
        window.addEventListener('error', onError);

        await api.run({ ...basicConfig, disablePageInteraction: true });
        api.show(true);
        api.showPreferences();
        api.hide();
        api.reset(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        window.removeEventListener('error', onError);
        expect(errors).toEqual([]);
    })
})
