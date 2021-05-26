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
    theme_css: '../dist/cookieconsent.css',
    force_consent: true,

    /* New options from v2.4 (everything is optional) */
    // remove_cookie_tables: false              // default: false (if set to true, cookie table's html will not be generated)

    // cookie_domain: location.hostname,       	// default: current domain
    // cookie_path: "/",                        // default: root
    // cookie_same_site: "Lax",
    
    /* Manage existing <scripts> tags (check readme.md) */
    page_scripts: true,                         // default: false (by default don't manage existing script tags)

    /* Basic gui options */
    gui_options : {
        consent_modal : {
            layout : 'cloud',               // box(default),cloud,bar
            position : 'bottom center',     // bottom(default),top + left,right,center:=> examples: 'bottom' or 'top right'
            transition : 'slide'            // zoom(default),slide
        },
        settings_modal : {
            layout : 'box',                 // box(default),bar
            // position: 'left',            // right(default),left (available only if bar layout selected)
            transition : 'slide'            // zoom(default),slide
        }
    },

    /* End new options added in v2.4 */

    onAccept: function(cookie){
        console.log("onAccept fired ...");
        disableBtn('btn2');
        disableBtn('btn3');
        
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
                title :  "👋 It's time for some nice cookies",
                description :  'Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it. The latter will be set only after consent. <a href="#privacy-policy" class="cc-link">Privacy policy</a>',
                primary_btn: {
                    text: 'Accept all',
                    role: 'accept_all'      //'accept_selected' or 'accept_all'
                },
                secondary_btn: {
                    text : 'Manage preferences',
                    role : 'settings'       //'settings' or 'accept_necessary'
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
                    {col3: "Expiration" }
                ],
                blocks : [
                    {
                        title : "Cookie usage",
                        description: getLoremIpsum()+' <a href="#" class="cc-link">Privacy Policy</a>.'
                    },{
                        title : "Strictly necessary cookies",
                        description: getLoremIpsum()+getLoremIpsum()+"<br><br>"+getLoremIpsum()+getLoremIpsum(),
                        toggle : {
                            value : 'necessary',
                            enabled : true,
                            readonly: true  //cookie categories with readonly=true are all treated as "necessary cookies"
                        }
                    },{
                        title : "Analytics & Performance cookies",
                        description: getLoremIpsum()+getLoremIpsum(),
                        toggle : {
                            value : 'analytics',
                            enabled : false,
                            readonly: false
                        },
                        cookie_table: [
                            {
                                col1: '_ga',
                                col2: 'yourdomain.com',
                                col3: getLoremIpsum(),
                            },
                            {
                                col1: '_gat',
                                col2: 'yourdomain.com',
                                col3: getLoremIpsum(),
                            },
                            {
                                col1: '_gat_UA-46747204-9',
                                col2: 'yourdomain.com',
                                col3: getLoremIpsum(),
                            },
                            {
                                col1: '_gid',
                                col2: 'yourdomain.com',
                                col3: 'description ...',
                            },
                            {
                                col1: '_my_cookie',
                                col2: 'yourdomain.com',
                                col3: 'test cookie with custom path ...',
                                path: '/demo'       // needed for autoclear cookies 
                            }
                        ]
                    },{
                        title : "Targeting & Advertising cookies",
                        description: 'If this category is deselected, <b>the page will reload when preferences are saved</b>... <br><br>(demo example with reload option enabled, for scripts like microsoft clarity which will re-set cookies and send beacons even after the cookies have been cleared by the cookieconsent\'s autoclear function)',
                        toggle : {
                            value : 'targeting',
                            enabled : false,
                            readonly: false,
                            reload: 'on_disable'            // New option in v2.4, check readme.md
                        },
                        cookie_table : [
                            {
                                col1: '^_cl',               // New option in v2.4: regex (microsoft clarity cookies)
                                col2: 'yourdomain.com',
                                col3: 'These cookies are set by microsoft clarity',
                                // path: '/',               // New option in v2.4
                                is_regex: true              // New option in v2.4
                            }
                        ]
                    },{
                        title : "More information",
                        description: getLoremIpsum() + ' <a class="cc-link" href="https://orestbida.com/contact/">Contact me</a>.',
                    }
                ]
            }
        }
    }
});

function getLoremIpsum(){
    return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
}

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