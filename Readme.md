<h1 align="center" style="text-align: center;">Cookie Consent</h1>
<div align="center" style="text-align: center;">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![Size](https://img.shields.io/github/size/orestbida/cookieconsent/dist/cookieconsent.js)
</div>
<div align="center" style="text-align: center; max-width: 770px; margin: 0 auto;">

A __lightweight__ & __gdpr compliant__ cookie consent plugin written in plain javascript. An "all-in-one" solution which also allows you to write your cookie policy inside it without the need of having a dedicated page. 

</div>
<div style="padding-top: .6em;">

![Cookie Consent cover](demo/assets/cover.png)
</div>


## Table of contents
1. [Key features](#key-features)
2. [How to use](#how-to-use)
3. [Download & CDN](#download--cdn) (work-in-progress)
4. [All available options](#all-available-options) (work-in-progress)
5. [Configuration examples](#examples) (work-in-progress)
    - Configuration with Google analytics
    - Configuration with explicit `accept all` and `accept necessary only` buttons
    - Configuration with embedded full cookie-policy 
6. [FAQ](#faq) (work-in-progress)
    - How to enable darkmode
    - How to integrate with my multi-language website
    - How to add link/button to open cookie settings
7. [License](#license)

## Key features
- __Lightweight__ (~ 10kb for minified version)
- __Cross-browser__ support (IE8+)
- __Standalone__ (no external dependecies needed)
- __GDPR compliant__
- Can easily add __support__ for __additional languages__
- Allows you to __define different cookie categories with opt in/out toggle__

## How to use
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

## Download & CDN
You can download the [latest version](https://github.com/orestbida/cookie-consent/releases/tag/v2.0) or use it via cdn:
```
...
```

## All available options
Below a table which sums up all of the available options.
| Option              	| Type     	| Default 	| Description                                                                                                                      	|
|---------------------	|----------	|---------	|----------------------------------------------------------------------------------------------------------------------------------	|
| `autorun`           	| boolean  	| true    	| If enabled, show the cookie consent as soon as possible (otherwise you need to manually call the `.show()` method)               	|
| `delay`             	| number   	| 0       	| Number of `milliseconds` before showing the consent-modal                                                                        	|
| `cookie_expiration` 	| number   	| 182     	| Number of days before the cookie expires (182 days = 6 months)                                                                   	|
| `autoload_css`      	| boolean  	| false   	| Enable if you want to let the plugin load the css (requires `theme_css` to be a valid path)                                      	|
| `theme_css`         	| string   	| -       	| Specify path to the .css file (requires `autoload_css` to be `true` for it to work)                                              	|
| `current_lang`      	| string   	| -       	| Specify one of the languages you have defined (can also be dynamic): `'en'`, `'de'` ...                                          	|
| `auto_language`     	| boolean  	| false   	| Automatically grab the language based on the user's browser language, if language is not defined => use specified `current_lang` 	|
| `autoclear_cookies` 	| boolean  	| false   	| Enable if you want to automatically delete cookies when user opts-out of a specific category inside cookie settings              	|
| __`onAccept`__      	| function 	| -       	| Method run `once` when:  <br>  1. The cookie consent has been accepted <br> 2. After each page load (if alredy accepted)         	|
| __`onUpdate`__      	| function 	| -       	| Method run after every event (except after page load)                                                                            	|


## License
Distributed under the MIT License. See [LICENSE](https://github.com/orestbida/cookieconsent/blob/master/LICENSE) for more information.