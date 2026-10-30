import { customEvents, onEvent } from './utils';
import { version } from '../../../package.json';

let latest = '';

/**
 * @type {Promise<string>}
 */
let latestRelease = null;

const releaseSpans = document.querySelectorAll('[data-latest-release]');

onEvent(customEvents._PLAYGROUND_READY, async () => {
    await updateReleaseSpans();
});

/**
 * Get last published v3 release
 */
export function fetchLatestRelease() {
    if (!latestRelease)
        latestRelease = getLatestRelease();

    return latestRelease;
}

async function getLatestRelease() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/orestbida/cookieconsent/master/package.json');

        /**
         * @type {import('../../package.json')}
         */
        const pkg = await res.json();

        return pkg.version || version;
    } catch (e) {
        return version;
    }
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