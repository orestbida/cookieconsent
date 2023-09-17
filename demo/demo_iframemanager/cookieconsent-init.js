import "https://cdn.jsdelivr.net/gh/orestbida/iframemanager@1.2.5/dist/iframemanager.js";
import "../../dist/cookieconsent.umd.js";

const im = iframemanager();

im.run({

    onChange: ({ eventSource, changedServices }) => {
        if(eventSource.type === 'click'){
            CookieConsent.acceptService(
                [
                    ...CookieConsent.getUserPreferences().acceptedServices.analytics,
                    ...changedServices
                ],
                'analytics'
            );
        }
    },

    currLang: 'en',

    services : {
        youtube : {
            embedUrl: 'https://www.youtube-nocookie.com/embed/{data-id}',
            thumbnailUrl: 'https://i3.ytimg.com/vi/{data-id}/hqdefault.jpg',

            iframe : {
                allow : 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen;',
            },

            languages : {
                en : {
                    notice: 'This content is hosted by a third party. By showing the external content you accept the <a rel="noreferrer" href="https://www.youtube.com/t/terms" title="Terms and conditions" target="_blank">terms and conditions</a> of youtube.com.',
                    loadBtn: 'Load video',
                    loadAllBtn: 'Don\'t ask again'
                }
            }
        },

        vimeo: {
            embedUrl: 'https://player.vimeo.com/video/{data-id}',

            iframe: {
                allow : 'fullscreen; picture-in-picture;'
            },

            thumbnailUrl: async (dataId, setThumbnail) => {
                const url = `https://vimeo.com/api/v2/video/${dataId}.json`;
                const response = await (await fetch(url)).json();
                const thumbnailUrl = response && response[0].thumbnail_large;
                thumbnailUrl && setThumbnail(thumbnailUrl);
            },

            languages: {
                en : {
                    notice: 'This content is hosted by a third party. By showing the external content you accept the <a rel="noreferrer noopener" href="https://vimeo.com/terms" target="_blank">terms and conditions</a> of vimeo.com.',
                    loadBtn: 'Load once',
                    loadAllBtn: "Don't ask again"
                }
            }
        }
    }
});

/**
 * Enable suggestions
 * @type {import('../../types')}
 */
CookieConsent.run({

    cookie: {
        name: 'cc_cookie_demo3'
    },

    guiOptions: {
        consentModal: {
            layout: 'cloud inline',
            position: 'bottom center',
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            equalWeightButtons: true,
            flipButtons: false
        }
    },

    onFirstConsent: ({cookie}) => {
        console.log('onFirstConsent fired',cookie);
    },

    onConsent: ({cookie}) => {
        console.log('onConsent fired!', cookie)
    },

    onChange: ({changedCategories, changedServices}) => {
        console.log('onChange fired!', changedCategories, changedServices);
    },

    onModalReady: ({modalName}) => {
        console.log('ready:', modalName);
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
                        name: /^(_ga|_gid|im_)/
                    }
                ]
            },
            services: {
                youtube: {
                    label: 'Youtube Embed',
                    onAccept: () => im.acceptService('youtube'),
                    onReject: () => im.rejectService('youtube')
                },
                vimeo: {
                    label: 'Vimeo Embed',
                    onAccept: () => im.acceptService('vimeo'),
                    onReject: () => im.rejectService('vimeo')
                }
            }
        },
        ads: {}
    },

    language: {
        default: 'en',

        translations: {
            en: './en.json'
        }
    }
});