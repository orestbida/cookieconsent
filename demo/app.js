(function(){

    // load plugin
    loadJS('../src/cookieconsent.js', function(){

        // obtain plugin object
        var cc = initCookieConsent();

        cc.run({
            "cc_autorun" : true, 							// show as soon as possible (without the need to manually call CookieConsent.show() )
            "cc_delay" : 0,								// specify initial delay after website has loaded
            "cc_website_name" : "Orest Bida",
            "cc_website_url" : "orestbida.com",				
            "cc_enable_verbose" : true,						// if enabled, prints all info/error msgs	
            "cc_current_lang" : "en",	
            "cc_auto_language" : false,						// if enabled, overrides cc_current_lang
            "cc_theme_css" : "../src/cookieconsent.css"		// path to cookieconsent css
        });

        addEvent(document.getElementById("btn1"), "click", function(){
            autorun();
        });
    
        addEvent(document.getElementById("btn2"), "click", function(){
            cc.show(0);                              // specify 0 as delay value
        });
    
        addEvent(document.getElementById("btn3"), "click", function(){
            cc.hide();                               // hide cookie consent
        });
    
        addEvent(document.getElementById("btn4"), "click", function(){
            cc.clearCookies();                        
        });
    })


    //autorun();

    /**
     * Add event listener to dom object (cross browser function)
     * @param {Object} elem 
     * @param {string} event //event type
     * @param {Object } fn 
     * @param {boolean} passive
     */
    function addEvent(elem, event, fn, passive) {
        var passive = passive || false;

        if (elem.addEventListener) {
            passive ? elem.addEventListener(event, fn, { capture: true, passive: true }) : elem.addEventListener(event, fn, false);
        } else {
            /**
             * For old browser, convert "click" and "focus" event to onclick
             * since the're not always supported
             */
            if (event == "click" || event == "focus") {
                event = "onclick";
            }
            elem.attachEvent(event, fn);
        }
    }

    function loadJS(url, callback) {
        var script = document.createElement( "script" )
        script.type = "text/javascript";
        if(script.readyState) {  // only required for IE <9
          script.onreadystatechange = function() {
            if ( script.readyState === "loaded" || script.readyState === "complete" ) {
              script.onreadystatechange = null;
              callback();
            }
          };
        } else {  //Others
          script.onload = function() {
            callback();
          };
        }
      
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
	}

})();