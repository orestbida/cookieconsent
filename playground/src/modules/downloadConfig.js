import { getById, addEvent, unquoteJson, onEvent, customEvents, highlightCode } from './utils';
import { getCurrentUserConfig, getState } from './stateManager';
import { saveAs } from 'file-saver';
import { fetchLatestRelease } from './fetchRelease';

/**
 * @type {HTMLAnchorElement}
 */
const downloadBtn = getById('downloadConfigBtn');

/**
 * @type {HTMLElement}
 */
const liveConfig = getById('live-config');

const customThemeNames = {
    'cc--dark-turquoise': 'Dark Turquoise',
    'cc--light-funky': 'Light Funky',
    'cc--elegant-black': 'Elegant Black'
};

const configAsString = async ({minify = false} = {}) => {
    const latest = await fetchLatestRelease();

    let scriptStr = `import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@${latest}/dist/cookieconsent.umd.js';\n\n`;

    const state = getState();
    const config = getCurrentUserConfig(state);
    const theme = state._theme;

    if (theme === 'cc--darkmode') {
        scriptStr += '// Enable dark mode\n';
        scriptStr += 'document.documentElement.classList.add(\'cc--darkmode\');\n\n';
    } else if (customThemeNames[theme]) {
        scriptStr += `// Enable the "${customThemeNames[theme]}" theme (copy its CSS from the playground into your stylesheet)\n`;
        scriptStr += `document.documentElement.classList.add('${theme}');\n\n`;
    }

    if (state._disableTransitions) {
        scriptStr += '// Animations are turned off with CSS; add this to your stylesheet:\n';
        scriptStr += '// #cc-main, #cc-main .cm, #cc-main .pm { --cc-modal-transition-duration: 0s; }\n\n';
    }

    /**
     * Config. as string
     */
    let configStr = JSON.stringify(config, minify ? undefined : null, minify ? undefined : 4);

    /**
     * Remove double quotes from keys
     */
    configStr = unquoteJson(configStr);

    /**
     * Append config.
     */
    scriptStr += `CookieConsent.run(${configStr});`;

    return scriptStr;
};

const updateLiveConfig = async () => {
    liveConfig.innerHTML = highlightCode(await configAsString());
};

onEvent(customEvents._PLAYGROUND_READY, updateLiveConfig);
onEvent(customEvents._UPDATE, updateLiveConfig);
onEvent(customEvents._RESET, updateLiveConfig);

addEvent(downloadBtn, 'click', async () => {
    const config = await configAsString();
    const blob = new Blob([config], {type: 'text/javascript;charset=utf-8'});
    saveAs(blob, 'cookieconsent-config.js');
});
