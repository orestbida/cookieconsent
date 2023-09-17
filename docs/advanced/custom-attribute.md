# Custom Attribute

The `data-cc` attribute allows you to bind any button — or link  — to a few API methods in order to run core functions, without the need to use javascript code.

Valid values:
- `show-preferencesModal`
- `show-consentModal`

* `accept-all`
* `accept-necessary`
* `accept-custom`

## show-preferencesModal
Use this value to show the `preferencesModal`.

**Example** <br>
```html
<button type="button" data-cc="show-preferencesModal">View Preferences Modal</button>
```

## show-consentModal
Use this value to show the `consentModal`. If the consent modal does not exist, it will be generated on the fly.

**Example** <br>
```html
<button type="button" data-cc="show-consentModal">View Consent Modal</button>
```


## accept-all
Use this value to accept all cookie categories.

**Example** <br>
```html
<button type="button" data-cc="accept-all">Accept all categories</button>
```

## accept-necessary
Use this value to accept only the necessary cookie categories.

**Example** <br>
```html
<button type="button" data-cc="accept-necessary">Reject all categories</button>
```

## accept-custom
Use this value to accept the current selection inside the preferences modal.

**Example** <br>
```html
<button type="button" data-cc="accept-custom">Accept selection</button>
```