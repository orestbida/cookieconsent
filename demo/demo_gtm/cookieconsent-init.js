var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

CookieConsent.run({
    cookie: {
        name: 'cc_cookie_demo2',
    },

    guiOptions: {
        consentModal: {
            layout: 'box',                      // box,cloud,bar
            position: 'bottom right',           // bottom,middle,top + left,right,center
        },
        preferencesModal: {
            layout: 'box',                      // box,bar
            // position: 'left',                // right,left (available only if bar layout selected)
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

        // If analytics category is disabled => disable google analytics
        if (!cc.acceptedCategory('analytics')) {
            typeof gtag === 'function' && gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
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
        },
        ads: {}
    },

    language: {
        default: 'en',

        translations: {
            en: {
                consentModal: {
                    title: 'Hello traveller, it\'s cookie time!',
                    description: 'Our website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#privacy-policy" class="cc__link">Privacy policy</a>',
                    acceptAllBtn: 'Accept',
                    acceptNecessaryBtn: 'Reject',
                    showPreferencesBtn: 'Manage preferences'
                },
                preferencesModal: {
                    title: 'Cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save preferences',
                    sections: [
                        {
                            description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc__link">privacy policy</a>.'
                        }, {
                            title: 'Strictly necessary cookies',
                            description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                            linkedCategory: 'necessary'
                        }, {
                            title: 'Performance and Analytics cookies',
                            description: 'These cookies allow the website to remember the choices you have made in the past',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Cookie',
                                    domain: 'Domain',
                                    desc: 'Description'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: 'yourdomain.com',
                                        desc: 'description ...',
                                    },
                                    {
                                        name: '_gid',
                                        domain: 'yourdomain.com',
                                        desc: 'description ...',
                                    }
                                ]
                            }
                        }, {
                            title: 'Advertisement and Targeting cookies',
                            description: 'These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you',
                            linkedCategory: 'ads'
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