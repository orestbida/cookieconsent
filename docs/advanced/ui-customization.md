# UI Customization

You can extensively customize both the color scheme and the layout, based on your needs.


## guiOptions
You can customize both modals through `guiOptions`:

- [`consentModal`](#consentmodal)
- [`preferencesModal`](#preferencesmodal)

All available options (default configuration):
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

Each modal has a different set of possible layouts and positions. A layout may also have one or more variants.

### consentModal

| Layout  | Variant(s)       | Position-Y                | Position-X                |
| ------- | ---------------- | ------------------------- | ------------------------- |
| `box`   | `wide`, `inline` | `top`, `middle`, `bottom` | `left`, `center`, `right` |
| `cloud` | `inline`         | `top`, `middle`, `bottom` | `left`, `center`, `right` |
| `bar `  | `inline`         | `bottom`                  | -                         |

Example:
```javascript
guiOptions: {
    consentModal: {
        layout: 'box wide',
        position: 'bottom left'
    }
}
```

::: warning Note
Valid `layout` syntax: `"layoutName layoutVariant"`. <br>
Valid `position` syntax: `"positionY positionX"`.
:::

### preferencesModal

| Layout | Variant(s) | Position-Y | Position-X      |
| ------ | ---------- | ---------- | --------------- |
| `box`  | -          | -          | -               |
| `bar ` | `wide`     | -          | `left`, `right` |

Example:
```javascript
guiOptions: {
    preferencesModal: {
        layout: 'bar',
        position: 'left'
    }
}
```

<br>

## Color schemes
The plugin ships with both a `light` (default) and a `dark` theme.

### Enable dark color scheme
The dark theme can be enabled by adding the `cc--dark` class to the `body` or  `html` element. You could also use javascript to toggle the dark mode on/off:
```javascript
document.body.classList.toggle('cc--dark');
```

### Custom color scheme
If you're feeling adventurous, you can develop your own theme by modifying/overriding the available css variables:

Available css variables:
```css
TODO
```