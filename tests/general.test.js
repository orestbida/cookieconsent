import {
    _addClass,
    _removeClass,
    _createNode,
    _isObject,
    _setAttribute,
    _hasClass,
    _indexOf,
    _getKeys,
    _appendChild,
    _elContains,
    _arrayDiff,
    _uuidv4
} from '../src/utils/general';

import CookieConsent from "../src/index"
import testConfig from "./config/basic-config"
import { defineCryptoRandom } from './config/mocs-utils';

describe("Test add/remove/toggle classes", () => {
    /**
     * @type {HTMLElement}
     */
    let el;
    const className = 'test_class';

    it("Should create element", () => {
        el = _createNode('div');
        console.debug(el);
        expect(el).toBeInstanceOf(HTMLElement);
    })

    it("Should add class", () => {
        _addClass(el, className);
        expect(_hasClass(el, className)).toBe(true);
        expect(el.className).toBe(className);
    })

    it("Should remove class", () => {
        _removeClass(el, className);
        expect(_hasClass(el, className)).toBe(false);
        expect(el.className).toBe('');
    })

    it("Should append child to el", () => {
        const child = _createNode('span');
        expect(el.children.length).toBe(0);

        _appendChild(el, child);
        expect(el.children.length).toBe(1);
    })

    it("Should add attribute to el", () => {
        _setAttribute(el, 'data-custom', 'my_value');
        expect(el.dataset.custom).toBe('my_value');
    })
})

describe("Array/Object tests", () =>{

    const arr1 = [1];
    const arr2 = [1, 2]

    beforeAll(()=>{
        defineCryptoRandom(global);
    })

    it('It should give array difference', () => {
        const diff = _arrayDiff(arr1, arr2);
        expect(diff).toEqual([2]);
        expect(_elContains(diff, 2)).toBe(true);
    });

    it('It should give index of el inside array', () => {
        expect(_indexOf(arr2, 2)).toBe(1);
        expect(_indexOf(arr2, 21)).toBe(-1);
    });

    it('Should determine if an el is a valid object', () => {
        expect(_isObject('string_example')).toBe(false);
        expect(_isObject(null)).toBe(false);
        expect(_isObject(arr2)).toBe(false);
        expect(_isObject({})).toBe(true);
    });

    it('Should return the object keys', () => {
        expect(_getKeys({id: 21})).toContain('id');
        expect(_getKeys({name: 'Johny', age: 21})).not.toContain('id');
        expect(_getKeys({name: 'Johny', surname: 'Depp', age: 21, })).toHaveLength(3)
    })

    it('Should return a 36 char long string', () => {
        expect(typeof _uuidv4()).toBe('string');
        expect(_uuidv4().length).toBe(36);
    })
})

describe("Test data-cc attributes", () =>{

    let api;

    beforeAll(()=>{
        defineCryptoRandom(global);

        document.body.innerHTML = `
            <button type="button" data-cc="show-preferencesModal">Show preferences modal</button>
            <button type="button" data-cc="show-consentModal">Show consent modal</button>
            <button type="button" data-cc="accept-all">Accept all</button>
            <button type="button" data-cc="accept-necessary">Accept necessary</button>
            <button type="button" data-cc="accept-custom">Accept current selection</button>
        `;

        api = CookieConsent.init();
        api.run(testConfig);
        api.accept('all');
        api.accept([]);
    })

    it('Should show the preferences modal onClick', () => {
        const showPreferencesBtn = document.querySelector('button[data-cc="show-preferencesModal"]');
        const clickEvent = new Event('click');
        showPreferencesBtn.dispatchEvent(clickEvent);
        expect(document.documentElement.classList.contains('show--preferences')).toBe(true);
    })

    it('Should show the consent modal onClick', () => {
        document.documentElement.classList.remove('show--consent')
        const showConsentModal = document.querySelector('button[data-cc="show-consentModal"]');
        const clickEvent = new Event('click');
        showConsentModal.dispatchEvent(clickEvent);
        expect(document.documentElement.classList.contains('show--consent')).toBe(true);
    })

    it('Should accept all categories onClick', () => {
        const acceptAllBtn = document.querySelector('button[data-cc="accept-all"]');
        const clickEvent = new Event('click');
        acceptAllBtn.dispatchEvent(clickEvent);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('all');
        expect(userPreferences.acceptedCategories.length).toBe(_getKeys(testConfig.categories).length);
    })

    it('Should accept necessary categories onClick', () => {
        const acceptNecessaryBtn = document.querySelector('button[data-cc="accept-necessary"]');
        const clickEvent = new Event('click');
        acceptNecessaryBtn.dispatchEvent(clickEvent);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('necessary');
        expect(userPreferences.acceptedCategories.length).toBe(1);
    })

    it('Should accept necessary categories onClick', () => {
        const acceptCustomBtn = document.querySelector('button[data-cc="accept-custom"]');
        const checkbox = document.querySelector('.section__toggle[value="analytics"]');
        checkbox.checked = true;
        const clickEvent = new Event('click');
        acceptCustomBtn.dispatchEvent(clickEvent);
        const userPreferences = api.getUserPreferences();
        expect(userPreferences.acceptType).toBe('custom');
        expect(userPreferences.acceptedCategories.length).toBe(2);
    })

});