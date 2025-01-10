# Configuration Reference
Overview of all the available configuration options.

::: info About the examples
All the examples in this section are partial code snippets. They do not represent full/valid configurations.
:::


## root

Root (parent) element where the modal will be appended as a last child.

- **Type**: `string | HTMLElement`
- **Default**: `document.body`
- **Example**: <br>
    ```javascript
    CookieConsent.run({
        root: '#app'  // css selector
    })
    ```

## mode

Changes the scripts' activation logic when consent is not valid.

* **Type**: `string`
* **Values**: `'opt-in'`, `'opt-out'`
* **Default**: `'opt-in'`
* **Details**:

    `opt-in`: scripts — configured under a specific category — will run only if the user accepts that category (GDPR compliant).

    `opt-out`: scripts — configured under a specific category which has `enabled: true` — will run automatically (it is generally not GDPR compliant).
    Once the user has provided consent, this option is ignored.

* **Example**:

    Setting the mode on a per-country basis (concept):
    ```javascript
    const euCountries = ['DE', 'FR', 'IT',  ...];
    const userCountry = "IT";

    const dynamicMode = euCountries.contains(userCountry) ? 'opt-in' : 'opt-out';

    CookieConsent.run({
        mode: dynamicMode
    })
    ```

## autoShow

Automatically show the consent modal if consent is not valid.

- **Type**: `boolean`
- **Default**: `true`
- **Example**:

    Disable `autoShow` and show modal after 3 seconds:

    ```javascript
    CookieConsent.run({
        autoShow: false
    })

    setTimeout(CookieConsent.show, 3000)
    ```

## revision

Manages consent revisions; useful if you'd like to ask your users again for consent after a change in your cookie/privacy policy.

- **Type**: `number`
- **Default**: `0`
- **Details**:

    The default value `0` means that revision management is disabled. You can set any number different from 0 in order to enable it. Check out the dedicated [revision management](/advanced/revision-management.html) section.


## manageScriptTags

