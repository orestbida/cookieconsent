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
                        ccp_blocks : [
                            {
                                ccb_title : "What are cookies",
                                ccb_description: 'Cookies are very small text files that are stored on your computer when you visit a website. I use cookies to assure the basic functionalities of the website and to enhance your online experience. I use many different types of cookies which you can check on the sections below.'
                            },{
                                ccb_title : "Strictly necessary cookies",
                                ccb_description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly.',
                                ccb_cookies_table : [
                                    {
                                        ccb_cookie_name: 'cc_cookie',
                                        ccb_cookie_domain: 'orestbida.com',
                                        ccb_cookie_expiration: 'After 3 months (Starting from the moment the cookie-consent was accepted)',
                                        ccb_cookie_description: 'Used to know whether a visitor has accepted the cookie consent or not.',
                                        ccb_cookie_type: 'Permanent cookie'
                                    },
                                    {
                                        ccb_cookie_name: 'cc_level',
                                        ccb_cookie_domain: 'orestbida.com',
                                        ccb_cookie_expiration: 'After 3 months (Starting from the moment the cookie-consent was accepted)',
                                        ccb_cookie_description: 'Used to know the accepted level of cookie consent (E.g.  essential cookie only, full cookie consent ...)',
                                        ccb_cookie_type: 'Permanent cookie'
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
                                        ccb_cookie_name: 'darkmode',
                                        ccb_cookie_domain: 'orestbida.com',
                                        ccb_cookie_expiration: 'One week after the cookie has been created',
                                        ccb_cookie_description: 'Used to remember visitor preferences. If darkmode was enabled, then the next time you visit the website, darkmode will be automatically turned on.' ,
                                        ccb_cookie_type: 'Permanent cookie'
                                    }
                                ]
                            },{
                                ccb_title : "More information",
                                ccb_description: 'For any queries in relation to my policy on cookies and your choices, please contact me.',
                            }
                        ],
                        ccp_save_text : "Save preferences"
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
                        ...
                    },
                    policy : {
                        ...
                    }
                }
            ]
        });
        ```

## TODO
List of things to implement
- [ ] Add dark-mode 
    - can be enabled based on a custom specific class set by user
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