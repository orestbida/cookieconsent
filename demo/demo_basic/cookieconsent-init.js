// run plugin with config object
CookieConsent.run({
    disablePageInteraction: true,

    cookie: {
        name: 'cc_cookie_demo1',
    },

    guiOptions: {
        consentModal: {
            layout: 'box wide',
            position: 'bottom right',
            equalWeightButtons: false,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            position: 'left',
            equalWeightButtons: false,
            flipButtons: false
        }
    },

    onFirstConsent: function(){
        console.log('onFirstAction fired');
    },

    onConsent: function () {
        console.log('onConsent fired ...');
    },

    onChange: function () {
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
                    showPreferencesBtn: 'Manage preferences',
                    closeIconLabel: 'Close',
                    footer: '<a href="#link">Privacy Policy</a><a href="#link">Impressum</a>'
                },
                preferencesModal: {
                    title: 'Cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save preferences',
                    closeIconLabel: 'Close',
                    sections: [
                        {
                            description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc__link">privacy policy</a>.'
                        }, {
                            title: 'Strictly necessary cookies',
                            description: 'Description',
                            linkedCategory: 'necessary'
                        }, {
                            title: 'Performance and Analytics cookies',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Name',
                                    domain: 'Service',
                                    description: 'Description',
                                    expiration: 'Expiration'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: 'Google Analytics',
                                        description: 'Cookie set by <a href="#das">Google Analytics</a>.',
                                        expiration: 'Expires after 12 days'
                                    },
                                    {
                                        name: '_gid',
                                        domain: 'Google Analytics',
                                        description: 'Cookie set by <a href="#das">Google Analytics</a>',
                                        expiration: 'Session'
                                    }
                                ]
                            }
                        }, {
                            title: 'More information',
                            description: 'For any queries in relation to my policy on cookies and your choices, please <a class="cc__link" href="#yourdomain.com">contact me</a>.',
                        }
                    ]
                }
            }
        }
    }
});