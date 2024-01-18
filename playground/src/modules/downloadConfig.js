import { getById, addEvent, unquoteJson} from './utils';
import { getCurrentUserConfig, getState } from './stateManager';
import { saveAs } from 'file-saver';
import { fetchLatestRelease } from './fetchRelease';

/**
 * @type {HTMLAnchorElement}
 */
const downloadBtn = getById('downloadConfigBtn');

const configAsString = async ({minify = false} = {}) => {
    const latest = await fetchLatestRelease();

    let scriptStr = `import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@${latest}/dist/cookieconsent.umd.js';\n\n`;

    const state = getState();
    const config = getCurrentUserConfig(state);
    const darkModeEnabled = state._theme === 'cc--darkmode';

    if (darkModeEnabled) {
        scriptStr += '// Enable dark mode\n';
        scriptStr += 'document.documentElement.classList.add(\'cc--darkmode\');\n\n';
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

addEvent(downloadBtn, 'click', async () => {
    const config = await configAsString();
    const blob = new Blob([config], {type: 'text/javascript;charset=utf-8'});
    saveAs(blob, 'cookieconsent-config.js');
});