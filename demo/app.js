(function(){

	var auto = true;
	var lorem_ipsum_short = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
	var lorem_ipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur';
	
	// obtain plugin object
	var cc = initCookieConsent();

	// init plugin
	var autorun = function(){
		cc.run({
			cc_autorun : auto, 							// show as soon as possible (without the need to manually call CookieConsent.show() )
			cc_delay : 0,								    // specify initial delay after website has loaded		
			cc_enable_verbose : true,						// if enabled, prints all info/error msgs	
			cc_current_lang : 'en',							
			cc_policy_url : null,                           // specify your own dedicated cookie policy page url
			cc_auto_language : true,						// if enabled, overrides cc_current_lang
			cc_theme_css : "../src/cookieconsent.css",		// path to cookieconsent css
			cc_languages : [
				{
					lang : 'it',
					modal : {
						cc_title : "Noi usiamo i cookies",
						cc_description : lorem_ipsum_short,
						cc_more_text : "Scopri di più",
						cc_accept_text : "Ho capito"
					},
					policy : {
						ccp_title : "La mia cookie-policy",
						ccp_save_text : "Salva preference",
						ccp_blocks : [
							{
								title : "Cookie essenziali",
								description: lorem_ipsum + "<br><br>" + lorem_ipsum
							},
							{
								title : "Cookie di funzionalità",
								description: lorem_ipsum,
								switch : {
									value : 'cc_funzionalita',
									enabled : true,
									readonly : true
								}
							},
							{
								title : "Cookie pubblicitari",
								description: lorem_ipsum,
								switch : {
									value : 'cc_publicita',
									enabled : false,
									readonly : false
								}
							}
						]
					}
				}
			]
		});
	}

	if(auto)
		autorun();

	document.getElementById("btn1").addEventListener('click', function(){
		autorun();
	});

	document.getElementById("btn2").addEventListener('click', function(){
		cc.show(0);
	});

	document.getElementById("btn3").addEventListener('click', function(){
		cc.hide();
	});

	document.getElementById("btn4").addEventListener('click', function(){
		cc.clearCookies();
	});

	document.getElementById("btn5").addEventListener('click', function(){
		cc.show_policy(0);  
	});
})();