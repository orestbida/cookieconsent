import {
    arrayDiff,
    deepCopy,
    elContains,
    getKeys,
    indexOf
} from '../src/utils/collections';
import { uuidv4 } from '../src/utils/cookies';
import {
    addClass,
    appendChild,
    createNode,
    hasClass,
    removeClass,
    setAttribute
} from '../src/utils/dom';
import { isObject } from '../src/utils/type-guards';

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
        document.documentElement.dispatchEvent(new KeyboardEvent("keydown", {key: "Escape"}));
        expect(globalObj._state._preferencesModalVisible).toBe(false);
        expect(htmlHasClass('show--preferences')).toBe(false);
    })
})

describe('Modal focus trap', () => {

    beforeEach(async () => {
        CookieConsent.reset(true);
        jest.useFakeTimers();
        await CookieConsent.run({ ...testConfig, autoShow: false });
        CookieConsent.showPreferences();
        jest.advanceTimersByTime(200);
    });

    afterEach(() => {
        CookieConsent.reset(true);
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('Should wrap Shift+Tab from the initial focus target to the last control', () => {
        expect(document.activeElement).toBe(globalObj._dom._pmDivTabindex);
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(globalObj._state._pmFocusableElements[1]);
    });

    it.each([
        ['backwards from the first control', true, 0, 1],
        ['forwards from the last control', false, 1, 0]
    ])('Should wrap %s', (description, shiftKey, start, end) => {
        const controls = globalObj._state._pmFocusableElements;
        controls[start].focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(controls[end]);
    });

    it.each([
        ['backwards', true, 1],
        ['forwards', false, 0]
    ])('Should redirect focus from outside the preferences modal %s', (description, shiftKey, end) => {
        globalObj._dom._cmAcceptAllBtn.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(globalObj._state._pmFocusableElements[end]);
    });

    it('Should allow forward Tab from the initial focus target', () => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(globalObj._dom._pmDivTabindex);
    });

    it('Should wrap Shift+Tab from the consent modal initial focus target', () => {
        CookieConsent.hidePreferences();
        CookieConsent.show();
        jest.advanceTimersByTime(200);
        expect(document.activeElement).toBe(globalObj._dom._cmDivTabindex);
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(globalObj._state._cmFocusableElements[1]);
    });

    it('Should allow backward Tab from an interior control', () => {
        const control = globalObj._dom._pmAcceptAllBtn;
        expect(globalObj._state._pmFocusableElements).not.toContain(control);
        control.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(control);
    });

    it('Should focus the preferences modal after its transition is enabled', async () => {
        CookieConsent.reset(true);
        await CookieConsent.run({ ...testConfig, autoShow: false });
        CookieConsent.showPreferences();

        const { _pmContainer, _pmDivTabindex } = globalObj._dom;
        const addClass = _pmContainer.classList.add.bind(_pmContainer.classList);
        let animEnabledAt, focusedAt;

        _pmContainer.classList.add = (className) => {
            className === 'cc--anim' && (animEnabledAt = Date.now());
            addClass(className);
        };
        _pmDivTabindex.addEventListener('focus', () => focusedAt = Date.now());

        jest.advanceTimersByTime(200);

        expect(document.activeElement).toBe(_pmDivTabindex);
        expect(focusedAt).toBeGreaterThan(animEnabledAt);
    });

    it('Should not scroll the page when focusing the modals', async () => {
        CookieConsent.reset(true);

        const hostBtn = document.createElement('button');
        document.body.appendChild(hostBtn);
        hostBtn.focus();

        await CookieConsent.run({ ...testConfig, autoShow: false });
        const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');
        const focusOptions = (el) => focusSpy.mock.calls[focusSpy.mock.contexts.lastIndexOf(el)][0];

        CookieConsent.show(true);
        jest.advanceTimersByTime(200);
        expect(focusOptions(globalObj._dom._cmDivTabindex)).toEqual({ preventScroll: true });

        CookieConsent.showPreferences();
        jest.advanceTimersByTime(200);
        expect(focusOptions(globalObj._dom._pmDivTabindex)).toEqual({ preventScroll: true });

        CookieConsent.hidePreferences();
        expect(focusOptions(globalObj._dom._pmFocusSpan)).toEqual({ preventScroll: true });

        CookieConsent.hide();
        expect(focusOptions(globalObj._dom._focusSpan)).toEqual({ preventScroll: true });
        expect(focusOptions(hostBtn)).toEqual({ preventScroll: undefined });

        focusSpy.mockRestore();
        hostBtn.remove();
    });

    it('Should not trap focus when the preferences modal is hidden', () => {
        CookieConsent.hidePreferences();
        globalObj._dom._pmDivTabindex.focus();
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });

        document.activeElement.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
    });
});

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
        expect(deepCopy(null)).toBe(null);

        const date = new Date();
        expect(deepCopy(date)).toEqual(date);

        const original = {
            id: 21,
            bool: false,
            date: new Date(),
            str: 'test',
            empty: null,
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