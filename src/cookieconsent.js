/*!
 * CookieConsent v2
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 */
(function(scope){
    'use strict';
    var CookieConsent = function(){
        
        var _cookieconsent = {},
       
        _c_status = {
            modal_isHidden : true,
            settings_isHidden: true,
            modal_isAttached : false,
            settings_isAttached: false,
            general_container_exists: false
        },

        c_general_container = null,
        c_modals_container = null,
        c_consent_modal = null,
        c_s_modal = null,
        onAcceptFired = false;

        /**
         * Default cookieConsent config settings
         */
        var _config = {
            current_lang : "en",         			    
            autorun: true, 							    // run as soon as loaded
            delay: 0,								    // default milliseconds delay	
            enable_verbose: false,					    // if enabled, show on console all events/errors
            auto_language: false,    				    // if enabled, overrides default current_lang
            cookie_expiration : 182,					// default: 6 months (in days)
            autoclear_cookies: true,                    // [NEW from version 1.2] if enabled -> erase unused cookies based on deselected preferences
            autoload_css: true,                         // [NEW from version 1.2] if true -> autolad css
            theme_css: null
        };

        /**
         * Update config settings (if user provided an config object)
         * @param {Object} conf_params 
         */
        var _setConfig = function(conf_params){
            if(typeof conf_params['enable_verbose'] === "boolean"){
                _config.enable_verbose = conf_params['enable_verbose'];
            }

            //_printVerbose("CookieConsent [config_notice]: recieved_config_settings ", conf_params);
    
            if(typeof conf_params['auto_language'] === "boolean"){
                _config.auto_language = conf_params['auto_language'];
            }

            if(typeof conf_params['theme_css'] === "string"){
                _config.theme_css = conf_params['theme_css'];
            }

            if(typeof conf_params['autoload_css'] === "boolean"){
                _config.autoload_css = conf_params['autoload_css'];
            }

            if(typeof conf_params['cookie_expiration'] === "number"){
                if(conf_params['cookie_expiration'] > 0){
                    _config.cookie_expiration = conf_params['cookie_expiration'];
                }
            }

            if(typeof conf_params['delay'] === "number"){
                conf_params['delay'] >=0 ? _config.delay = conf_params['delay'] : false;
            }

            if(typeof conf_params['autorun'] === "boolean"){
                _config.autorun = conf_params['autorun'];
            }

            if(typeof conf_params['onUpdate'] === "function"){
                _config.onUpdate = conf_params['onUpdate'];
            }

            if(typeof conf_params['onAccept'] === "function"){
                _config.onAccept = conf_params['onAccept'];
            }

            if(typeof conf_params['autoclear_cookies'] === "boolean"){
                _config.autoclear_cookies = conf_params['autoclear_cookies'];
            }

            if(_config.auto_language){
                _config.current_lang = _getValidatedLanguage(_getBrowserLang(), conf_params.languages);
            }else{
                if(typeof conf_params['current_lang'] === "string"){
                    _config.current_lang = conf_params['current_lang'];
                }
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
                passive ? elem.addEventListener(event, fn, { passive: true }) : elem.addEventListener(event, fn, false);
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
         * Helper function which prints info (console.log()) only if verbose mode is enabled
         * @param {object} print_msg 
         * @param {object} optional_param 
         */
        var _printVerbose = function(print_msg, optional_param, error){
            !error ? _config.enable_verbose && console.log(print_msg, optional_param || "") : _config.enable_verbose && console.error(print_msg, optional_param || "");
        }
        
        /**
         * Get current client - browser language
         * Used when 'auto_language' config property is set to 'true' (boolean)
         */
        var _getBrowserLang = function(){
            var browser_lang = navigator.language || navigator.browserLanguage;
            browser_lang.length > 2 && (browser_lang = browser_lang[0]+browser_lang[1]);
            //_printVerbose("CookieConsent [browser_lang_notice]: detected_browser_lang = '"+ browser_lang + "'");
            return browser_lang.toLowerCase()
        }

        var _createGeneralContainer = function(){
            /**
             * Create general container
             */
            c_general_container = document.createElement('div');
            c_general_container.setAttribute('c_data', 'c_cookie_main');
            // Fix layout flash
            c_general_container.style.position = "fixed";
            c_general_container.style.zIndex = "1000000";
            c_general_container.innerHTML = '<!--[if lt IE 9 ]><div id="'+'c_modal__container'+'" class="ie"></div><![endif]--><!--[if (gt IE 8)|!(IE)]><!--><div id="'+'c_modal__container'+'"></div><!--<![endif]-->'
            c_modals_container = c_general_container.children[0];
            _c_status.general_container_exists = true;
        }

        /**
         * Generate cookie consent html based on config settings
        */
        var _createCookieConsentHTML = function(is_cookie_set, conf_params){

            _createGeneralContainer();
            
            /**
             * If no cookie is set => create consent-modal
             */
            if(!is_cookie_set){
                /**
                 * Create all c_modal elems
                 */
                var c_modal = document.createElement("div");
                var c_titolo = document.createElement("h1");
                var c_text = document.createElement("p");
                var c_btn_container = document.createElement("div");
                var c_primary_btn = document.createElement("button");
                var c_secondary_btn = document.createElement("button");

                /**
                 * Set for each of them, their default configured ids
                 */
                c_modal.id = 'c_modal';
                c_titolo.id = 'c_modal__title';
                c_text.id = 'c_modal__text';
                c_btn_container.id = "c_modal__btns";
                c_primary_btn.id = 'c_m_primary__btn';
                c_secondary_btn.id = 'c_m_secondary__btn';
                c_primary_btn.setAttribute('type', 'button');
                c_primary_btn.className =  "c_button";
                c_secondary_btn.className = "c_link";
                c_modal.style.visibility = "hidden";
                c_secondary_btn.setAttribute('type', 'button');

                var lang = _getValidatedLanguage(_config.current_lang, conf_params.languages);
                //_printVerbose("CookieConsent [c_lang_notice]: setting current_lang = '"+ lang + "'");
                
                c_titolo.innerHTML = conf_params.languages[lang]['consent_modal']['title'];
                c_text.innerHTML = conf_params.languages[lang]['consent_modal']['description'];
                c_primary_btn.innerHTML = conf_params.languages[lang]['consent_modal']['primary_btn']['text'];
                c_secondary_btn.innerHTML = conf_params.languages[lang]['consent_modal']['secondary_btn']['text'];
                _c_status.modal_isAttached = true;

                if(conf_params.languages[lang]['consent_modal']['primary_btn']['role'] == 'accept_all'){
                    _addEvent(c_primary_btn, "click", function(event){ 
                        _cookieconsent.hide();
                        //_printVerbose("CookieConsent [cookie_consent]: cookie_consent was accepted!");
                        var checkboxes = document.querySelectorAll('#c_s_blocks .c_toggle');
                        for(var i=0; i<checkboxes.length; i++){
                            checkboxes[i].checked = true;
                        }
                        _saveCookiePreferences(conf_params);
                    });
                }else{
                    _addEvent(c_primary_btn, "click", function(event){
                        _cookieconsent.hide();
                        //_printVerbose("CookieConsent [cookie_consent]: cookie_consent was accepted!");
                        _saveCookiePreferences(conf_params);
                    });
                }

                // insert title into c_modal
                c_modal.insertAdjacentElement('beforeend', c_titolo);
            
                // insert description into c_modal
                c_modal.insertAdjacentElement('beforeend', c_text);
            
                // insert buttons into c_btn_container
                c_btn_container.insertAdjacentElement('beforeend', c_primary_btn);
                c_btn_container.insertAdjacentElement('beforeend', c_secondary_btn);
                
                // insert btn_container into c_modal
                c_modal.insertAdjacentElement('beforeend', c_btn_container);

                c_modals_container.appendChild(c_modal);
                c_consent_modal = c_modal;
                _c_status.modal_isAttached = true;
            }

            /**
             * Create all c_modal elems
             */
            var c_s_container = document.createElement("div");
            var c_v_align = document.createElement("div");
            var c_s = document.createElement("div");
            var c_s_inner_container = document.createElement("div");
            var c_s_inner = document.createElement("div");
            var c_s_title = document.createElement("h1");
            var c_s_header = document.createElement("div");
            var c_s_close_btn = document.createElement("button");
            var c_s_content = document.createElement("div");
            c_s_close_btn.setAttribute('type', 'button');
            
			/**
             * Set for each of them, their default configured ids
             */
            c_s_container.id = 'c_s_container';
            c_v_align.id = "c_valign";
            c_s.id = "c_s";
            c_s_inner_container.id = "c_s_ctl";
            c_s_title.id = 'c_s_title';
            c_s_inner.id = "c_s_inner";
            c_s_header.id = "c_s_header";
            c_s_content.id = 'c_s_blocks';
            c_s_close_btn.id = 'c_s_close__btn';
            c_s_close_btn.innerHTML = 'x';
            c_s_close_btn.className = 'c_button';

            c_s_header.appendChild(c_s_title);
            c_s_header.appendChild(c_s_close_btn);
            c_s_inner.appendChild(c_s_header);
            c_s_inner.appendChild(c_s_content);
            c_s_inner_container.appendChild(c_s_inner);
            c_s.appendChild(c_s_inner_container);
            c_v_align.appendChild(c_s);
            c_s_container.appendChild(c_v_align);

            if(_c_status.modal_isAttached){
                if(conf_params.languages[lang]['consent_modal']['secondary_btn']['role'] == 'accept_necessary'){
                    _addEvent(c_secondary_btn, 'click', function(){
                        _cookieconsent.hide();
                        var checkboxes = document.querySelectorAll('.c_toggle:not(:disabled)');
                        for(var i=0; i<checkboxes.length; i++){
                            checkboxes[i].checked = false;
                        }
                        _saveCookiePreferences(conf_params);
                    });
                }else{
                    _addEvent(c_secondary_btn, 'click', function(){
                        _cookieconsent.showSettings(0);
                    });
                }
            }

            _addEvent(c_s_close_btn, 'click', function(){
                _cookieconsent.hideSettings();
            });

            c_s_container.style.visibility = "hidden";


            // insert title into c_modal
            c_modals_container.appendChild(c_s_container);

            c_s_modal = c_s_container;
            _c_status.settings_isAttached = true;


            var all_blocks = conf_params.languages[_config.current_lang]['settings_modal']['blocks'];

            // Get number of blocks with c_s_lang as language
            var n_blocks = all_blocks.length;

            // Set cc settings modal title
            c_s_title.innerHTML = conf_params.languages[_config.current_lang]['settings_modal']['title'];

            // Create settings modal content (blocks)
            for(var i=0; i<n_blocks; ++i){
                
                // Create title
                var block_section = document.createElement('div');
                var block_title_container = document.createElement('div');
                var block_table_container = document.createElement('div');
                var block_title = document.createElement('h2');
                var block_desc = document.createElement('p');
                block_section.className = 'c_s_block';
                block_title.className = 'block__title';
                block_title_container.className = 'title';
                block_table_container.className = 'desc';

                // set title and description for each block
                block_title.innerHTML =all_blocks[i]['title'];
                block_desc.innerHTML = all_blocks[i]['description'];

                block_title_container.appendChild(block_title);

                // ... switch
                if(typeof all_blocks[i]['toggle'] !== 'undefined'){

                    var block_switch_label = document.createElement('label');
                    var block_switch = document.createElement('input');
                    var block_switch_span = document.createElement('span');

                    block_switch_label.className = 'c_block_toggle';
                    block_switch.className = 'c_toggle';
                    block_switch.setAttribute('aria-label', 'toggle');
                    block_switch_span.className = 'sc_checkmark';

                    block_switch.setAttribute('type', 'checkbox');
                    block_switch.value = all_blocks[i]['toggle'].value;
                    block_switch.setAttribute('aria-label', all_blocks[i]['toggle'].value);

                    // if cookie is set, get current saved preferences from cookie
                    if(is_cookie_set){
                        if(_cookieconsent.inArray(JSON.parse(_getCookie('cc_cookie')).level, all_blocks[i]['toggle'].value)){ 
                            block_switch.checked = true;
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
                }

                block_section.appendChild(block_title_container);
                //block_section.appendChild(block_desc);
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
                
                if(typeof all_blocks[i]['toggle'] !== 'undefined'){
                    _addClass(block_table_container, 'block__accordion');
                    _addClass(block_title_container, 'block_button');
                    _addClass(block_section, 'block__expand');
                    _addEvent(block_title_container, 'click', function(){
                        if(!hasClass(this.parentNode, '_active')){
                            _addClass(this.parentNode, '_active');
                        }else{
                            _removeClass(this.parentNode, '_active');
                        }
                    });
                };

                // append block inside c_s dom
                c_s_content.appendChild(block_section);
            }

            // Create save preferences button
            var c_s_buttons = document.createElement("div");
            var cp_save_btn = document.createElement('button');
            var cp_accept_all_btn = document.createElement('button');
            c_s_buttons.id = "c_s_buttons";
            cp_save_btn.id = 'c_s_save__btn';
            cp_accept_all_btn.id = 'c_s_acceptall_btn';
            cp_save_btn.setAttribute('type', 'button');
            cp_accept_all_btn.setAttribute('type', 'button');
            cp_save_btn.className ='c_button';
            cp_accept_all_btn.className ='c_button';
            cp_save_btn.innerHTML = conf_params.languages[_config.current_lang]['settings_modal']['save_settings_btn'];
            cp_accept_all_btn.innerHTML = conf_params.languages[_config.current_lang]['settings_modal']['accept_all_btn'];
            c_s_buttons.appendChild(cp_accept_all_btn);
            c_s_buttons.appendChild(cp_save_btn);
           
            // Add save preferences button onClick event 
            // Hide both settings modal and consent modal
            _addEvent(cp_save_btn, 'click', function(){
                _cookieconsent.hideSettings();
                _cookieconsent.hide();
                _saveCookiePreferences(conf_params);
            });

            _addEvent(cp_accept_all_btn, 'click', function(){
                var checkboxes = document.querySelectorAll('.c_toggle');
                for(var i=0; i<checkboxes.length; ++i){
                    checkboxes[i].checked = true;
                }
                _cookieconsent.hideSettings();
                _cookieconsent.hide();
                _saveCookiePreferences(conf_params);
            });

            // append c_s to dom
            c_s_content.parentNode.appendChild(c_s_buttons);

        }

        /**
         * Save cookie based 
         */
        var _saveCookiePreferences = function(conf_params){
            
            // Get all cookiepreferences values saved in cookieconsent settings modal
            var accepted_cookies = document.querySelectorAll('.c_toggle');
            var c_cookie_level = 'basic';
            var unselected_prefereneces = [];

            if(typeof accepted_cookies.length === "number"){
                /**
                 * Reset cookie value
                 */
                c_cookie_level = '';
                for(var i=0; i<accepted_cookies.length; i++){
                    if(accepted_cookies[i].checked){
                        c_cookie_level+='"'+accepted_cookies[i].value+'",';
                    }else{
                        unselected_prefereneces.push(accepted_cookies[i].value);
                    }
                }

                c_cookie_level = c_cookie_level.slice(0, -1);
                
                /**
                 * If autoclear_cookies==true -> delete all cookies which are unused (based on selected preferences)
                 */
                if(_config.autoclear_cookies){

                    // Get array of all blocks defined inside settings
                    var all_blocks = conf_params.languages[_config.current_lang]['settings_modal']['blocks'];
                    
                    // Get number of blocks
                    var len = all_blocks.length;

                    // For each block
                    for(var jk=0; jk<len; jk++){

                        // Save current block (local scope & less accesses -> ~faster value retrieval)
                        var curr_block = all_blocks[jk];
                        
                        // If current block has a cookie table and also a switch
                        if(curr_block.hasOwnProperty('cookie_table') && curr_block.hasOwnProperty('toggle')){
                            
                            // Check if switch is turned off (disabled)
                            if(unselected_prefereneces.length > 0 && _cookieconsent.inArray(unselected_prefereneces, curr_block['toggle'].value)){
                                curr_block['toggle']['enabled'] = false;
                            }

                            // If current block has switch disabled -> delete all cookies specified in it
                            if(!curr_block['toggle']['enabled']){
                                
                                // [IMPORTANT]: uses first parameter of each object (cookie), inside cookie_table array, assuming it stores the cookiename 
                                // ISSUE? [TODO: ADD TO README]
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
                                    }
                                }

                                //_printVerbose('CookieConsent [erase_cookies]: deleted all cookies inside "'+curr_block['toggle'].value+'"', curr_block['cookie_table']);
                            }
                        }
                    }
                }
            }

            // save both status and 'preferences' level
            _setCookie('cc_cookie', '{"status": "accepted", "level": ['+c_cookie_level+']}', _config.cookie_expiration, 0, 0);
            var cookie_val = _getCookie('cc_cookie');

            if(typeof _config.onUpdate === "function"){
                _config.onUpdate(JSON.parse(cookie_val != "" ? cookie_val : "null"));
            }

            if(typeof _config.onAccept === "function" && !onAcceptFired){
                onAcceptFired = true;
                _config.onAccept(JSON.parse(cookie_val != "" ? cookie_val : "null"));
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
            //_printVerbose('CookieConsent [preload]: preloaded '+as, href);
        }

        /**
         * Load .css file for CookieConsent specified via the parameter
         * @param {string} css_file_path 
         */
        var _loadCookieConsentCSS = function(css_file_path, callback){
            var head = document.getElementsByTagName('head')[0];
            if(_config.autoload_css){
                _preload(css_file_path, 'style');

                var link  = document.createElement('link');
                link.rel  = 'stylesheet';
                link.type = 'text/css';
                link.href = css_file_path;
                head.appendChild(link);

                if(link.onload){
                    link.onload = callback();
                }else{
                    callback();
                }

                 //_printVerbose("CookieConsent [css_notice]: loading_css = '"+ css_file_path + "'");
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
         * Returns true cookie category is saved into cc_cookie
         * @param {String} cookie_name 
         */
        _cookieconsent.allowedCategory = function(cookie_name){
            var cookies = _getCookie('cc_cookie');
            if(cookies){
                cookies = JSON.parse(cookies).level || [];
            }
            return this.inArray(cookies, cookie_name);
        }

        /**
         * Check if cookieconsent is alredy attached to dom
         * If not, create one, configure it and attach it to body
         */
        _cookieconsent.run = function(conf_params){
            if(!_c_status.general_container_exists){
                
                // config all parameters
                _setConfig(conf_params);

                // Get cookie value
                var cookie_val = _getCookie('cc_cookie');

                // If cookie doesn't exist => cookie-consent never accepted
                if(!cookie_val){
                    
                    // Generate both cookie-consent & cookie-settings dom
                    _createCookieConsentHTML(false, conf_params);

                    // Load css (if enabled), and run callback function afterwards
                    _loadCookieConsentCSS(_config.theme_css, function(){

                        // Attach generated html to body
                        document.body.appendChild(c_general_container);

                        // Add listener to open settings via custom attribute buttons and links
                        _addCookieSettingsButtonListener();

                        if(_config.autorun){
                            _cookieconsent.show(_config.delay);
                        }
                    });

                }else{
                    // Generate only cookie-settings dom
                    _createCookieConsentHTML(true, conf_params);

                    _loadCookieConsentCSS(_config.theme_css, function(){ 
                        document.body.appendChild(c_general_container);
                        _addCookieSettingsButtonListener();

                        // Fire once onAccept method (if defined)
                        if(!cookie_val && typeof _config.onAccept === "function" && !onAcceptFired){
                            _config.onAccept(JSON.parse(cookie_val != "" ? cookie_val : "null"));
                            onAcceptFired = true;
                        }
                    });

                    //_printVerbose("CookieConsent [NOTICE]: cookie consent alredy accepted!");
                }
            }else{
                //_printVerbose("CookieConsent [NOTICE]: cookie consent alredy attached to body!");
            }
        }

        _cookieconsent.showSettings = function(delay){
            
            if(_c_status.settings_isAttached){
                setTimeout(function() {
                    if(_c_status.settings_isHidden){
                        /**
                         * Make these dom elems, animate-able
                         */
                        _addClass(c_s_modal, "c_anim");
                        _addClass(c_s_modal, "c_show");
                        //_printVerbose("CookieConsent [settings_modal]: showSettings_modal");
                        _c_status.settings_isHidden = false;
                    }else{
                        //_printVerbose("CookieConsent [settings_modal]: alredy_shown");
                    }
                }, typeof delay === "number" && delay > 0 ? delay : 0);
            }else{
                //_printVerbose("CookieConsent [settings_modal]: cookie settings modal was not initialized!");
            }
        }

        _cookieconsent.loadScript = function(src, callback, preload, attrs){

            // If script is not alredy loaded (same src)
            if(!document.querySelector('script[src="' + src + '"]')){
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
                //_printVerbose("CookieConsent [loadScript]: script '"+src+"' alredy loaded!");
                callback();
            }
        }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {number} delay 
         */
        _cookieconsent.show = function(delay){
            if(_c_status.modal_isAttached){
                setTimeout(function() {
                    if(_c_status.modal_isHidden){
                        /**
                         * Make these dom elems, animate-able
                         */
                        _addClass(c_consent_modal, "c_anim");
                        
                        /**
                         * Show ccmodal
                         */
                        _addClass(c_consent_modal, "c_show");
                        
                        //_printVerbose("CookieConsent [consent_modal_notice]: show_consent_modal");
                        _c_status.modal_isHidden = false;
                    }else{
                        //_printVerbose("CookieConsent [consent_modal_notice]: alredy_shown");
                    }
                }, typeof delay == "number" && delay > 100 ? delay : 120);
                
            }else{
                //_printVerbose("CookieConsent [consent_modal_notice]: cookie modal was not initialized!");
            }
        }

        /**
         * Hide cookie consent (after it has been attached to dom)
         */
        _cookieconsent.hide = function(){
            if(_c_status.modal_isAttached){
                if(!_c_status.modal_isHidden){ 
                    _removeClass(document.getElementById('c_modal'), "c_show");
                    _c_status.modal_isHidden = true;
                    //_printVerbose("CookieConsent [consent_modal_notice]: hide_cookie_consent");
                }else{
                    //_printVerbose("CookieConsent [consent_modal_notice]: alredy_hidden");
                }
            }else{
                //_printVerbose("CookieConsent [consent_modal_notice]: nothing to hide!");
            }
        }

        /**
         * Hide settings modal
         */
        _cookieconsent.hideSettings = function(){
            if(_c_status.settings_isAttached){
                if(!_c_status.settings_isHidden){
                    _removeClass(c_s_modal, "c_show");
                    _c_status.settings_isHidden = true;
                    //_printVerbose("CookieConsent [settings_modal]: hide_cookie_settings");
                }else{
                    //_printVerbose("CookieConsent [settings_modal]: alredy_hidden");
                }
            }else{
                //_printVerbose("CookieConsent [settings_modal]: nothing to hide!");
            }
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

            //_printVerbose("CookieConsent [cookie_consent]: cookie "+ name + "='" + value + "' was set!");
        }

        /**
         * Get cookie value by name
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
            document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }

        /**
         * Return true if cookie was found and has valid value (not empty string)
         * @param {string} cookie_name 
         */
        _cookieconsent.validCookie = function(cookie_name){
            var val = _getCookie(cookie_name);
            return typeof val === 'string' && val != "";
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