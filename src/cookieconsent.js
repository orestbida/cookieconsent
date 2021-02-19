/*!
 * CookieConsent v2
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 */
(function(scope){
    'use strict';
    var CookieConsent = function(){
        var _cookieconsent = {};
        
        var consent_modal_exists = false;
        var cookie_consent_acepted = false;

        // variable to save main dom elements (to avoid using document.getElementById)
        var main_container = null;
        var consent_modal = null;
        var settings_container = null;

        // Array of booleans to keep track of enabled/disabled preferences
        var toggle_states = [];

     
        //default cookieConsent config settings (some are implicit, not shown here)
        var _config = {
            current_lang : "en",         			    
            autorun: true, 							    // run as soon as loaded
            delay: 0,								    // default milliseconds delay	
            cookie_expiration : 182,					// default: 6 months (in days)
        };

        /**
         * Update config settings
         * @param {Object} conf_params 
         */
        var _setConfig = function(conf_params){
            _log("CookieConsent [CONFIG]: recieved_config_settings ", conf_params);

            if(typeof conf_params['cookie_expiration'] === "number"){
                _config.cookie_expiration = conf_params['cookie_expiration'];
            }

            if(typeof conf_params['autorun'] === "boolean"){
                _config.autorun = conf_params['autorun'];
            }

            if(conf_params['auto_language']){
                _config.current_lang = _getValidatedLanguage(_getBrowserLang(), conf_params.languages);
            }else{
                if(typeof conf_params['current_lang'] === "string"){
                    _config.current_lang = _getValidatedLanguage(conf_params['current_lang'], conf_params.languages);;
                }
            }

            _log("CookieConsent [LANG]: setting current_lang = '"+ _config.current_lang + "'");
        }

        /**
         * Search for all occurrences in webpage and add an onClick listener : 
         * when clicked => open settings modal
         */
        var _addCookieSettingsButtonListener = function(){
            var all_links = document.querySelectorAll('a[data-cc="c-settings"], button[data-cc="c-settings"]');
            for(var x=0; x<all_links.length; x++){
                _addEvent(all_links[x], 'click', function(event){
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    _cookieconsent.showSettings();
                });
            }
        }

        /**
         * Check if given lang index exists as a defined property inside _config object
         * If it exists -> desired language is implemented for cookieconsent
         * Otherwise switch back to default current_lang
         * @param {string} lang 
         */
        var _getValidatedLanguage = function(lang, all_languages){
            if(all_languages.hasOwnProperty(lang)){
                return lang;
            }else if(_getKeys(all_languages).length > 0){
                if(all_languages.hasOwnProperty(_config.current_lang)){
                    return _config.current_lang ;
                }else{
                    return _getKeys(all_languages)[0];
                }
            }
        }

        /**
         * Generate cookie consent html based on config settings
        */
        var _createCookieConsentHTML = function(never_accepted, conf_params){

            // Create main container which holds both consent modal & settings modal
            main_container = document.createElement('div');
            main_container.setAttribute('c_data', 'c_cookie_main');
            
            // Fix layout flash
            main_container.style.position = "fixed";
            main_container.style.zIndex = "1000000";
            main_container.innerHTML = '<!--[if lt IE 9 ]><div id="cc_div" class="ie"></div><![endif]--><!--[if (gt IE 8)|!(IE)]><!--><div id="cc_div"></div><!--<![endif]-->'
            var all_modals_container = main_container.children[0];

            // If never_accepted => create consent-modal
            if(!never_accepted){
                
                consent_modal = document.createElement("div");
                var consent_title = document.createElement("h1");
                var consent_text = document.createElement("p");
                var consent_buttons = document.createElement("div");
                var consent_primary_btn = document.createElement("button");
                var consent_secondary_btn = document.createElement("button");

                // Set for each of them, their default configured ids
                consent_modal.id = 'cm';
                consent_title.id = 'cm_title';
                consent_text.id = 'cm_text';
                consent_buttons.id = "cm_btns";
                consent_primary_btn.id = 'cm_primary_btn';
                consent_secondary_btn.id = 'cm_secondary_btn';
                consent_primary_btn.setAttribute('type', 'button');
                consent_primary_btn.className =  "c_button";
                consent_secondary_btn.className = "c_link";
                consent_modal.style.visibility = "hidden";
                consent_secondary_btn.setAttribute('type', 'button');

                // Get current lang
                var lang = _config.current_lang;

                consent_title.innerHTML = conf_params.languages[lang]['consent_modal']['title'];
                consent_text.innerHTML = conf_params.languages[lang]['consent_modal']['description'];
                consent_primary_btn.innerHTML = conf_params.languages[lang]['consent_modal']['primary_btn']['text'];
                consent_secondary_btn.innerHTML = conf_params.languages[lang]['consent_modal']['secondary_btn']['text'];

                if(conf_params.languages[lang]['consent_modal']['primary_btn']['role'] == 'accept_all'){
                    _addEvent(consent_primary_btn, "click", function(){ 
                        _cookieconsent.hide();
                        _log("CookieConsent [ACCEPT]: cookie_consent was accepted!");
                        _saveCookiePreferences(conf_params, 1);     // 1 => accept all
                    });
                }else{
                    _addEvent(consent_primary_btn, "click", function(){
                        _cookieconsent.hide();
                        _log("CookieConsent [ACCEPT]: cookie_consent was accepted (necessary only)!");
                        _saveCookiePreferences(conf_params, -1);    // -1 => accept current selection
                    });
                }

                // insert title into consent_modal
                consent_modal.appendChild(consent_title);
            
                // insert description into consent_modal
                consent_modal.appendChild(consent_text);
            
                // insert buttons into consent_buttons
                consent_buttons.appendChild(consent_primary_btn);
                consent_buttons.appendChild(consent_secondary_btn);
                
                // insert btn_container into consent_modal
                consent_modal.appendChild(consent_buttons); 

                if(conf_params.languages[lang]['consent_modal']['secondary_btn']['role'] == 'accept_necessary'){
                    _addEvent(consent_secondary_btn, 'click', function(){
                        _cookieconsent.hide();
                        _saveCookiePreferences(conf_params, 0); // 0 => accept necesssary only
                    });
                }else{
                    _addEvent(consent_secondary_btn, 'click', function(){
                        _cookieconsent.showSettings(0);
                    });
                }

                // Append consent modal to dom
                all_modals_container.appendChild(consent_modal);
                consent_modal_exists = true;
            }

            /**
             * Create all consent_modal elems
             */
            settings_container = document.createElement("div");
            var settings_container_valign = document.createElement("div");
            var settings = document.createElement("div");
            var settings_container_inner = document.createElement("div");
            var settings_inner = document.createElement("div");
            var settings_title = document.createElement("h1");
            var settings_header = document.createElement("div");
            var settings_close_btn = document.createElement("button");
            var settings_blocks = document.createElement("div");
            settings_close_btn.setAttribute('type', 'button');
            
            /**
             * Set for each of them, their default configured ids
             */
            settings_container.id = 'cs_cont';
            settings_container_valign.id = "cs_valign";
            settings_container_inner.id = "cs_cont_inner";
            settings.id = "cs";
            settings_title.id = 'cs_title';
            settings_inner.id = "cs_inner";
            settings_header.id = "cs_header";
            settings_blocks.id = 'cs_blocks';
            settings_close_btn.id = 'cs_close_btn';
            settings_close_btn.innerHTML = 'x';
            settings_close_btn.className = 'c_button';

            _addEvent(settings_close_btn, 'click', function(){
                _cookieconsent.hideSettings();
            });

            var all_blocks = conf_params.languages[_config.current_lang]['settings_modal']['blocks'];

            // Get number of blocks with cs_lang as language
            var n_blocks = all_blocks.length;

            // Set cc settings modal title
            settings_title.innerHTML = conf_params.languages[_config.current_lang]['settings_modal']['title'];
            var count_toggles = 0, div_btns = [];
            
            // Create settings modal content (blocks)
            for(var i=0; i<n_blocks; ++i){
                
                // Create title
                var block_section = document.createElement('div');
                var block_title_container = document.createElement('div');
                var block_table_container = document.createElement('div');
                var block_title = document.createElement('h2');
                var block_desc = document.createElement('p');
                block_section.className = 'cs_block';
                block_title.className = 'b_title';
                block_title_container.className = 'title';
                block_table_container.className = 'desc';

                // set title and description for each block
                block_title.innerHTML =all_blocks[i]['title'];
                block_desc.innerHTML = all_blocks[i]['description'];

                block_title_container.appendChild(block_title);

                // create toggle if specified (opt in/out)
                if(typeof all_blocks[i]['toggle'] !== 'undefined'){
                    var block_switch_label = document.createElement('label');
                    var block_switch = document.createElement('input');
                    var block_switch_span = document.createElement('span');

                    block_switch_label.className = 'c_b_toggle';
                    block_switch.className = 'c_toggle';
                    block_switch.setAttribute('aria-label', 'toggle');
                    block_switch_span.className = 'sc_toggle';

                    block_switch.setAttribute('type', 'checkbox');
                    block_switch.value = all_blocks[i]['toggle'].value;
                    block_switch.setAttribute('aria-label', all_blocks[i]['toggle'].value);

                    // if cookie is set, get current saved preferences from cookie
                    if(never_accepted){
                        if(_cookieconsent.inArray(JSON.parse(_getCookie('cc_cookie')).level, all_blocks[i]['toggle'].value)){ 
                            block_switch.checked = true;
                            toggle_states.push(true);
                        }else{
                            toggle_states.push(false);
                        }
                    }else if(all_blocks[i]['toggle']['enabled']){
                        block_switch.checked = true;
                    }

                    if(all_blocks[i]['toggle']['readonly']){
                        block_switch.disabled = "disabled"
                        block_switch.readOnly = true;
                        _addClass(block_switch_span, 'sc_readonly');
                    }

                    block_switch_label.appendChild(block_switch);
                    block_switch_label.appendChild(block_switch_span);

                    block_title_container.appendChild(block_switch_label);

                    _addClass(block_table_container, 'accordion');
                    _addClass(block_title_container, 'block_button');
                    _addClass(block_section, 'block__expand');
                    div_btns.push(block_title_container);
                    
                    _addEvent(div_btns[count_toggles], 'click', function(_index){
                        if(!hasClass(div_btns[_index].parentNode, '_active')){
                            _addClass(div_btns[_index].parentNode, '_active');
                        }else{
                            _removeClass(div_btns[_index].parentNode, '_active');
                        }
                    }, false, count_toggles);

                    count_toggles++;
                }

                block_section.appendChild(block_title_container);
                block_table_container.appendChild(block_desc);

                // if cookie table found, generate table for this block
                if(typeof all_blocks[i]['cookie_table'] !== 'undefined'){

                    // generate cookie-table for this block
                    var block_table = document.createElement('table');

                    // create table header
                    var thead = document.createElement('thead');
                    var tr_tmp = document.createElement('tr');
                    var all_table_headers = conf_params.languages[_config.current_lang]['settings_modal']['cookie_table_headers'];
                    
                    /**
                     * Use custom table headers
                     */
                    for(var p=0; p<all_table_headers.length; ++p){ 
                        // create new header
                        var th1 = document.createElement('th');

                        // get custom header content
                        var new_column_key = _getKeys(all_table_headers[p])[0];
                        var new_column_content = all_table_headers[p][new_column_key];
                        
                        th1.innerHTML = new_column_content;
                        tr_tmp.appendChild(th1);  
                    }
                    
                    thead.appendChild(tr_tmp);
                    block_table.appendChild(thead);

                    var tbody = document.createElement('tbody');

                    // create table content
                    for(var n=0; n<all_blocks[i]['cookie_table'].length; n++){

                        var tr = document.createElement('tr');
 
                        for(var g=0; g<all_table_headers.length; ++g){ 

                            var td_tmp = document.createElement('td');
    
                            // get custom header content
                            var new_column_key = _getKeys(all_table_headers[g])[0];
                            var new_column_content = all_blocks[i]['cookie_table'][n][new_column_key];
            
                            td_tmp.innerHTML = new_column_content;
                            td_tmp.setAttribute('data-column', all_table_headers[g][new_column_key]);

                            tr.appendChild(td_tmp);
                        }

                        tbody.appendChild(tr);
                    }
               
                    block_table.appendChild(tbody);

                    //block_section.appendChild(block_table);
                    block_table_container.appendChild(block_table);
                }

                block_section.appendChild(block_table_container);
    
                // append block inside settings dom
                settings_blocks.appendChild(block_section);
            }

            // Create settings buttons
            var settings_buttons = document.createElement('div');
            var settings_save_btn = document.createElement('button');
            var settings_accept_all_btn = document.createElement('button');

            settings_buttons.id = 'cs_buttons';
            settings_save_btn.id = 'cs_save__btn';
            settings_accept_all_btn.id = 'cs_acceptall_btn';
            settings_save_btn.setAttribute('type', 'button');
            settings_accept_all_btn.setAttribute('type', 'button');
            settings_save_btn.className ='c_button';
            settings_accept_all_btn.className ='c_button';
            settings_save_btn.innerHTML = conf_params.languages[_config.current_lang]['settings_modal']['save_settings_btn'];
            settings_accept_all_btn.innerHTML = conf_params.languages[_config.current_lang]['settings_modal']['accept_all_btn'];
            settings_buttons.appendChild(settings_accept_all_btn);
            settings_buttons.appendChild(settings_save_btn);
           
            // Add save preferences button onClick event 
            // Hide both settings modal and consent modal
            _addEvent(settings_save_btn, 'click', function(){
                _cookieconsent.hideSettings();
                _cookieconsent.hide();
                _saveCookiePreferences(conf_params, -1);
            });

            _addEvent(settings_accept_all_btn, 'click', function(){
                _cookieconsent.hideSettings();
                _cookieconsent.hide();
                _saveCookiePreferences(conf_params, 1);
            });

            settings_header.appendChild(settings_title);
            settings_header.appendChild(settings_close_btn);
            settings_inner.appendChild(settings_header);
            settings_inner.appendChild(settings_blocks);
            settings_inner.appendChild(settings_buttons);
            settings_container_inner.appendChild(settings_inner);
            settings.appendChild(settings_container_inner);
            settings_container_valign.appendChild(settings);
            settings_container.appendChild(settings_container_valign);
            settings_container.style.visibility = "hidden";

            all_modals_container.appendChild(settings_container);

            // Finally append everything to body (main_container holds all modals container)
            document.body.appendChild(main_container);
        }

        /**
         * Save cookie preferences
         * accept_type = 0: accept necessary only
         * accept_type = 1: accept all
         * accept_type = -1: accept selection
         */
        var _saveCookiePreferences = function(conf_params, accept_type){
            
            // Get all cookiepreferences values saved in cookieconsent settings modal
            var category_toggles = document.querySelectorAll('.c_toggle');
            var c_cookie_level = '', changedSettings = false;

            // If there are opt in/out toggles ...
            if(typeof category_toggles.length === "number"){
                switch(accept_type){
                    case -1: 
                        //accept current selection
                        for(var i=0; i<category_toggles.length; i++){
                            if(category_toggles[i].checked){
                                c_cookie_level+='"'+category_toggles[i].value+'",';
                                if(!toggle_states[i]){
                                    changedSettings = true;
                                    toggle_states[i] = true;
                                }
                            }else{
                                if(toggle_states[i]){
                                    changedSettings = true;
                                    toggle_states[i] = false;
                                }
                            }
                        }
                        break;
                    case 0: 
                        // disable all except necessary
                        for(var i=0; i<category_toggles.length; i++){
                            if(category_toggles[i].readOnly){
                                c_cookie_level+='"'+category_toggles[i].value+'",';
                                toggle_states[i] = true;
                            }else{
                                category_toggles[i].checked = false;
                                if(toggle_states[i]){
                                    changedSettings = true;
                                    toggle_states[i] = false;
                                }
                            }
                        }
                        break;
                    case 1: 
                        // enable all
                        for(var i=0; i<category_toggles.length; i++){
                            category_toggles[i].checked = true
                            c_cookie_level+='"'+category_toggles[i].value+'",';
                            if(!toggle_states[i]){
                                changedSettings = true;
                            }

                            toggle_states[i] = true;
                        }
                        break;
                }

                // remove last ',' character
                c_cookie_level = c_cookie_level.slice(0, -1);
                
                /**
                 * If autoclear_cookies==true -> delete all cookies which are unused (based on selected preferences)
                 */
                if(conf_params['autoclear_cookies'] && cookie_consent_acepted){

                    // Get array of all blocks defined inside settings
                    var all_blocks = conf_params.languages[_config.current_lang]['settings_modal']['blocks'];
                    
                    // Get number of blocks
                    var len = all_blocks.length;

                    // For each block
                    var count = -1;
                    for(var jk=0; jk<len; jk++){

                        // Save current block (local scope & less accesses -> ~faster value retrieval)
                        var curr_block = all_blocks[jk];

                        // If current block has a toggle for opt in/out
                        if(curr_block.hasOwnProperty('toggle')){
                            
                            // if current block has a cookie table with toggle off => delete cookies
                            if(!toggle_states[++count] && curr_block.hasOwnProperty('cookie_table')){
                               
                                var ckey = _getKeys(conf_params.languages[_config.current_lang]['settings_modal']['cookie_table_headers'][0])[0];
                                
                                // Get number of cookies defined in cookie_table
                                var clen = curr_block['cookie_table'].length;
                                
                                // Delete each cookie defined in ccb_cookie_table of current block
                                for(var hk=0; hk<clen; hk++){
                                    // Get current row of table (corresponds to all cookie params)
                                    var curr_row = curr_block['cookie_table'][hk];
                                    
                                    // If cookie exists -> delete it
                                    if(_getCookie(curr_row[ckey]) != ""){
                                        _eraseCookie(curr_row[ckey]);
                                        _log('CookieConsent [AUTOCLEAR]: deleting cookie: \''+curr_row[ckey] +'\'');
                                    }
                                }
                            }  
                        }
                    }
                }
            }

            // save cookie with 'preferences' level
            _setCookie('cc_cookie', '{"level": ['+c_cookie_level+']}', _config.cookie_expiration, 0, 0);

            if(typeof conf_params['onAccept'] === "function" && !cookie_consent_acepted){
                cookie_consent_acepted = true;
                return conf_params['onAccept']();
            }

            // fire onChange only if settings were changed
            if(typeof conf_params['onChange'] === "function" && changedSettings){
                conf_params['onChange']();
            }
        }

        /**
         * Preload asset (css or javascript)
         * @param {string} href 
         * @param {string} as 
         */
        var _preload = function(href, as){
            var preload = document.createElement('link');
            preload.rel = 'preload';
            preload.href = href;
            preload.setAttribute('as', as);
            document.getElementsByTagName('head')[0].appendChild(preload);
            _log('CookieConsent [PRELOAD]: preloaded '+as, href);
        }
        
        /**
         * Load .css file for CookieConsent specified via the parameter
         * @param {string} css_file_path 
         */
        function _loadCookieConsentCSS(conf_parms, callback) {
            if(conf_parms['autoload_css']){

                // preload style
                _preload(conf_parms['theme_css'], 'style');

                // create link
                var link = document.createElement('link'), sheet, cssRules;
                link.href = conf_parms['theme_css']; 
                link.rel  = 'stylesheet';
                link.type = 'text/css';

                // get the correct properties to check for depending on the browser
                if ('sheet' in link ) {
                    sheet = 'sheet'; cssRules = 'cssRules';
                } else {
                    sheet = 'styleSheet'; cssRules = 'rules';
                }

                // Actively check if style is loaded ...
                var interval_id = setInterval( function() { 
                    if (link[sheet] && link[sheet][cssRules].length){
                        clearInterval(interval_id);                     
                        callback();
                    }
                }, 50);
                
                document.getElementsByTagName('head')[0].appendChild(link);
            }else{
                callback();
            }
        }

        /**
         * Returns true if value is found inside array
         * @param {Array} arr 
         * @param {Object} value 
         */
        _cookieconsent.inArray = function(arr, value){
            var len = arr.length;
            for(var i=0; i<len; i++){
                if(arr[i] == value)
                    return true;
            }
            return false;
        }

        /**
         * Helper function which prints info (console.log())
         * @param {object} print_msg 
         * @param {object} optional_param 
         */
        var _log = function(print_msg, optional_param, error){
            !error ? console.log(print_msg, optional_param || "") : console.error(print_msg, optional_param || "");
        }
        
        /**
         * Get current client - browser language
         * Used when 'auto_language' config property is set to 'true' (boolean)
         */
        var _getBrowserLang = function(){
            var browser_lang = navigator.language || navigator.browserLanguage;
            browser_lang.length > 2 && (browser_lang = browser_lang[0]+browser_lang[1]);
            _log("CookieConsent [LANG]: detected_browser_lang = '"+ browser_lang + "'");
            return browser_lang.toLowerCase()
        }

        /**
         * Returns true cookie category is saved into cc_cookie
         * @param {String} cookie_name 
         */
        _cookieconsent.allowedCategory = function(cookie_name){
            return this.inArray(JSON.parse(_getCookie('cc_cookie')).level || [], cookie_name);
        }

        /**
         * Check if cookieconsent is alredy attached to dom
         * If not, create one, configure it and attach it to body
         */
        _cookieconsent.run = function(conf_params){
            if(!main_container){
                
                // config all parameters
                _setConfig(conf_params);

                // Get cookie value
                var cookie_val = _getCookie('cc_cookie');

                // If cookie doesn't exist => cookie-consent never acepted
                if(!cookie_val){
                    
                    // Generate both cookie-consent & cookie-settings dom
                    _createCookieConsentHTML(false, conf_params);

                    // Load css (if enabled), and run callback function afterwards
                    _loadCookieConsentCSS(conf_params, function(){
                        // Add listener to open settings via custom attribute buttons and links
                        _addCookieSettingsButtonListener();

                        // Make both consent modal and settings modal animatable
                        _addClass(consent_modal, "c_anim");
                        _addClass(settings_container, "c_anim");

                        if(_config.autorun){
                            _cookieconsent.show(conf_params['delay'] || 0);
                        }
                    });
                }else{
                    // Generate only settings modal
                    _log("CookieConsent [NOTICE]: cookie consent alredy acepted!");

                    _createCookieConsentHTML(true, conf_params);
                    _loadCookieConsentCSS(conf_params, function(){ 
                        _addCookieSettingsButtonListener();

                        _addClass(settings_container, "c_anim");
                        
                        // Fire once onAccept method (if defined)
                        if(typeof conf_params['onAccept'] === "function" && !cookie_consent_acepted){
                            cookie_consent_acepted = true;
                            conf_params['onAccept'](JSON.parse(cookie_val != "" ? cookie_val : "null"));
                        }
                    });
                }
            }else{
                _log("CookieConsent [NOTICE]: cookie consent alredy attached to body!");
            }
        }

        _cookieconsent.showSettings = function(delay){
            setTimeout(function() {
                _addClass(settings_container, "cshow");
                _log("CookieConsent [SETTINGS]: showSettings_modal");
            }, typeof delay === "number" && delay > 0 ? delay : 0);
        }

        _cookieconsent.loadScript = function(src, callback, preload, attrs){

            // Check if script is not alredy loaded
            if(!document.querySelector('script[src="' + src + '"]')){
                
                // preload script
                preload && _preload(src, 'script');
                
                var script = document.createElement('script');

                // if an array is provided => add custom attributes
                if(attrs && attrs.length > 0){
                    for(var i=0; i<attrs.length; ++i){
                        script.setAttribute(attrs[i]['name'], attrs[i]['value']);
                    }
                }

                script.onload = function () {
                    callback();
                };

                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            }else{
                _log("CookieConsent [LOAD_SCRIPT]: script '"+src+"' alredy loaded!");
                callback();
            }
        }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {number} delay 
         */
        _cookieconsent.show = function(delay){
            if(consent_modal_exists){
                setTimeout(function() {
                    _addClass(consent_modal, "cshow");
                    _log("CookieConsent [MODAL]: show_consent_modal");
                }, typeof delay === "number" && delay > 0 ? delay : 0);
            }
        }

        /**
         * Hide consent modal
         */
        _cookieconsent.hide = function(){
            if(consent_modal_exists){
                _removeClass(consent_modal, "cshow");
            }
        }

        /**
         * Hide settings modal
         */
        _cookieconsent.hideSettings = function(){ 
            _removeClass(settings_container, "cshow");
        }

        /**
         * Set cookie, specifying name, value and expiration time
         * @param {string} name 
         * @param {string} value 
         * @param {number} days 
         * @param {number} hours 
         * @param {number} minutes 
         */
        var _setCookie = function(name, value, days, hours, minutes) {
            var expires = "";
        
            var date = new Date();
            date.setTime(date.getTime() + (1000 * (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60)));
            expires = "; expires=" + date.toUTCString();

            /**
             * Set secure cookie if https found
             */
            if(location.protocol === "https:"){
                document.cookie = name + "=" + (value || "") + expires + "; path=/; Domain=" + location.host+ "; SameSite=Lax; Secure";
            }else{
                document.cookie = name + "=" + (value || "") + expires + "; path=/; Domain=" + location.host+ "; SameSite=Lax;";
            }

            _log("CookieConsent [SET_COOKIE]: cookie "+ name + "='" + value + "' was set!");
        }

        /**
         * Get cookie value by name
         * returns cookie value if found, otherwise empty string: ""
         * @param {string} a 
         */
        var _getCookie = function(a) {
            return (a = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)")) ? a.pop() : ""
        }

        /**
         * Delete cookie by name
         * @param {string} name 
         */
        var _eraseCookie = function(name) {   
            document.cookie = name +'=; Path=/; Domain=' + location.host + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = name +'=; Path=/; Domain=.' + location.host + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }

        /**
         * Return true if cookie was found and has valid value (not empty string)
         * @param {string} cookie_name 
         */
        _cookieconsent.validCookie = function(cookie_name){
            var val = _getCookie(cookie_name);
            return val != "";
        }

        /**
         * Add event listener to dom object (cross browser function)
         * @param {Object} elem 
         * @param {string} event //event type
         * @param {Object } fn 
         * @param {boolean} passive
         */
        var _addEvent = function(elem, event, fn, passive, count_value) {
            var passive = passive || false, _fn = (typeof count_value !== 'number' ? fn : function(){ fn(count_value) });
            
            if (elem.addEventListener) {
                passive ? elem.addEventListener(event, _fn , { passive: true }) : elem.addEventListener(event, _fn, false);
            } else {
                /**
                 * For old browser, convert "click" and "focus" event to onclick
                 * since they're not always supported
                 */
                if (event == "click" || event == "focus") {
                    event = "onclick";
                }
                elem.attachEvent(event, _fn);
            }
        }

        /**
         * Get all prop. keys defined inside object
         * @param {Object} obj 
         */
        var _getKeys = function(obj){
            if(typeof obj === "object"){
                var keys = [], i = 0;
                for (keys[i++] in obj) {};
                return keys;
            }
        }

        /**
         * Append class to specified dom element
         * @param {Object} elem 
         * @param {string} classname 
         */
        var _addClass = function (elem, classname){
            if(elem.classList)
                elem.classList.add(classname)
            else{
                if(!hasClass(elem, classname))
                    elem.className += ' '+classname;
            }
        }

        /**
         * Remove specified class from dom element
         * @param {HTMLElement} elem 
         * @param {string} classname 
         */
        var _removeClass = function (el, className) {
            el.classList ? el.classList.remove(className) : el.className = el.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
        }

        /**
         * Check if html element has classname
         * @param {HTMLElement} el 
         * @param {String} className 
         */
        var hasClass = function(el, className) {
            if (el.classList) {
                return el.classList.contains(className);
            }
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }

        return _cookieconsent;
    };

    /**
     * Make CookieConsent object accessible globally
     */
    if(typeof scope.initCookieConsent === 'undefined'){
        scope.initCookieConsent = function(){
            return CookieConsent();
        };
    }
})(window);