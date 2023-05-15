import { customEvents, onEvent } from "./utils";

let latest = '';

const releaseSpans = document.querySelectorAll('[data-latest-release]');

onEvent(customEvents._PLAYGROUND_READY, async () => {
    await updateReleaseSpans();
});

/**
 * Get last published v3 release
 */
export async function fetchLatestRelease() {

    if(latest)
        return latest;

    const res = await fetch('https://api.github.com/repos/orestbida/cookieconsent/tags');
    const tags = await res.json();

    latest = tags.filter(tag => validRelease(tag.name))[0].name;

    return latest;
}

/**
 * Update all elements with "data-latest-release" attribute
 */
export async function updateReleaseSpans(state) {

    latest ||= await fetchLatestRelease();

    for(const el of releaseSpans) {
        el.textContent = latest;
    }
}

/**
* @param {string} release
*/
function validRelease(release) {

    const isV3 = /^(v3.|3.)/.test(release);

    if(!isV3)
        return false;

    /**
     * Ignore releases that contain
     * one of the following keywords
     */
    const safeRelease = !['alpha', 'beta', 'test']
        .some(str => release.includes(str));

    return safeRelease;
}