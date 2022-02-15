var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

// obtain cookieconsent plugin
var cc = initCookieConsent();

// run plugin with config object
cc.run({
    current_lang: 'en',
    autoclear_cookies: true,                    // default: false
    cookie_name: 'cc_cookie_demo2',             // default: 'cc_cookie'
    cookie_expiration: 365,                     // default: 182
    page_scripts: true,                         // default: false
    force_consent: true,                        // default: false

    // auto_language: null,                     // default: null; could also be 'browser' or 'document'
    // autorun: true,                           // default: true
    // delay: 0,                                // default: 0
    // hide_from_bots: false,                   // default: false
    // remove_cookie_tables: false              // default: false
    // cookie_domain: location.hostname,        // default: current domain
    // cookie_path: '/',                        // default: root
    // cookie_same_site: 'Lax',
    // use_rfc_cookie: false,                   // default: false
    // revision: 0,                             // default: 0

    gui_options: {
        consent_modal: {
            layout: 'cloud',                    // box,cloud,bar
            position: 'bottom center',          // bottom,middle,top + left,right,center
            transition: 'slide'                 // zoom,slide
        },
        settings_modal: {
            layout: 'bar',                      // box,bar
            position: 'left',                   // right,left (available only if bar layout selected)
            transition: 'slide'                 // zoom,slide
        }
    },

    onFirstAction: function(){
        console.log('onFirstAction fired');
    },

    onAccept: function (cookie) {
        console.log('onAccept fired!')
    },

    onChange: function (cookie, changed_preferences) {
        console.log('onChange fired!');

        // If analytics category is disabled => disable google analytics
        if (!cc.allowedCategory('analytics')) {
            typeof gtag === 'function' && gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    },

    languages: {
        'en': {
            consent_modal: {
                title: 'Hello traveller, it\'s cookie time!',
                description: 'Our website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#privacy-policy" class="cc-link">Privacy policy</a>',
                primary_btn: {
                    text: 'Accept all',
                    role: 'accept_all'      //'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text: 'Preferences',
                    role: 'settings'       //'settings' or 'accept_necessary'
                },
                revision_message: '<br><br> Dear user, terms and conditions have changed since the last time you visisted!'
            },
            settings_modal: {
                title: 'Cookie settings',
                save_settings_btn: 'Save current selection',
                accept_all_btn: 'Accept all',
                reject_all_btn: 'Reject all',
                close_btn_label: 'Close',
                cookie_table_headers: [
                    {col1: 'Name'},
                    {col2: 'Domain'},
                    {col3: 'Expiration'}
                ],
                blocks: [
                    {
                        title: 'Cookie usage',
                        description: LOREM_IPSUM + ' <a href="#" class="cc-link">Privacy Policy</a>.'
                    }, {
                        title: 'Strictly necessary cookies',
                        description: LOREM_IPSUM + LOREM_IPSUM + "<br><br>" + LOREM_IPSUM + LOREM_IPSUM,
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true  //cookie categories with readonly=true are all treated as "necessary cookies"
                        }
                    }, {
                        title: 'Analytics & Performance cookies',
                        description: LOREM_IPSUM,
                        toggle: {
                            value: 'analytics',
                            enabled: false,
                            readonly: false
                        },
                        cookie_table: [
                            {
                                col1: '^_ga',
                                col2: 'yourdomain.com',
                                col3: 'description ...',
                                is_regex: true
                            },
                            {
                                col1: '_gid',
                                col2: 'yourdomain.com',
                                col3: 'description ...',
                            },
                            {
                                col1: '_my_cookie',
                                col2: 'yourdomain.com',
                                col3: 'test cookie with custom path ...',
                                path: '/demo'       // needed for autoclear cookies
                            }
                        ]
                    }, {
                        title: 'Targeting & Advertising cookies',
                        description: 'If this category is deselected, <b>the page will reload when preferences are saved</b>... <br><br>(demo example with reload option enabled, for scripts like microsoft clarity which will re-set cookies and send beacons even after the cookies have been cleared by the cookieconsent\'s autoclear function)',
                        toggle: {
                            value: 'targeting',
                            enabled: false,
                            readonly: false,
                            reload: 'on_disable'            // New option in v2.4, check readme.md
                        },
                        cookie_table: [
                            {
                                col1: '^_cl',               // New option in v2.4: regex (microsoft clarity cookies)
                                col2: 'yourdomain.com',
                                col3: 'These cookies are set by microsoft clarity',
                                // path: '/',               // New option in v2.4
                                is_regex: true              // New option in v2.4
                            }
                        ]
                    }, {
                        title: 'More information',
                        description: LOREM_IPSUM + ' <a class="cc-link" href="https://orestbida.com/contact/">Contact me</a>.',
                    }
                ]
            }
        }
    }
});