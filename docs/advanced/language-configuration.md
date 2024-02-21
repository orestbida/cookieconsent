# Language Config

This section explains in detail how to create and handle multiple languages.

- `language`

The language object requires the definition of the following 2 fields:

- `language.default` default language
- `language.translations` object containing the text contents used to generate the modals

Check out the [language config.](/reference/configuration-reference.html#language) section for all the available options.

## External translations
The cleanest solution is to separate the translations from the plugin's configuration.

1. Create a new translation file, e.g. `en.json`:

    ::: details en.json
    ```json
    {
        "consentModal": {
            "title": "Consent Modal Title",
            "description": "Consent Modal Description",
            "acceptAllBtn": "Accept all",
            "acceptNecessaryBtn": "Reject all",
            "showPreferencesBtn": "Manage preferences"
        },
        "preferencesModal": {
            "title": "Cookie preferences",
            "acceptAllBtn": "Accept all",
            "acceptNecessaryBtn": "Reject all",
            "savePreferencesBtn": "Save preferences",
            "closeIconLabel": "Close",
            "sections": [
                {
                    "title": "Cookie usage",
                    "description": "We use cookies to ensure the basic functionalities of the website and to enhance your online experience ..."
                },
                {
                    "title": "Strictly necessary cookies",
                    "description": "These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly",
                    "linkedCategory": "necessary"
                },
                {
                    "title": "Performance and Analytics cookies",
                    "description": "These cookies allow the website to remember the choices you have made in the past",
                    "linkedCategory": "analytics",
                    "cookieTable": {
                        "headers": {
                            "name": "Name",
                            "domain": "Service",
                            "description": "Description",
                            "expiration": "Expiration"
                        },
                        "body": [
                            {
                                "name": "_ga",
                                "domain": "Google Analytics",
                                "description": "Cookie set by <a href=\"#das\">Google Analytics</a>.",
                                "expiration": "Expires after 12 days"
                            },
                            {
                                "name": "_gid",
                                "domain": "Google Analytics",
                                "description": "Cookie set by <a href=\"#das\">Google Analytics</a>",
                                "expiration": "Session"
                            }
                        ]
                    }
                },
                {
                    "title": "More information",
                    "description": "For any queries in relation to our policy on cookies and your choices, please <a class=\"cc-link\" href=\"#yourdomain.com\">contact us</a>."
                }
            ]
        }
    }
    ```
    :::

2. Configure the plugin for use with the external `en.json` translation:

    ```javascript
    CookieConsent.run({
        language: {
            default: 'en',
            translations: {
                'en': './en.json'
            }
        }
    });
    ```

    You can also use asynchronous functions to fetch the translation:
    ```javascript
    CookieConsent.run({
        language: {
            default: 'en',
            translations: {
                en: async () => {
                    const res = await fetch('path-to-json');
                    return await res.json();
                }
            }
        }
    });
    ```

You can set up multiple languages by following the same steps!

## Inline translations

An inline translation is easier to implement, but might also make the configuration harder to manage — especially if you have a lot of translations.

```javascript
CookieConsent.run({
    language: {
        default: 'en',
        translations: {
            'en': {
                consentModal: {
                    title: "Consent Modal Title",
                    description: "Consent Modal Description",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    showPreferencesBtn: "Manage preferences"
                },
                preferencesModal: {
                    title: "Cookie preferences",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    savePreferencesBtn: "Save preferences",
                    closeIconLabel: "Close",
                    sections: [
                        {
                            title: "Cookie usage",
                            description: "We use cookies to ensure the basic functionalities of the website and to enhance your online experience ..."
                        },
                        {
                            title: "Strictly necessary cookies",
                            description: "These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly",
                            linkedCategory: "necessary"
                        },
                        {
                            title: "Performance and Analytics cookies",
                            description: "These cookies allow the website to remember the choices you have made in the past",
                            linkedCategory: "analytics",
                            cookieTable: {
                                headers: {
                                    name: "Name",
                                    domain: "Service",
                                    description: "Description",
                                    expiration: "Expiration"
                                },
                                body: [
                                    {
                                        name: "_ga",
                                        domain: "Google Analytics",
                                        description: "Cookie set by <a href=\"#das\">Google Analytics</a>",
                                        expiration: "Expires after 12 days"
                                    },
                                    {
                                        name: "_gid",
                                        domain: "Google Analytics",
                                        description: "Cookie set by <a href=\"#das\">Google Analytics</a>",
                                        expiration: "Session"
                                    }
                                ]
                            }
                        },
                        {
                            title: "More information",
                            description: "For any queries in relation to our policy on cookies and your choices, please <a class=\"cc-link\" href=\"#yourdomain.com\">contact us</a>."
                        }
                    ]
                }
            }
        }
    }
});
```