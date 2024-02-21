import { customEvents, onEvent } from './utils';

let latest = '';

const releaseSpans = document.querySelectorAll('[data-latest-release]');

onEvent(customEvents._PLAYGROUND_READY, async () => {
    await updateReleaseSpans();
});

/**
 * Get last published v3 release
 */
export async function fetchLatestRelease() {
    if (latest) {
        return latest;
    }

    const res = await fetch('https://raw.githubusercontent.com/orestbida/cookieconsent/master/package.json');

    /**
     * @type {import('../../package.json')}
     */
    const pkg = await res.json();

    return pkg.version;
}

/**
 * @param {string} release
 */
const getMinor = release => release?.slice(release.indexOf('.')) || '';

/**
 * Update all elements with "data-latest-release" attribute
 */
export async function updateReleaseSpans() {
    latest = await fetchLatestRelease();

    for (const el of releaseSpans) {
        el.textContent = el.hasAttribute('data-minor-release')
            ? getMinor(latest)
            : latest;
    }
}

/**
* @param {string} release
*/
function validRelease(release) {
    const isV3 = /^(v3.|3.)/.test(release);

    if (!isV3)
        return false;

    /**
     * Ignore releases that contain
     * one of the following keywords
     */
    const safeRelease = !['alpha', 'beta', 'test']
        .some(str => release.includes(str));

    return safeRelease;
}