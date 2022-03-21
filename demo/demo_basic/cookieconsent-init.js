// obtain cookieconsent plugin
var cc = CookieConsent.init();

// run plugin with config object
cc.run({
    cookie: {
        name: 'cc_cookie_demo1',
    },

    guiOptions: {
        consentModal: {
            layout: 'box',                      // box,cloud,bar
            position: 'bottom right',           // bottom,middle,top + left,right,center
            transition: 'slide'                 // zoom,slide
        },
        preferencesModal: {
            layout: 'box',                      // box,bar
            // position: 'left',                // right,left (available only if bar layout selected)
            transition: 'slide'                 // zoom,slide
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
                    description: 'Our website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#privacy-policy" class="cc-link">Privacy policy</a>',
                    acceptAllBtn: 'Accept',
                    acceptNecessaryBtn: 'Reject'
                },
                preferencesModal: {
                    title: 'Demo preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save preferences',
                    sections: [
                        {
                            title: 'Cookie usage 📢',
                            description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc-link">privacy policy</a>.'
                        }, {
                            title: 'Strictly necessary cookies',
                            description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                            linkedCategory: 'necessary'
                        }, {
                            title: 'Performance and Analytics cookies',
                            description: 'These cookies allow the website to remember the choices you have made in the past',
                            linkedCategory: 'analytics'
                        }, {
                            title: 'More information',
                            description: 'For any queries in relation to my policy on cookies and your choices, please <a class="cc-link" href="#yourdomain.com">contact me</a>.',
                        }
                    ]
                }
            }
        }
    }
});
