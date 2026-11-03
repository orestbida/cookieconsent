import CookieConsent, * as esm from '../src/index.esm';
import * as api from '../src/index';

describe('ESM entry', () => {
    it('Should export the same API as named and default exports', () => {
        const { default: _, ...named } = esm;
        expect(Object.keys(named)).toEqual(Object.keys(api));
        expect(Object.keys(CookieConsent)).toEqual(Object.keys(api));

        for (const key of Object.keys(api)) {
            expect(named[key]).toBe(api[key]);
            expect(CookieConsent[key]).toBe(api[key]);
        }
    });
});
