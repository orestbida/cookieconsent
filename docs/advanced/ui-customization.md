# UI Customization

You can extensively customize both the color scheme and the layout, based on your needs.

## guiOptions

Allows you to tweak the modal's and button's layout/position. Check the [dedicated section](/reference/configuration-reference.html#guioptions) for all available options.

::: info
Each modal has a different set of possible layouts and positions. A layout may also have one or more variants.
:::

Default configuration:
```javascript
guiOptions: {
    consentModal: {
        layout: 'box',
        position: 'bottom right',
        flipButtons: false,
        equalWeightButtons: true
    },
    preferencesModal: {
        layout: 'box',
        // position: 'left right',
        flipButtons: false,
        equalWeightButtons: true
    }
}
```

<br>

## Color schemes
The plugin ships with both a `light` (default) and a `dark` theme.

The dark theme can be enabled by adding the `cc--darkmode` class to the `html` element. You could also use javascript to toggle the dark mode on/off:
```javascript
document.documentElement.classList.add('cc--darkmode');
```

## Available css variables
You can develop your own theme by modifying/overriding the available css variables in [/src/scss/abstracts](https://github.com/orestbida/cookieconsent/tree/master/src/scss/abstracts).

More css variables:

```css
#cc-main {
    --cc-font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    --cc-modal-border-radius: .5rem;
    --cc-btn-border-radius: .4rem;
    --cc-modal-transition-duration: .25s;
    --cc-modal-margin: 1rem;
    --cc-z-index: 2147483647;
}
```

## Disable transitions
You can disable all transitions simply by setting the transition duration to 0:

```css
#cc-main,
#cc-main .cm,
#cc-main .pm {
    --cc-modal-transition-duration: 0;
}
```

## How to change CSS variables:

1. Create a new `.css` file (or declare the style inline using the `<style>` tag)
2. Overwrite existing css variables:
   ```css
    #cc-main {
        /** Change font **/
        --cc-font-family: Roboto;

        /** Change button primary color to black **/
        --cc-btn-primary-bg: #000000;
        --cc-btn-primary-border-color: #000000;
        --cc-btn-primary-hover-bg: #444444;
        --cc-btn-primary-hover-border-color: #444444;

        /** Also make toggles the same color as the button **/
        --cc-toggle-on-bg: var(--cc-btn-primary-bg);

        /** Make the buttons a bit rounder **/
        --cc-btn-border-radius: 10px;
    }
    ```