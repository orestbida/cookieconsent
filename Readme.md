# Cookie Consent

![Cookie Consent cover](demo/assets/cover.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Size](https://img.shields.io/github/size/orestbida/cookieconsent/dist/cookieconsent.js)

A __lightweight__ & __gdpr compliant__ cookie consent plugin written in plain javascript. An "all-in-one" solution which also allows you to write your cookie policy inside it without the need of having a dedicated page. 

### Main features
- __Cross-browser__ support (IE8+)
- __Standalone__ (no external dependecies needed)
- __Lightweight__ (~ 10kb for optimized/minified version)
- Can easily add __support__ for __additional languages__
- Automatic browser language detection
- No additional external http requests
- __GDPR compliant__ (if configured properly)
- __Auto-deletes cookies on opt-out__ (read more)
- Allows you to easily load scripts upon consent
- Allows you to __define different cookie categories with opt in/out toggle__
- Can detect which types of cookie categories the user has consented to

## Get started
Include the script (either inside head or body)
```html
<script src="cookieconsent.js"></script>
```

load the css style
```html
<link rel="stylesheet" href="cookieconsent.css">
```

and then run the plugin with your configuration. A very basic example:
```javascript
var cookieconsent = initCookieConsent();

cookieconsent.run({
    current_lang : 'en',
    onAccept : function(){
        // do something ...
    },

    languages : {
        en : {
            consent_modal : {
				title :  "I use cookies",
				description :  'Your cookie consent message here',
				primary_btn: {
					text: 'Accept',
					role: 'accept_all'
				},
				secondary_btn: {
					text : 'Settings',
					role : 'settings'
				}
			},
            settings_modal : {
				title : 'Cookie settings',
				save_settings_btn : "Save settings",
				accept_all_btn : "Accept all",
                blocks : [
					{
						title : "Cookie usage",
						description: 'Your cookie usage disclaimer'
					},{
						title : "Strictly necessary cookies",
						description: 'Category description ... ',
						toggle : {
							value : 'necessary_cookies',
							enabled : true,
							readonly: true
						}
					},{
						title : "Statistics cookies",
						description: 'Category description ... ',
						toggle : {
							value : 'statistics_cookies',
							enabled : true,
							readonly: false
						}
					},
                ]
            }
        }
    }
});
```