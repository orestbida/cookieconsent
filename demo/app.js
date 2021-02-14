/*
 * CookieConsent v2
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
*/

// obtain cookieconsent plugin
var cc = initCookieConsent();

// run plugin with config object
cc.run({
	autorun : true, 							// [OPTIONAL] show consent modal as soon as possible
	delay : 0,									// [OPTIONAL] specify initial delay after website has loaded		
	current_lang : 'en',						// [REQUIRED] specify one of the languages defined inside languages below (NOTE: can be dynamic value)
	theme_css : "../src/cookieconsent.css",		// [REQUIRED] (NOTE: autoload_css need too be set to true)
	auto_language : true,						// [OPTIONAL] if true, override current_lang and grabs the language based on the client browser
	autoclear_cookies : true,					// [OPTIONAL] if true, delete all cookies specified inside the cookie table, in a block after being deselected in the settings modal
	autoload_css : true, 						// [OPTIONAL] if true, load css via js (NOTE: theme_css must have valid path)
	cookie_expiration : 365,    				// [OPTIONAL] change default expiration number of days
	enable_verbose : true,						// [OPTIONAL] if true, print all info/error messages (not available on dist version)
	
	onAccept: function(cookies){				// [OPTIONAL]
		if(cc.allowedCategory('marketing_analytics_cookies')){
			cc.loadScript('https://www.google-analytics.com/analytics.js', function(){		
				ga('create', 'UA-46747204-4', 'auto');
				ga('send', 'pageview');
			});
		}
	},

	onUpdate : function(cookies){				// [OPTIONAL]
		// do something if needed ...
	},

	languages : {
		en : {	
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
							readonly: true
						}
					},{
						title : "Preferences cookies",
						description: 'These cookies allow the website to remember the choices you have made in the past.',
						toggle : {
							value : 'preferences_cookies',
							enabled : true,
							readonly: false
						}
					},{
						title : "Statistics cookies",
						description: 'These cookies cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you.',
						toggle : {
							value : 'statistics_cookies',
							enabled : false,
							readonly: false
						},
						cookie_table: [
							{
								col1: '_ga',
								col2: 'google.com',
								col3: '2 years',
								col4: 'Secure connections only, Content: <span style="word-break: break-word;">AHWqTUn0x1l8j_qWOD0zBGG646eTNjqLQxNQ-wywrCEsS33DLylxgvZ7I98N1Xz_</span>' ,
								col5: 'Permanent cookie'
							},
							{
								col1: '_gat',
								col2: 'google.com',
								col3: '1 minute',
								col4: 'Secure connections only, Content: <span style="word-break: break-word;">AHWqTUn0x1l8j_qWOD0zBGG646eTNjqLQxNQ-wywrCEsS33DLylxgvZ7I98N1Xz_</span>' ,
								col5: 'Permanent cookie'
							},
							{
								col1: '_gid',
								col2: 'google.com',
								col3: '1 day',
								col4: 'Secure connections only, Content: <span style="word-break: break-word;">AHWqTUn0x1l8j_qWOD0zBGG646eTNjqLQxNQ-wywrCEsS33DLylxgvZ7I98N1Xz_</span>' ,
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