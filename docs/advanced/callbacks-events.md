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

## onFirstConsent
This event is triggered only the very first time that the user expresses their choice of consent (accept/reject).

- **Example** <br>

    ```javascript
    CookieConsent.run({
        onFirstConsent: ({cookie}) => {
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onFirstConsent', ({detail}) => {
        // detail.cookie

        // do something
    });
    ```

## onConsent
This event is triggered the very first time the user expresses their choice of consent — just like `onFirstConsent` — but also **on every subsequent page load**.

- **Example** <br>

    ```javascript
    CookieConsent.run({
        onConsent: ({cookie}) => {
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onConsent', ({detail}) => {
        // detail.cookie

        // do something
    });
    ```

## onChange
This event is triggered when the user modifies their preferences and only if consent has already been provided.

- **Example** <br>

    ```javascript
    CookieConsent.run({
        onChange: ({cookie, changedCategories, changedServices}) => {
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onChange', ({detail}) => {
        /**
         * detail.cookie
         * detail.changedCategories
         * detail.changedServices
         */

        // do something
    });
    ```

## onModalShow
This event is triggered when one of the modals is visible.

- **Example** <br>

    ```javascript
    CookieConsent.run({
        onModalShow: ({modalName}) => {
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onModalShow', ({detail}) => {
        /**
         * detail.modalName
         */

        // do something
    });
    ```

## onModalHide
This event is triggered when one of the modals is hidden.

- **Example** <br>

    ```javascript
    CookieConsent.run({
        onModalHide: ({modalName}) => {
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onModalHide', ({detail}) => {
        /**
         * detail.modalName
         */

        // do something
    });
    ```

## onModalReady
This event is triggered when a modal is created and appended to the DOM.

- **Example** <br>

    ```javascript
    CookieConsent.run({
        onModalReady: ({modalName, modal}) => {
            // do something
        }
    });
    ```

    using event listener:
    ```javascript
    window.addEventListener('cc:onModalReady', ({detail}) => {
        /**
         * detail.modalName
         * detail.modal
         */

        // do something
    });
    ```
