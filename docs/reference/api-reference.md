# API Reference

## run

Configures the plugin with the provided config. object.

- **Type**

    ```javascript
    function(config: object): Promise<void>
    ```
- **Details**

    The `config` argument is required and must contain — at least — the [`categories`](/reference/configuration-reference.html#categories) and [`language`](/reference/configuration-reference.html#language) properties.

- **Example**
    ```javascript
    CookieConsent.run({
        categories: {
            // categories here
        },
        language: {
            default: 'en',

            translations: {
                en: {
                    // modal translations here
                }
            }
        }
    });
    ```


## show

Shows the consent modal.

- **Type**

    ```javascript
    function(createModal?: boolean): void
    ```
- **Details**

   If consent was previously expressed, the consent modal will not be generated; you'll have to pass the argument `true` to generate it on the fly.

- **Example**
    ```javascript
    CookieConsent.show();

    // show modal (if it doesn't exist, create it)
    CookieConsent.show(true);
    ```

## hide

Hides the consent modal.

- **Type**

    ```javascript
    function(): void
    ```

- **Example**
    ```javascript
    CookieConsent.hide();
    ```

## showPreferences

Shows the preferences modal.

- **Type**

    ```javascript
    function(): void
    ```

- **Example**
    ```javascript
    CookieConsent.showPreferences();
    ```


## hidePreferences

Hides the preferences modal.

- **Type**

    ```javascript
    function(): void
    ```

- **Example**
    ```javascript
    CookieConsent.hidePreferences();
    ```

## acceptCategory

Accepts or rejects categories.

- **Type**

    ```javascript
    function(
        categoriesToAccept?: string | string[],
        exclusions?: string[]
    ): void
    ```
- **Details**

    The first argument accepts either a `string` or an `array` of strings. Special values:

    - `'all'`: accept all
    - `[]`: empty array, accept none (reject all)
    - ` `: empty argument, accept only the categories selected in the preferences modal

- **Examples**
    ```javascript
    CookieConsent.acceptCategory('all');                // accept all categories
    CookieConsent.acceptCategory([]);                   // reject all (accept only categories marked as readOnly/necessary)
    CookieConsent.acceptCategory();                     // accept currently selected categories inside the preferences modal

    CookieConsent.acceptCategory('analytics');          // accept only the "analytics" category
    CookieConsent.acceptCategory(['cat_1', 'cat_2']);   // accept only these 2 categories

    CookieConsent.acceptCategory('all', ['analytics']); // accept all categories except the "analytics" category
    CookieConsent.acceptCategory('all', ['cat_1', 'cat_2']); // accept all categories except these 2
    ```


## acceptedCategory

Returns `true` if the specified category was accepted, otherwise `false`.

- **Type**

    ```javascript
    function(categoryName: string): boolean
    ```

- **Examples**
    ```javascript
    if(CookieConsent.acceptedCategory('analytics')){
        // great
    }

    if(!CookieConsent.acceptedCategory('ads')){
        // not so great
    }
    ```

## acceptService

Accepts or rejects services.

- **Type**

    ```javascript
    function(
        services: string | string[],
        category: string
    ): void
    ```
- **Details**

    Special values for the `services` argument:

    - `'all'`: accept all services
    - `[]`: empty array, accept none (reject all)

- **Examples**
    ```javascript
    CookieConsent.acceptService('all', 'analytics');   // accept all services (in the 'analytics' category)
    CookieConsent.acceptService([], 'analytics');      // reject all services

    CookieConsent.acceptService('service1', 'analytics');     // accept only this specific service (reject all the others)
    CookieConsent.acceptService(['service1', 'service2'], 'analytics');   // accept only these 2 services (reject all the others)
    ```

## acceptedService

Returns `true` if the service inside the category is accepted, otherwise `false`.

- **Type**

    ```javascript
    function(
        serviceName: string,
        categoryName: string
    ): boolean
    ```

- **Examples**
    ```javascript
    if(CookieConsent.acceptedService('Google Analytics', 'analytics')){
        // great
    }else{
        // not so great
    }
    ```

## validConsent
Returns `true` if consent is valid.

- **Type**
    ```javascript
    function(): boolean
    ```
- **Details**

    Consent is not valid when at least one of following situations occurs:
    - consent is missing (e.g. user has not yet made a choice)
    - revision numbers don't match
    - the plugin's cookie does not exist/has expired
    - the plugin's cookie is structurally not valid (e.g. empty)
    <br><br>

- **Example**
    ```javascript
    if(CookieConsent.validConsent()){
        // consent is valid
    }else{
        // consent is not valid
    }
    ```

## validCookie

Returns `true` if the specified cookie is valid (it exists and its content is not empty).

- **Type**

    ```javascript
    function(cookieName: string): boolean
    ```

- **Details** <br>

    This method cannot detect if the cookie has expired as such information cannot be retrieved with javascript.

- **Example** <br>

    Check if the `'gid'` cookie is set.

    ```javascript
    if(CookieConsent.validCookie('_gid')){
        // _gid cookie is valid!
    }else{
        // _gid cookie is not set ...
    }
    ```

## eraseCookies

Removes one or multiple cookies.

- **Type**

    ```javascript
    function(
        cookies: string | RegExp | (string | RegExp)[],
        path?: string,
        domain?: string
    ): void
    ```

- **Details**

    This function uses `document.cookie` to expire cookies.
    According to the [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#write_a_new_cookie):
    "The domain _must_ match the domain of the JavaScript origin. Setting cookies to foreign domains will be silently ignored."

- **Examples**

    Delete the plugin's own cookie:
    ```javascript
    CookieConsent.eraseCookies('cc_cookie');
    ```

    Delete the `_gid` and all cookies starting with `_ga`:
    ```javascript
    CookieConsent.eraseCookies(['_gid', /^_ga/]);
    ```

    Delete all cookies except the plugin's own cookie:
    ```javascript
    CookieConsent.eraseCookies(/^(?!cc_cookie$)/);
    ```

## loadScript

Loads script files (`.js`).

- **Type**

    ```javascript
    function(
        path: string,
        attributes?: {[key: string]: string}
    ): Promise<boolean>
    ```

- **Examples** <br>

    ```javascript
    // basic usage
    CookieConsent.loadScript('path-to-script.js');

    // check if script is loaded successfully
    const loaded = await CookieConsent.loadScript('path-to-script.js');

    if(!loaded){
        console.log('Script failed to load!');
    }
    ```

    You may also concatenate multiple `.loadScript` methods:
    ```javascript
    CookieConsent.loadScript('path-to-script1.js')
        .then(() => CookieConsent.loadScript('path-to-script2.js'))
        .then(() => CookieConsent.loadScript('path-to-script3.js'));
    ```

    Load script with attributes:
    ```javascript
    CookieConsent.loadScript('path-to-script.js', {
        'id': 'ga-script',
        'another-attribute': 'another-value'
    });
    ```


## getCookie

Returns the plugin's own cookie, or just one of the fields.

- **Type**
    ```javascript
    function(
        field?: string,
        cookieName?: string,
    ): any | {
        categories: string[],
        revision: number,
        data: any,
        consentId: string
        consentTimestamp: string,
        lastConsentTimestamp: string,
        languageCode: string,
        services: {[key: string]: string[]}
    }
    ```

- **Example**
    ```javascript
    // Get only the 'data' field
    const data = CookieConsent.getCookie('data');

    // Get all fields
    const cookieContent = CookieConsent.getCookie();
    ```

## getConfig

Returns the configuration object or one of its fields.

- **Type**
    ```javascript
    function(field?: string): any
    ```

- **Example**
    ```javascript
    // Get the entire config
    const config = CookieConsent.getConfig();

    // Get only the language' prop.
    const language = CookieConsent.getConfig('language');
    ```

## getUserPreferences

Returns user's preferences, such as accepted/rejected categories and services.

- **Type**

    ```javascript
    function(): {
        acceptType: string,
        acceptedCategories: string[],
        rejectedCategories: string[],
        acceptedServices: {[category: string]: string[]}
        rejectedServices: {[category: string]: string[]}
    }
    ```
- **Details**

    Possible `acceptType` values:
    - `'all'`
    - `'custom'`
    - `'necessary'`

- **Example** <br>

    ```javascript
    const preferences = CookieConsent.getUserPreferences();

    if(preferences.acceptType === 'all'){
        console.log("Awesome!");
    }

    if(preferences.acceptedCategories.includes('analytics')){
        console.log("The analytics category was accepted!");
    }
    ```


## setLanguage
Changes the modal's language. Returns a `Promise<boolean>` which evaluates to `true` if the language was changed successfully.

- **Type**
    ```javascript
    function(
        language: string,
        force?: boolean
    ): Promise<boolean>
    ```

- **Examples** <br>

    ```javascript
    // Simple usage
    CookieConsent.setLanguage('it');

    // Get return value
    const success = await CookieConsent.setLanguage('en');
    ```

    Forcefully refresh modals (re-generates the html content):
    ```javascript
    CookieConsent.setLanguage('en', true);
    ```

## setCookieData
Save custom data into the cookie. Returns `true` if the data was set successfully.

- **Type** <br>

    ```javascript
    function({
        value: any,
        mode?: string
    }): boolean
    ```

- **Details**

    Valid `mode` values:
    - `'update'` sets the new value only if its different from the previous value, and both are of the same type.
    - `'overwrite'` (default): always sets the new value (overwrites any existing value).

    ::: info
    The `setCookieData` method does not alter the cookies' current expiration time.
    :::


- **Examples** <br>

    ```javascript
    // First set: true
    CookieConsent.setCookieData({
        value: {id: 21, lang: 'it'}
    }); //{id: 21, lang: 'it'}

    // Change only the 'id' field: true
    CookieConsent.setCookieData({
        value: {id: 22},
        mode: 'update'
    }); //{id: 22, lang: 'it'}

    // Add a new field: true
    CookieConsent.setCookieData({
        value: {newField: 'newValue'},
        mode: 'update'
    }); //{id: 22, lang: 'it', newField: 'newValue'}

    // Change 'id' to a string value: FALSE
    CookieConsent.setCookieData({
        value: {id: 'hello'},
        mode: 'update'
    }); //{id: 22, lang: 'it', newField: 'newValue'}

    // Overwrite: true
    CookieConsent.setCookieData({
        value: 'overwriteEverything'
    }); // 'overwriteEverything'
    ```

## reset

Reset CookieConsent.

- **Type**:
    ```javascript
    function(eraseCookie?: boolean): void
    ```

- **Details**:

    Resets all internal pointers and config. settings. You need to call again the `.run()` method with a valid config. object.

    You can pass the argument `true` to delete the plugin's cookie. The user will be prompted once again to express their consent.

    ::: warning
    Once this method is called, the plugin won't be able to detect already executed `script` tags with a `data-category` attribute.
    :::

- **Example**:
    ```javascript
    CookieConsent.reset(true);
    ```
