# Getting Started

This section will help you install CookieConsent in your app/website.


## Installation
You can download/import the plugin using one of the following methods:
<br>

1. Install via [NPM](https://www.npmjs.com/package/vanilla-cookieconsent).

    ::: code-group

    ```sh [npm]
    npm i vanilla-cookieconsent@v3.0.0
    ```

    ```sh [pnpm]
    pnpm add vanilla-cookieconsent@v3.0.0
    ```

    ```sh [yarn]
    yarn add vanilla-cookieconsent@v3.0.0
    ```

    :::

    Special thanks to [Till Sanders](https://github.com/tillsanders) for bringing the plugin on npm!

2. Use the CDN hosted version.

    stylesheet:
    ```
    https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.css
    ```

    script:
    ```
    https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.umd.js
    ```

3. Download the [latest release](https://github.com/orestbida/cookieconsent/releases?q=cookieconsent+v3) from github and use the optimized files located in the `dist` folder.


## Usage
Here are some of the most common setups to help you get up and running.

- [HTML](#html)
- [React](#react)
- [Vue](#vue)
- [Angular](#angular)

<br>

### HTML
Add the stylesheet in the head section. Create a new file — `cookieconsent-config.js` — and add it in the body section.
```html{4,8}
<html>
    <head>
        <!-- head content -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.css">
    </head>
    <body>
        <!-- body content -->
        <script type="module" src="cookieconsent-config.js"></script>
    </body>
</html>
```

Import and [configure](#configuration) the plugin inside `cookieconsent-config.js`:

```javascript{1}
import 'https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.umd.js';

CookieConsent.run({
    // your config. goes here (required)
});
```

### React
Import the plugin in your root/APP component, and [configure](#configuration) it inside the `useEffect` hook:
```javascript{3-4}
import { useEffect } from "react";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

export default function App() {

    useEffect(() => {
        CookieConsent.run({
            // your config. goes here (required)
        });
    }, []);

    // ...
}
```

### Vue

Create a new [Vue plugin](https://vuejs.org/guide/reusability/plugins.html): `CookieConsentVue.js`:

```javascript
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

export default {
    install: (app, pluginConfig) => {
        app.config.globalProperties.$CookieConsent = CookieConsent;
        app.config.globalProperties.$CookieConsent.run(pluginConfig);
    }
}
```

::: info
The newly created VUE Plugin will allow you to access CookieConsent from any component, using either `this.$CookieConsent` or `$CookieConsent`.
:::

"Register" the plugin in your root/APP component, inside `main.js`:
```javascript{5,9-11}
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import CookieConsentVue from 'path-to-CookieConsentVue.js'

createApp(App)
    .use(router),
    .use(CookieConsentVue, {
        // your config. goes here (required)
    })
    .mount('#app');
```

### Angular

Declare the `cookieconsent.css` style in the `angular.json` file:
```json{6}
{
    ...
        "build": {
            "options": {
                "styles": [
                    "node_modules/vanilla-cookieconsent/dist/cookieconsent.css"
                ]
            }
        }
    ...
}
```

Import the module in your angular component (generally `app.component.ts`):

```javascript{2,13-17}
import { Component, AfterViewInit } from '@angular/core';
import * as CookieConsent from 'vanilla-cookieconsent';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit{
    title = 'angular-javascript-demo';

    ngAfterViewInit(): void{
        CookieConsent.run({
            // your config. goes here (required)
        });
    }
}
```

Finally, [configure](#configuration) the plugin.

<br>

## Configuration

All configs. require the following 2 fields to be set up properly:

- [`categories`](/reference/configuration-reference.html#categories)
- [`language`](/reference/configuration-reference.html#language)

::: code-group

```javascript [Basic example]
/**
 * All config. options available here:
 * https://cookieconsent.orestbida.com/reference/configuration-reference.html
 */
CookieConsent.run({

    categories: {
        necessary: {
            enabled: true,  // this category is enabled by default
            readOnly: true  // this category cannot be disabled
        },
        analytics: {}
    },

    language: {
        default: 'en',
        translations: {
            en: {
                consentModal: {
                    title: 'We use cookies',
                    description: 'Cookie modal description',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    showPreferencesBtn: 'Manage Individual preferences'
                },
                preferencesModal: {
                    title: 'Manage cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Accept current selection',
                    closeIconLabel: 'Close modal',
                    sections: [
                        {
                            title: 'Somebody said ... cookies?',
                            description: 'I want one!'
                        },
                        {
                            title: 'Strictly Necessary cookies',
                            description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',

                            //this field will generate a toggle linked to the 'necessary' category
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Performance and Analytics',
                            description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                            linkedCategory: 'analytics'
                        },
                        {
                            title: 'More information',
                            description: 'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>'
                        }
                    ]
                }
            }
        }
    }
});
```

```javascript [Fully featured example]
/**
 * All config. options available here:
 * https://cookieconsent.orestbida.com/reference/configuration-reference.html
 */
CookieConsent.run({

    // root: 'body',
    // autoShow: true,
    // disablePageInteraction: true,
    // hideFromBots: true,
    // mode: 'opt-in',
    // revision: 0,

    cookie: {
        name: 'cc_cookie',
        // domain: location.hostname,
        // path: '/',
        // sameSite: "Lax",
        // expiresAfterDays: 365,
    },

    // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
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
            enabled: true,  // this category is enabled by default
            readOnly: true  // this category cannot be disabled
        },
        analytics: {
            autoClear: {
                cookies: [
                    {
                        name: /^_ga/,   // regex: match all cookies starting with '_ga'
                    },
                    {
                        name: '_gid',   // string: exact cookie name
                    }
                ]
            },

            // https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
            services: {
                ga: {
                    label: 'Google Analytics',
                    onAccept: () => {},
                    onReject: () => {}
                },
                youtube: {
                    label: 'Youtube Embed',
                    onAccept: () => {},
                    onReject: () => {}
                },
            }
        },
        ads: {}
    },

    language: {
        default: 'en',
        translations: {
            en: {
                consentModal: {
                    title: 'We use cookies',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    showPreferencesBtn: 'Manage Individual preferences',
                    // closeIconLabel: 'Reject all and close modal',
                    footer: `
                        <a href="#path-to-impressum.html" target="_blank">Impressum</a>
                        <a href="#path-to-privacy-policy.html" target="_blank">Privacy Policy</a>
                    `,
                },
                preferencesModal: {
                    title: 'Manage cookie preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Accept current selection',
                    closeIconLabel: 'Close modal',
                    serviceCounterLabel: 'Service|Services',
                    sections: [
                        {
                            title: 'Your Privacy Choices',
                            description: `In this panel you can express some preferences related to the processing of your personal information. You may review and change expressed choices at any time by resurfacing this panel via the provided link. To deny your consent to the specific processing activities described below, switch the toggles to off or use the “Reject all” button and confirm you want to save your choices.`,
                        },
                        {
                            title: 'Strictly Necessary',
                            description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',

                            //this field will generate a toggle linked to the 'necessary' category
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Performance and Analytics',
                            description: 'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                caption: 'Cookie table',
                                headers: {
                                    name: 'Cookie',
                                    domain: 'Domain',
                                    desc: 'Description'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: location.hostname,
                                        desc: 'Description 1',
                                    },
                                    {
                                        name: '_gid',
                                        domain: location.hostname,
                                        desc: 'Description 2',
                                    }
                                ]
                            }
                        },
                        {
                            title: 'Targeting and Advertising',
                            description: 'These cookies are used to make advertising messages more relevant to you and your interests. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.',
                            linkedCategory: 'ads',
                        },
                        {
                            title: 'More information',
                            description: 'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>'
                        }
                    ]
                }
            }
        }
    }
});
```
:::

You should now see the consent modal pop up!

::: tip
You can also define [external translation files](/advanced/language-configuration.html#external-translations).
:::

If you're having trouble setting up the plugin, you can check out a few [demo examples](https://github.com/orestbida/cookieconsent/tree/master/demo) on github.

<br>

## How to open the preferences modal
You can open the preferences modal using a `button` with the following [`data-cc`](/advanced/custom-attribute) attribute:

```html
<button type="button" data-cc="show-preferencesModal">Manage cookie preferences</button>
```

## How to block scripts/cookies
Showing the consent banner is not enough for you to be compliant with the GDPR. You also need to block all scripts/cookies until the user gives their consent.

Go to the [scripts management](/advanced/manage-scripts.html) section for more details.