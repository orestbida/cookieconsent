# API Reference

<CustomBlock type="info" title="Note">
The `?` means that the parameter/property is optional.

</CustomBlock>

## run

Configures the plugin with the provided config. object.

- **Type**

    ```javascript
    function(config: object): void
    ```
- **Details**

    The `config` argument is required and must contain — at least — the `categories` and `language` properties (both properly configured). Check out how to set up [categories](/reference/configuration-reference.html#categories) and [translations](/reference/configuration-reference.html#languages-and-translations).

- **Example**
    ```javascript
    cc.run({
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
    function(delay?: number, createModal?: boolean): void
    ```
- **Details**

    Both arguments are optional. You can show the modal after a specific `delay` (measured in milliseconds). If consent was previously expressed, the consent modal will not be generated; you'll have to pass `true` to the second argument to generate it on the fly.

- **Example**
    ```javascript
    // show modal after 300ms
    cc.show(300);

    // show modal (if it doesn't exist, create it)
    cc.show(0, true);
    ```

## hide

Hides the consent modal.

- **Type**

    ```javascript
    function(): void
    ```

- **Example**
    ```javascript
    cc.hide();
    ```

## showPreferences

Shows the preferences modal.

- **Type**

    ```javascript
    function(delay?: number): void
    ```
- **Details**

    The delay argument is optional.

- **Example**
    ```javascript
    // show modal after 300ms
    cc.showPreferences(300);

    // show modal (without delay)
    cc.showPreferences();
    ```


## hidePreferences

Hides the preferences modal.

- **Type**

    ```javascript
    function(): void
    ```

- **Example**
    ```javascript
    cc.hidePreferences();
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
    cc.acceptCategory('all');                // accept all categories
    cc.acceptCategory([]);                   // reject all (accept only categories marked as readOnly/necessary)
    cc.acceptCategory();                     // accept currently selected categories inside the preferences modal

    cc.acceptCategory('analytics');          // accept only the "analytics" category
    cc.acceptCategory(['cat_1', 'cat_2']);   // accept only these 2 categories

    cc.acceptCategory('all', ['analytics']); // accept all categories except the "analytics" category
    cc.acceptCategory('all', ['cat_1', 'cat_2']); // accept all categories except these 2
    ```


## acceptedCategory

Returns `true` if the specified category was accepted, otherwise `false`.

- **Type**

    ```javascript
    function(categoryName: string): boolean
    ```

- **Examples**
    ```javascript
    /**
     * if the user accepted the 'analytics' category
     * print "hooray!"
     */
    if(cc.acceptedCategory('analytics')){
        console.log("hooray!");
    }

    /**
     * if the user didn't accept the 'ads' category
     * print "oh no ..."
     */
    if(!cc.acceptedCategory('ads')){
        console.log("oh no ...");
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
    cc.acceptService('all', 'analytics');   // accept all services (in the 'analytics' category)
    cc.acceptService([], 'analytics');      // reject all services

    cc.acceptService('service1', 'analytics');     // accept only this specific service (reject all the others)
    cc.acceptService(['service1', 'service2'], 'analytics');   // accept only these 2 services (reject all the others)
    ```

## validConsent
Returns `true` if consent is valid.

- **Type**
    ```javascript
    function(): boolean
    ```

- **Details** <br>
    Invalid consent is explained at the very top of the [Configuration Reference](/reference/configuration-reference.html) page.

- **Example**
    ```javascript
    if(cc.validConsent()){
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

- **Details**
    This method cannot detect if the cookie has expired as such information cannot be retrieved with javascript.

- **Example** <br>

    Check if the `'gid'` cookie is set.

    ```javascript
    if(cc.validCookie('_gid')){
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
        domains?: string[]
    ): boolean
    ```

- **Examples** <br>

    Delete the plugin's own cookie

    ```javascript
    cc.eraseCookies('cc_cookie');
    ```

    Delete the `_gid` and  all cookies starting with `_ga` cookies:
    ```javascript
    cc.eraseCookies(['_gid', /^_ga/], '/', [location.hostname]);
    ```



## loadScript

Loads script files (`.js`).

- **Type**

    ```javascript
    function(
        path: string,
        callback?: function(): void,
        attributes?: [
            { name: string, value: string }
        ]
    ): void
    ```

- **Examples** <br>

    Load a script:

    ```javascript
    cc.loadScript('path-to-script.js', function(){
        // Script loaded, do something
    });
    ```

    You may also nest multiple `.loadScript` methods:
    ```javascript
    cc.loadScript('path-to-script1.js', function(){
        cc.loadScript('path-to-script2.js', function(){
            // script1 and script2 loaded, do something
        });
    });
    ```

    Load script with attributes:
    ```javascript
    cookieconsent.loadScript('path-to-script.js', function(){
        // Script loaded, do something
    }, [
        {name: 'id', value: 'ga_script'},
        {name: 'another-attribute', value: 'value'}
    ]);
    ```


## getCookie

Returns the content of the plugin's cookie.

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
    }
    ```

- **Example**
    ```javascript
    // Get only the 'data' field
    const data = cc.getCookie('data');

    // Get all fields
    const cookieContent = cc.getCookie();
    ```

## getConfig

## getUserPreferences

Returns user's preferences, such as accepted and rejected categories.

- **Type**

    ```javascript
    function(): {
        acceptType: string,
        acceptedCategories: string[],
        rejectedCategories: string[]
    }
    ```
- **Details**

    Possible `acceptType` values: `'all'`, `'custom'` or `'necessary'`.

- **Example** <br>

    ```javascript
    const preferences = cc.getUserPreferences();

    if(preferences.acceptType === 'all'){
        console.log("Awesome!");
    }

    if(preferences.acceptedCategories.includes('analytics')){
        console.log("The analytics category was accepted!");
    }
    ```


## setLanguage
Changes the modal's language. Returns `true` if the language was changed.

- **Type**
    ```javascript
    function(
        language: string,
        force?: boolean
    ): boolean
    ```

- **Examples** <br>

    Assuming that the current language is set to `'en'`:

    ```javascript
    cc.setLanguage('it');        // true
    cc.setLanguage('en');        // false, en is already the current language
    ```

    If you've changed the `'en'` translation's content, and you'd like to reflect the changes:
    ```javascript
    cc.setLanguage('en', true);  // true
    ```

## setCookieData
Save custom data into the cookie. Returns `true` if the data was set successfully.

- **Type** <br>

    ```javascript
    function({
        value: any,
        mode: string
    }): boolean
    ```

- **Details** <br>
    You may use this field to store any kind of data (as long as the entire cookie doesn't exceed the 4096 bytes size threshold). There are 2 modes:
    - `'update'`: sets the new value only if its different from the previous value, and both are of the same type.
    - `'overwrite'` (default): always sets the new value (overwrites any existing value).

    <CustomBlock type="info" title="Note">
    This API method is safe to use, as it does not alter the cookies' current expiration time.

    </CustomBlock>


- **Examples** <br>

    ```javascript
    // First set: true
    cc.setData({
        value: {id: 21, lang: 'it'}
    }); //{id: 21, lang: 'it'}

    // Change only the 'id' field: true
    cc.setData({
        value: {id: 22},
        mode: 'update'
    }); //{id: 22, lang: 'it'}

    // Add a new field: true
    cc.setData({
        value: {newField: 'newValue'},
        mode: 'update'
    }); //{id: 22, lang: 'it', newField: 'newValue'}

    // Change 'id' to a string value: FALSE
    cc.setData({
        value: {id: 'hello'},
        mode: 'update'
    }); //{id: 22, lang: 'it', newField: 'newValue'}

    // Overwrite: true
    cc.setData({
        value: 'overwriteEverything'
    }); // 'overwriteEverything'
    ```