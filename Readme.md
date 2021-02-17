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

### 🚧 Note: this v2 version is not NOT COMPATIBLE with previous versions
Specifically the syntax has been completely changed (config. parameters have been renamed for the sake of simplicity/ease of use), some "useless" features have been removed, and some new ones have been added. Check [changelog](#changelog) for more.

## Table of contents
1. [Key features](#key-features)
2. [How to use](#how-to-use)
3. [Download & CDN](#download--cdn) (work-in-progress)
4. [APIs & config. parameters](#apis--configuration-parameters) (work-in-progress)
5. [Configuration examples](#examples) (work-in-progress)
    - Configuration with Google analytics   
    - Configuration with [explicit `accept all` and `accept necessary only` buttons](#explicit-consent)
    - Configuration with embedded full cookie-policy 
6. [FAQ](#faq) (work-in-progress)
7. [License](#license)

## Key features
- __Lightweight__ (~ 10kb for minified version)
- __Cross-browser__ support (IE8+)
- __Standalone__ (no external dependecies needed)
- __GDPR compliant__
- __Support for multi language__
- Allows you to __define different cookie categories with opt in/out toggle__
- Allows you to __define custom cookie tables__ if you want to clarify the cookies you use

## How to use 
1. download and include the script (or use via [cdn](#download--cdn))
    ```html
    <script src="cookieconsent.js"></script>
    ```
2. load the css style:
    ```html
    <link rel="stylesheet" href="cookieconsent.css">
    ```
    or alternatively you can configure the plugin to automatically load the .css file.

3. run the plugin with your configuration ([check out full examples](#examples)). A very basic example:
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
```html
https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v2/dist/cookieconsent.js
```
## APIs & configuration parameters
After getting the plugin like so:

```javascript
var cookieconsent = initCookieConsent();
```

the following methods are available:

- cookieconsent`.run(<config_object>)`
- cookieconsent`.show(<optional_delay>)`
- cookieconsent`.hide()`
- cookieconsent`.showSettings(<optional_delay>)`
- cookieconsent`.hideSettings()`

For an easier management of your scripts and cookie settings:
- cookieconsent`.allowedCategory(<your_cookie_category>)`  => returns true or false
- cookieconsent`.validCookie(<cookiename>)`                 => returns true or false
- cookieconsent`.loadScript(<src>, <callback>)`

#### All available options
Below a table which sums up all of the available options (must be passed to the .run() method).
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
| `languages`      	    | object 	| -       	| [Check below](#how-to-configure-languages--cookie-settings) for configuration

#### How to configure languages & cookie settings
Languages is an object which basically holds all of the text/html of your cookie modals in different languages. In here you can create `define cookie categories`, `cookie tables`, `opt-in/out toggle` for each category and more. For each language, a `consent_modal` object and a `settings_modal` must be configured.

<details><summary>Example with <b>multiple languages</b> ('en' and 'it')</summary>
<p>

```javascript
cookieconsent.run({
    ...
    languages : {
        'en' : {
            consent_modal : {
                title :  "Title here ...",
                description :  'Description here ...',
                primary_btn: {
                    text: 'Accept',
                    role: 'accept_all'      //'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text : 'Settings',
                    role : 'settings'       //'settings' or 'accept_necessary'
                }
            },
            settings_modal : {
                title : 'Cookie preferences ...',
                save_settings_btn : "Save settings",
                accept_all_btn : "Accept all",
                blocks : [
                    {
                        title : "First block title ...",
                        description: 'First block description ...'
                    },{
                        title : "Second block title ...",
                        description: 'Second block description ...',
                        toggle : {
                            value : 'my_category1',
                            enabled : true,
                            readonly: true
                        }
                    },{
                        title : "Third block title ...",
                        description: 'Third block description ...',
                        toggle : {
                            value : 'my_category2',
                            enabled : true,
                            readonly: false
                        }
                    }
                ]
            }
        },
        'it' : {
            consent_modal : {
                title :  "Title in italian here ...",
                description :  'Description in italian here ...',
                primary_btn: {
                    text: 'Accept in italian',
                    role: 'accept_all'				//'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text : 'Settings',
                    role : 'settings'				//'settings' or 'accept_necessary'
                }
            },
            settings_modal : {
                title : 'Cookie preferences ...',
                save_settings_btn : "Save settings in italian",
                accept_all_btn : "Accept all",
                blocks : [
                    {
                        title : "First block title in italian ...",
                        description: 'First block description in italian ...'
                    },{
                        title : "Second block title in italian ...",
                        description: 'Second block description in italian...',
                        toggle : {
                            value : 'my_category1',
                            enabled : true,
                            readonly: true
                        }
                    },{
                        title : "Third block title in italian ...",
                        description: 'Third block description in italian...',
                        toggle : {
                            value : 'my_category2',
                            enabled : true,
                            readonly: false
                        }
                    }
                ]
            }
        }
    }
});
```

</p>
</details>

<details><summary>Example with <b>custom cookie table</b></summary>
<p>

[Check demo app.js](../demo/app.js)

</p>
</details>
<details><summary id="explicit-consent">Example with explicit <b>accept all</b> and <b>accept necessary</b> buttons</summary>
<p>

```javascript
cookieconsent.run({
    ...
    languages : {
        'en' : {
            consent_modal : {
                title :  "Title here ...",
                description :  'Description here ...',
                primary_btn: {
                    text: 'Accept all',
                    role: 'accept_all'          //'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text : 'Accept necessary',
                    role : 'accept_necessary'   //'settings' or 'accept_necessary'
                }
            },
            settings_modal : {
                title : 'Cookie preferences ...',
                save_settings_btn : "Save settings",
                accept_all_btn : "Accept all",
                blocks : [
                    {
                        title : "First block title ...",
                        description: 'First block description ...'
                    },{
                        title : "Second block title ...",
                        description: 'Second block description ...',
                        toggle : {
                            value : 'my_category1',
                            enabled : true,
                            readonly: true
                        }
                    },{
                        title : "Third block title ...",
                        description: 'Third block description ...',
                        toggle : {
                            value : 'my_category2',
                            enabled : true,
                            readonly: false
                        }
                    }
                ]
            }
        }
    }
});
```
</p>
</details>


## FAQ
-   <details><summary>How to enable dark-mode</summary>
    <p>

    Either manually add the following class `c_darkmode` to the body/html tag, or toggle it via javascript:
    ```javascript
    document.body.classList.toggle('c_darkmode');
    ```

    </p>
    </details>
-   <details><summary>How to add link/button to open cookie settings</summary>
    <p>

    Create a link (or button) with `data-cc="c-settings"` attribute:
    ```javascript
    <a href="javascript:void(0);" aria-label="View cookie settings" data-cc="c-settings">Cookie Settings</a>
    ```

    </p>
    </details>
-   <details><summary>How to integrate with my multi-language website</summary>
    <p>

    If you have multiple versions of your html page, each with a different &lt;html <b>lang="..."</b> &gt; attribute, you can grab this value using:

    ```javascript
    document.documentElement.getAttribute('lang');
    ```

    and then set it as `current_lang` value like this:

    ```javascript
    cookieconsent.run({
        current_lang : document.documentElement.getAttribute('lang'),
        ...
    });
    ```

    **Note**: make sure that the lang attribute's value format (example: 'en' => 2 characters) is identical to the ones you defined. If you have 'en-US' as lang attribute, make sure to also specify 'en-US' (and not just 'en') in the config. parameters.

    </p>
    </details>

-   <details><summary>How to load scripts after a specific cookie category has been accepted</summary>
    <p>

    <div id="#g-analytics-example">You would do something like this: </div>

    ```javascript
    cookieconsent.run({
        ...
        onAccept : function(){
            // if analytics category has been accepted
            if(cookieconsent.allowedCategory('analytics')){
                cookieconsent.loadScript('https://www.google-analytics.com/analytics.js', function(){
                    ga('create', 'UA-XXXXXXXX-Y', 'auto');
                    ga('send', 'pageview');
                });
            }

            if(cookieconsent.allowedCategory('marketing')){
                // do something else
            }
        }
    })
    ```

    </p>
    </details>
-   <details><summary>How to autoload the .css file</summary>
    <p>

    You need to enable `autoload_css` and set `theme_css` to a valid path.

    ```javascript
    cookieconsent.run({
        autoload_css : true, 	
        theme_css : "../src/cookieconsent.css",					
        ...
    });
    ```

    </p>
    </details>

## License
Distributed under the MIT License. See [LICENSE](https://github.com/orestbida/cookieconsent/blob/master/LICENSE) for more information.