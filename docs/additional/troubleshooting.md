# Troubleshooting
Issues you might encounter and possible fixes.

[[toc]]

## Missing Web Server
Check your path in the browser window, and make sure it begins with either `http` or `https`. If it is something else, chances are that you haven't set-up a [Web Server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_web_server).

## Incorrect paths
Verify that all paths — pointing to the files — are correct.

## Some cookies are not deleted
Check the cookie's path and domain and make sure they match your configuration.

Some services — such as GA4 — might re create the deleted cookie and require you to explicitly disable the tracking using their own API.

## Some cookies are not deleted on subdomains
Some services set their cookies in the main domain even if you are on a sub-domain. The plugin is unaware of this and just searches for cookies in the current sub-domain.

You have to manually specify the `domain` field within each cookie declared in the `autoClear` object. See the [categories.autoClear](/reference/configuration-reference.html#category-autoclear) section.

## Modals or buttons stop working after client-side navigation {#buttons-stop-working-after-client-side-navigation}
Client-side routers — such as Astro's view transitions — replace the page's `<body>` without reloading the page. The modals, which are appended to the `<body>` by default, are removed along with it, and buttons with a [data-cc](/advanced/custom-attribute.html) attribute on the new page are not wired up.

Call `CookieConsent.run()` only once, and handle the clicks with a single listener on `document`, which is not replaced:

```javascript
document.addEventListener('click', (event) => {
    if (event.target.closest('[data-cc="show-preferencesModal"]')) {
        event.preventDefault();
        CookieConsent.showPreferences();
    }
});
```

With Astro's `<ClientRouter />`, add an empty element with the `transition:persist` directive to your layout, and use it as the [root](/reference/configuration-reference.html#root) element, so that the modals are kept across navigations:

```html
<div id="cc-root" transition:persist></div>
```

```javascript
CookieConsent.run({
    root: '#cc-root',
    // ...
});
```

## Consent is not updated after changing the cookie's domain
If you change [cookie.domain](/reference/configuration-reference.html#cookie-domain), the cookie saved with the previous domain is not removed. The browser then sends both cookies, and the plugin keeps reading the old one, so new choices seem to be ignored.

Remove the old cookie before calling `CookieConsent.run()`, using the previous domain:

```javascript
document.cookie = 'cc_cookie=; Path=/; Domain=www.example.com; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
```

Users will be asked for consent again, once.

