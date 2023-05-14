import en from '../translations/en.json';
import de from '../translations/de.json';
import it from '../translations/it.json';
import es from '../translations/es.json';
import fr from '../translations/fr.json';
import ar from '../translations/ar.json';

/**
 * WARNING: this object will be
 * stored in localStorage;
 * do not declare functions,
 * regex ... (only primitive data)
 */

/**
 * @type {import("../../../types").CookieConsentConfig}
 */
const defaultFullConfig = {
    root: 'main',

    cookie: {
        name: 'demoPlayground',
    },

    guiOptions: {
        consentModal: {
            layout: 'box',
            position: 'bottom left',
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            position: 'right',
            equalWeightButtons: true,
            flipButtons: false
        }
    },

    categories: {
        necessary: {
            readOnly: true,
        },
        functionality: {},
        analytics: {},
        marketing: {}
    },

    language: {
        default: 'en',
        autoDetect: 'browser',
        rtl: 'ar',

        translations: {
            en: en,
            it: it,
            de: de,
            es: es,
            fr: fr,
            ar: ar
        }
    }
};


/**
 * @type {typeof defaultFullConfig}
*/
const defaultConfig = deepCopy(defaultFullConfig);

function deepCopy(el) {

    if (typeof el !== 'object' )
        return el;

    if (el instanceof Date)
        return new Date(el.getTime());

    let clone = Array.isArray(el) ? [] : {};

    for (let key in el) {
        let value = el[key];

        clone[key] = deepCopy(value);
    }

    return clone;
};

export {
    defaultFullConfig,
    defaultConfig
}