import '../assets/installationSection.scss';
import { getById, addEvent } from "./utils";
import { getState } from './stateManager';
import { saveAs } from 'file-saver';
import { enabledTranslation } from './translations';

/**
 * @type {HTMLAnchorElement}
 */
const downloadBtn = getById('downloadConfigBtn');
const pluginVersion = 'v3.0.0-rc.13';

const configAsString = ({minify=false} = {}) => {

    let scriptStr = `import { run } from 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@${pluginVersion}/dist/cookieconsent.esm.js';\n\n`;

    const state = getState();
    const config = state._cookieConsentConfig;
    const allTranslations = config.language.translations;
    const darkModeEnabled = state._theme === 'cc--darkmode';

    if(darkModeEnabled) {
        scriptStr += `// Enable dark mode\n`;
        scriptStr += `document.documentElement.classList.add('cc--darkmode');\n\n`;
    }

    /**
     * Remove unneeded fields
     */
    config.root = undefined;
    config.cookie = undefined;
    config.categories.analytics.services = undefined;

    if(!config.disablePageInteraction)
        config.disablePageInteraction = undefined;

    /**
     * Remove all translations except those specified by the user
     */
    for(const languageCode in allTranslations) {
        if(!enabledTranslation(languageCode, state))
            allTranslations[languageCode] = undefined;
    }

    /**
     * config. as string
     */
    const configStr = minify
        ? JSON.stringify(config)
        : JSON.stringify(config, null, 4);

    /**
     * Append config.
     */
    scriptStr += `run(${configStr});`;

    return scriptStr;
}

addEvent(downloadBtn, 'click', () => {

    const config = configAsString();

    const blob = new Blob([config], {type: 'text/javascript;charset=utf-8'});
    saveAs(blob, 'cookieconsent-config.js');
});