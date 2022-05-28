# Getting Started

This section will help you install CookieConsent in your app/website.


## Installation
You can download/import the plugin using one of the following methods:
<br>

1. Install via [NPM](https://www.npmjs.com/package/vanilla-cookieconsent).
    ```shell
    npm i vanilla-cookieconsent
    yarn add vanilla-cookieconsent
    ```

    Special thanks to [Till Sanders](https://github.com/tillsanders) for bringing the plugin on npm!

2. Use the CDN hosted version.
    ```
    https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.js
    https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.css
    ```
3. Download the [latest release](https://github.com/orestbida/cookieconsent/releases/latest) from github and use the optimized files located in the `dist` folder.


## Usage
Here are some of the most common setups to help you get up and running.

### Vanilla JS
Import `cookieconsent.css` and `cookieconsent.js` files respectively in the head and body section. Create a new file — `cookieconsent-init.js` — and import it in the body section.
```html{9,13-14}
<html>
    <head>
        <!-- head content -->

        <!-- Typical CSS loading -->
        <!-- <link rel="stylesheet" href="path-to-cookieconsent.css"> -->

        <!-- Deferred CSS loading (recommended) -->
        <link rel="stylesheet" href="path-to-cookieconsent.css" media="print" onload="this.media='all'">
    </head>
    <body>
        <!-- body content -->
        <script defer src="path-to-cookieconsent.js"></script>
        <script defer src="path-to-cookieconsent-init.js"></script>
    </body>
</html>
```

<CustomBlock type="warning" title="Note">

Replace `path-to-cookieconsent.js`, `path-to-cookieconsent.css` and `path-to-cookieconsent-init.js` with valid paths.

</CustomBlock>


[Configure](#configuration) the plugin inside `cookieconsent-init.js`:
```javascript
const cc = CookieConsent.init();

cc.run({
    // your config. goes here (required)
});
```

### React
Assuming that you have installed the plugin via NPM, you can import it as follows:
```javascript{3-4}
import { useEffect } from "react";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import CookieConsent from "vanilla-cookieconsent";
```

[Configure](#configuration) the plugin inside the `useEffect` hook:

```javascript
export default function App() {

    useEffect(() => {
        const cc = CookieConsent.init();

        cc.run({
            // your config. goes here (required)
        });
    }, []);

    // ...
}
```

### Vue

The simplest way to integrate CookieConsent in a VUE App is by importing the `ESM` module located in the `/dist/esm/` directory.

Create a new [VUE Plugin](https://vuejs.org/essential/reusability/plugins.html), `CookieConsentVue.js`:
```javascript
import "vanilla-cookieconsent/dist/cookieconsent.css";
import CookieConsent from "vanilla-cookieconsent/dist/esm/cookieconsent.js"

export default {
    install: (app, pluginConfig) => {
        app.config.globalProperties.$cc = CookieConsent.init();
        app.config.globalProperties.$cc.run(pluginConfig);
    }
}
```

<CustomBlock type="info" title="Info">

The newly created VUE Plugin will allow you to access CookieConsent from any component, using either `this.$cc` or `$cc`.

</CustomBlock>

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
Finally, [Configure](#configuration) the plugin.

<br>

## Configuration
The most basic configuration requires the definition of the following 2 fields:

- `categories`
- `language`

* **Example** <br>

    In this example we have have defined 2 categories ("necessary", "analytics") — and the `en` language.

    ```javascript
    {

        onConsent: function () {
            // consent was given
        },

        onChange: function () {
            // user changed his/her preferences
        },

        categories: {
            necessary: {
                enabled: true,  // this category is enabled by default
                readOnly: true  // this category cannot be disabled
            },
            analytics: {
                enabled: false,
                readOnly: false,

                // Delete specific cookies when the user opts-out of this category
                autoClear: {
                    cookies: [
                        {
                            name: /^_ga/,   // regex: match all cookies starting with '_ga'
                        },
                        {
                            name: '_gid',   // string: exact cookie name
                        }
                    ]
                }
            }
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
    }
    ```

You should now see the consent modal pop up!

<CustomBlock type="tip" title="Tip">
You can also define [external translation files](/advanced/language-configuration.html#external-translations).

</CustomBlock>

If you're having trouble setting up the plugin, you can check out a few [demo examples](https://github.com/orestbida/cookieconsent/tree/master/demo) on github.

<br>


## Manage scripts/cookies
You can block any `script` tag by simply adding the following 2 attributes:

- `type="text/plain"` disables the script
- `data-cookiecategory="category-name"` enables the script if the specified category is accepted

Before:
```html
<script src="external.js"></script>

<script>
    console.log("Hi i'm an inline script!");
</script>
```

After:
```html
<script src="external.js" type="text/plain" data-cookiecategory="analytics"></script>

<script type="text/plain" data-cookiecategory="analytics">
    console.log("Hi, I'm an inline script!");
</script>
```

You can also use [callbacks or custom events](/advanced/callbacks-events) for more flexibility.

<br>

## Open preferences modal
The simplest way to open the preferences modal is by creating a `button` (or a link) with the following attribute:
- `data-cc="show-preferences"`

```html
<button type="button" data-cc="show-preferences">Manage cookie preferences</button>
```

Check out all the possible [data-cc](/advanced/custom-attribute)  values.