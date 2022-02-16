var LOREM_IPSUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

// obtain iframemanager object
var manager = iframemanager();

// obtain cookieconsent plugin
var cc = initCookieConsent();

// Configure with youtube embed
manager.run({
    currLang: 'en',
    services : {
        youtube : {
            embedUrl: 'https://www.youtube-nocookie.com/embed/{data-id}',
            thumbnailUrl: 'https://i3.ytimg.com/vi/{data-id}/hqdefault.jpg',
            iframe : {
                allow : 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen;',
            },
            cookie : {
                name : 'cc_youtube'
            },
            languages : {
                en : {
                    notice: 'This content is hosted by a third party. By showing the external content you accept the <a rel="noreferrer" href="https://www.youtube.com/t/terms" title="Terms and conditions" target="_blank">terms and conditions</a> of youtube.com.',
                    loadBtn: 'Load video',
                    loadAllBtn: 'Don\'t ask again'
                }
            }
        }
    }
});

// run plugin with config object
cc.run({
    current_lang: 'en',
    autoclear_cookies: true,                    // default: false
    cookie_name: 'cc_cookie_demo2',             // default: 'cc_cookie'
    cookie_expiration: 365,                     // default: 182
    // page_scripts: false,                         // default: false
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

    onAccept: function(){
        console.log('onAccept fired!')

        // If analytics category is disabled => load all iframes automatically
        if(cc.allowedCategory('analytics')){
            console.log('iframemanager: loading all iframes');
            manager.acceptService('all');
        }
    },

    onChange: function (cookie, changed_preferences) {
        console.log('onChange fired!');

        // If analytics category is disabled => ask for permission to load iframes
        if(!cc.allowedCategory('analytics')){
            console.log('iframemanager: disabling all iframes');
            manager.rejectService('all');
        }else{
            console.log('iframemanager: loading all iframes');
            manager.acceptService('all');
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
                                col1: 'cc_youtube',
                                col2: 'yourdomain.com',
                                col3: 'Cookie set by iframemanager'
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