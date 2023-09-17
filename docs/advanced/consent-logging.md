# Consent Logging

There is no built-in API for consent logging. You can simply use the browser's `fetch` API to send the data using a `POST` request.

## How to retrieve user's consent
There are 2 main API methods that allow you to retrieve everything about the current user's preferences:

* [`getUserPreferences()`](/reference/api-reference.html#getuserpreferences)
* [`getCookie()`](/reference/api-reference.html#getcookie)

## How to send to your backend

Before sending the data to your backend server, you'll need to create an object containing the data useful to you.

Here is a full example.

```javascript
function logConsent(){

    // Retrieve all the fields
    const cookie = CookieConsent.getCookie();
    const preferences = CookieConsent.getUserPreferences();

    // In this example we're saving only 4 fields
    const userConsent = {
        consentId: cookie.consentId,
        acceptType: preferences.acceptType,
        acceptedCategories: preferences.acceptedCategories,
        rejectedCategories: preferences.rejectedCategories
    };

    // Send the data to your backend
    // replace "/your-endpoint-url" with your API
    fetch('/your-endpoint-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userConsent)
    });
}
```

## When/Where to send the data

You generally want to log the consent the **very first time** the user express their consent, and eventually when **they change their preferences**.

We can easily achieve this by using the following 2 [callbacks/events](/advanced/callbacks-events):

- `onFirstConsent`
- `onChange`

Example:
```javascript
CookieConsent.run({
    // ...

    onFirstConsent: () => {
        logConsent();
    },

    onChange: () => {
        logConsent();
    }
});

function logConsent(){
    // ...
}
```