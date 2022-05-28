# How to manage scripts
There are two ways to manage your scripts:

- via `<script>` tags
- via [callbacks/events](/advanced/callbacks-events)

## Using &lt;script&gt; tags
Given any script element, all you need to do  is to add the following attributes to the script tag itself:

- `type="text/plain"`
- `data-cookiecategory="category-name"`

Before:
```html
<!-- E.g. enable this script only if analytics category is accepted -->
<script>
    console.log("User accepted the analytics category!");
<script>
```

After:
```html
<script type="text/plain" data-cookiecategory="analytics">
    console.log("User accepted the analytics category!");
<script>
```


<CustomBlock type="info" title="Info">
The `type="text/plain"` attribute prevents the script from executing. `data-cookiecategory` is used by the plugin to enable the script when the specified category is accepted by the user.

</CustomBlock>

Although using script tags is very easy, they are also very limited and might not be suitable for specific use cases. That's where callbacks/custom events might come in handy.

<br>

## Using callbacks/events
Check out all the available [callbacks and events](/advanced/callbacks-events).

You can adapt the above script tag example for use inside the `onConsent` callback. You'd also need to make use of the `.acceptedCategory()` method, described in the [API Reference](/reference/api-reference) section.

`onConsent` callback example:
```javascript
cc.run({
    onConsent: function(){
        if(cc.acceptedCategory('analytics')){
            console.log("User accepted the analytics category!");
        }
    }
});
```
<br>

Another handy callback is the `onChange` callback.

If the user has already consented and later one changes their preference, you can use the `onChange` callback to enable or disable specific services — based on their new preference — with an immediate effect:

```javascript
cc.run({
    onChange: function(changedCategories){
        if(changedCategories.includes('analytics')){
            if(cc.acceptedCategory('analytics')){
                console.log("User just accepted the analytics category!");
            }else{
                console.log("User just rejected the analytics category!");
            }
        }
    }
})
```