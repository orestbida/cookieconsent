# Configuration Reference
Overview of all the available configuration options.

**Before diving in:**

::: info What is Invalid Consent
Consent is not valid when at least one of following situations occurs:
- consent is missing (e.g. user has not yet made a choice)
- revision numbers don't match
- the plugin's cookie does not exist/has expired
- the plugin's cookie is structurally not valid (e.g. empty)
:::

::: info About the examples
All the examples in this section are partial code snippets. They do not represent full/valid configurations.
:::


## root

Root (parent) element where the modal will be appended as a last child.

- Type: `HTMLElement`
- default: `document.body`

* **Example** <br>

    ```javascript
    cc.run({
        // set a different root element
        root: document.getElementById('app')
    })
    ```

## mode

Changes the scripts' activation logic when consent is not valid

- Type: `string`
- Values: `'opt-in'`, `'opt-out'`
- Default: `'opt-in'`

* **Details**

    - `opt-in`: scripts — configured under a specific category — will run only if the user accepts that category (GDPR compliant).
    - `opt-out`: scripts — configured under a specific category which has `enabled: true` — will run automatically (it is generally not GDPR compliant).

    Once the user has provided consent, this option is ignored.

    ::: tip
    If you are able to determine the country of the current user, you can set the mode to `opt-out` — assuming that the user's country is not under the GDPR law.
    :::

* **Example** <br>

    Setting the mode on a per-country basis (concept):

    ```javascript
    const euCountries = ['DE', 'FR', 'IT',  ...];
    const userCountry = "IT";

    const dynamicMode = euCountries.contains(userCountry) ? 'opt-in' : 'opt-out';

    cc.run({
        mode: dynamicMode
    })
    ```

## autoShow

Automatically show the consent modal if consent is not valid.

- Type: `boolean`
- default: `true`

* **Details**

    Based on your use case, you may turn this option off and use the `.show()` method instead to programmatically show the modal.

* **Example** <br>

    Disable autoShow:

    ```javascript
    cc.run({
        autoShow: false
    })
    ```

## revision

Manages consent revisions.

- Type: `number`
- default: `0`

* **Details**

    The default value `0` means that revision management is disabled. You can set any number different from 0 in order to enable it. Check out the dedicated [revision management](/advanced/revision-management.html) section.


## manageScriptTags

- Type: `boolean`
- default: `true`

