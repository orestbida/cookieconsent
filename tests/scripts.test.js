import * as CookieConsent from "../src/index"
import { globalObj } from "../src/core/global";
import testConfig from "./config/full-config";

/**
 * @type {import("../src/core/global").Api}
 */
let api;

describe("Script management", () => {

    beforeAll(() => {
        api = CookieConsent;
    })

    afterEach(() => {
        api.reset(true);
    })

    it('Should revive and mark as executed an inline script matching an accepted category', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics">window.__ranInline = true;</script>
        `;
        await api.run(testConfig);
        api.acceptCategory('analytics');

        expect(globalObj._state._allScriptTags[0]._executed).toBe(true);
        expect(document.querySelector('script[data-category]')).toBeNull();
    })

    it('Should not revive an already-executed script again when its category is re-accepted', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics"></script>
        `;
        await api.run(testConfig);
        api.acceptCategory('analytics');

        const revivedScript = document.querySelector('script');
        api.acceptCategory('analytics');

        expect(document.querySelectorAll('script').length).toBe(1);
        expect(document.querySelector('script')).toBe(revivedScript);
    })

    it('Should load external scripts sequentially, only reviving the next one once the previous one loads', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics" src="https://example.com/a.js"></script>
            <script type="text/plain" data-category="analytics" src="https://example.com/b.js"></script>
        `;
        await api.run(testConfig);
        api.acceptCategory('analytics');

        const firstScript = document.querySelector('script[src="https://example.com/a.js"]');
        expect(firstScript).not.toBeNull();
        expect(firstScript.hasAttribute('data-category')).toBe(false);

        // second script must still be "sleeping" until the first one's onload fires
        expect(document.querySelector('script[data-category][src="https://example.com/b.js"]')).not.toBeNull();

        firstScript.onload();
        await new Promise((resolve) => setTimeout(resolve));

        const secondScript = document.querySelector('script[src="https://example.com/b.js"]');
        expect(secondScript.hasAttribute('data-category')).toBe(false);
    })

    it('Should revive the next external script even when the previous one errors out', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics" src="https://example.com/a.js"></script>
            <script type="text/plain" data-category="analytics" src="https://example.com/b.js"></script>
        `;
        await api.run(testConfig);
        api.acceptCategory('analytics');

        const firstScript = document.querySelector('script[src="https://example.com/a.js"]');
        firstScript.onerror();
        await new Promise((resolve) => setTimeout(resolve));

        const secondScript = document.querySelector('script[src="https://example.com/b.js"]');
        expect(secondScript.hasAttribute('data-category')).toBe(false);
    })

    it('Should only activate a service-specific script once its own service is accepted', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics" data-service="service1"></script>
        `;
        await api.run(testConfig);
        api.acceptService('service2', 'analytics');
        expect(document.querySelector('script[data-category]')).not.toBeNull();

        api.acceptService('service1', 'analytics');
        expect(document.querySelector('script[data-category]')).toBeNull();
    })

    it('Should revive a runOnDisable ("!category") script only once its category gets rejected', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="!analytics"></script>
        `;
        await api.run(testConfig);
        api.acceptCategory('analytics');
        expect(document.querySelector('script[data-category]')).not.toBeNull();

        api.acceptCategory([]);
        expect(document.querySelector('script[data-category]')).toBeNull();
    })

    it('Should not track scripts when manageScriptTags=false', async () => {
        document.body.innerHTML = `
            <script type="text/plain" data-category="analytics"></script>
        `;
        testConfig.manageScriptTags = false;
        await api.run(testConfig);

        expect(globalObj._state._allScriptTags.length).toBe(0);

        testConfig.manageScriptTags = true;
    })
})
