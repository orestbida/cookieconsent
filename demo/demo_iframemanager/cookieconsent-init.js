// obtain iframemanager object
const manager = iframemanager();

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

CookieConsent.run({
    disablePageInteraction: true,

    cookie: {
        name: 'cc_cookie_demo3',

        /**
         * Dynamic expiresAfterDays value
         */
        expiresAfterDays: (acceptType) => {
            if(acceptType === 'all'){
                console.log('long duration!');
                return 365;
            }

            console.log("short duration!");
            return 90;
        }
    },

    guiOptions: {
        consentModal: {
            layout: 'cloud inline',
            position: 'bottom center',
            equalWeightButtons: true
        },
        preferencesModal: {
            layout: 'bar',
            position: 'right',
            equalWeightButtons: true
        }
    },

    onFirstConsent: ({cookie}) => {
        console.log('onFirstConsent fired',cookie);
    },

    onConsent: ({cookie}) => {
        console.log('onConsent fired!', cookie)
    },

    onChange: ({cookie, changedCategories, changedServices}) => {
        console.log('onChange fired!', changedCategories, changedServices);
    },

    onModalShow: ({modalName}) => {
        console.log('visible:', modalName);
    },

    onModalHide: ({modalName}) => {
        console.log('hidden:', modalName);
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
            },
            services: {
                IframeManager:{
                    onAccept: () => {
                        console.log("enabled iframemanager")
                        manager.acceptService('all');
                    },
                    onReject: () => {
                        console.log("disabled iframemanager")
                        manager.rejectService('all');
                    }
                }
            }
        }
    },

    language: {
        default: 'en',

        translations: {
            en: './en.json'
        }
    }
});