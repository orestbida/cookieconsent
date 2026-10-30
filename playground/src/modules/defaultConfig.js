import * as translations from '../translations/translations'
import { deepCopy } from './utils';

/**
 * WARNING: this object will be
 * stored in localStorage;
 * do not declare functions,
 * regex ... (only primitive data)
 */

/**
 * @type {import("../../../types").CookieConsentConfig}
 */
export const defaultFullConfig = {
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

        translations: {...translations}
    }
};


/**
 * @type {typeof defaultFullConfig}
*/
export const defaultConfig = deepCopy(defaultFullConfig);