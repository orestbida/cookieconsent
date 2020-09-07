# Cookie Consent
Simple cross-browser cookie consent plugin written in plain javascript.

## Why though
I wanted a simple, `lightweight` but also `extensible` plugin, which could be placed in my own web server without the need of making additional external requests. The reason was to further optimize the loading speed of my website.

Main features
- __Cross-browser__ support (IE8+)
- __Standalone__ (no external dependecies needed)
- __Lightweight__ (~ 8kb for optimized/minified version)
- Can easily add __support__ for __additional languages__
- Automatic browser language detection
- No additional external http requests

## How to run
- __Include file__ (or load it dynamically)
	```javascript
	<script src="<your_path>/cookieconsent.js"></script>
	```
- __Obtain Cookie-Consent plugin__ 
	```javascript
	const CookieConsent = initCookieConsent();
	```
- __Initialize cookieconsent__ (with default config. settings)
	```javascript
	CookieConsent.run(<config_object>);
	```
- __Show cookieconsent modal__ (will show only if cookieconsent was not alredy accepted)
	```javascript
	CookieConsent.show(<optional_delay_value>);
	```
- __Hide cookieconsent modal__ (if it is attached to dom)
	```javascript
	CookieConsent.hide();
	```

## Custom config. settings
Another way is to run the cookieconsent with an initial __config object__ like in the example below. 
```javascript
CookieConsent.run({
	cc_autorun : false, 						
	cc_delay : 0,								
	cc_policy_url : null,				
	cc_enable_verbose : true,					
	cc_current_lang : 'en',	
	cc_auto_language : true,					
	cc_theme_css : '<your_path>/cookieconsent.css',
	cc_languages : [
		{
			lang : 'it',
			modal : {
				cc_title : "My cookie-modal title",
				cc_description : "My cookie-modal description",
				cc_more_text : "Learn more text",
				cc_accept_text : "Accept cookie-modal text"
			},
			policy : {
				cc_title : "My cookie-policy title",
				ccp_save_text : "Save preferences text",
				ccp_blocks : [
					{
						ccb_title : "Block1 title",
						ccb_descritpion: "Block1 description"
					},
					{
						ccb_title : "Block2 title",
						ccb_description: "Block2 descritpion",
						ccb_switch : {
							value : 'block_2_cookies',
							enabled : true,
							readonly : false
						}
					}
				]
			}
		}
	]
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
- __cc_current_lang__ : (string)
	- *default* : "en"
	- when specified, modal will be set to that language (if it is implemented)
- __cc_auto_language__ : (boolean)
	- *default* : false
	- if set to true, cc_current_lang will be ignored, and the cookieconsent modal will set its language based on client browser language (if specific client browser language is not defined, a fallback_language="en" will be used instead)
- __cc_theme_css__ : (string)
	- *default* : null
	- specify path to local cookieconsent.css file
- __cc_policy_url__ : (string)
	- *default* : null
	- specify path to your own cookieconsent policy page (eg. https://mydomain.com/cookiepolicy/)
- __cc_languages__ : (string)
	- *default* : [{<en_language_only>}]
	- define (multiple) new languages or override default one (en)
	- example usage:
		```javascript
			CookieConsent.run({
				cc_languages : [
					{
						lang : "it"	//add italian
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
- [ ] Implement a dropdown select language menu when multiple languages are defined
- [x] `Custom cookie-policy url` (useful for those who alredy have a cookie policy)
- [ ] Make cookieconsent **`GPDR compliant`**:
	- Implement "learn more" modal with a brief explanation about cookies
	- Implement custom-cookie-table containing:
		- column for cookie-name
		- column for cookie-description
		- column for cookie-expiration-date
	- Implement the (eventual) `possibility of opting-out` of cookie-consent