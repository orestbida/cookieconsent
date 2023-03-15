# Callbacks and Events
There are a few callbacks/events at your disposal to handle different kinds of situations. Each callback has a corresponding custom event, named after the callback function itself.

Available callbacks:

- `onFirstConsent`
- `onConsent`
- `onChange`
- `onModalShow`
- `onModalHide`
- `onModalReady`

<br>

::: info
To use an event listener, simply prepend `cc:` to the callback name.
:::

## onFirstConsent
This event is triggered only the very first time that the user expresses their choice of consent (accept/reject).

- **Example** <br>

    ```javascript
    cc.run({
        onFirstConsent: function({cookie}){
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onFirstConsent', function(event){
        // event.detail.cookie
        // do something
    });
    ```

## onConsent
This event is triggered the very first time the user expresses their choice of consent — just like `onFirstConsent` — but also **on every subsequent page load**.

- **Example** <br>

    ```javascript
    cc.run({
        onConsent: function({cookie}){
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onConsent', function(event){
        // event.detail.cookie
        // do something
    });
    ```

## onChange
This event is triggered when the user modifies their preferences and only if consent has already been provided.

- **Example** <br>

    ```javascript
    cc.run({
        onChange: function({cookie, changedCategories, changedServices}){
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onChange', function(event){
        /**
         * event.detail.cookie
         * event.detail.changedCategories
         * event.detail.changedServices
         */

        // do something
    });
    ```

## onModalShow
This event is triggered when one of the modals is visible.

- **Example** <br>

    ```javascript
    cc.run({
        onModalShow: function({modalName}){
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onModalShow', function(event){
        /**
         * event.detail.modalName
         */

        // do something
    });
    ```

## onModalHide
This event is triggered when one of the modals is hidden.

- **Example** <br>

    ```javascript
    cc.run({
        onModalHide: function({modalName}){
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onModalHide', function(event){
        /**
         * event.detail.modalName
         */

        // do something
    });
    ```

## onModalReady
This event is triggered when a modal is created and appended to the DOM.

- **Example** <br>

    ```javascript
    cc.run({
        onModalReady: function({modalName, modal}){
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onModalReady', function(event){
        /**
         * event.detail.modalName
         * event.detail.modal
         */

        // do something
    });
    ```
