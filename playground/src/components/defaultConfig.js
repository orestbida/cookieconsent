/**
 * @type {import("vanilla-cookieconsent").CookieConsentConfig}
 */
const defaultConfig = {

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
                'another': {
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
            en: '/translations/en.json',
            it: '/translations/it.json',
            de: '/translations/de.json',
            es: '/translations/es.json',
            fr: '/translations/fr.json'
        }
    }
}

export default defaultConfig