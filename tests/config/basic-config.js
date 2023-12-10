/**
 * @type {import('../../src/core/global').UserConfig}
 */
const config = {
    mode: 'opt-out',

    cookie: {
        expiresAfterDays: () => 200
    },

    lazyHtmlGeneration: false,

    categories: {
        necessary: {
            enabled: true,
            readOnly: true
        },
        analytics: {
            enabled: true,
            readOnly: false,
            autoClear: {
                cookies: [
                    {
                        name: /^(_ga|_gid)/
                    }
                ]
            },
            services: {
                service1: {
                    label: 'Service 1',
                    onAccept: () => {
                        window.__service1Enabled = true;
                    },
                    onReject: () => {}
                },
                service2: {
                    label: 'Service 2',
                    onAccept: () => {},
                    onReject: () => {}
                }
            }
        },
        ads: {
            enabled: true,
            readOnly: false
        }
    },
    language: {
        default: 'it',
        autoDetect: 'document',

        translations: {
            it: require('./it.json')
        }
    }
}

export default config;