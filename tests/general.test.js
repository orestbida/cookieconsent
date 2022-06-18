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


    beforeAll(()=>{
        defineCryptoRandom(global);
        let api = CookieConsent.init();
        api.run(testConfig);
        api.accept();
    })

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