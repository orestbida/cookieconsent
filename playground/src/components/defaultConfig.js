import en from '../translations/en.json'
import de from '../translations/de.json'
import it from '../translations/it.json'
import es from '../translations/es.json'
import fr from '../translations/fr.json'

/**
 * WARNING: this object is
 * will be stored in localStorage;
 * do not declare functions,
 * regex ... (only primitive data)
 */

/**
 * @type {import("vanilla-cookieconsent").CookieConsentConfig}
 */
const defaultConfig = {
    disablePageInteraction: true,

    cookie: {
        name: 'demoPlayground',
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
}

window.addEventListener('cc:onConsent', ({detail}) => {
    console.log('onConsent', detail)
})

window.addEventListener('cc:onChange', ({detail}) => {
    console.log('onChange', detail)
})

export default defaultConfig