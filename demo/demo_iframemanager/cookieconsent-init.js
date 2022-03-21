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
            layout: 'cloud',                      // box,cloud,bar
            position: 'bottom',           // bottom,middle,top + left,right,center
            transition: 'slide'                 // zoom,slide
        },
        preferencesModal: {
            layout: 'bar',                      // box,bar
            position: 'right',                // right,left (available only if bar layout selected)
            transition: 'slide'                 // zoom,slide
        }
    },

    onFirstConsent: function(){
        console.log('onFirstConsent fired');
    },

    onConsent: function(){
        console.log('onConsent fired!')

        // If analytics category is disabled => load all iframes automatically
        if(cc.acceptedCategory('analytics')){
            console.log('iframemanager: loading all iframes');
            manager.acceptService('all');
        }
    },

    onChange: function () {
        console.log('onChange fired!');

        // If analytics category is disabled => ask for permission to load iframes
        if(!cc.acceptedCategory('analytics')){
            console.log('iframemanager: disabling all iframes');
            manager.rejectService('all');
        }else{
            console.log('iframemanager: loading all iframes');
            manager.acceptService('all');
        }
    },

    categories: {
        necessary: {
            readOnly: true,
            enabled: false
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
            en: './en.json'
        }
    }
});