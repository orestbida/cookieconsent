/*
 * CookieConsent v2 DEMO config.
*/

// obtain cookieconsent plugin
var cc = initCookieConsent();

// run plugin with config object
cc.run({
	autorun : true, 							// [OPTIONAL] show consent modal as soon as possible
	delay : 0,									// [OPTIONAL] specify initial delay after website has loaded		
	current_lang : 'en',						// [REQUIRED] specify one of the languages defined inside languages below (NOTE: can be dynamic value)
	autoload_css : true, 						// [OPTIONAL] if true, load css via js (NOTE: theme_css must have valid path)
	theme_css : "../dist/cookieconsent.css",		// [OPTIONAL*] (NOTE: autoload_css needs to be set to true)
	auto_language : true,						// [OPTIONAL] if true, grab the language based on the client browser
	autoclear_cookies : true,					// [OPTIONAL] if true, delete all cookies specified inside the cookie table, in a block after being deselected in the settings modal
	cookie_expiration : 365,    				// [OPTIONAL] change default expiration number of days
	
	onAccept: function(cookie){						// [OPTIONAL]
		console.log(cookie);
		console.log("onAccept fired ...");
		if(cc.allowedCategory('analytics_cookies')){
			cc.loadScript('https://www.google-analytics.com/analytics.js', function(){		
				ga('create', 'UA-46747204-4', 'auto');
				ga('send', 'pageview');
				console.log("analytics.js loaded");
			});
		}
		
		document.getElementById('cookie').innerHTML = '<pre>'+JSON.stringify(cookie, null, 2)+'</pre>';
	},

	onChange: function(cookie){						// [OPTIONAL]
		console.log("onChange fired ...");
		// do something ...
		console.log(cookie);
		document.getElementById('cookie').innerHTML = '<pre>'+JSON.stringify(cookie, null, 2)+'</pre>';
	},

	languages : {
		'en' : {	
			consent_modal : {
				title :  "I use cookies",
				description :  'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only upon approval. <a aria-label="Cookie policy" class="cc-link" href="#">Read more</a>',
				primary_btn: {
					text: 'Accept',
					role: 'accept_all'				//'accept_selected' or 'accept_all'
				},
				secondary_btn: {
					text : 'Settings',
					role : 'settings'				//'settings' or 'accept_necessary'
				}
			},
			settings_modal : {
				title : '<div>Cookie settings</div><div style="font-size: .8em; font-weight: 200; color: #859198; margin-top: 5px;">Powered by <a href="https://github.com/orestbida/cookieconsent/" aria-label="powered by cookie-consent" style="text-decoration: underline;">cookie-consent</a></div>',
				save_settings_btn : "Save settings",
				accept_all_btn : "Accept all",
				cookie_table_headers : [
					{col1: "Name" }, 
					{col2: "Domain" }, 
					{col3: "Expiration" }, 
					{col4: "Description" }, 
					{col5: "Type" }
				],
				blocks : [
					{
						title : "Cookie usage",
						description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details about cookies and how I use them, read the full <a href="#" class="cc-link">cookie policy</a>.'
					},{
						title : "Strictly necessary cookies",
						description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly.',
						toggle : {
							value : 'necessary_cookies',
							enabled : true,
							readonly: true							//cookie categories with readonly=true are all treated as "necessary cookies"
						}
					},{
						title : "Preferences cookies",
						description: 'These cookies allow the website to remember the choices you have made in the past.',
						toggle : {
							value : 'preferences_cookies_3rweds',	//there are no default categories => you specify them
							enabled : true,
							readonly: false
						}
					},{
						title : "Analytics cookies",
						description: 'These cookies cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.',
						toggle : {
							value : 'analytics_cookies',
							enabled : false,
							readonly: false
						},
						cookie_table: [
							{
								col1: '_ga',
								col2: 'google.com',
								col3: '2 years',
								col4: '<span><b>description</b> ...</span>' ,
								col5: 'Permanent cookie'
							},
							{
								col1: '_gat',
								col2: 'google.com',
								col3: '1 minute',
								col4: '<b>description</b> ...' ,
								col5: 'Permanent cookie'
							},
							{
								col1: '_gid',
								col2: 'google.com',
								col3: '1 day',
								col4: '<b>description</b> ...' ,
								col5: 'Permanent cookie'
							}
						]
					},{
						title : "More information",
						description: 'For any queries in relation to my policy on cookies and your choices, please <a class="cc-link" href="https://orestbida.com/contact">contact me</a>.',
					}
				]
			}
		}
	}
});