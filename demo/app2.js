/*
 * CookieConsent v2 DEMO config.
*/

// obtain cookieconsent plugin
var cc = initCookieConsent();

// run plugin with config object
cc.run({
	autorun : true, 
	delay : 0,
	current_lang : 'en',
	auto_language : false,
	autoclear_cookies : true,
	cookie_expiration : 365,
	autoload_css: true,
	theme_css: '../dist/cookieconsent.css',
	force_consent: true,

	onAccept: function(cookie){
		console.log("onAccept fired ...");
		if(cc.allowedCategory('analytics_cookies')){
			cc.loadScript('https://www.google-analytics.com/analytics.js', function(){		
				ga('create', 'UA-46747204-4', 'auto');
				ga('send', 'pageview');
				console.log("analytics.js loaded");
			});
		}
		
		// Delete line below
		document.getElementById("cookie_val").innerHTML = JSON.stringify(cookie, null, 2);
	},

	onChange: function(cookie){
		console.log("onChange fired ...");
		// do something ...

		// Delete line below
		document.getElementById("cookie_val").innerHTML = JSON.stringify(cookie, null, 2);
	},

	languages : {
		'en' : {	
			consent_modal : {
				title :  "I use cookies",
				description :  'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#privacy-policy" class="cc-link">Privacy policy</a>',
				primary_btn: {
					text: 'Accept all',
					role: 'accept_all'				//'accept_selected' or 'accept_all'
				},
				secondary_btn: {
					text : 'Manage preferences',
					role : 'settings'				//'settings' or 'accept_necessary'
				}
			},
			settings_modal : {
				title : '<div>Cookie preferences</div><div aria-hidden="true" style="font-size: .8em; font-weight: 200; color: #687278; margin-top: 5px;">Powered by <a tabindex="-1" aria-hidden="true" href="https://github.com/orestbida/cookieconsent/" style="text-decoration: underline;">cookie-consent</a></div>',
				save_settings_btn : "Save current selection",
				accept_all_btn : "Accept all",
				close_btn_label: "Close",
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
						description: 'I use cookies to ensure the basic functionalities of the website and to enhance your online experience. You can choose for each category to opt-in/out whenever you want. For more details relative to cookies and other sensitive data, please read the full <a href="#" class="cc-link">privacy policy</a>.'
					},{
						title : "Strictly necessary cookies",
						description: 'These cookies are essential for the proper functioning of my website. Without these cookies, the website would not work properly',
						toggle : {
							value : 'necessary_cookies',
							enabled : true,
							readonly: true							//cookie categories with readonly=true are all treated as "necessary cookies"
						}
					},{
						title : "Preferences cookies",
						description: 'These cookies allow the website to remember the choices you have made in the past',
						toggle : {
							value : 'preferences_cookies',	//there are no default categories => you specify them
							enabled : true,
							readonly: false
						}
					},{
						title : "Analytics cookies",
						description: 'These cookies collect information about how you use the website, which pages you visited and which links you clicked on. All of the data is anonymized and cannot be used to identify you',
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
								col4: 'description ...' ,
								col5: 'Permanent cookie'
							},
							{
								col1: '_gat',
								col2: 'google.com',
								col3: '1 minute',
								col4: 'description ...' ,
								col5: 'Permanent cookie'
							},
							{
								col1: '_gid',
								col2: 'google.com',
								col3: '1 day',
								col4: 'description ...' ,
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

// DELETE ALL CONTENT BELOW THIS COMMENT!!!
if(cc.validCookie('cc_cookie')){
    //if cookie is set => disable buttons
    disableBtn('btn2');
    disableBtn('btn3');
}

function disableBtn(id){
    document.getElementById(id).disabled = true;
    document.getElementById(id).className = "styled_btn disabled";
}

var darkmode = false;

function toggleDarkmode(){
    if(!darkmode){
        document.getElementById('theme').innerText = 'dark theme';
		document.body.className='d_mode c_darkmode';
        darkmode = true;
    }else{
        document.getElementById('theme').innerText = 'light theme';
		document.body.className='d_mode';
        darkmode = false;
    }
}

/*
* The following lines of code are for demo purposes (show api functions)
*/
if(document.addEventListener){

    document.getElementById("btn2").addEventListener('click', function(){
        cc.show(0);
    });

    document.getElementById("btn3").addEventListener('click', function(){
        cc.hide();
    });

    document.getElementById("btn5").addEventListener('click', function(){
        cc.showSettings(0);  
    });

    document.getElementById("btn6").addEventListener('click', function(){
        toggleDarkmode();
    });
}else{
    document.getElementById("btn2").attachEvent('onclick', function(){
        cc.show(0);
    });

    document.getElementById("btn3").attachEvent('onclick', function(){
        cc.hide();
    });

    document.getElementById("btn5").attachEvent('onclick', function(){
        cc.showSettings(0);  
    });

    document.getElementById("btn6").attachEvent('onclick', function(){
		toggleDarkmode();
    });
}