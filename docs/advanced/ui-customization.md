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

### Enable dark color scheme
The dark theme can be enabled by adding the `cc--darkmode` class to the `body` or  `html` element. You could also use javascript to toggle the dark mode on/off:
```javascript
document.body.classList.toggle('cc--darkmode');
```

### Custom color scheme
If you're feeling adventurous, you can develop your own theme by modifying/overriding the available css variables:

```css
:root{
    --cc-bg: #ffffff;
    --cc-primary-color: #2c2f31;
    --cc-secondary-color: #5e6266;

    --cc-btn-primary-bg: #0066dd;
    --cc-btn-primary-color: #ffffff;
    --cc-btn-primary-border-color: var(--cc-btn-primary-bg);
    --cc-btn-primary-hover-bg: #0853a8;
    --cc-btn-primary-hover-color: #ffffff;
    --cc-btn-primary-hover-border-color: var(--cc-btn-primary-hover-bg);

    --cc-btn-secondary-bg: #eaeff2;
    --cc-btn-secondary-color: var(--cc-primary-color);
    --cc-btn-secondary-border-color: var(--cc-btn-secondary-bg);
    --cc-btn-secondary-hover-bg: #d4dae0;
    --cc-btn-secondary-hover-color: #000000;
    --cc-btn-secondary-hover-border-color: #d4dae0;

    --cc-separator-border-color: #f0f4f7;

    --cc-toggle-on-bg: var(--cc-btn-primary-bg);
    --cc-toggle-off-bg: #667481;
    --cc-toggle-on-knob-bg: #ffffff;
    --cc-toggle-off-knob-bg: var(--cc-toggle-on-knob-bg);

    --cc-toggle-enabled-icon-color: var(--cc-bg);   // yes (v tick)
    --cc-toggle-disabled-icon-color: var(--cc-bg);  // no (x tick)

    --cc-toggle-readonly-bg: #d5dee2;
    --cc-toggle-readonly-knob-bg: #fff;
    --cc-toggle-readonly-knob-icon-color: var(--cc-toggle-readonly-bg);

    --cc-section-category-border: var(--cc-cookie-category-block-bg);

    --cc-cookie-category-block-bg: #f0f4f7;
    --cc-cookie-category-block-border: #f0f4f7;
    --cc-cookie-category-block-hover-bg: #e9eff4;
    --cc-cookie-category-block-hover-border: #e9eff4;
    --cc-cookie-category-expanded-block-bg: transparent;
    --cc-cookie-category-expanded-block-hover-bg: #dee4e9;

    --cc-overlay-bg: rgba(0, 0, 0, 0.541);
    --cc-webkit-scrollbar-bg: var(--cc-section-category-border);
    --cc-webkit-scrollbar-hover-bg: var(--cc-btn-primary-hover-bg);

    --cc-footer-bg: var(--cc-btn-secondary-bg);
    --cc-footer-color: var(--cc-secondary-color);
    --cc-footer-border-color: #e4eaed;

    /*A few more */
    --cc-font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    --cc-btn-border-radius: 4px;
    --cc-pm-toggle-border-radius: 4em;
    --cc-modal-margin: 1em;
}
```

## How to use CSS variables:

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