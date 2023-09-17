import "../../dist/cookieconsent.umd.js";

/**
 * Enable suggestions
 * @type {import('../../types')}
 */
CookieConsent.run({

    cookie: {
        name: 'cc_cookie_demo1',
    },

    guiOptions: {
        consentModal: {
            layout: 'box inline',
            position: 'bottom right',
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            position: 'left',
            flipButtons: false
        }
    },

    onFirstConsent: () => {
        console.log('onFirstAction fired');
    },

    onConsent: () => {
        console.log('onConsent fired ...');
    },

    onChange: () => {
        console.log('onChange fired ...');
    },

    categories: {
        necessary: {
            readOnly: true,
            enabled: true
        },
        analytics: {
            autoClear: {
                cookies: [
                    {
                        name: /^(_ga|_gid)/
                    }
                ]
            }
        }
    },

    language: {
        default: 'en',

        translations: {
            en: {
                consentModal: {
                    title: 'Hello traveller, it\'s cookie time!',
                    description: 'Our website uses tracking cookies to understand how you interact with it. The tracking will be enabled only if you accept explicitly. <a href="#privacy-policy" data-cc="show-preferencesModal" class="cc__link">Manage preferences</a>',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    footer: `
                        <a href="#link">Privacy Policy</a>
                        <a href="#link">Impressum</a>
                    `
                },
                preferencesModal: {
                    title: 'Cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save preferences',
                    closeIconLabel: 'Close',
                    sections: [
                        {
                            title: 'Cookie usage',
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. For more details, refer to our <a href="#" class="cc__link">privacy policy</a>.'
                        }, {
                            title: 'Strictly necessary cookies',
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            linkedCategory: 'necessary'
                        }, {
                            title: 'Performance and analytics cookies',
                            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                            linkedCategory: 'analytics'
                        }, {
                            title: 'More information',
                            description: 'For any queries in relation to our policy on cookies and your choices, please <a class="cc__link" href="#yourdomain.com">contact me</a>.',
                        }
                    ]
                }
            }
        }
    }
});