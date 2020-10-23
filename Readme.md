# Cookie Consent
Simple cross-browser cookie consent plugin written in plain javascript.

## Why though
I wanted a simple, `lightweight` but also `extensible` plugin, which could be placed in my own web server without the need of making additional external requests. The reason was to further optimize the loading speed of my website.

Main features
- __Cross-browser__ support (IE8+)
- __Standalone__ (no external dependecies needed)
- __Lightweight__ (~ 10kb for optimized/minified version)
- Can easily add __support__ for __additional languages__
- Automatic browser language detection
- No additional external http requests

## CDN
```
// dist version (no verbose mode)
https://cdn.jsdelivr.net/gh/orestbida/cookieconsent/dist/cookieconsent.js

// src version (with verbose mode)
https://cdn.jsdelivr.net/gh/orestbida/cookieconsent/src/cookieconsent.js
```

## How to run
- __Include file__ (or load it dynamically)
    ```javascript
    // either locally
    <script src="<your_path>/cookieconsent.js"></script>

    // or load it via cdn
    <script src="https://cdn.jsdelivr.net/gh/orestbida/cookieconsent/dist/cookieconsent.js"></script>

    // dist version (no verbose mode)


    ```
- __Obtain Cookie-Consent plugin__ 
    ```javascript
    const CookieConsent = initCookieConsent();
    ```
- __Initialize cookieconsent__ (you __need__ to provide a config. object)
    ```javascript
    CookieConsent.run(<config_object>);
    ```
- __Show cookieconsent modal__ (will show only if cookieconsent was not alredy accepted)
    ```javascript
    CookieConsent.show(<optional_delay_value>);
    ```
- __Hide cookieconsent modal__
    ```javascript
    CookieConsent.hide();
    ```
- __Show cookie policy modal__
    ```javascript
    CookieConsent.show_policy();
    ```
- __Hide cookie policy modal__
    ```javascript
    CookieConsent.hide_policy();
    ```

## Custom config. settings
All available config settings shown in the example below. 
<div id="full_example">

```javascript
CookieConsent.run({
    
    // if true, shows cookie-consent modal as soon as initialized
    cc_autorun : false, 						
    
    // shows cookie-consent modal after 0 milliseconds 
    cc_delay : 0,	

    // if url is specified, the cookie-consent policy will not be generated
    // and the learn more button will instead be linked to the specified url
    cc_policy_url : null,	

    // if set to true, prints all config/info/error messages on console
    cc_enable_verbose : true,	

    // set default language (from those defined in cc_languages)
    cc_current_lang : 'en',	
    
    // if set to true, sets cookie-consent language to that of the browser in use 
    // (if that language is defined in cc_languages)
    cc_auto_language : true,					
    
    // path to cookieconsent.css
    cc_theme_css : '<your_path>/cookieconsent.css',
    
    // optional callback function to call when the visitor accepts the cookie consent
    cc_accept_callback : function(cookies){
        // print accepted cookie settings
		console.log('cookie consent is accepted!', cookies);
	},
    
    // define your own cookie-consent and cookie-policy
    // it's up to you to make it gdpr compliant
    cc_languages : [
        {
            lang : 'en',
            modal : {
                cc_title :  "I use cookies",
                cc_more_text :  "Learn more", 
                cc_accept_text : "I understand",
                cc_description :  'My website uses essential cookies necessary for its functioning. By continuing browsing, you consent to my use of cookies and other technologies.',
            },
            policy : {
                ccp_title : "Cookie Policy",
                ccp_save_text : "Save preferences",
                // ccb_table_headers is REQUIRED if any ccb_cookies_table is used
                ccb_table_headers : [
                    {col1: "Name" }, 
                    {col2: "Domain" }, 
                    {col3: "Expiration" }, 
                    {col4: "Description" }, 
                    {col5: "Type" }
                ],
                ccp_blocks : [
                    {
                        ccb_title : "What are cookies",
                        ccb_description: 'Cookies are very small text files that are stored on your computer when you visit a website. I use cookies to assure the basic functionalities of the website and to enhance your online experience. I use many different types of cookies which you can check on the sections below.'
                    },{
                        ccb_title : "Strictly necessary cookies",
                        ccb_description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly.',
                        ccb_cookies_table : [
                            {
                                col1: 'cc_cookie',
                                col2: 'orestbida.com',
                                col3: 'After 3 months (Starting from the moment the cookie-consent was accepted)',
                                col4: 'Used to know whether a visitor has accepted the cookie consent or not.',
                                col5: 'Permanent cookie'
                            },
                            {
                                col1: 'cc_level',
                                col2: 'orestbida.com',
                                col3: 'After 3 months (Starting from the moment the cookie-consent was accepted)',
                                col4: 'Used to know the accepted level of cookie consent (E.g.  essential cookie only, full cookie consent ...)',
                                col5: 'Permanent cookie'
                            }
                        ],
                        ccb_switch : {
                            value : 'necessary_cookies',
                            enabled : true,
                            readonly: true
                        }
                    },{
                        ccb_title : "Functionality cookies",
                        ccb_description: 'These cookies are used to provide you with a more personalized experience on my website and to remember choices you make when you browse the website. For example, whether or not you enabled dark-mode on this website.',
                        ccb_switch : {
                            value : 'functionality_cookies',
                            enabled : true,
                            readonly: false
                        },
                        ccb_cookies_table: [
                            {
                                col1: 'darkmode',
                                col2: 'orestbida.com',
                                col3: 'One week after the cookie has been created',
                                col4: 'Used to remember visitor preferences. If darkmode was enabled, then the next time you visit the website, darkmode will be automatically turned on.' ,
                                col5: 'Permanent cookie'
                            }
                        ]
                    },{
                        ccb_title : "More information",
                        ccb_description: 'For any queries in relation to my policy on cookies and your choices, please contact me.',
                    }
                ]
            }
        }
    ]
});
```
</div>