Intercepts all `<script>` tags with a `data-category` attribute, and enables them based on the accepted categories.  Check out the [scripts management](/advanced/manage-scripts.html#using-script-tags) section for details and examples.

- **Type**: `boolean`
- **Default**: `true`


## autoClearCookies

Clears cookies when user rejects a specific category. It requires a valid [`autoClear`](/reference/configuration-reference.html#category-autoclear) array.

- **Type**: `boolean`
- **Default**: `true`
- **Details**:

    This function is executed on the following 2 events:
    - when consent is not valid and the `onFirstConsent` callback is executed
    - when consent is valid and the state of the categories is changed



## hideFromBots

Stops the plugin's execution when a bot/crawler is detected, to prevent them from indexing the modal's content.

- **Type**: `boolean`
- **Default**: `true`


## disablePageInteraction

Creates a dark overlay and blocks the page scroll until consent is expressed.

- **Type**: `boolean`
- **Default**: `false`


## lazyHtmlGeneration

Delays the generation of the modal's markup until they're about to become visible, to improve the TTI score.
You can detect when a modal is ready/created via the [`onModalReady`](/advanced/callbacks-events.html#onmodalready) callback.

- **Type**: `boolean`
- **Default**: `true`

## cookie

Customize the plugin's cookie.

- **Type**:
    ```typescript
    interface Cookie {
        name?: string,
        domain?: string,
        path?: string,
        secure?: boolean,
        expiresAfterDays?: number | (acceptType: string) => number,
        sameSite?: string,
        useLocalStorage?: boolean
    }
    ```
- **Default**:
    ```javascript
    {
        name: 'cc_cookie',
        domain: window.location.hostname,
        path: '/',
        secure: true,
        expiresAfterDays: 182,
        sameSite: 'Lax',
        useLocalStorage: false
    }
    ```

### cookie<span></span>.name

- **Type**: `string`
- **Default**: `'cc_cookie'`

### cookie.domain

Current domain/subdomain's name, retrieved automatically.

- **Type**: `string`
- **Default**: `window.location.hostname`

### cookie.path

- **Type**: `string`
- **Default**: `'/'`

### cookie.secure

Toggle the *secure* flag.

- **Type**: `boolean`
- **Default**: `true`
- **Details**:

    The *secure* flag won't be set if there is no *https* connection.

### cookie.expiresAfterDays

Number of days before the cookie expires.

- **Type**:
    ```javascript
    number | (acceptType: string) => number
    ```
- **Default**: `182`
- **Details**:

    This field also accepts a `function` that must return a number.
    The `acceptType` parameter is equal to [`getUserPreferences().acceptType`](/reference/api-reference.html#getuserpreferences).


- **Example**: <br>

    If the user accepted all categories, set `expiresAfterDays=365.25`, otherwise set `expiresAfterDays=182`.

    ```javascript
    CookieConsent.run({
        cookie: {
            expiresAfterDays: acceptType => {
                return acceptType === 'all'
                    ? 365.25
                    : 182;
            }
        }
    })
    ```

### cookie.sameSite

- **Type**: `string`
- **Values**: `'Lax'`, `'Strict'`, `'None'`
- **Default**: `'Lax'`

### cookie.useLocalStorage

Store the value of the cookie in localStorage.

- **Type**: `boolean`
- **Default**: `false`
- **Details**:

    When enabled, the following fields are ignored: `domain`, `path`, `sameSite`

## onFirstConsent

Callback function executed once, on the user's first consent action.

- **Type**:
  ```javascript
  function({
      cookie: {} // same as CookieConsent.getCookie()
  }): void
  ```

* **Example**: <br>
    ```javascript
    CookieConsent.run({
        onFirstConsent: ({cookie}) => {
            // do something
        }
    })
    ```
::: info
This callback function is also executed on revision change.
:::

## onConsent

Callback function executed on the user's first consent action and after each page load.

- **Type**:
  ```javascript
  function({
      cookie: {} // same value as CookieConsent.getCookie()
  }): void
  ```

* **Example**: <br>
    ```javascript
    CookieConsent.run({
        onConsent: ({cookie}) => {
            // do something
        }
    })
    ```
::: info
This callback function is also executed on revision change.
:::


## onChange

Callback function executed when the user's preferences — such as accepted categories and services — change.

- **Type**:
  ```javascript
  function({
      cookie: {},   // same as CookieConsent.getCookie()
      changedCategories: string[],
      changedPreferences: {[category: string]: string[]}
  }): void
  ```
- **Example**: <br>
    ```javascript
    CookieConsent.run({
        onChange: ({cookie, changedCategories, changedPreferences}) => {
            if(changedCategories.includes('analytics')){

                if(CookieConsent.acceptedCategory('analytics')){
                    // the analytics category was just enabled
                }else{
                    // the analytics category was just disabled
                }

                if(changedServices['analytics'].includes('Google Analytics')){
                    if(CookieConsent.acceptedService('Google Analytics', 'analytics')){
                        // Google Analytics was just enabled
                    }else{
                        // Google Analytics was just disabled
                    }
                }
            }
        }
    })
    ```

## onModalShow

Callback function executed when one of the modals is visible.

- **Type**:
    ```javascript
    function({
        modalName: string
    }): void
    ```

* **Example**: <br>
    ```javascript
    CookieConsent.run({
        onModalShow: ({modalName}) => {
            // do something
        }
    })
    ```

- **Details**:

    `modalName` equals to one of the following values:
    * `'consentModal'`
    * `'preferencesModal'`


## onModalHide

Callback function executed when one of the modals is hidden.

- **Type**:
    ```javascript
    function({
        modalName: string
    }): void
    ```

* **Example**: <br>
    ```javascript
    CookieConsent.run({
        onModalHide: ({modalName}) => {
            // do something
        }
    })
    ```

- **Details**:

    `modalName` equals to one of the following values:
    * `'consentModal'`
    * `'preferencesModal'`

## onModalReady

Callback function executed when one of the modals is created and appended to the DOM.

- **Type**:
    ```javascript
    function({
        modalName: string
    }): void
    ```

* **Example**: <br>
    ```javascript
    CookieConsent.run({
        onModalReady: ({modalName, modal}) => {
            // do something
        }
    })
    ```

- **Details**:

    `modalName` equals to one of the following values:
    * `'consentModal'`
    * `'preferencesModal'`

## guiOptions

Tweak main UI settings.

- **Type**:
    ```typescript
    interface GuiOptions {
        consentModal?: ConsentModalOptions
        preferencesModal?: PreferencesModalOptions
    }
    ```

### guiOptions.consentModal

- **Type**:

    ```typescript
    interface ConsentModalOptions {
        layout?: string
        position?: string
        flipButtons?: boolean
        equalWeightButtons?: boolean
    }
    ```

- **Default**:

    ```javascript
    {
        layout: 'box',
        position: 'bottom right',
        flipButtons: false,
        equalWeightButtons: true
    }
    ```

- **Details**:

    All available `layout` and `position` options.

    | Layout  | Variant(s)       | Position-Y                | Position-X                |
    | ------- | ---------------- | ------------------------- | ------------------------- |
    | `box`   | `wide`, `inline` | `top`, `middle`, `bottom` | `left`, `center`, `right` |
    | `cloud` | `inline`         | `top`, `middle`, `bottom` | `left`, `center`, `right` |
    | `bar `  | `inline`         | `top`, `bottom`           | -                         |

    ::: warning Note
    Valid `layout` syntax: `<layoutName> <layoutVariant>`. <br>
    Valid `position` syntax: `<positionY> <positionX>`.
    :::

- **Example**:

    ```javascript
    guiOptions: {
        consentModal: {
            layout: 'cloud inline',
            position: 'bottom center'
        }
    }
    ```

### guiOptions.preferencesModal

- **Type**:

    ```typescript
    interface PreferencesModalOptions {
        layout?: string
        position?: string
        flipButtons?: boolean
        equalWeightButtons?: boolean
    }
    ```

- **Default**:

    ```javascript
    {
        layout: 'box',
        position: 'right',
        flipButtons: false,
        equalWeightButtons: true
    }
    ```

- **Details**:

    All available `layout` and `position` options.

    | Layout | Variant(s) | Position-Y | Position-X      |
    | ------ | ---------- | ---------- | --------------- |
    | `box`  | -          | -          | -               |
    | `bar ` | `wide`     | -          | `left`, `right` |

    ::: warning Note
    Valid `layout` syntax: `<layoutName> <layoutVariant>`. <br>
    Valid `position` syntax: `<positionX>` (if any available).
    :::

- **Example**:

    ```javascript
    guiOptions: {
        preferencesModal: {
            layout: 'bar wide',
            position: 'left',
            equalWeightButtons: false,
            flipButtons: true
        }
    }
    ```

## categories <span class="required" data-label="required"></span>

Use to define your cookie categories.

- **Type**:
    ```javascript
    {[category: string]: {
        enabled?: boolean,
        readOnly?: boolean,
        autoClear?: AutoClear,
        services?: Service[]
    }}
    ```

- **Example**:

    How to define the `analytics` category:
    ```javascript
    CookieConsent.run({
        categories: {
            analytics: {}
        }
    })
    ```

### <span style="opacity: .6">[category]</span>.enabled

Mark the category as enabled by default.

- **Type**: `boolean`
- **Default**: `false`
- **Example**: <br>
    ```javascript
    CookieConsent.run({
        categories: {
            necessary: {
                enabled: true
            },
            analytics: {
                enabled: false
            }
        }
    })
    ```


### <span style="opacity: .6">[category]</span>.readOnly

Treat the category as read-only/necessary (always enabled).

- **Type**: `boolean`
- **Default**: `false`
- **Example**:
    ```javascript
    CookieConsent.run({
        categories: {
            necessary: {
                readOnly: true
            }
        }
    })
    ```

### <span style="opacity: .6">[category]</span>.autoClear

Clear cookies when the user rejects the cookie category.

- **Type**:
    ```typescript
    interface AutoClear {
        cookies: Cookie[]
        reloadPage: boolean
    }
    ```
- **Details**:
    - `autoClear.cookies`: `Cookie[]` array of `Cookie` objects
    - `autoClear.reloadPage`: `boolean` reload page on clear

    `Cookie` type:
    ```javascript
    {
        name: string | RegExp
        path?: string
        domain?: string
    }
    ```

* **Example**: <br>

    Clear the `'_gid'` cookie and all the other cookies starting with `'_ga'` when the user opts-out of the "analytics" category.

    ```javascript
    CookieConsent.run({
        categories: {
            analytics: {
                readOnly: false,
                autoClear: {
                    cookies: [
                        {
                            name: /^(_ga)/      //regex
                        },
                        {
                            name: '_gid'        //string
                        }
                    ]
                }
            }
        }
    })
    ```

::: warning
If you've installed CookieConsent in a subdomain, and the cookie you're trying to erase is in the main domain, you'll have to specify your main domain in the `domain` field of the `Cookie` object.
:::

### <span style="opacity: .6">[category]</span>.services

Define individually togglable services.

- **Type**:
    ```typescript
    {
        [service: string]: {
            label?: string
            onAccept?: () => void
            onReject?: () => void
            cookies?: CookieItem[]
        }
    }
    ```

- **Details**:

    - `label`: overwrites the visible name in the preferencesModal (can be html)
    - `onAccept`: callback function executed when the service is accepted
    - `onReject`: callback function executed when the service is rejected (assuming that it was previously accepted)
    - `cookies`: array of cookies to erase when the service is disabled/rejected

* **Example**:

    Defining 2 services: `ga` and `new_service`:
    ```javascript
    CookieConsent.run({
        categories: {
            analytics: {
                services: {
                    ga: {
                        label: 'Google Analytics',
                        onAccept: () => {
                            // enable ga
                        },
                        onReject: () => {
                            // disable ga
                        },
                        cookies: [
                            {
                                name: /^(_ga|_gid)/
                            }
                        ]
                    },
                    new_service: {
                        label: 'Another Service',
                        onAccept: () => {
                            // enable new_service
                        },
                        onReject: () => {
                            // disable new_service
                        }
                    }
                }
            }
        }
    })
    ```

::: info
If one or more services are enabled, then the entire category will be treated as enabled/accepted.
:::

## language <span class="required" data-label="required"></span>

Define your language settings and the translation(s).

- **Type**:
    ```typescript
    interface Language {
        default: string
        autoDetect?: string
        rtl?: string | string[]
        translations: {
            [locale: string]:
                Translation
                | string
                | (() => Translation)
                | (() => Promise<Translation>)
        }
    }
    ```

### language.default <span class="required" data-label="required"></span>

The desired default language.

- **Type**: `string`
- **Example**:
    ```javascript
    CookieConsent.run({
        language: {
            default: 'en'
        }
    })
    ```

### language.autoDetect

Set the current language dynamically.

- **Type**: `string`
- **Values**: `'document'`, `'browser'`
- **Details**: <br>
    - `'document'`: retrieve language from the `lang` attribute (e.g. `<html lang="en-US">`)
    - `'browser'`: retrieve the user's browser language via `navigator.language`

    ::: info
    The detected language will be used only if a valid translation is defined, otherwise the plugin will fallback to the `default` language.
    :::

### language.rtl

List of languages that should use the RTL layout.

- **Type**: `string | string[]`
- **Example**: <br>
    ```javascript {4}
    CookieConsent.run({
        language: {
            default: 'en',
            rtl: 'ar',  // enable RTL for Arabic
            autoDetect: 'browser',

            translations: {
                en: '/assets/translations/en.json',
                ar: '/assets/translations/ar.json'
            }
        }
    })
    ```

### language.translations <span class="required" data-label="required"></span>

Define the translation(s) content.

- **Type**:
    ```typescript
    interface Translations {
        [locale: string]:
            Translation
            | string
            | (() => Translation)
            | (() => Promise<Translation>)
    }
    ```
- **Details**:

    You can define an `inline` translation object, or specify the path to an external `.json` translation file.

- **Examples**:

    External translation file:
    ```javascript
    CookieConsent.run({
        language: {
            default: 'en',
            translations: {
                en: '/assets/translations/en.json'
            }
        }
    })
    ```

    Inline translation object:
    ```javascript
    CookieConsent.run({
        language: {
            default: 'en',
            translations: {
                en: {
                    consentModal: {
                        // ...
                    },
                    preferencesModal: {
                        // ...
                    }
                }
            }
        }
    })
    ```

    You can also fetch a translation asynchronously:
    ```javascript {5-8}
    CookieConsent.run({
        language: {
            default: 'en',
            translations: {
                en: async () => {
                    const res = fetch('path-to-json-translation');
                    return await res.json();
                }
            }
        }
    })
    ```

### <span style="opacity: .6">[translation]</span>.consentModal<span class="required" data-label="required"></span>

- **Type**:
    ```typescript
    interface ConsentModal {
        label?: string
        title?: string
        description?: string
        acceptAllBtn?: string
        acceptNecessaryBtn?: string
        showPreferencesBtn?: string
        closeIconLabel?: string
        revisionMessage?: string
        footer?: string
    }
    ```
- **Details**:
    - `closeIconLabel`: if specified, a big `X` button will be generated (visible only in the `box` layout). It acts the same as `acceptNecessaryBtn`.
    - `revisionMessage`: check out the dedicated [revision section](/advanced/revision-management.html#revision-message).
    - `footer`: a small area where you can place your links (impressum, privacy policy, ...)

    <br>

    ::: info
    All the options/fields also allow html markup.
    :::

- **Example**:

    ```javascript
    translations: {
        'en': {
            consentModal: {
                label: 'Cookie Consent',
                title: 'We use cookies!',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
                acceptAllBtn: 'Accept all',
                acceptNecessaryBtn: 'Accept necessary',
                showPreferencesBtn: 'Manage individual preferences',
                footer: `
                    <a href="#path-to-impressum.html" target="_blank">Impressum</a>
                    <a href="#path-to-privacy-policy.html" target="_blank">Privacy Policy</a>
                `
            }
        }
    }
    ```

### <span style="opacity: .6">[translation]</span>.preferencesModal<span class="required" data-label="required"></span>

- **Type**:
    ```typescript
    interface PreferencesModal {
        title?: string
        acceptAllBtn?: string
        acceptNecessaryBtn?: string
        savePreferencesBtn?: string
        closeIconLabel?: string
        serviceCounterLabel?: string
        sections: Section[]
    }
    ```
- **Details**:

    - `serviceCounterLabel`: if you're using services, you can specify a label such as `'Service(s)'` to clarify what the counter means. The counter will not be displayed if `guiOptions.preferencesModal.layout` is set to `bar`, as well as on narrow viewports.

- **Example**:

    ```javascript
    translations: {
        'en': {
            preferencesModal: {
                title: 'Cookie Preferences Center',
                acceptAllBtn: 'Accept all',
                acceptNecessaryBtn: 'Accept necessary only',
                savePreferencesBtn: 'Accept current selection',
                closeIconLabel: 'Close modal',
                sections: []
            }
        }
    }
    ```


### <span style="opacity: .6">[translation]</span>.preferencesModal.sections<span class="required" data-label="required"></span>

- **Type**:
    ```typescript
    interface Section {
        title?: string
        description?: string
        linkedCategory?: string
        cookieTable?: CookieTable
    }
    ```

- **Details**:

    - `linkedCategory`: by specifying the name of a defined category (e.g. 'analytics'), a toggle will be generated
    - `cookieTable`: html table where you can list and clarify the cookies under this category

    `CookieTable` type:
    ```javascript
    interface CookieTable {
        caption?: string
        headers: {[key: string]: string}
        body: {[key: string]: string}[]
    }
    ```

- **Example**:

    ```javascript
    sections: [
        {
            title: 'Section name',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'
        },
        {
            title: 'Section name',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
            linkedCategory: 'necessary'
        },
        {
            title: 'Analytics Cookies',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
            linkedCategory: 'analytics',
            cookieTable: {
                caption: 'List of cookies',
                headers: {
                    name: 'Name',
                    description: 'Description',
                    duration: 'Duration'
                },
                body: [
                    {
                        name: 'cookie-name',
                        description: 'cookie-description',
                        duration: 'cookie-duration'
                    },
                    {
                        name: 'cookie-name-2',
                        description: 'cookie-description-2',
                        duration: 'cookie-duration-2'
                    }
                ]
            }
        }
    ]
    ```

    ::: tip
    You can define any table, with the headers you deem more fit.
    :::
