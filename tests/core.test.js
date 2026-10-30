import fs from 'fs';
import os from 'os';
import path from 'path';

const guiBlocks = /\/\/{{START: GUI}}[\s\S]*?\/\/{{END: GUI}}/g;

/**
 * Replicate the "core" build: copy src without the GUI blocks
 * @param {string} src
 * @param {string} dest
 */
const copyWithoutGui = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory())
            copyWithoutGui(srcPath, destPath);
        else if (entry.name.endsWith('.js'))
            fs.writeFileSync(destPath, fs.readFileSync(srcPath, 'utf8').replaceAll(guiBlocks, ''));
    }
};

describe('Core version (without GUI)', () => {
    const coreDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-core-'));

    /**
     * @type {import("../src/core/global").Api}
     */
    let api;

    beforeAll(() => {
        copyWithoutGui(path.join(__dirname, '../src'), coreDir);
        api = require(path.join(coreDir, 'index.js'));
    })

    afterEach(() => {
        api.reset(true);
    })

    afterAll(() => {
        fs.rmSync(coreDir, { recursive: true, force: true });
    })

    it('Should run and accept categories', async () => {
        await api.run({
            categories: {
                necessary: { readOnly: true },
                analytics: {
                    services: {
                        ga: {}
                    }
                }
            }
        });

        expect(api.validConsent()).toBe(false);

        api.acceptCategory('analytics');
        expect(api.acceptedCategory('analytics')).toBe(true);
        expect(api.acceptedService('ga', 'analytics')).toBe(true);
    })
})
