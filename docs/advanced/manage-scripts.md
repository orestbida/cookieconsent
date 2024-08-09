# How to manage scripts
There are two ways to manage your scripts:

- via `<script>` tags
- via [callbacks/events](/advanced/callbacks-events)

## Available script attributes

* `data-category`: name of the category
* `data-service` (optional): if specified, a toggle will be generated in the `preferencesModal`
* `data-type` (optional): custom type (e.g. `"module"`)
* `data-src` (optional): can be used instead of `src` to avoid validation issues

Example usage:
```html
<script
    type="text/plain"
    data-category="analytics"
    data-service="Google Analytics"
>/*...code*/</script>
```

## How to block/manage a script tag

You can manage any script tag by adding the following 2 attributes (both required):

- `type="text/plain"`
- `data-category="your-category-name"`

Before:
```html
<script>
    // Always executed
</script>
```

After:
```html{2-3}
<script
    type="text/plain"
    data-category="analytics">
    // Executed when the "analytics" category is enabled
</script>
```

You can also run **scripts when a category is disabled** (if it was previously enabled) by prepending the `'!'` character to the category name:

```html{3}
<script
    type="text/plain"
    data-category="!analytics">
    // Executed when the "analytics" category is disabled
</script>
```

::: warning Custom type
You can set a custom script type via the `data-type` attribute. E.g. to set the `type="module"` attribute you must specify `data-type="module"`.

```html{6}
<script
    type="text/plain"
    src="my-service-module.js"
    data-category="analytics"
    data-service="My service"
    data-type="module"
></script>
```
:::

### Services
::: info What is a service
A service represents a script — or a group of scripts — associated to a name, that appears inside the Preferences Modal with its own toggle. You can also [configure a service internally](/reference/configuration-reference.html#category-services) via the configuration object.
:::

You can define a service by adding the following attribute:
- `data-service="your-service-name"`

```html{4}
<script
    type="text/plain"
    data-category="analytics"
    data-service="Google Analytics">
    // Executed when the "Google Analytics" service is enabled
</script>
```

You can add the `'!'` before the service name to run some clean-up logic when the service is disabled:
```html{4}
<script
    type="text/plain"
    data-category="analytics"
    data-service="!Google Analytics">
    // Executed when the "Google Analytics" service is disabled
</script>
```
<br>

## Using callbacks/events
You can adapt the above examples for use inside the `onConsent` callback:
```javascript
CookieConsent.run({
    onConsent: function(){
        if(CookieConsent.acceptedCategory('analytics')){
            // Analytics category enabled
        }

        if(CookieConsent.acceptedService('Google Analytics', 'analytics')){
            // Google Analytics enabled
        }
    }
});
```

Another handy callback is the `onChange` callback, fired when the state of the categories or services is changed (assuming that consent was already expressed).

```javascript
CookieConsent.run({
    onChange: function({changedCategories, changedServices}){
        if(changedCategories.includes('analytics')){

            if(CookieConsent.acceptedCategory('analytics')){
                // Analytics category was just enabled
            }else{
                // Analytics category was just disabled
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


::: info
A `<script>` tag can be enabled and disabled at most once, unlike the `onChange` callback — or its equivalent event listener — which can be executed multiple times.
:::