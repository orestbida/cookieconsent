// obtain iframemanager object
var manager = iframemanager();

// obtain cookieconsent plugin
var cc = CookieConsent.init();

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

cc.run({
    disablePageInteraction: true,

    cookie: {
        name: 'cc_cookie_demo3',
        expiresAfterDays: function(acceptType){
            if(acceptType === 'all'){
                console.log('long duration!');
                return 640;
            }

            console.log("short duration!");
            return 0;
        }
    },

    guiOptions: {
        consentModal: {
            layout: 'cloud inline',
            position: 'bottom center',
        },
        preferencesModal: {
            layout: 'bar',
            position: 'right'
        }
    },

    onFirstConsent: function(){
        console.log('onFirstConsent fired');
    },

    onConsent: function(){
        console.log('onConsent fired!')
    },

    onChange: function () {
        console.log('onChange fired!');
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
                        manager.acceptService('all');
                    },
                    onReject: () => {
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