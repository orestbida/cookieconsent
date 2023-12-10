import {
    addClass,
    removeClass,
    createNode,
    isObject,
    setAttribute,
    hasClass,
    indexOf,
    getKeys,
    appendChild,
    elContains,
    arrayDiff,
    deepCopy,
    uuidv4
} from '../src/utils/general';

import * as CookieConsent from "../src/index"
import testConfig from "./config/basic-config"
import { htmlHasClass } from './config/mocks-utils';
import { globalObj } from '../src/core/global';

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Test add/remove/toggle classes", () => {

    let el;
    const className = 'test_class';

    beforeAll(async () => {
        api = CookieConsent;
        await api.run(testConfig);
        api.acceptCategory();
    })

    it("Should create element", () => {
        el = createNode('div');
        console.debug(el);
        expect(el).toBeInstanceOf(HTMLElement);
    })

    it("Should add class", () => {
        addClass(el, className);
        expect(hasClass(el, className)).toBe(true);
        expect(el.className).toBe(className);
    })

    it("Should remove class", () => {
        removeClass(el, className);
        expect(hasClass(el, className)).toBe(false);
        expect(el.className).toBe('');
    })

    it("Should append child to el.", () => {
        const child = createNode('span');
        expect(el.children.length).toBe(0);

        appendChild(el, child);
        expect(el.children.length).toBe(1);
    })

    it("Should add attribute to el.", () => {
        setAttribute(el, 'data-custom', 'my_value');
        expect(el.dataset.custom).toBe('my_value');
    })

    it("Should hide the preferences modal when esc key is pressed", () => {
        api.showPreferences();
        expect(globalObj._state._preferencesModalVisible).toBe(true);
        document.documentElement.dispatchEvent(new KeyboardEvent("keydown", {keyCode: 27}));
        expect(globalObj._state._preferencesModalVisible).toBe(false);
        expect(htmlHasClass('show--preferences')).toBe(false);
    })
})

describe("Array/Object tests", () => {

    const arr1 = [1];
    const arr2 = [1, 2]

    it('It should return symmetric array difference', () => {
        const diff = arrayDiff(arr1, arr2);
        expect(diff).toEqual([2]);
        expect(elContains(diff, 2)).toBe(true);
    });

    it('It should return index of el. inside array', () => {
        expect(indexOf(arr2, 2)).toBe(1);
        expect(indexOf(arr2, 21)).toBe(-1);
    });

    it('Should determine if an el. is a "valid" object', () => {
        expect(isObject('string_example')).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(arr2)).toBe(false);
        expect(isObject({})).toBe(true);
    });

    it('Should return the object\'s keys', () => {
        expect(getKeys({id: 21})).toContain('id');
        expect(getKeys({name: 'Johny', surname: 'Depp', age: 21, })).toHaveLength(3)
    })

    it('Should return a 36 char long string', () => {
        expect(uuidv4().length).toBe(36);
    })

    it('It should deep copy object', () => {

        expect(deepCopy(2)).toBe(2);
        expect(deepCopy(false)).toBe(false);
        expect(deepCopy('ciao')).toBe('ciao');
        expect(deepCopy({})).toEqual({});

        const date = new Date();
        expect(deepCopy(date)).toEqual(date);

        const original = {
            id: 21,
            bool: false,
            date: new Date(),
            str: 'test',
            arr: ['a', 'b', 'c'],
            obj: {
                id: 21,
                date: new Date(),
                str: 'test',
                arr: ['a', 'b', 'c'],
            }
        }

        expect(deepCopy(original)).toEqual(original);
    });
})