// obtain cookieconsent plugin
var cc = initCookieConsent();

// run plugin with config object
cc.run({
    current_lang: 'en',
    autoclear_cookies: true,                    // default: false
    theme_css: '../src/cookieconsent.css',
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

    /* End new options added in v2.4 */

    onAccept: function (cookie) {
        console.log('onAccept fired ...');
        disableBtn('btn2');
        disableBtn('btn3');

        // Delete line below
        document.getElementById('cookie_val') && (document.getElementById('cookie_val').innerHTML = JSON.stringify(cookie, null, 2));
    },

    onChange: function (cookie, changed_preferences) {
        console.log('onChange fired ...');

        // If analytics category's status was changed ...
        if (changed_preferences.indexOf('analytics') > -1) {

            // If analytics category is disabled ...
            if (!cc.allowedCategory('analytics')) {

                // Disable gtag ...
                console.log('disabling gtag')
                window.dataLayer = window.dataLayer || [];

                function gtag() {
                    dataLayer.push(arguments);
                }

                gtag('consent', 'default', {
                    'ad_storage': 'denied',
                    'analytics_storage': 'denied'
                });
            }
        }

        // Delete line below
        document.getElementById('cookie_val') && (document.getElementById('cookie_val').innerHTML = JSON.stringify(cookie, null, 2));
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
                        description: getLoremIpsum() + ' <a href="#" class="cc-link">Privacy Policy</a>.'
                    }, {
                        title: 'Strictly necessary cookies',
                        description: getLoremIpsum() + getLoremIpsum() + "<br><br>" + getLoremIpsum() + getLoremIpsum(),
                        toggle: {
                            value: 'necessary',
                            enabled: true,
                            readonly: true  //cookie categories with readonly=true are all treated as "necessary cookies"
                        }
                    }, {
                        title: 'Analytics & Performance cookies',
                        description: getLoremIpsum(),
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
                        description: getLoremIpsum() + ' <a class="cc-link" href="https://orestbida.com/contact/">Contact me</a>.',
                    }
                ]
            }
        }
    }
});


function getLoremIpsum() {
    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
}

// DELETE ALL CONTENT BELOW THIS COMMENT!!!
if (cc.validCookie('cc_cookie')) {
    //if cookie is set => disable buttons
    disableBtn('btn2');
    disableBtn('btn3');
}

function disableBtn(id) {
    document.getElementById(id).disabled = true;
    document.getElementById(id).className = 'styled_btn disabled';
}

var darkmode = false;

function toggleDarkmode() {
    if (!darkmode) {
        document.getElementById('theme').innerText = 'dark theme';
        document.body.className = 'd_mode c_darkmode';
        darkmode = true;
    } else {
        document.getElementById('theme').innerText = 'light theme';
        document.body.className = 'd_mode';
        darkmode = false;
    }
}

/*
* The following lines of code are for demo purposes (show api functions)
*/
if (document.addEventListener) {

    document.getElementById('btn2').addEventListener('click', function () {
        cc.show(0);
    });

    document.getElementById('btn3').addEventListener('click', function () {
        cc.hide();
    });

    document.getElementById('btn5').addEventListener('click', function () {
        cc.showSettings(0);
    });

    document.getElementById('btn6').addEventListener('click', function () {
        toggleDarkmode();
    });
} else {
    document.getElementById('btn2').attachEvent('onclick', function () {
        cc.show(0);
    });

    document.getElementById('btn3').attachEvent('onclick', function () {
        cc.hide();
    });

    document.getElementById('btn5').attachEvent('onclick', function () {
        cc.showSettings(0);
    });

    document.getElementById('btn6').attachEvent('onclick', function () {
        toggleDarkmode();
    });
}