Intercepts all `<script>` tags with a `data-category` attribute, and enables them based on the accepted categories. Check out the [scripts management](/advanced/manage-scripts.html#using-script-tags) section for details and examples.

## autoClearCookies

- Type: `boolean`
- default: `true`

Clears all cookies listed inside a specific category, when the user rejects that category. It requires a valid `autoClear` array. Check out the [categories.autoClear](/reference/configuration-reference.html#categories-autoclear) section.

## hideFromBots

- Type: `boolean`
- default: `true`

Stops the plugin's execution if a bot/crawler is detected, to prevent them from indexing the modal's content (for SEO purposes).


## disablePageInteraction

- Type: `boolean`
- default: `false`

Creates a dark overlay and blocks the page scroll until consent is expressed.

## cookie

- Type:
    ```javascript
    {
        name: string,
        domain: string,
        path: string,
        expiresAfterDays: number | function(acceptType): number,
        sameSite: string
    }
    ```
- default:
    ```javascript
    {
        name: 'cc_cookie',
        domain: window.location.hostname,
        path: '/',
        expiresAfterDays: 182,
        sameSite: 'Lax'
    }
    ```

The cookie is automatically set with the `secure` flag if `https` is enabled.

### cookie<span></span>.name

- Type: `string`
- default: `'cc_cookie'`

Name of the plugin's cookie.

### cookie.domain

- Type: `string`
- default: `window.location.hostname`

Current domain/subdomain's name, retrieved automatically.

### cookie.path

- Type: `string`
- default: `'/'`

By default the cookie will be set on the root path of your domain/subdomain.

### cookie.expiresAfterDays

- Type:
    ```javascript
    number | function(acceptType: string): number
    ```
- default: `182`

Number of days before the cookie expires. Some countries require a minimum of 182 days before the consent modal is shown again.

This field also accepts a `function` that must return a number!

::: tip acceptType

The `acceptType` parameter is a `string` with one of the following values:
- `'all'`: user accepted all the categories
- `'custom'`: user accepted a custom selection
- `'necessary'`: user accepted only the necessary categories (or rejected all)
:::

- **Example**: <br>

    If the user accepted all categories, set `expiresAfterDays=365.25`, otherwise set `expiresAfterDays=182`.

    ```javascript
    cc.run({
        cookie: {
            expiresAfterDays: function(acceptType){
                if(acceptType === 'all') return 365.25;
                return 182;
            }
        }
    })
    ```

### cookie.sameSite

- Type: `string`
- default: `'Lax'`

By default the cookie is restricted to same-site context only request. Check the official [MDN Docs.](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite) for more insight.

## onFirstConsent

Callback function executed once, on the user's first consent action.

- Type:
  ```javascript
  function({
      cookie: {} // same value as cc.getCookie()
  }): void
  ```

* **Example** <br>
    ```javascript
    cc.run({
        onFirstConsent: function({cookie}) {
            // do something
        }
    })
    ```

## onConsent

Callback function executed on the user's first consent action and after each page load.

- Type:
  ```javascript
  function({
      cookie: {} // same value as cc.getCookie()
  }): void
  ```

* **Example** <br>
    ```javascript
    cc.run({
        onConsent: function({cookie}) {
            // do something
        }
    })
    ```

## onChange

Callback function executed when the user's preferences — such as accepted categories and/or services — change.

- Type:
  ```javascript
  function({
      cookie: {},   // same value as cc.getCookie()
      changedCategories: string[],
      changedPreferences: {[key: string]: string[]}
  }): void
  ```

* **Example** <br>
    ```javascript
    cc.run({
        onChange: function({cookie, changedPreferences, changedCategories}) {
            // do something
        }
    })
    ```

## guiOptions

Tweak main UI aspects such as Layout and Buttons.

- Type:
  ```javascript
  {
      consentModal?: {}
      preferencesModal?: {}
  }
  ```

### guiOptions.consentModal

- Type:

    ```javascript
    {
        layout?: string,
        position?: string,
        equalWeightButtons?: boolean,
        flipButtons?: boolean
    }
    ```

- Default:

    ```javascript
    {
        layout: 'box',
        position: 'bottom right',
        flipButtons: false,
        equalWeightButtons: true
    }
    ```

- Details:

    All available `layout` and `position` options.

    | Layout  | Variant(s)       | Position-Y                | Position-X                |
    | ------- | ---------------- | ------------------------- | ------------------------- |
    | `box`   | `wide`, `inline` | `top`, `middle`, `bottom` | `left`, `center`, `right` |
    | `cloud` | `inline`         | `top`, `middle`, `bottom` | `left`, `center`, `right` |
    | `bar `  | `inline`         | `bottom`                  | -                         |

    ::: warning Note
    Valid `layout` syntax: `<layoutName> <layoutVariant>`. <br>
    Valid `position` syntax: `<positionY> <positionX>`.
    :::

- Example:

    ```javascript
    guiOptions: {
        consentModal: {
            layout: 'cloud inline',
            position: 'bottom center'
        }
    }
    ```

### guiOptions.preferencesModal

- Type:

    ```javascript
    {
        layout?: string,
        position?: string,
        flipButtons?: boolean,
        equalWeightButtons?: boolean
    }
    ```

- Default:

    ```javascript
    {
        layout: 'box',
        // position: 'right',
        flipButtons: false,
        equalWeightButtons: true
    }
    ```

- Details:

    All available `layout` and `position` options.

    | Layout | Variant(s) | Position-Y | Position-X      |
    | ------ | ---------- | ---------- | --------------- |
    | `box`  | -          | -          | -               |
    | `bar ` | `wide`     | -          | `left`, `right` |

    ::: warning Note
    Valid `layout` syntax: `<layoutName> <layoutVariant>`. <br>
    Valid `position` syntax: `<positionX>` (if any available).
    :::

- Example:

    ```javascript
    guiOptions: {
        preferencesModal: {
            layout: 'bar',
            position: 'left',
            equalWeightButtons: false,
            flipButtons: true
        }
    }
    ```

## categories <span class="required">required</span>

- Type: `object`
- default: `undefined`

Example on how to create the `analytics` category:
```javascript
cc.run({
    categories: {
        analytics: {}
    }
})
```

### categories.enabled
- Type: `boolean`

Mark the category as enabled by default.


### categories.readOnly
- Type: `boolean`

Treat the category as read-only/necessary. The user won't be able to toggle the category off when this option is enabled. Enable only on categories which are essential for the proper functioning of your website.

e.g. set the `necessary` category as read-only:
```javascript
cc.run({
    categories: {
        necessary: {
            enabled: true,
            readOnly: true
        }
        analytics: {
            enabled: false,
            readOnly: false
        }
    }
})
```

### categories.autoClear
- Type:
    ```javascript
    {
        cookies: []
        reloadPage: false
    }
    ```

Clear cookies when user rejects the cookie category. Available options for the autoClear object:

- `autoClear.cookies`: `[{cookie}]` array of cookie objects
- `autoClear.reloadPage`: `boolean` reload page on clear


* **Example**: <br>

    Clear the `'_gid'` cookie and all the other cookies starting with `'_ga'` when the user opts-out of the "analytics" category.

    ```javascript
    cc.run({
        categories: {
            analytics: {
                enabled: false,
                readOnly: false,
                autoClear: [
                    {
                        name: /^(_ga)/      //regex
                    },
                    {
                        name: '_gid'        //string
                    }
                ]
            }
        }
    })
    ```

### categories.services


- Type:
    ```javascript
    {
        [key: string]: {
            label?: string,
            onAccept: () => void,
            onReject: () => void
        }
    }
    ```

- **Details**:

    `key`: service name (unique) <br>
    `label`: overwrites the visible name in the preferencesModal (can be html)


* **Example**: <br>
    ```javascript
    cc.run({
        categories: {
            analytics: {
                services: {
                    ga: {
                        label: 'Google Analytics',
                        onAccept: function() {
                            // enable ga
                        },
                        onReject: function() {
                            // disable ga
                        }
                    },
                    new_service: {
                        label: 'Another Service',
                        onAccept: function() {
                            // enable new_service
                        },
                        onReject: function() {
                            // disable new_service
                        }
                    }
                }
            }
        }
    })
    ```

## language <span class="required">required</span>
Section under development. Check out the [Language Config.](/advanced/language-configuration.html).

### language.default <span class="required">required</span>
Section under development.

### language.autoDetect

Automatically detect and set language — if defined in the config — otherwise use `default`.

- Type: `string`
- Values: `'document'`, `'browser'`


Language detection strategies:
- `'document'`: set language based on the current page's `lang` attribute
- `'browser'`: detect client's browser's language using `navigator.language`

### language.translations <span class="required">required</span>
Section under development.