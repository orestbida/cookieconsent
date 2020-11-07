/*!
 * CookieConsent v1.2
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 */
(function(scope){
    'use strict';
    var CookieConsent = function(){
        
        var _cookieconsent = {};
        var _cc_modal_isHidden = true;
        var _cc_modal_isAttached = false;
        var _cc_policy_isHidden = true;
        var _cc_policy_isAttached = false;
        var _cc_modal_dom = null;
        var _cc_policy_dom = null;
        var _general_container_exists = false;
        
        /**
         * Default cookieConsent config settings
         */
        var _config = {
            cc_container : "body",  					// supports only "body", and ids like "#example_id"
            cc_current_lang : "en",         			
            cc_default_lang : "en",						// default language (from those in _config.cc_languages object)
            cc_autorun: true, 							// run as soon as loaded
            cc_delay: 0,								// default milliseconds delay	
            cc_policy_url: null,						// link to your own existing cookie-policy page	
            cc_enable_verbose: true,					// if enabled, show on console all events/errors
            cc_auto_language: false,    				// if enabled, overrides default cc_current_lang
            cc_cookie_expiration : 182,					// default: 6 months (in days)
            cc_cookie_name: "cc_cookie",
            cc_autoclear_cookies: true,                 // [NEW from version 1.2] if enabled -> erase unused cookies based on deselected preferences
            cc_autoload_css: true,                      // [NEW from version 1.2] if true -> autolad css
            cc_cc_darkmode_class : 'cc_darkmode',         // default class for dark mode -> if you change this make sure to also update css file with your class
            cc_theme_css: null,
			cc_languages : {}
        };

        /**
         * Update config settings (if user provided an config object)
         * @param {Object} conf_params 
         */
        var _setConfig = function(conf_params){
            try{
                if(typeof conf_params !== 'undefined' && conf_params != null){

                    if(typeof conf_params['cc_enable_verbose'] === "boolean"){
                        _config.cc_enable_verbose = conf_params['cc_enable_verbose'];
                    }
    
                    _printVerbose("CookieConsent [config_notice]: recieved_config_settings ", conf_params);
            
                    if(typeof conf_params['cc_auto_language'] === "boolean"){
                        _config.cc_auto_language = conf_params['cc_auto_language'];
                    }

                    if(typeof conf_params['cc_theme_css'] === "string"){
						_config.cc_theme_css = conf_params['cc_theme_css'];
                    }

                    if(typeof conf_params['cc_autoload_css'] === "boolean"){
						_config.cc_autoload_css = conf_params['cc_autoload_css'];
                    }

                    if(typeof conf_params['cc_cookie_expiration'] === "number"){
                        if(conf_params['cc_cookie_expiration'] > 0){
                            _config.cc_cookie_expiration = conf_params['cc_cookie_expiration'];
                        }
                    }

                    if(typeof conf_params['cc_delay'] === "number"){
                        conf_params['cc_delay'] >=0 ? _config.cc_delay = conf_params['cc_delay'] : false;
                    }

                    if(typeof conf_params['cc_autorun'] === "boolean"){
                        _config.cc_autorun = conf_params['cc_autorun'];
                    }

                    if(typeof conf_params['cc_policy_url'] === "string"){
                        _config.cc_policy_url = conf_params['cc_policy_url'];
                    }

                    if(typeof conf_params['cc_accept_callback'] === "function"){
                        _config.cc_accept_callback = conf_params['cc_accept_callback'];
                    }

                    if(typeof conf_params['cc_autoclear_cookies'] === "boolean"){
                        _config.cc_autoclear_cookies = conf_params['cc_autoclear_cookies'];
                    }

                    if(typeof conf_params['cc_languages'] === "object" && conf_params['cc_languages'].length > 0){
                        /**
                         * Add each defined custom language
                         */
                        for(var i=0; i<conf_params['cc_languages'].length; i++){
                            var lang_index = conf_params['cc_languages'][i]['lang'];
                            var lang_content = conf_params['cc_languages'][i];
                            
                            /**
                             * Add language only if it doesn't exist
                             */
                            if(!_config.cc_languages.hasOwnProperty(lang_index)){
                                /**
                                 * Add new language
                                 */
                                 _printVerbose("CookieConsent [config_notice]: adding_new_lang = '"+ lang_index +"'");
                                _config.cc_languages[lang_index] = {};
                                /**
                                 * Set modal content
                                 */
                                _config.cc_languages[lang_index].modal = {};
                                _config.cc_languages[lang_index].modal.cc_title = lang_content['modal']['cc_title'];
                                _config.cc_languages[lang_index].modal.cc_description = lang_content['modal']['cc_description'];
                                _config.cc_languages[lang_index].modal.cc_accept_text = lang_content['modal']['cc_accept_text'];
                                _config.cc_languages[lang_index].modal.cc_more_text = lang_content['modal']['cc_more_text'];

                                /**
                                 * Set policy content
                                 */
                                _config.cc_languages[lang_index].policy = {};
                                _config.cc_languages[lang_index].policy.ccp_blocks = [];
                                _config.cc_languages[lang_index].policy.ccp_title =  lang_content['policy']['ccp_title'];
                                _config.cc_languages[lang_index].policy.ccp_save_text =  lang_content['policy']['ccp_save_text'];

                                /**
                                 * Set all blocks for policy
                                 */
                                var all_blocks = lang_content['policy']['ccp_blocks'];

                                /**
                                 * Use custom table headers 
                                 */
                                if(lang_content['policy'].hasOwnProperty('ccb_table_headers')){

                                    _config.cc_languages[lang_index].policy.ccb_table_headers = [];

                                    var all_table_headers = lang_content['policy']['ccb_table_headers'], tmp_headers = [];

                                    for(var lk=0; lk<all_table_headers.length; ++lk){ 
                                        var tmp_header = {}, new_keys;
                                        new_keys = _getKeys(all_table_headers[lk]);
                                        tmp_header[new_keys[0]] = all_table_headers[lk][new_keys[0]];
                                        tmp_headers.push(tmp_header);
                                    }

                                    _config.cc_languages[lang_index].policy.ccb_table_headers = tmp_headers;
                                }

                                for(var j=0; j<all_blocks.length; j++){
                                    
                                    var block_tmp = {};
                                    
                                    block_tmp.ccb_title = all_blocks[j]['ccb_title'];
                                    block_tmp.ccb_description = all_blocks[j]['ccb_description'];
                                    
                                    if(all_blocks[j].hasOwnProperty('ccb_cookies_table')){
                                        block_tmp.ccb_cookies_table = [];

                                        var all_cookies_table_tmp = all_blocks[j]['ccb_cookies_table'];
                                        var all_table_headers = _config.cc_languages[lang_index].policy.ccb_table_headers;

                                        for(var t=0; t<all_cookies_table_tmp.length; t++){
                                            var ccb_cookie_tmp = {};
                                            for(var y=0; y<all_table_headers.length; ++y){
                                                new_keys = _getKeys(all_table_headers[y]);
                                                ccb_cookie_tmp[new_keys[0]] = all_cookies_table_tmp[t][new_keys[0]];
                                            }
                                            block_tmp.ccb_cookies_table.push(ccb_cookie_tmp);
                                        }
                                    }

                                    if(all_blocks[j].hasOwnProperty('ccb_switch')){
                                        var ccb_switch = {};
                                        ccb_switch.value = all_blocks[j]['ccb_switch']['value'];
                                        ccb_switch.enabled = all_blocks[j]['ccb_switch']['enabled'];
                                        ccb_switch.readonly = all_blocks[j]['ccb_switch']['readonly'];
                                        block_tmp.ccb_switch = ccb_switch;
                                    }

                                    _config.cc_languages[lang_index].policy.ccp_blocks.push(block_tmp);  
                                }
                            }
                        }
                    }

                    if(_config.cc_auto_language){
                        _config.cc_current_lang = _getValidatedLanguage(_getBrowserLang());
                    }else{
                        if(typeof conf_params['cc_current_lang'] === "string"){
                            _config.cc_current_lang = conf_params['cc_current_lang'];
                        }
                    }
                }else{
    
                    _printVerbose("CookieConsent [config_notice]: No initial config object found, using default values!");
    
                    if(_config.cc_auto_language){
                        _config.cc_current_lang = _getValidatedLanguage(_getBrowserLang())
                    }
                }
            }catch(ex){
                _printVerbose("CookieConsent [ERROR] => ", ex, true);
            }
        }

        /**
         * Add event listener to dom object (cross browser function)
         * @param {Object} elem 
         * @param {string} event //event type
         * @param {Object } fn 
         * @param {boolean} passive
         */
        var _addEvent = function(elem, event, fn, passive) {
            var passive = passive || false;
        
            if (elem.addEventListener) {
                passive ? elem.addEventListener(event, fn, { capture: true, passive: true }) : elem.addEventListener(event, fn, false);
            } else {
                /**
                 * For old browser, convert "click" and "focus" event to onclick
                 * since they're not always supported
                 */
                if (event == "click" || event == "focus") {
                    event = "onclick";
                }
                elem.attachEvent(event, fn);
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
            throw new TypeError("Parameter is not an object!");
        }

        /**
         * Append class to specified dom element
         * @param {Object} elem 
         * @param {string} classname 
         */
        var _addClass = function (elem, classname){
            elem.classList ? elem.classList.add(classname) : elem.className += ' '+classname;
        }

        /**
         * Remove specified class from dom element
         * @param {Object} elem 
         * @param {string} classname 
         */
        var _removeClass = function (el, className) {
            el.classList ? el.classList.remove(className) : el.className = el.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
        }

        /**
         * Search for all occurrences in webpage and add an onClick listener : 
         * when clicked => open cookie policy
         */
        var _addCookiePolicyButtonListener = function(){
            var all_links = document.querySelectorAll('a[data-cc="cc_policy"], button[data-cc="cc_policy"]');
            for(var x=0; x<all_links.length; x++){
                _addEvent(all_links[x], 'click', function(event){
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                    _cookieconsent.show_policy();
                });
            }
        }

        /**
         * Check if given lang index exists as a defined property inside _config object
         * If it exists -> desired language is implemented for cookieconsent
         * Otherwise switch back to default cc_current_lang
         * @param {string} lang 
         */
        var _getValidatedLanguage = function(lang){
            
            if(_config.cc_languages.hasOwnProperty(lang)){
                return lang;
            }else if(_getKeys(_config.cc_languages).length > 0){
                if(_config.cc_languages.hasOwnProperty(_config.cc_current_lang)){
                    return _config.cc_current_lang ;
                }else{
                    return _getKeys(_config.cc_languages)[0];
                }
            }
            throw new Error("No language defined!")
        }

        /**
         * Helper function which prints info (console.log()) only if verbose mode is enabled
         * @param {object} print_msg 
         * @param {object} optional_param 
         */
        var _printVerbose = function(print_msg, optional_param, error){
            !error ? _config.cc_enable_verbose && console.log(print_msg, optional_param || "") : _config.cc_enable_verbose && console.error(print_msg, optional_param || "");
        }

        /**
         * Given a description (text), set it as innerText inside dom element with given id
         * @param {string} id id of dom element
         * @param {string} cc_description innertext to set inside dom element
         */
        var _setText = function(id, cc_description){
            document.getElementById(id).innerText = cc_description
        };
        
        /**
         * Given a description (html), set it as innerHTML inside dom element with given id
         * @param {string} id 
         * @param {string} cc_description_html 
         */
        var _setHtml = function(id, cc_description_html){
            document.getElementById(id).innerHTML = cc_description_html
        }
        
        /**
         * Get current client - browser language
         * Used when 'cc_auto_language' config property is set to 'true' (boolean)
         */
        var _getBrowserLang = function(){
            var browser_lang = navigator.language || navigator.browserLanguage;
            browser_lang.length > 2 && (browser_lang = browser_lang[0]+browser_lang[1]);
            _printVerbose("CookieConsent [browser_lang_notice]: detected_browser_lang = '"+ browser_lang + "'");
            return browser_lang.toLowerCase()
        }

        var _createGeneralContainer = function(){
            /**
             * Create general container
             */
            var _cc_general_container = document.createElement('div');
            _cc_general_container.setAttribute('cc_data', 'cc_cookie_main');
            // Fix layout flash
            _cc_general_container.style.position = "fixed";
            _cc_general_container.style.zIndex = "1000000";
            _cc_general_container.innerHTML = '<!--[if lt IE 9 ]><div id="'+'cc__modal__container'+'" class="ie"></div><![endif]--><!--[if (gt IE 8)|!(IE)]><!--><div id="'+'cc__modal__container'+'"></div><!--<![endif]-->'

            /**
             * Check if cc_container prop. is configured
             * If valid, check if it is an id or body
             */
            if(typeof _config.cc_container === "string"){
                if(_config.cc_container[0] != "#"){
                    document.body.appendChild(_cc_general_container)
                }else{
                    /**
                     * Remove '#' character from string
                     * Append cc_modal object inside the specified dom element with id = _config.cc_container
                     */
                    var id_without_hashtag = _config.cc_container.substr(1);
                    document.getElementById(id_without_hashtag).appendChild(_cc_general_container);
                }
            }
            _general_container_exists = true;
        }

        /**
         * Generate cookie consent html based on config settings
        */
        var _createCookieConsentHTML = function(){
            
            /**
             * Create all cc_modal elems
             */
            var cc_modal = document.createElement("div");
            var cc_titolo = document.createElement("h1");
            var cc_text = document.createElement("p");
            var cc_btn_container = document.createElement("div");
            var cc_btn_accept = document.createElement("button");

            /**
             * If cookie-policy url is specified -> create link <a href="..."></a>
             * otherwise create a button that opens your own custom cookie policy
             */
            if(_config.cc_policy_url != null && typeof _config.cc_policy_url === 'string'){
                var cc_btn_more = document.createElement("a");
                cc_btn_more.href = _config.cc_policy_url;
            }else{
                var cc_btn_more = document.createElement("button");
                cc_btn_more.setAttribute('type', 'button');
            }

            /**
             * Set for each of them, their default configured ids
             */
            cc_modal.id = 'cc__modal';
            cc_titolo.id = 'cc__modal__title';
            cc_text.id = 'cc__modal__text';
            cc_btn_container.id = "cc__modal__btns";
            cc_btn_accept.id = 'cc__modal__accept__btn';
            cc_btn_more.id = 'cc__modal__more__btn';
            cc_btn_accept.setAttribute('type', 'button');

            _addClass(cc_btn_accept, "cc_button");
            _addClass(cc_btn_more, "cc__link");
            

            cc_modal.style.visibility = "hidden";

            // insert cc_title into cc_modal
            cc_modal.insertAdjacentElement('beforeend', cc_titolo);
        
            // insert cc_description into cc_modal
            cc_modal.insertAdjacentElement('beforeend', cc_text);
        
            // insert buttons into cc_btn_container
            cc_btn_container.insertAdjacentElement('beforeend', cc_btn_accept);
            cc_btn_container.insertAdjacentElement('beforeend', cc_btn_more);
            
            // insert btn_container into cc_modal
            cc_modal.insertAdjacentElement('beforeend', cc_btn_container);

            if(!_general_container_exists)
                _createGeneralContainer();
            
            document.getElementById('cc__modal__container').appendChild(cc_modal);
            _cc_modal_dom = cc_modal;
            _cc_modal_isAttached = true;
        }

        var _createCookieConsentPolicyHTML = function(){
            /**
             * Create all cc_modal elems
             */
            var cc_policy_container = document.createElement("div");
            var cc_v_align = document.createElement("div");
            var cc_policy = document.createElement("div");
            var cc_policy_inner = document.createElement("div");
            var cc_policy_title = document.createElement("h1");
            var cc_policy_header = document.createElement("div");
            var cc_policy_close_btn = document.createElement("button");
            var cc_policy_content = document.createElement("div");
            cc_policy_close_btn.setAttribute('type', 'button');
            
			/**
             * Set for each of them, their default configured ids
             */
            cc_policy_container.id = 'cc__policy__container';
            cc_v_align.id = "cc__valign";
            cc_policy.id = "cc__policy";
            cc_policy_title.id = 'cc__policy__title';
            cc_policy_inner.id = "cc__policy__inner";
            cc_policy_header.id = "cc__policy__header";
            cc_policy_content.id = 'cc__policy__content';
            cc_policy_close_btn.id = 'cc__policy__close__btn';
            var close_icon = 'x';
            cc_policy_close_btn.innerHTML = close_icon;

            _addClass(cc_policy_close_btn, 'cc_button');

            cc_policy_header.appendChild(cc_policy_title);
            cc_policy_header.appendChild(cc_policy_close_btn);
            cc_policy_inner.appendChild(cc_policy_header);
            cc_policy_inner.appendChild(cc_policy_content);
            cc_policy.appendChild(cc_policy_inner);
            cc_v_align.appendChild(cc_policy);
            cc_policy_container.appendChild(cc_v_align);

            if(_cc_modal_isAttached){
                _addEvent(document.getElementById('cc__modal__more__btn'), 'click', function(){
                    _cookieconsent.show_policy(0);
                });
            }

            _addEvent(cc_policy_close_btn, 'click', function(){
                _cookieconsent.hide_policy();
            });

            cc_policy_container.style.visibility = "hidden";

            if(!_general_container_exists)
                _createGeneralContainer();
            
            // insert cc_title into cc_modal
            document.getElementById('cc__modal__container').appendChild(cc_policy_container);

            _cc_policy_dom = cc_policy_container;
            _cc_policy_isAttached = true;
        }

        var _setCookieConsentPolicyContent = function(is_cookie_set){
            
            var all_blocks = _config.cc_languages[_config.cc_current_lang].policy.ccp_blocks;

            // Get number of blocks with cc_policy_lang as language
            var n_blocks = all_blocks.length;

            // Get cc_policy_dom
            var cc_content_dom = document.getElementById('cc__policy__content');

            // Set cc policy title
            _setText('cc__policy__title', _config.cc_languages[_config.cc_current_lang].policy.ccp_title);

            // Create cc policy content
            for(var i=0; i<n_blocks; ++i){
                
                // Create title
                var block_section = document.createElement('div');
                var block_title_container = document.createElement('div');
                var block_title = document.createElement('h2');
                var block_desc = document.createElement('p');

                _addClass(block_section, 'ccp_section');
                _addClass(block_title, 'section_title');
                _addClass(block_desc, 'section_desc');

                // set title and description for each block
                block_title.innerHTML =all_blocks[i].ccb_title;
                block_desc.innerHTML = all_blocks[i].ccb_description;

                block_title_container.appendChild(block_title);

                // ... switch
                if(typeof all_blocks[i].ccb_switch !== 'undefined'){

                    var block_switch_label = document.createElement('label');
                    var block_switch = document.createElement('input');
                    var block_switch_span = document.createElement('span');

                    _addClass(block_switch_label, 'sc_container_checkbox');
                    _addClass(block_switch, 'sc_toggle');
                    _addClass(block_switch_span, 'sc_checkmark');
                    
                    block_switch.setAttribute('type', 'checkbox');
                    block_switch.setAttribute('value', all_blocks[i].ccb_switch.value);

                    // if cookie is set, get current saved preferences from cookie
                    if(is_cookie_set){
                        if(_cookieconsent.inArray(JSON.parse(_getCookie('cc_cookie')).level, all_blocks[i].ccb_switch.value)){ 
                            block_switch.checked = true;
                        }
                    }else if(all_blocks[i].ccb_switch.enabled){
                        block_switch.checked = true;
                    }

                    if(all_blocks[i].ccb_switch.readonly){
                        block_switch.disabled = "disabled"
                        block_switch.readOnly = true;
                        _addClass(block_switch_span, 'sc_readonly');
                    }

                    block_switch_label.appendChild(block_switch);
                    block_switch_label.appendChild(block_switch_span);

                    block_title_container.appendChild(block_switch_label);
                }

                block_section.appendChild(block_title_container);
                block_section.appendChild(block_desc);

                // if cookie table found, generate table for this block
                if(typeof all_blocks[i].ccb_cookies_table !== 'undefined'){

                    // generate cookie-table for this block
                    var block_table = document.createElement('table');

                    // create table header
                    var thead = document.createElement('thead');
                    var tr_tmp = document.createElement('tr');
               
                    var all_table_headers = _config.cc_languages[_config.cc_current_lang].policy.ccb_table_headers;
                    
                    /**
                     * Use custom table headers
                     */
                    for(var p=0; p<all_table_headers.length; ++p){ 

                        // create new header
                        var th1 = document.createElement('th');

                        // get custom header content
                        var new_column_key = _getKeys(all_table_headers[p])[0];
                        var new_column_content = all_table_headers[p][new_column_key];
                        
                        th1.innerText = new_column_content;

                        tr_tmp.appendChild(th1);
                    }

                    thead.appendChild(tr_tmp);
                    block_table.appendChild(tr_tmp);

                    var tbody = document.createElement('tbody');

                    // create table content
                    for(var n=0; n<all_blocks[i].ccb_cookies_table.length; n++){

                        var tr = document.createElement('tr');
 
                        for(var g=0; g<all_table_headers.length; ++g){ 

                            var td_tmp = document.createElement('td');
    
                            // get custom header content
                            var new_column_key = _getKeys(all_table_headers[g])[0];
                            var new_column_content = all_blocks[i].ccb_cookies_table[n][new_column_key];
            
                            td_tmp.innerText = new_column_content;
                            td_tmp.setAttribute('data-column', all_table_headers[g][new_column_key]);

                            tr.appendChild(td_tmp);
                        }

                        tbody.appendChild(tr);
                    }

                    block_table.appendChild(tbody);

                    block_section.appendChild(block_table);
                }

                // append block inside cc_policy dom
                cc_content_dom.appendChild(block_section);
            }

            // Create save preferences button
            var cp_save_btn = document.createElement('button');
            cp_save_btn.setAttribute('type', 'button');
            cp_save_btn.id = 'cc__policy__save__btn';
            _addClass(cp_save_btn, 'cc_button');
            cp_save_btn.innerText = _config.cc_languages[_config.cc_current_lang].policy.ccp_save_text;

            // Add save preferences button onClick event 
            // Hide both cookie policy and cookie consent
            _addEvent(cp_save_btn, 'click', function(){
                 _printVerbose('CookieConsent [cc_policy_notice]: saved_preferences!');
                _cookieconsent.hide_policy();
                _cookieconsent.hide();
                _saveCookiePreferences();
            });

            // append cc_policy to dom
            cc_content_dom.appendChild(cp_save_btn);
        }

        /**
         * Save cookie based 
         */
        var _saveCookiePreferences = function(){
            
            // Get all cookiepreferences values saved in cookieconsent policy
            var accepted_cookies = document.querySelectorAll('#cc__policy__content > .ccp_section input.sc_toggle');
            var cc_cookie_level = 'basic';
            var unselected_prefereneces = [];

            if(typeof accepted_cookies.length === "number"){
                /**
                 * Reset cookie value
                 */
                cc_cookie_level = '';
                for(var i=0; i<accepted_cookies.length; i++){
                    if(accepted_cookies[i].checked){
                        cc_cookie_level+='"'+accepted_cookies[i].value+'",';
                    }else{
                        unselected_prefereneces.push(accepted_cookies[i].value);
                    }
                }

                cc_cookie_level = cc_cookie_level.slice(0, -1);
                
                /**
                 * If cc_autoclear_cookies==true -> delete all cookies which are unused (based on selected preferences)
                 */
                if(_config.cc_autoclear_cookies){

                    // Get array of all blocks defined inside the policy
                    var all_blocks = _config.cc_languages[_config.cc_current_lang].policy.ccp_blocks;
                    
                    // Get number of blocks
                    var len = all_blocks.length;

                    // For each block
                    for(var jk=0; jk<len; jk++){

                        // Save current block (local scope & less accesses -> ~faster value retrieval)
                        var curr_block = all_blocks[jk];
                        
                        // If current block has a cookie table and also a switch
                        if(curr_block.hasOwnProperty('ccb_cookies_table') && curr_block.hasOwnProperty('ccb_switch')){
                            
                            // Check if switch is turned off (disabled)
                            if(unselected_prefereneces.length > 0 && _cookieconsent.inArray(unselected_prefereneces, curr_block.ccb_switch.value)){
                                curr_block.ccb_switch.enabled = false;
                            }

                            // If current block has switch disabled -> delete all cookies specified in it
                            if(!curr_block.ccb_switch.enabled){
                                
                                // [IMPORTANT]: uses first parameter of each object (cookie), inside ccb_cookies_table array, assuming it stores the cookiename 
                                // ISSUE? [TODO: ADD TO README]
                                var ckey = _getKeys(_config.cc_languages[_config.cc_current_lang].policy.ccb_table_headers[0])[0];
                                
                                // Get number of cookies defined in ccb_cookies_table
                                var clen = curr_block.ccb_cookies_table.length;
                                
                                // Delete each cookie defined in ccb_cookie_table of current block
                                for(var hk=0; hk<clen; hk++){
                                    // Get current row of table (corresponds to all cookie params)
                                    var curr_row = curr_block.ccb_cookies_table[hk];
                                    
                                    // If cookie exists -> delete it
                                    if(_getCookie(curr_row[ckey]) != ""){
                                        _eraseCookie(curr_row[ckey]);
                                    }
                                }

                                 _printVerbose('CookieConsent [erase_cookies]: deleted all cookies inside "'+curr_block.ccb_switch.value+'"', curr_block.ccb_cookies_table);
                            }
                        }
                    }
                }
            }

            // save both status and 'preferences' level
            _setCookie(_config.cc_cookie_name, '{"status": "accepted", "level": ['+cc_cookie_level+']}', _config.cc_cookie_expiration, 0, 0);
            
            if(typeof _config.cc_accept_callback === "function"){
               var cookie_val = _getCookie(_config.cc_cookie_name);
                _config.cc_accept_callback(JSON.parse(cookie_val != "" ? cookie_val : "null"));
            }
        }

        /**
         * Load .css file for CookieConsent specified via the parameter
         * @param {string} css_file_path 
         */
        var _loadCookieConsentCSS = function(css_file_path, callback){
            if(_config.cc_autoload_css){
                var link  = document.createElement('link');
                link.rel  = 'stylesheet';
                link.type = 'text/css';
                link.href = css_file_path;
                document.getElementsByTagName('head')[0].appendChild(link);

                if(link.onload){
                    link.onload = callback();
                }else{
                    callback();
                }

                 _printVerbose("CookieConsent [css_notice]: loading_css = '"+ css_file_path + "'");
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
         * Check if cookieconsent is alredy attached to dom
         * If not, create one, configure it and attach it to body
         */
        _cookieconsent.run = function(conf_params){
            if(!document.getElementById('cc__modal__container')){
                var cc_cookie_value = _getCookie(_config.cc_cookie_name);
                if( cc_cookie_value === "" || typeof cc_cookie_value === 'undefined'){
                    
                    /**
                     * _setConfig with true param -> config all parameters
                     */
                    _setConfig(conf_params, true);
                    
                    /**
                     * Finally, load cookie-consent
                     */
                    _loadCookieConsentCSS(_config.cc_theme_css, function(){
                        _createCookieConsentHTML();
                        _setCookieConsentContent(_config.cc_current_lang);
                        
                        if (typeof _config.cc_policy_url != "string"){
                            _createCookieConsentPolicyHTML();
                            _setCookieConsentPolicyContent();
                            _addCookiePolicyButtonListener();
                        }

                        _acceptCookieConsentListener();
                        
                        if(_config.cc_autorun){
                            _cookieconsent.show(_config.cc_delay);
                        }
                    });
                }else{
                    _setConfig(conf_params, false);
                    _loadCookieConsentCSS(_config.cc_theme_css, function(){
                        if (typeof _config.cc_policy_url != "string"){
                            _createCookieConsentPolicyHTML();
                            _setCookieConsentPolicyContent(true);
                            _addCookiePolicyButtonListener();
                        }
                    });
                    _printVerbose("CookieConsent [NOTICE]: cookie consent alredy accepted!");
                    
                    if(typeof _config.cc_accept_callback === "function"){
                        _config.cc_accept_callback(JSON.parse(_getCookie(_config.cc_cookie_name)));
                    }
                }
            }else{
                _printVerbose("CookieConsent [NOTICE]: cookie consent alredy attached to body!");
            }
        }

        _cookieconsent.show_policy = function(cc_delay){
            if(_cc_policy_isAttached){
                setTimeout(function() {
                    if(_cc_policy_isHidden){
                        /**
                         * Make these dom elems, animate-able
                         */
                        _addClass(_cc_policy_dom, "cc__anim");
                        _addClass(_cc_policy_dom, "cc__show");
                        
                        _printVerbose("CookieConsent [cookie_policy]: show_cookie_policy");
                        _cc_policy_isHidden = false;
                    }else{
                        _printVerbose("CookieConsent [cookie_policy]: alredy_shown");
                    }
                }, typeof cc_delay === "number" && cc_delay > 100 ? cc_delay : 100);
            }else{
                _printVerbose("CookieConsent [cookie_policy]: cookie policy was not initialized!");
            }
        }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {number} cc_delay 
         */
        _cookieconsent.show = function(cc_delay){
            if(_cc_modal_isAttached){
                setTimeout(function() {
                    if(_cc_modal_isHidden){
                        /**
                         * Make these dom elems, animate-able
                         */
                        _addClass(_cc_modal_dom, "cc__anim");
                        
                        /**
                         * Show ccmodal
                         */
                        _addClass(_cc_modal_dom, "cc__show");
                        
                        _printVerbose("CookieConsent [cookie_modal]: show_cookie_consent");
                        _cc_modal_isHidden = false;
                    }else{
                        _printVerbose("CookieConsent [cookie_modal]: alredy_shown");
                    }
                }, typeof cc_delay == "number" && cc_delay > 20 ? cc_delay : 20);
                
            }else{
                _printVerbose("CookieConsent [cookie_modal]: cookie modal was not initialized!");
            }
        }

        /**
         * Hide cookie consent (after it has been attached to dom)
         */
        _cookieconsent.hide = function(){
            if(_cc_modal_isAttached){
                if(!_cc_modal_isHidden){
                    _removeClass(document.getElementById('cc__modal'), "cc__show");
                    _cc_modal_isHidden = true;
                    _printVerbose("CookieConsent [cookie_modal]: hide_cookie_consent");
                }else{
                    _printVerbose("CookieConsent [cookie_modal]: alredy_hidden");
                }
            }else{
                _printVerbose("CookieConsent [cookie_modal]: nothing to hide!");
            }
        }

        _cookieconsent.hide_policy = function(){
            if(_cc_policy_isAttached){
                if(!_cc_policy_isHidden){
                    _removeClass(_cc_policy_dom, "cc__show");
                    _cc_policy_isHidden = true;
                    _printVerbose("CookieConsent [cookie_policy]: hide_cookie_policy");
                }else{
                    _printVerbose("CookieConsent [cookie_policy]: alredy_hidden");
                }
            }else{
                _printVerbose("CookieConsent [cookie_policy]: nothing to hide!");
            }
        }

        /**
         * TODO
         */
        _cookieconsent.clearCookies = function(){
            var cookie_val = _getCookie(_config.cc_cookie_name);
            if(typeof cookie_val === "string" && cookie_val != ""){
                _eraseCookie(_config.cc_cookie_name);
                _printVerbose("CookieConsent [cookie_notice]: cc_cookies erased!");
            }else{
                _printVerbose("CookieConsent [cookie_notice]: cc_cookies not found, nothing to erase!");
            }
        }

        /**
         * Accept cookie consent listener
         * Create cookie with val. 'accepted' and then hide cookie-consent
         */
        var _acceptCookieConsentListener = function(){
            _addEvent(document.getElementById('cc__modal__accept__btn'), "click", function(event){
                _cookieconsent.hide();
                _printVerbose("CookieConsent [cookie_consent]: cookie_consent was accepted!");
                _saveCookiePreferences();
            });
        }

        /**
         * Set a cookie, specifying name, value and expiration time
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
                document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
            }else{
                document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
            }

            _printVerbose("CookieConsent [cookie_consent]: cookie "+ name + "='" + value + "' was set!");
        }

        /**
         * Get cookie value by name
         * @param {string} a 
         */
        var _getCookie = function(a) {
            return (a = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)")) ? a.pop() : ""
        }

        /**
         * Delete cookie by namn
         * @param {string} name 
         */
        var _eraseCookie = function(name) {   
            document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }

        /**
         * Given a language, set the cookieconsent text content in the same language
         * @param {string} selected_lang 
         */
        var _setCookieConsentContent = function(selected_lang){
            // check if selected language is defined in config object
            var lang = _getValidatedLanguage(selected_lang);
            _printVerbose("CookieConsent [cc_lang_notice]: setting cc_current_lang = '"+ lang + "'");
            _setText('cc__modal__title', _config.cc_languages[lang].modal.cc_title);
            _setHtml('cc__modal__text', _config.cc_languages[lang].modal.cc_description);
            _setText('cc__modal__accept__btn', _config.cc_languages[lang].modal.cc_accept_text);
            _setText('cc__modal__more__btn', _config.cc_languages[lang].modal.cc_more_text);
            _cc_modal_isAttached = true;
        }

        return _cookieconsent;
    };

    /**
     * Make CookieConsent object accessible globally
     */
    if(typeof scope.initCookieConsent === 'undefined'){

        scope.initCookieConsent = function(){
            var cc = CookieConsent();

            try {
                delete scope.initCookieConsent; 
            }catch(e) { 
                scope.initCookieConsent = undefined; 
            }
    
            return cc;
        };
    }
})(window);