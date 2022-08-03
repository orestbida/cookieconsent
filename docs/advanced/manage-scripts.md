# How to manage scripts
There are two ways to manage your scripts:

- via `<script>` tags
- via [callbacks/events](/advanced/callbacks-events)

## Using &lt;script&gt; tags
To configure a script tag, you must add the following 2 attributes:

- `type="text/plain"`
- `data-category="your-category-name"`

Before:
```html
<!-- E.g. enable this script only if analytics category is accepted -->
<script>
    // Script enabled
</script>
```

After:
```html
<script type="text/plain" data-category="analytics">
    // Analytics category enabled
</script>
```

You can also run **scripts when a category is disabled** (if it was previously enabled) by pre-pending `!` to the category name:

```html
<script type="text/plain" data-category="!analytics">
    // Analytics category disabled
</script>
```

### Services
::: info What is a service
A service represents a script — or a group of scripts — associated to a name, that appears inside the Preferences Modal with its own toggle. You can also [configure a service internally](/reference/configuration-reference.html#category-services) via the configuration object.
:::

You can define a service by adding the following attribute:
- `data-service="your-service-name"`

```html
<script type="text/plain" data-category="analytics" data-service="Google Analytics">
    // Google Analytics enabled
</script>
```

You can pre-pend the `!` character to the service name to run some clean-up logic when the service is disabled:
```html
<script type="text/plain" data-category="analytics" data-service="!Google Analytics">
    // Google Analytics disabled
</script>
```
<br>

## Using callbacks/events
You can adapt the above examples for use inside the `onConsent` callback:
```javascript
cc.run({
    onConsent: function(){
        if(cc.acceptedCategory('analytics')){
            // Analytics category enabled
        }

        if(cc.acceptedService('Google Analytics', 'analytics')){
            // Google Analytics enabled
        }
    }
});
```

Another handy callback is the `onChange` callback, which is fired when the state of the categories or services is changed (assuming that consent was already expressed).

```javascript
cc.run({
    onChange: function({changedCategories, changedServices}){
        if(changedCategories.includes('analytics')){

            if(cc.acceptedCategory('analytics')){
                // Analytics category was just enabled
            }else{
                // Analytics category was just disabled
            }

            if(changedServices['analytics'].includes('Google Analytics')){
                if(cc.acceptedService('Google Analytics', 'analytics')){
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