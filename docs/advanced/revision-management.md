# Revision management
You can enable the revision management if you need to refresh the consent due to a change your cookie/privacy policy.

- `revision` number (default = 0)

## Enable revisions
To enable revisions, you just need to specify a valid `revision` number in your configuration:
```javascript
CookieConsent.run({
    revision: 1
});
```

::: warning Note
The new revision number must be different from the current revision number.
:::

Once enabled, users who had already consented to revision 0, will be prompted again for consent.

## Revision message
Optionally, you can also set a revision message to let your users know what has changed since the last time they visited.

1. Add a `revisionMessage` field inside `consentModal`
2. Specify the `{{startBrackets}}revisionMessage{{endBrackets}}` placeholder inside `consentModal.description`

```javascript
CookieConsent.run({
    revision: 1,

    language: {
        // ...
        translations: {
            en: {
                consentModal: {
                    description: 'Modal description. <br> {{revisionMessage}}',
                    revisionMessage: "Hi, we've made some changes to our cookie policy since the last time you visited!",
                    // ...
                },
                // ...
            }
        }
    }
});
```

<script>
  export default {
    data() {
      return {
        startBrackets: "{{",
        endBrackets: "}}"
      }
    }
  }
</script>