# IframeManager set-up
How to properly set up CookieConsent and IframeManager so that changes in state are reflected in both plugins.

Checkout the [demo on Stackblitz](https://stackblitz.com/edit/web-platform-ahqgz3?file=index.js).

::: info Info
This is an example config. and assumes that all iframes belong to the `analytics` category.
:::

## Connect IframeManager -> CookieConsent
When an iframe is accepted via a button click we must notify CookieConsent using the `onChange` callback:

::: warning Note
The `onChange` callback is available in iframemanager v1.2.0+.
:::

```javascript
const im = iframemanager();

im.run({
    onChange: ({ changedServices, eventSource }) => {
        if(eventSource.type === 'click') {
            const servicesToAccept = [
                ...CookieConsent.getUserPreferences().acceptedServices['analytics'],
                ...changedServices
            ];

            CookieConsent.acceptService(servicesToAccept, 'analytics');
        }
    },

    services: {
        youtube: {
            // ...
        },

        vimeo: {
            // ...
        }
    }
});
```

## Connect CookieConsent -> IframeManager
Enable/disable iframes via CookieConsent:

```javascript
CookieConsent.run({
    categories: {
        analytics: {
            services: {
                youtube: {
                    label: 'Youtube Embed',
                    onAccept: () => im.acceptService('youtube'),
                    onReject: () => im.rejectService('youtube')
                },
                vimeo: {
                    label: 'Vimeo Embed',
                    onAccept: () => im.acceptService('vimeo'),
                    onReject: () => im.rejectService('vimeo')
                }
            }
        }
    }
})
```

<br>

For more examples or details about the configuration options, checkout the [iframemanger](https://github.com/orestbida/iframemanager) repo.