import en from '../translations/en.json';
import de from '../translations/de.json';
import it from '../translations/it.json';
import es from '../translations/es.json';
import fr from '../translations/fr.json';
import { customEvents, onEvent } from './utils';

/**
 * WARNING: this object will be 
 * stored in localStorage;
 * do not declare functions,
 * regex ... (only primitive data)
 */

/**
 * @type {import("vanilla-cookieconsent").CookieConsentConfig}
 */
const defaultConfig = {
    root: '#app',

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
            enabled: true
        },
        analytics: {
            services: {
                'ga': {
                    label: `
                        <a
                            href="https://marketingplatform.google.com/about/analytics/terms/us/"
                            rel="noreferrer"
                            target="_blank">
                            Google Analytics 4
                        </a>
                    `
                },
                'clarity': {
                    label: 'Microsoft Clarity'
                },
                'another2': {
                    label: 'Yet another service'
                }
            }
        },
        ads: {}
    },

    language: {
        default: 'en',
        autoDetect: 'browser',

        translations: {
            en: en,
            it: it,
            de: de,
            es: es,
            fr: fr
        }
    }
};

onEvent(customEvents._ON_CONSENT, ({detail}) => {
    console.log('onConsent', detail);
});

onEvent(customEvents._ON_CHANGE, ({detail}) => {
    console.log('onChange', detail);
});

export default defaultConfig;