## How to open cookie policy without manually calling api
You need to create a button or link with the following custom attribute `data-cc="cc_policy"`
```html
<!-- button example-->
<button type="button" data-cc="cc_policy">Open cookie-policy</button>

<!-- link example-->
<a href="javascript:void(0)" data-cc="cc_policy">Open cookie-policy</a>
```

## How to enable dark-mode
You can either specifiy the class `cc_darkmode` on a parent container (for example on body), or you can toggle it manually like in the following example
```javascript
document.body.classList.toggle('cc_darkmode');
```

## Do something on "accept cookie-consent" event
You can find the user cookie settings via the `cc_accept_callback` callback function which is fired everytime a user accepts the cookie consent or if it is alredy accepted
```javascript
CookieConsent.run({
    // ...
    cc_accept_callback : function(cookies){
        // print accepted cookie settings
        console.log('cookie-consent accepted: ', cookies);
        
        /*
         * example: do somethings if 'functionality_cookies' is accepted
         */
        if(cookies.level.includes('functionality_cookies')){
            console.log("yoo")
        }
            
    }
    // ...
});
```

### Config. properties
- __cc_autorun__ : (boolean)
    - *default* : false
    - if set to true, cookieconsent will show modal as soon as loaded
- __cc_delay__ : (number)
    - *default* : 0
    - if specified (>=0), there will be an initial delay before showing the cookieconsent modal
    - useful when you have implemented a "loader"
- __cc_enable_verbose__ : (boolean) 
    - *default* : true
    - if set to true, all informational/error messages will show on console
- __cc_current_lang__ : (string) __[REQUIRED]__
    - *default* : "en"
    - when specified, modal will be set to that language (if it is implemented)
- __cc_auto_language__ : (boolean)
    - *default* : false
    - if set to true, cc_current_lang will be ignored, and the cookieconsent modal will set its language based on client browser language (if specific client browser language is not defined, a fallback_language="en" will be used instead)
- __cc_theme_css__ : (string) __[REQUIRED]__
    - *default* : null
    - specify path to local cookieconsent.css file
- __cc_policy_url__ : (string)
    - *default* : null
    - specify path to your own cookieconsent policy page (eg. https://mydomain.com/cookiepolicy/)
- __cc_accept_callback__ : (function)
	- *default* : undefined (not used)
    - a function to call when the visitor accepts the cookie consent, or has alredy accepted it
- __cc_languages__ : (string) __[REQUIRED]__
    - *default* : [{<en_language_only>}]
    - define (multiple) new languages or override default one (en)
    - if no languages are defined, an error will be thrown
    - example usage (<a href="#full_example">full example here</a>):
        ```javascript
        /*
         * Defining new language example
         * the following props: lang, modal, policy are required
         */
        CookieConsent.run({
            cc_languages : [
                {
                    lang : 'it',	//add italian
                    modal : {
                        cc_title : "<title ...>",
                        // ...
                    },
                    policy : {
                        // ...
                    }
                }
            ]
        });
        ```

## Reccomended way of loading the plugin
1. preload `cookieconsent.css` inside `<head>`
	```html
	<link rel="preload" href="<your_path>/cookieconsent.css" as="style">
	```
2. append cookieconsent.js at the bottom, inside `body` tag
    ```html
	<script src="<your_path>/cookieconsent.js"></script>
	```
3. initialize plugin with a config. object like <a href="#full_example">full example</a>


## Cookie-consent default expiration time
The default expiration time for the cookie consent is `6 months`

## TODO
List of things to implement
- [x] Add dark-mode 
    - can be enabled manually by toggling a specific class
- [ ] Add option to set custom cookie expiration date
- [x] Make all `cookie-modal` content and `cookie-policy` __customizable__
- [x] Add the possibility of quickly `defining a new language/override default one` 
- [ ]  ~~Implement a dropdown select language menu when multiple languages are defined~~
- [x] `Custom cookie-policy url` (useful for those who alredy have a cookie policy)
- [x] Make cookieconsent **`GPDR compliant`** (up to user): 
    - Implement "learn more" modal with a brief explanation about cookies (up to user)
    - Implement custom-cookie-table containing (up to user):
        - column for cookie-name
        - column for cookie-description
        - column for cookie-expiration-date
    - Implement the (eventual) `possibility of opting-out` of cookie-consent (up to user)

## Changelog compared to v1.0
 - add __custom table headers__ in cookie-policy modal ✨
 - tables inside cookie-policy can now have an arbitrary number of columns defined by user
 - refactor code / remove unused code 🔥
 - minor css updates