<h1 align="center" style="text-align: center;">Cookie Consent</h1>
<div align="center" style="text-align: center;">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Size](https://img.shields.io/github/size/orestbida/cookieconsent/dist/cookieconsent.js)
[![Stable version](https://img.shields.io/github/v/release/orestbida/cookieconsent)](https://github.com/orestbida/cookieconsent/releases)
</div>
<div align="center" style="text-align: center; max-width: 770px; margin: 0 auto;">

A __lightweight__ & __gdpr/ccpa compliant__ cookie consent plugin written in plain javascript.

</div>
<div style="padding-top: .6em;">

![Cookie Consent cover](demo/assets/cover.png)
![Cookie Consent cover](demo/assets/features.png)
</div>

## Table of contents
- [Key features](#key-features)
- [Installation & usage](#installation--usage)
- [How to block scripts](#how-to-blockmanage-scripts)
- [How to clear cookies](#how-to-clear-cookies)
- [Layout & customization](#layout-options--customization)
- [API](#api)
- [Callbacks](#available-callbacks)
- [Custom `data-cc` attribute](#custom-data-cc-attribute)
- [Configuration options](#configuration-options)
- [How to manage revisions](#how-to-manage-revisions)
- [How to share consent across subdomains](#how-to-share-consent-across-subdomains)
- [How to block iframes](#how-to-block-iframes)
- [FAQ](#faq)
- [License](#license)

## Key features
- __Lightweight__
- __Cross-browser__ support
- __Standalone__ (no external dependencies needed)
- __GDPR compliant__
- __CCPA compliant__
- __Support for multi language__
- __[WAI-ARIA](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics) compliant__

<br>

## Installation & Usage
1. Download the [latest release](https://github.com/orestbida/cookieconsent/releases/latest) or use via CDN/[NPM](https://www.npmjs.com/package/vanilla-cookieconsent)

    ```bash
    # CDN links
    https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v2.9.2/dist/cookieconsent.js
    https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v2.9.2/dist/cookieconsent.css
    ```

    Thanks to [Till Sanders](https://github.com/tillsanders) for bringing the plugin on npm!

    ```bash
    npm i vanilla-cookieconsent
    ```

1. Import the production version of the plugin (`dist` folder):
    ```html
    <html>
        <head>
            <!-- Load stylesheet -->
            <link rel="stylesheet" href="cookieconsent.css">
        </head>
        <body>
            <!-- Load script with the "defer" keyword -->
            <script defer src="cookieconsent.js"></script>
        </body>
    </html>
    ```

    If you're on React, check out the [FAQ](#faq) for more details or this live [Stackblitz](https://stackblitz.com/edit/nextjs-euxk9k?file=components%2FCookieConsentComponent.js) demo.

    If you're using VUE/Nuxt, check out this [example setup](https://github.com/orestbida/cookieconsent/issues/42#issuecomment-899387614).


3. Configure the plugin:

    Since there are no default settings, you must configure the (cookie) categories and at least one language! Example configurations:

    -   <details><summary>using an external script</summary>
        <p>

        - Create a `.js` file (e.g. `cookieconsent-init.js`) and import it in your html page

            ```html
            <body>
                <!-- Load script with the "defer" keyword -->
                <script defer src="cookieconsent.js"></script>
                <script defer src="cookieconsent-init.js"></script>
            <body>
            ```

        - Configure the plugin inside `cookieconsent-init.js`

            ```javascript
            // obtain plugin
            var cc = initCookieConsent();

            // run plugin with your configuration
            cc.run({
                current_lang: 'en',
                autoclear_cookies: true,                   // default: false
                page_scripts: true,                        // default: false

                // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
                // delay: 0,                               // default: 0
                // auto_language: null                     // default: null; could also be 'browser' or 'document'
                // autorun: true,                          // default: true
                // force_consent: false,                   // default: false
                // hide_from_bots: true,                   // default: true
                // remove_cookie_tables: false             // default: false
                // cookie_name: 'cc_cookie',               // default: 'cc_cookie'
                // cookie_expiration: 182,                 // default: 182 (days)
                // cookie_necessary_only_expiration: 182   // default: disabled
                // cookie_domain: location.hostname,       // default: current domain
                // cookie_path: '/',                       // default: root
                // cookie_same_site: 'Lax',                // default: 'Lax'
                // use_rfc_cookie: false,                  // default: false
                // revision: 0,                            // default: 0

                onFirstAction: function(user_preferences, cookie){
                    // callback triggered only once
                },

                onAccept: function (cookie) {
                    // ...
                },

                onChange: function (cookie, changed_preferences) {
                    // ...
                },

                languages: {
                    'en': {
                        consent_modal: {
                            title: 'We use cookies!',
                            description: 'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <button type="button" data-cc="c-settings" class="cc-link">Let me choose</button>',
                            primary_btn: {
                                text: 'Accept all',
                                role: 'accept_all'              // 'accept_selected' or 'accept_all'
                            },
                            secondary_btn: {
                                text: 'Reject all',
                                role: 'accept_necessary'        // 'settings' or 'accept_necessary'
                            }
                        },
                        settings_modal: {
                            title: 'Cookie preferences',
                            save_settings_btn: 'Save settings',
                            accept_all_btn: 'Accept all',
                            reject_all_btn: 'Reject all',
                            close_btn_label: 'Close',
                            cookie_table_headers: [
                                {col1: 'Name'},
                                {col2: 'Domain'},
                                {col3: 'Expiration'},
                                {col4: 'Description'}
                            ],
                            blocks: [
                                {
                                    title: 'Cookie usage 📢',
                                    description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc-link">privacy policy</a>.'
                                }, {
                                    title: 'Strictly necessary cookies',
                                    description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                                    toggle: {
                                        value: 'necessary',
                                        enabled: true,
                                        readonly: true          // cookie categories with readonly=true are all treated as "necessary cookies"
                                    }
                                }, {
                                    title: 'Performance and Analytics cookies',
                                    description: 'These cookies allow the website to remember the choices you have made in the past',
                                    toggle: {
                                        value: 'analytics',     // your cookie category
                                        enabled: false,
                                        readonly: false
                                    },
                                    cookie_table: [             // list of all expected cookies
                                        {
                                            col1: '^_ga',       // match all cookies starting with "_ga"
                                            col2: 'google.com',
                                            col3: '2 years',
                                            col4: 'description ...',
                                            is_regex: true
                                        },
                                        {
                                            col1: '_gid',
                                            col2: 'google.com',
                                            col3: '1 day',
                                            col4: 'description ...',
                                        }
                                    ]
                                }, {
                                    title: 'Advertisement and Targeting cookies',
                                    description: 'These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you',
                                    toggle: {
                                        value: 'targeting',
                                        enabled: false,
                                        readonly: false
                                    }
                                }, {
                                    title: 'More information',
                                    description: 'For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="#yourcontactpage">contact us</a>.',
                                }
                            ]
                        }
                    }
                }
            });
            ```
        </p>
        </details>
    -   <details><summary>using an inline script</summary>
        <p>

        ```html
        <body>
            <!-- Load script with the "defer" keyword -->
            <script defer src="cookieconsent.js"></script>

            <!-- Inline script -->
            <script>
                window.addEventListener('load', function(){

                    // obtain plugin
                    var cc = initCookieConsent();

                    // run plugin with your configuration
                    cc.run({
                        current_lang: 'en',
                        autoclear_cookies: true,                   // default: false
                        page_scripts: true,                        // default: false

                        // mode: 'opt-in'                          // default: 'opt-in'; value: 'opt-in' or 'opt-out'
                        // delay: 0,                               // default: 0
                        // auto_language: '',                      // default: null; could also be 'browser' or 'document'
                        // autorun: true,                          // default: true
                        // force_consent: false,                   // default: false
                        // hide_from_bots: true,                   // default: true
                        // remove_cookie_tables: false             // default: false
                        // cookie_name: 'cc_cookie',               // default: 'cc_cookie'
                        // cookie_expiration: 182,                 // default: 182 (days)
                        // cookie_necessary_only_expiration: 182   // default: disabled
                        // cookie_domain: location.hostname,       // default: current domain
                        // cookie_path: '/',                       // default: root
                        // cookie_same_site: 'Lax',                // default: 'Lax'
                        // use_rfc_cookie: false,                  // default: false
                        // revision: 0,                            // default: 0

                        onFirstAction: function(user_preferences, cookie){
                            // callback triggered only once on the first accept/reject action
                        },

                        onAccept: function (cookie) {
                            // callback triggered on the first accept/reject action, and after each page load
                        },

                        onChange: function (cookie, changed_categories) {
                            // callback triggered when user changes preferences after consent has already been given
                        },

                        languages: {
                            'en': {
                                consent_modal: {
                                    title: 'We use cookies!',
                                    description: 'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <button type="button" data-cc="c-settings" class="cc-link">Let me choose</button>',
                                    primary_btn: {
                                        text: 'Accept all',
                                        role: 'accept_all'              // 'accept_selected' or 'accept_all'
                                    },
                                    secondary_btn: {
                                        text: 'Reject all',
                                        role: 'accept_necessary'        // 'settings' or 'accept_necessary'
                                    }
                                },
                                settings_modal: {
                                    title: 'Cookie preferences',
                                    save_settings_btn: 'Save settings',
                                    accept_all_btn: 'Accept all',
                                    reject_all_btn: 'Reject all',
                                    close_btn_label: 'Close',
                                    // cookie_table_caption: 'Cookie list',
                                    cookie_table_headers: [
                                        {col1: 'Name'},
                                        {col2: 'Domain'},
                                        {col3: 'Expiration'},
                                        {col4: 'Description'}
                                    ],
                                    blocks: [
                                        {
                                            title: 'Cookie usage 📢',
                                            description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc-link">privacy policy</a>.'
                                        }, {
                                            title: 'Strictly necessary cookies',
                                            description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
                                            toggle: {
                                                value: 'necessary',
                                                enabled: true,
                                                readonly: true          // cookie categories with readonly=true are all treated as "necessary cookies"
                                            }
                                        }, {
                                            title: 'Performance and Analytics cookies',
                                            description: 'These cookies allow the website to remember the choices you have made in the past',
                                            toggle: {
                                                value: 'analytics',     // your cookie category
                                                enabled: false,
                                                readonly: false
                                            },
                                            cookie_table: [             // list of all expected cookies
                                                {
                                                    col1: '^_ga',       // match all cookies starting with "_ga"
                                                    col2: 'google.com',
                                                    col3: '2 years',
                                                    col4: 'description ...',
                                                    is_regex: true
                                                },
                                                {
                                                    col1: '_gid',
                                                    col2: 'google.com',
                                                    col3: '1 day',
                                                    col4: 'description ...',
                                                }
                                            ]
                                        }, {
                                            title: 'Advertisement and Targeting cookies',
                                            description: 'These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you',
                                            toggle: {
                                                value: 'targeting',
                                                enabled: false,
                                                readonly: false
                                            }
                                        }, {
                                            title: 'More information',
                                            description: 'For any queries in relation to our policy on cookies and your choices, please <a class="cc-link" href="#yourcontactpage">contact us</a>.',
                                        }
                                    ]
                                }
                            }
                        }
                    });
                });
            </script>
        <body>
        ```
      </p>
    </details>

4. Add a button/link to show the settings modal:
    ```html
    <button type="button" data-cc="c-settings">Manage cookie settings</button>
    ```
5. Now you must configure the scripts and cookies.
    * [How to block/manage script tags](#how-to-blockmanage-scripts)
    * [How to autoclear cookies](#how-to-clear-cookies)

<br>

## How to block/manage scripts
You can manage any script tag (inline or external).

1. Enable `page_scripts` option:

    ```javascript
    cc.run({
        // ...
        page_scripts: true
        // ...
    });
    ```
2. Set `type="text/plain"` and `data-cookiecategory="<category>"` to any `script` tag you want to manage:

    ```html
    <!-- External script -->
    <script
        type="text/plain"
        data-cookiecategory="analytics"
        src="analytics.js">
    </script>

    <!-- Inline script -->
    <script
        type="text/plain"
        data-cookiecategory="ads">
        console.log('"ads" category accepted');
    </script>
    ```

    You can also specify a custom type via the `data-type` attribute:
    ```html
    <script
        type="text/plain"
        data-type="module"
        data-cookiecategory="analytics"
        src="test.js">
    </script>
    ```

    Note: the `type="text/plain"` disables the script tag (required attribute)!

<br>

## How to clear cookies

You can configure the plugin so that it automatically clears existing cookies when a category is rejected/disabled.

Cookies must be listed manually as the plugin is not aware of them.

1. Enable the `autoclear_cookies` option:
    ```js
    cc.run({
        // ...
        autoclear_cookies: true,
        // ...
    });
    ```

2. Add the `settings_modal.cookie_table_headers` field:

    ```js
    cc.run({
        // ...
        autoclear_cookies: true,

        languages: {
            en: {
                // ...
                settings_modal: {
                    // ...
                    cookie_table_headers: [
                        {col1: 'Name'},
                        {col2: 'Service'},
                        {col3: 'Description'}
                    ]
                }
            }
        }
    });
    ```

3. Add the `cookie_table` field under the desired category block. A category block must contain the `toggle` object with a valid category name (`toggle.value`).

    ```js
    cc.run({
        // ...
        autoclear_cookies: true,
        // ...

        languages: {
            'en': {
                // ...
                settings_modal: {
                    // ...
                    cookie_table_headers: [
                        {col1: 'Name'},
                        {col2: 'Service'},
                        {col3: 'Description'}
                    ],
                    blocks: [
                        // ...
                        {
                            // ...
                            toggle: {
                                value: 'analytics'
                            },
                            cookie_table: [
                                {
                                    col1: '^_ga',
                                    col2: 'Google Analytics',
                                    col3: 'description ...',
                                    is_regex: true
                                },
                                {
                                    col1: '_gid',
                                    col2: 'Google Analytics',
                                    col3: 'description ...',
                                }
                            ]
                        }
                    ]
                }
            }
        }
    });
    ```

    **For the autoclear function to work, the _first_ column must contain the name of the cookie!**

    You can also specify 3 optional fields for each cookie item:
    * `is_regex`: boolean
    * `domain`: string
    * `path`: string

    The `is_regex` option is handy if you want to match multiple cookies without specifying them individually.

    ```javascript
    // Match all cookies starting with `'_ga'`
    {
        col1: '^_ga',
        is_regex: true
    }
    ```

    ```javascript
    // Match only the `'_ga'` cookie
    {
        col1: '_ga',
    }
    ```

    The domain `domain` option is useful when you are in a subdomain but you want to clear cookies set in the main domain:

    ```javascript
    {
        col1: '_ga',
        domain: 'example.com'   // main domain
    }
    ```

    [Full example](https://github.com/orestbida/cookieconsent/blob/9ad310e7edcac7bf23600ff0e23d42254d3fced2/demo/demo_iframemanager/cookieconsent-init.js#L139).

<br>

## Layout options & customization
You can choose a few layout options via `gui_options`.

```javascript
cc.run({
    // ...
    gui_options: {
        consent_modal: {
            layout: 'cloud',               // box/cloud/bar
            position: 'bottom center',     // bottom/middle/top + left/right/center
            transition: 'slide',           // zoom/slide
            swap_buttons: false            // enable to invert buttons
        },
        settings_modal: {
            layout: 'box',                 // box/bar
            position: 'left',              // left/right
            transition: 'slide'            // zoom/slide
        }
    }
    //...
});
```

### How to customize the color scheme

You can customize the color scheme using css variables, which you can find at the top of [cookieconsent.css](src/cookieconsent.css) file.

<br>

## API
Once you configure and run the plugin:

```javascript
const cc = initCookieConsent();

cc.run({
    // required config.
});
```

the following methods are available:

* cc`.show(delay?: number, createModal?: boolean)`
* cc`.hide()`
* cc`.showSettings(delay?: number)`
* cc`.hideSettings()`

<br>

- <details><summary>cc<code>.accept(&lt;accepted_categories&gt;, &lt;optional_rejected_categories&gt;)</code> [v2.5.0+]</summary>
    <p>

    - accepted_categories: `string` or `string[]`
    - rejected_categories: `string[]` - optional

    <br>

    Note: **all categories marked as `readonly` will ALWAYS be enabled/accepted regardless of the categories provided inside the `.accept()` API call.**

    Examples:

    ```javascript
    cc.accept('all');                // accept all categories
    cc.accept([]);                   // accept none (reject all)
    cc.accept('analytics');          // accept only analytics category
    cc.accept(['cat_1', 'cat_2']);   // accept only these 2 categories
    cc.accept();                     // accept all currently selected categories inside modal

    cc.accept('all', ['analytics']); // accept all except "analytics" category
    cc.accept('all', ['cat_1', 'cat_2']); // accept all except these 2 categories
    ```

    How to later reject a specific category (cookieconsent already accepted)? Same as above:

    ```javascript
    cc.accept('all', ['targeting']);     // opt out of targeting category
    ```
    </p>
    </details>
- <details><summary>cc<code>.allowedCategory(&lt;category_name&gt;)</code></summary>
    <p>

    <b>Note:</b> there are no default cookie categories, you create them!


    A cookie category corresponds to the string of the <code>value</code> property inside the <code>toggle</code> object:

    ```javascript
    // ...
    toggle: {
        value: 'analytics',      // cookie category
        enabled?: false,         // default status
        readonly?: false         // allow to enable/disable
        reload?: 'on_disable',   // allows to reload page when the current cookie category is deselected
    }
    // ...
    ```

    Example:
    ```javascript
    // Check if user accepts cookie consent with analytics category enabled
    if (cc.allowedCategory('analytics')) {
        // yoo, you might want to load analytics.js ...
    };
    ```
    </p>
    </details>
- <details><summary>cc<code>.validCookie(&lt;cookie_name&gt;)</code></summary>
    <p>

    If cookie exists and has non empty (<code>''</code>) value => return <code>true</code>, otherwise <code>false</code>.

    ```javascript
    // Example: check if '_gid' cookie is set
    if (!cc.validCookie('_gid')) {
        // yoo, _gid cookie is not set, do something ...
    };
    ```
    </p>
    </details>
- <details><summary>cc<code>.validConsent()</code></summary>
    <p>

    If consent is valid return <code>true</code>, otherwise <code>false</code>.

    ```javascript
    // Example: show modal if consent is not valid
    if (!cc.validConsent()) {
        cc.show();
    }
    ```
    </p>
    </details>
- <details><summary>cc<code>.eraseCookies(&lt;cookie_names&gt;, &lt;optional_path&gt;, &lt;optional_domains&gt;)</code> [v2.5.0+]</summary>
    <p>

    - cookie_names: `string[]`
    - path: `string` - optional
    - domains: `string[]` - optional

    <br>

    Examples:

    ```javascript
    cc.eraseCookies(['cc_cookies']);             // erase "cc_cookie" if it exists
    cc.eraseCookies(['cookie1', 'cookie2']);     // erase these 2 cookies

    cc.eraseCookies(['cc_cookie'], "/demo");
    cc.eraseCookies(['cc_cookie'], "/demo", [location.hostname]);
    ```
    </p>
    </details>
- <details><summary>cc<code>.loadScript(&lt;path&gt;, &lt;callback_function&gt;, &lt;optional_custom_attributes&gt;)</code></summary>
    <p>

    Basic example:

    ```javascript
    cc.loadScript('https://www.google-analytics.com/analytics.js', function(){
        // Script loaded, do something
    });
    ```
    How to load scripts with custom attributes:
    ```javascript
    cc.loadScript('https://www.google-analytics.com/analytics.js', function(){
        // Script loaded, do something
    }, [
        {name: 'id', value: 'ga_id'},
        {name: 'another-attribute', value: 'value'}
    ]);
    ```
    </p>
    </details>
- <details><summary>cc<code>.set(&lt;field&gt;, &lt;object&gt;)</code> [v2.6.0+]</summary>
    <p>

    The `.set()` method allows you to set the following values:
    - **data** (used to save custom data inside the plugin's cookie)
    - **revision**

    <br>

    How to save custom `data`:
    ```javascript
    // Set cookie's "data" field to whatever the value of the `value` prop. is
    cc.set('data', {value: {id: 21, country: "italy"}});

    // Only add/update the specified props.
    cc.set('data', {value: {id: 22, new_prop: 'new prop value'}, mode: 'update'});
    ```
    </p>
    </details>
- <details><summary>cc<code>.get(&lt;field&gt;)</code> [v2.6.0+]</summary>
    <p>

    The `.get()` method allows you to retrieve any of the fields inside the plugin's cookie:
    ```javascript
    cc.get('level');     // retrieve all accepted categories (if cookie exists)
    cc.get('data');      // retrieve custom data (if cookie exists)
    cc.get('revision');  // retrieve revision number (if cookie exists)
    ```
    </p>
    </details>
- <details><summary>cc<code>.getConfig(&lt;field&gt;)</code> [v2.7.0+]</summary>
    <p>

    The `.getConfig()` method allows you to read configuration options from the current instance:
    ```javascript
    cc.getConfig('current_lang');        // get currently used language
    cc.getConfig('cookie_expiration');   // get configured cookie expiration
    // ...
    ```
    </p>
    </details>
- <details><summary>cc<code>.getUserPreferences()</code> [v2.7.0+]</summary>
    <p>

    The `.getUserPreferences()` returns the following object (for analytics/logging purposes):
    ```javascript
    {
        accept_type: string,            // 'all', 'necessary', 'custom'
        accepted_categories: string[],  // e.g. ['necessary', 'analytics']
        rejected_categories: string[]   // e.g. ['ads']
    }
    ```
    </p>
    </details>
- <details><summary>cc<code>.updateScripts()</code> [v2.7.0+]</summary>
    <p>

    This method allows the plugin to manage dynamically added/injected scripts that have been loaded after the plugin's execution.

    E.g. dynamic content generated by server side languages like php, node, ruby ...
    </p>
    </details>
- <details><summary>cc<code>.updateLanguage(&lt;language&gt;, &lt;force_update&gt;)</code> [v2.8.0+]</summary>
    <p>

    Use this method to change modal's language dynamically (without page reload).

    - language: `string`
    - force_update: `boolean` - optional

    <br>

    Example:
    ```javascript
    cc.updateLanguage('it');
    ```

    Note: language will change only if it is valid (already defined) and different from the current language!

    <br>

    You can also forcefully update the modals (useful if you dynamically change the content of the modals). Example:
    ```javascript
    // Change content: e.g. modify modal title
    cc.getConfig('languages').en.consent_modal.title = 'New title';

    // Update changes
    cc.updateLanguage('en', true);
    ```

    </p>
    </details>

<br>

## Available callbacks

- <details><summary><code>onAccept</code></summary>
    <p>

    This function will be executed:
    - at the first moment that consent is given (just like `onFirstAction`)
    - after every page load, if consent (accept or "reject" action) has already been given

    <br>

    parameters:
    - `cookie`: contains the current value of the cookie

    <br>

    example:
    ```javascript
    //...
    cc.run({
        // ...
        onAccept: function(cookie){
            // load script, e.g. google analytics ...
        },
        // ...
    });
    ```
    </p>
    </details>
- <details><summary><code>onChange</code></summary>
    <p>

    This function will be executed (only if consent has already been given):
    - when user changes his preferences (accepts/rejects a cookie category)

    <br>

    parameters:
    - `cookie`: contains the current value of the cookie
    - `changed_categories`: array of categories whose state (accepted/rejected) just changed

    <br>

    example:
    ```javascript
    //...
    cc.run({
        // ...
        onChange: function(cookie, changed_categories){
            // cleanup logic ... (e.g. disable gtm if analytics category is disabled)
        },
        // ...
    });
    ```
    </p>
    </details>
- <details><summary><code>onFirstAction</code> [v2.7.0+]</summary>
    <p>

    This function will be executed only once, when the user takes the first action (accept/reject).

    parameters:
    - `user_preferences`: contains the same data provided by the `.getUserPreferences()` API
    - `cookie`: contains the current value of the cookie

    <br>

    example:
    ```javascript
    //...
    cc.run({
        // ...
        onFirstAction: function(user_preferences, cookie){
            console.log('User accept type:', user_preferences.accept_type);
            console.log('User accepted these categories', user_preferences.accepted_categories)
            console.log('User reject these categories:', user_preferences.rejected_categories);
        },
        // ...
    });
    ```
    </p>
    </details>

<br>

## Custom `data-cc` attribute
You can add the `data-cc` attribute to any element (typically a button) to perform a few actions without having to use code.

Valid values:
- `c-settings`: show settings modal
- `accept-all`: accept all categories
- `accept-necessary`: accept only categories marked as necessary/readonly (reject all)
- `accept-custom`: accept currently selected categories inside the settings modal

Example:
```html
<button type="button" data-cc="c-settings">Show cookie settings</button>
```
<br>

## Configuration options

Below a table which sums up all of the available options (must be passed to the .run() method).
| Option              	| Type     	| Default 	| Description                                                                                                                       |
|---------------------	|----------	|---------	|---------------------------------------------------------------------------------------------------------------------------------- |
| `autorun`           	| boolean  	| true    	| If enabled, show the cookie consent as soon as possible (otherwise you need to manually call the `.show()` method)                |
| `delay`             	| number   	| 0       	| Number of `milliseconds` before showing the consent-modal                                                                         |
| `mode`             	| string   	| 'opt-in'  |Accepted values: <br> - `opt-in`: scripts will not run unless consent is given (gdpr compliant) <br> - `opt-out`: scripts — that have categories set as `enabled` by default — will run without consent, until an explicit choice is made                                                 |
| `cookie_expiration` 	| number   	| 182     	| Number of days before the cookie expires (182 days = 6 months)                                                                    |
| `cookie_necessary_only_expiration` 	| number   	| -     	| Specify if you want to set a different number of days - before the cookie expires - when the user accepts only the necessary categories                                                |
| `cookie_path` 	    | string   	| "/"     	| Path where the cookie will be set                                                                                                 |
| `cookie_domain` 	    | string   	| location.hostname | Specify your domain (will be grabbed by default) or a subdomain                                                           |
| `cookie_same_site` 	| string   	| "Lax"     | SameSite attribute                                                           |
| `use_rfc_cookie` 	    | boolean   | false     | Enable if you want the value of the cookie to be rfc compliant                                            |
| `force_consent`       | boolean   | false     | Enable if you want to block page navigation until user action (Check out the [FAQ > Make consent required item](#faq) for a proper implementation) |
| `revision`            | number  	| 0   	    | Specify this option to enable revisions. [Check below](#how-to-enablemanage-revisions) for a proper usage |
| `current_lang`      	| string   	| -       	| Specify one of the languages you have defined (can also be dynamic): `'en'`, `'de'` ...                                           |
| `auto_language`     	| string  	| null  	| Language auto-detection strategy. Null to disable (default), `"browser"` to get user's browser language or `"document"` to read value from `<html lang="...">` of current page. If language is not defined => use specified `current_lang` |
| `autoclear_cookies` 	| boolean  	| false   	| Enable if you want to automatically delete cookies when user opts-out of a specific category inside cookie settings               |
| `page_scripts` 	    | boolean  	| false   	| Enable if you want to easily `manage existing <script>` tags. Check [manage third party scripts](#manage-third-party-scripts)     |
| `remove_cookie_tables`| boolean  	| false   	| Enable if you want to remove the html cookie tables (but still want to make use of `autoclear_cookies`)                           |
| `hide_from_bots`      | boolean  	| true    	| Disable if you want the plugin to run when a bot/crawler/webdriver is detected       |
| `gui_options`         | object  	| -   	    | Customization option which allows to choose layout, position	and transition. Check [layout options & customization](#layout-options--customization) |
| __`onAccept`__      	| function 	| -       	| Callback run on: <br>  1. the moment the cookie consent is accepted <br> 2. after each page load (if cookie consent has already been accepted) |
| __`onChange`__      	| function 	| -       	| Callback run **whenever preferences are modified** (and only if cookie consent has already been accepted)                             |
| __`onFirstAction`__   | function 	| -       	| Callback executed **once**, on the users first consent action.                                                  |
| `languages`      	    | object 	| -       	| Defined in [types.d.ts](https://github.com/orestbida/cookieconsent/blob/f83cacea7d3dfba22eb96910f03af0fea290f5a2/types/types.d.ts#L91-L94)

<br>

## How to manage revisions
Revisions can be enabled by setting a value different from `0` (default). If the saved revision number (stored in the cookie) is different from the current one, the consent modal will be shown.

1. Enable revisions by setting a `revision` number > 0:

    ```javascript
    cc.run({
        // ...,
        revision: 1,
        // ...
    })
    ```

2. You can optionally set a revision message. To do this, add the `revision_message` parameter inside `consent_modal`, and also place the following placeholder `{{revision_message}}` inside the `description` field:

    ```javascript
    cc.run({
        // ...,
        revision: 1,
        // ...,
        languages: {
            en: {
                consent_modal: {
                    // ...,
                    description: 'Usual description ... {{revision_message}}',
                    revision_message: '<br> Dude, my terms have changed. Sorry for bothering you again!',
                    // ...
                },
                // ...
            }
        }
        // ...
    })
    ```

<br>

## How to share consent across subdomains

If your main domain and subdomain share the same cookieconsent configuration, you can also share the consent by pointing all configurations to the same cookie (using the main domain).

In the plugin's config. simply specify the main domain in the `cookie_domain` option:

```js
var cc = initCookieConsent();

cc.run({
    // ...
    cookie_domain: 'domain.com'
});
```

E.g. if your main domain is `"loremipsum.com"` or `"www.loremipsum.com"`, you have to put `"loremipsum.com"`.

<br>

## How to block iframes

CookieConsent does not have any built-in functionality to block iframes. You can however use [iframemanager](https://github.com/orestbida/iframemanager) which was specifically designed for this task.

<br>

## FAQ
-   <details><summary>How to enable dark mode</summary>
    <p>

    Either manually add the following class `c_darkmode` to the body/html tag, or toggle it via javascript:
    ```javascript
    document.body.classList.toggle('c_darkmode');
    ```

    </p>
    </details>
-   <details><summary>How to add link/button to open cookie settings</summary>
    <p>

    Create a button (or link) with `data-cc="c-settings"` attribute:
    ```javascript
    <button type="button" data-cc="c-settings">Cookie Settings</button>
    ```

    </p>
    </details>
-   <details><summary>How to integrate with a multi-language website</summary>
    <p>

    If you have multiple versions of your html page, each with a different &lt;html <b>lang="..."</b> &gt; attribute, you can grab this value using:

    ```javascript
    document.documentElement.getAttribute('lang');
    ```

    and then set it as `current_lang` value like this:

    ```javascript
    cc.run({
        // ...
        current_lang: document.documentElement.getAttribute('lang'),
        // ...
    });
    ```

    **Note**: make sure that the lang attribute's value format (example: 'en' => 2 characters) is identical to the ones you defined. If you have 'en-US' as lang attribute, make sure to also specify 'en-US' (and not just 'en') in the config. parameters.

    </p>
    </details>

-   <details><summary>How to load scripts after a specific cookie category has been accepted</summary>
    <p>

    Suppose you have a `analytics.js` file you want to load after the `analytics` category has been accepted:
    - <details><summary>Method 1 (recommended)</summary>
        <p>

        1. enable `page_scripts`:

            ```javascript
            cc.run({
                // ...
                page_scripts: true,
                // ...
            });
            ```
        2. add a `<script>` tag with the following attributes: `type="text/plain"` and `data-cookiecategory="<category>"`

            ```html
            <script type="text/plain" data-cookiecategory="analytics" src="<path-to-analytics.js>"></script>
            ```

        </p>
        </details>
    - <details><summary>Method 2</summary>
        <p>

        Load script using the `.loadScript()` method inside the `onAccept` method:

        ```javascript
        cc.run({
            // ...
            onAccept: function () {
                if (cc.allowedCategory('analytics')) {
                    cc.loadScript('analytics.js', function () {
                        // script loaded ...
                    });
                }
            }
        })
        ```

        </p>
        </details>

    </p>
    </details>
-   <details><summary>Make consent required (block page navigation until action)</summary>
    <p>

    This is a css only solution:

    1. enable `force_consent` option:
        ```javascript
        cc.run({
            // ...
            force_consent: true,
            // ...
        });
        ```
    2. That should do it. If you want to remove the weird horizontal jump (due to the scrollbar disappearing) you can add the following style **inside the head tag** of your page:
        ```html
        <style>
            html,
            body {
                height: auto!important;
                width: 100vw!important;
                overflow-x: hidden!important;
            }
        </style>
        ```
    For a full example check the <a href="demo/demo_gtm">second demo</a>.
    </p>
    </details>
-   <details><summary>How to create custom cookie tables</summary>
    <p>

    - **Cookie tables are defined by you, that is you choose how many columns and what their naming will be**
    - **Make sure that the first column of the table contains the name of the cookie for <code>autoclear_cookie</code> to work properly**
    <br>

    1. Specify the table structure via the `cookie_table_headers` property inside `settings_modal` object:

        Example with 3 columns:

        ```javascript
        // ...
        cookie_table_headers: [
            {col1: "Name"},
            {col2: "Source"},
            {col3: "Description"},
        ]
        // ...
        ```

    2. Now you can create a `cookie_table` array of objects:

        ```javascript
        // ...
        cookie_table: [
            {
                col1: '_ga',
                col2: 'google.com',
                col3: 'description ..',
            },
            {
                col1: '_gid',
                col2: 'google.com',
                col3: 'description ..',
            }
        ]
        // ...
        ```

    **Check the examples above for a valid implementation.**
    </p>
    </details>
-   <details><summary>How to use in React</summary>
    <p>

    You can find a [live demo](https://stackblitz.com/edit/nextjs-euxk9k) ( next.js) on stackblitz.

    1. Create a new component: `CookieConsent.js`

        ```javascript
        import { useEffect } from "react";

        import 'vanilla-cookieconsent';
        import 'vanilla-cookieconsent/dist/cookieconsent.css';

        export default function CookieConsent() {
            useEffect(() => {

                if (!document.getElementById('cc--main')) {
                    window.CC = window.initCookieConsent();
                    window.CC.run({
                        // your config (required)
                    });
                }

            }, []);

            return null;
        }
        ```

    2. Import the component in your main/root file (e.g. `App.js`):

        ```javascript
        import CookieConsent from "./<path-to-CookieConsent.js-component>";

        export default function App() {
            return (
                <div className="App">
                    <h1>Hello World</h1>

                    <CookieConsent/>
                </div>
            );
        }
        ```
    </p>
    </details>

<br>

## License
Distributed under the MIT License. See [LICENSE](https://github.com/orestbida/cookieconsent/blob/master/LICENSE) for more information.
