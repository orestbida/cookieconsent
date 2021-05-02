/*!
 * CookieConsent v2.3
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 */
(function(){
    'use strict';
    /**
     * @param {HTMLElement} root element where the cookieconsent will be appended (default :=> document.body)
     * @returns {Object}
     */
    var CookieConsent = function(root){
        
        // CHANGE THIS FLAG FALSE TO DISABLE console.log()
        var ENABLE_LOGS = true;

        var _config = {
            current_lang : "en",         			    
            autorun: true, 							    // run as soon as loaded
            cookie_expiration : 182,					// default: 6 months (in days)
            share_across_subdomains: false,
        };

        /**
         * Object which holds the main methods (.show, .run, ...)
         */
        var _cookieconsent = {};

        /**
         * Internal state variables
         */
        var _saved_cookie_content;
        var consent_modal_exists = false;
        var cookie_consent_accepted = false;
        var consent_modal_visible = false;
        var settings_modal_visible = false;
        var clicked_inside_modal = false;
        var current_modal_focusable;
        
        /**
         * Save reference to the last focused element on the page
         * (used later on to restore focus when both modals are closed)
         */
        var last_elem_before_modal;
        var last_consent_modal_btn_focus;
                             
        /**
         * Both of the array below have the same structure:
         * [0] => holds reference to FIRST focusable element inside modal
         * [1] => holds reference to LAST focusable element inside modal
         */
        var consent_modal_focusable = [];
        var settings_modal_focusable = [];

        /**
         * Array of booleans used to keep track of enabled/disabled preferences
         */
        var toggle_states = [];
        
        /**
         * Pointers to main dom elements (to avoid retrieving them later using document.getElementById)
         */
        var html_dom = document.documentElement;
        var main_container;
        var consent_modal;
        var settings_container, settings_inner;

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

            if(typeof conf_params['share_across_subdomains'] === "boolean"){
                _config.share_across_subdomains = conf_params['share_across_subdomains'];
            }

            if(conf_params['auto_language']){
                _config.current_lang = _getValidatedLanguage(_getBrowserLang(), conf_params.languages);
            }else{
                if(typeof conf_params['current_lang'] === "string"){
                    _config.current_lang = _getValidatedLanguage(conf_params['current_lang'], conf_params.languages);;
                }
            }
            
            if(conf_params['force_consent'] === true){
                _addClass(html_dom, 'force--consent');
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
                all_links[x].setAttribute('aria-haspopup', 'dialog');
                _addEvent(all_links[x], 'click', function(event){
                    _cookieconsent.showSettings(0);
                    event.preventDefault ? event.preventDefault() : event.returnValue = false;
                });
            }
        }

        /**
         * Check if given lang index exists as a defined property inside _config object
         * If it exists -> desired language is implemented for cookieconsent
         * Otherwise switch back to default current_lang
         * @param {String} lang
         * @param {Object} all_languages
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
         * Save reference to first and last focusable elements inside each modal
         * to prevent losing focus while navigating with TAB
         * @param {HTMLElement} modal_dom 
         */
        var _getModalFocusableData = function(){
            
			/**
			 * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
			 * the first or last element of the modal, won't recieve focus during "open/close" modal
			 */
            var allowed_focusable_types = ['[href]', 'button', 'input', 'details', '[tabindex="0"]'];
            var focus_later, focus_first;

            function _getAllFocusableElements(modal){

                focus_later = focus_first = false;
                
                // ie might throw exception due to complex unsupported selector => a:not([tabindex="-1"])
                try{  
                    var elems = modal.querySelectorAll(allowed_focusable_types.join(':not([tabindex="-1"]), '));
                    var attr, len=elems.length, i=0;
                    
                    while(i < len){
                        
                        attr = elems[i].getAttribute('data-focus');

                        if(!focus_first && attr === "1"){
                            focus_first = elems[i];
                            
                        }else if(attr === "0"){
                            focus_later =  elems[i];
                            if(!focus_first && elems[i+1].getAttribute('data-focus') !== "0"){
                                focus_first = elems[i+1];
                            }
                        }

                        i++;
                    }
                  
                    return elems;
                }catch(e){
                    return modal.querySelectorAll(allowed_focusable_types.join(', '));
                }
            }

            /**
             * Get settings modal'S all focusable elements
             */
            var focusableContent = _getAllFocusableElements(settings_inner);
            
            /**
             * Save first and last elements (used to lock/trap focus inside modal)
             */
            settings_modal_focusable.push(focusableContent[0]);
            settings_modal_focusable.push(focusableContent[focusableContent.length - 1]);
            settings_modal_focusable[2] = focus_later || false;
            settings_modal_focusable[3] = focus_first || false;

            /**
             * If consent modal exists, do the same
             */
            if(consent_modal_exists){
                focusableContent = _getAllFocusableElements(consent_modal);
                consent_modal_focusable.push(focusableContent[0]);
                consent_modal_focusable.push(focusableContent[focusableContent.length - 1]);
                consent_modal_focusable[2] = focus_later || false;
                consent_modal_focusable[3] = focus_first || false;
            }

            focus_later = focus_first = focusableContent = null;
        }

        /**
         * Generate cookie consent html based on config settings
        */
        var _createCookieConsentHTML = function(never_accepted, conf_params){

            // Create main container which holds both consent modal & settings modal
            main_container = _createNode('div');
            main_container.id = 'cc--main';

            // Fix layout flash
            main_container.style.position = "fixed";
            main_container.style.zIndex = "1000000";
            main_container.innerHTML = '<!--[if lt IE 9 ]><div id="cc_div" class="ie"></div><![endif]--><!--[if (gt IE 8)|!(IE)]><!--><div id="cc_div"></div><!--<![endif]-->'
            var all_modals_container = main_container.children[0];
            
            // Get current language
            var lang = _config.current_lang;

            // Feature detection :=> avoid IE exception since .textContent is not always supported
            var innerText = (typeof html_dom.textContent === 'string' ? 'textContent' : 'innerText');
            
            // If never_accepted => create consent-modal
            if(!never_accepted){
                
                consent_modal = _createNode('div');
                var consent_modal_inner = _createNode('div');
                var consent_title = _createNode('div');
                var consent_text = _createNode('div');
                var consent_buttons = _createNode('div');
                var consent_primary_btn = _createNode('button');
                var consent_secondary_btn = _createNode('button');
  
                consent_modal.id = 'cm'; 
                consent_modal_inner.id = 'cm_inner';
                consent_title.id = 'cm_title';
                consent_text.id = 'cm_text';
                consent_buttons.id = "cm_btns";
                consent_primary_btn.id = 'cm_primary_btn';
                consent_secondary_btn.id = 'cm_secondary_btn';
                consent_primary_btn.className =  "c_button";
                consent_secondary_btn.className = "c_button c_link";

                consent_title.setAttribute('role', 'heading');
                consent_title.setAttribute('aria-level', '2');
                consent_modal.setAttribute('role', 'dialog');
                consent_modal.setAttribute('aria-modal', 'true');
                consent_modal.setAttribute('aria-hidden', 'false');
                consent_modal.setAttribute('aria-labelledby', 'cm_title');
                consent_modal.setAttribute('aria-describedby', 'cm_text');
                consent_primary_btn.setAttribute('type', 'button');
                consent_secondary_btn.setAttribute('type', 'button');

                /**
                 * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
                 */
                consent_modal.style.visibility = "hidden";

                // Use insertAdjacentHTML instead of innerHTML
                consent_title.insertAdjacentHTML('beforeend', conf_params.languages[lang]['consent_modal']['title']);
                consent_text.insertAdjacentHTML('beforeend', conf_params.languages[lang]['consent_modal']['description']);
                
                consent_primary_btn[innerText] = conf_params.languages[lang]['consent_modal']['primary_btn']['text'];
                consent_secondary_btn[innerText] = conf_params.languages[lang]['consent_modal']['secondary_btn']['text'];

                /**
                 * Add click event listeners
                 */
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

                if(conf_params.languages[lang]['consent_modal']['secondary_btn']['role'] == 'accept_necessary'){
                    _addEvent(consent_secondary_btn, 'click', function(){
                        _cookieconsent.hide();
                        _saveCookiePreferences(conf_params, 0); // 0 => accept necessary only
                    });
                }else{
                    _addEvent(consent_secondary_btn, 'click', function(){
                        _cookieconsent.showSettings(0);
                    });
                }

                consent_modal_inner.appendChild(consent_title);
                consent_modal_inner.appendChild(consent_text);
                consent_buttons.appendChild(consent_primary_btn);
                consent_buttons.appendChild(consent_secondary_btn);
                consent_modal_inner.appendChild(consent_buttons); 
                consent_modal.appendChild(consent_modal_inner);

                // Append consent modal to main container
                all_modals_container.appendChild(consent_modal);
            }

            /**
             * Create all consent_modal elements
             */
            settings_container = _createNode('div');
            var settings_container_valign = _createNode('div');
            var settings = _createNode('div');
            var settings_container_inner = _createNode('div');
            settings_inner = _createNode('div');
            var settings_title = _createNode('div');
            var settings_header = _createNode('div');
            var settings_close_btn = _createNode('button');
            var settings_close_btn_container = _createNode('div');
            var settings_blocks = _createNode('div');
            settings_close_btn.setAttribute('type', 'button');
            
            /**
             * Set ids
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
            settings_close_btn_container.id = 'cs_close_btn_cont';
            settings_close_btn.className = 'c_button';

            settings_close_btn.setAttribute('aria-label', conf_params.languages[lang]['settings_modal']['close_btn_label'] || 'Close');
            settings_container.setAttribute('role', 'dialog');
            settings_container.setAttribute('aria-modal', 'true');
            settings_container.setAttribute('aria-hidden', 'true');
            settings_container.setAttribute('aria-labelledby', 'cs_title');
            settings_blocks.setAttribute('tabindex', '-1');
            settings_title.setAttribute('role', 'heading');
            settings_container.style.visibility = "hidden";

            settings_close_btn_container.appendChild(settings_close_btn);
            
            // If 'esc' key is pressed inside settings_container div => hide settings
            _addEvent(settings_container_valign, 'keydown', function(evt){
                evt = evt || window.event;
                if (evt.keyCode == 27) {
                    _cookieconsent.hideSettings(0);
                }
            }, true);

            _addEvent(settings_close_btn, 'click', function(){
                _cookieconsent.hideSettings(0);
            });

            var all_blocks = conf_params.languages[_config.current_lang]['settings_modal']['blocks'];
            var n_blocks = all_blocks.length;

            // Set settings modal title
            settings_title.insertAdjacentHTML('beforeend', conf_params.languages[_config.current_lang]['settings_modal']['title']);

            // Create settings modal content (blocks)
            for(var i=0; i<n_blocks; ++i){
                
                // Create title
                var block_section = _createNode('div');
                var block_table_container = _createNode('div');
                var block_desc = _createNode('div');
                var block_title_container = _createNode('div');

                block_section.className = 'cs_block';
                block_table_container.className = 'desc';
                block_desc.className = 'p';
                block_title_container.className = 'title';

                // Sset title and description for each block
                block_desc.insertAdjacentHTML('beforeend', all_blocks[i]['description']);

                // Create toggle if specified (opt in/out)
                if(typeof all_blocks[i]['toggle'] !== 'undefined'){
                    
                    var accordion_id = "acc__"+i;

                    // Create button (to collapse/expand block description)
                    var block_title_btn = _createNode('button');
                    var block_switch_label = _createNode('label');
                    var block_switch = _createNode('input');
                    var block_switch_span = _createNode('span');
                    var label_text_span = _createNode('span');

                    // These 2 spans will contain each 2 pseudo-elements to generate 'tick' and 'x' icons
                    var block_switch_span_on_icon = _createNode('span');
                    var block_switch_span_off_icon = _createNode('span');

                    block_title_btn.className = 'b_title';
                    block_switch_label.className = 'c_b_toggle';
                    block_switch.className = 'c_toggle';
                    block_switch_span_on_icon.className = 'c_on_icon';
                    block_switch_span_off_icon.className = 'c_off_icon';
                    block_switch_span.className = 'sc_toggle';
                    label_text_span.className = "toggle_label";

                    block_title_btn.setAttribute('type', 'button');                  
                    block_title_btn.setAttribute('aria-expanded', 'false');
                    block_title_btn.setAttribute('aria-controls', accordion_id);

                    block_switch.setAttribute('type', 'checkbox');
                    block_switch_span.setAttribute('aria-hidden', 'true');

                    var cookie_category = all_blocks[i]['toggle'].value;
                    block_switch.value = cookie_category;
  
                    label_text_span[innerText] = all_blocks[i]['title']; 
                    block_title_btn.insertAdjacentHTML('beforeend', all_blocks[i]['title']);

                    block_title_container.appendChild(block_title_btn);
                    block_switch_span.appendChild(block_switch_span_on_icon);
                    block_switch_span.appendChild(block_switch_span_off_icon);

                    /**
                     * If never accepted => generate toggles with the states defined in the config. object
                     * Otherwise, retrieve values from saved cookie
                     */
                    if(never_accepted){
                        if(_arrayContains(JSON.parse(_saved_cookie_content).level, cookie_category)){ 
                            block_switch.checked = true;
                            toggle_states.push(true);
                        }else{
                            toggle_states.push(false);
                        }
                    }else if(all_blocks[i]['toggle']['enabled']){
                        block_switch.checked = true;
                    }

                    /**
                     * Set toggle as readonly if true (disable checkbox)
                     */
                    if(all_blocks[i]['toggle']['readonly']){
                        block_switch.disabled = true;
                        block_switch.setAttribute('aria-readonly', 'true');
                        _addClass(block_switch_span, 'sc_readonly');
                    }

                    _addClass(block_table_container, 'accordion');
                    _addClass(block_title_container, 'block_button');
                   
                    block_table_container.id = accordion_id;
                    block_table_container.setAttribute('aria-hidden', 'true');

                    block_switch_label.appendChild(block_switch);
                    block_switch_label.appendChild(block_switch_span);
                    block_switch_label.appendChild(label_text_span);
                    block_title_container.appendChild(block_switch_label);

                    _addClass(block_section, 'block__expand');
                    
                    /**
                     * On button click handle the following :=> aria-expanded, aria-hidden and _active class for current block
                     */
                    (function(accordion, block_section, btn){
                        _addEvent(block_title_btn, 'click', function(){
                            if(!_hasClass(block_section, '_active')){
                                _addClass(block_section, '_active');
                                btn.setAttribute('aria-expanded', 'true');
                                accordion.setAttribute('aria-hidden', 'false');
                            }else{
                                _removeClass(block_section, '_active');
                                btn.setAttribute('aria-expanded', 'false');
                                accordion.setAttribute('aria-hidden', 'true');
                            }
                        }, false);
                    })(block_table_container, block_section, block_title_btn);

                }else{
                    /**
                     * If block is not a button (no toggle defined), 
                     * create a simple div instead 
                     */
                    var block_title = _createNode('div');
                    block_title.className = 'b_title';
                    block_title.setAttribute('role', 'heading');
                    block_title.setAttribute('aria-level', '3');
                    block_title.insertAdjacentHTML('beforeend', all_blocks[i]['title']);
                    block_title_container.appendChild(block_title);
                }

                block_section.appendChild(block_title_container);
                block_table_container.appendChild(block_desc);

                // if cookie table found, generate table for this block
                if(typeof all_blocks[i]['cookie_table'] !== 'undefined'){
                    var tr_tmp_fragment = document.createDocumentFragment();
                    var all_table_headers = conf_params.languages[_config.current_lang]['settings_modal']['cookie_table_headers'];
                    
                    /**
                     * Use custom table headers
                     */
                    for(var p=0; p<all_table_headers.length; ++p){ 
                        // create new header
                        var th1 = _createNode('th');
                        th1.setAttribute('scope', 'col');

                        // get custom header content
                        var new_column_key = _getKeys(all_table_headers[p])[0];
                        
                        th1[innerText] = all_table_headers[p][new_column_key];
                        tr_tmp_fragment.appendChild(th1);  
                    }

                    var tr_tmp = _createNode('tr');
                    tr_tmp.appendChild(tr_tmp_fragment);

                    // create table header & append fragment
                    var thead = _createNode('thead');
                    thead.appendChild(tr_tmp);
                    
                    // append header to table
                    var block_table = _createNode('table');
                    block_table.appendChild(thead);

                    var tbody_fragment = document.createDocumentFragment();
                    
                    // create table content
                    for(var n=0; n<all_blocks[i]['cookie_table'].length; n++){
                        var tr = _createNode('tr');

                        for(var g=0; g<all_table_headers.length; ++g){ 
                            // get custom header content
                            var new_column_key = _getKeys(all_table_headers[g])[0];
                            
                            var td_tmp = _createNode('td');
                            td_tmp[innerText] = all_blocks[i]['cookie_table'][n][new_column_key];
                            td_tmp.setAttribute('data-column', all_table_headers[g][new_column_key]);

                            tr.appendChild(td_tmp);
                        }

                        tbody_fragment.appendChild(tr);
                    }
                    
                    // append tbody_fragment to tbody & append the latter into the table
                    var tbody = _createNode('tbody'); 
                    tbody.appendChild(tbody_fragment);
                    block_table.appendChild(tbody);

                    //block_section.appendChild(block_table);
                    block_table_container.appendChild(block_table); 
                }

                block_section.appendChild(block_table_container);
    
                // append block inside settings dom
                settings_blocks.appendChild(block_section);
            }

            // Create settings buttons
            var settings_buttons = _createNode('div');
            var settings_save_btn = _createNode('button');
            var settings_accept_all_btn = _createNode('button');

            settings_buttons.id = 'cs_buttons';
            settings_save_btn.id = 'cs_save__btn';
            settings_accept_all_btn.id = 'cs_acceptall_btn';
            settings_save_btn.setAttribute('type', 'button');
            settings_accept_all_btn.setAttribute('type', 'button');
            settings_save_btn.className ='c_button';
            settings_accept_all_btn.className ='c_button';
            settings_save_btn.insertAdjacentHTML('beforeend', conf_params.languages[_config.current_lang]['settings_modal']['save_settings_btn']);
            settings_accept_all_btn.insertAdjacentHTML('beforeend', conf_params.languages[_config.current_lang]['settings_modal']['accept_all_btn']);
            
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
            settings_header.appendChild(settings_close_btn_container);
  
            settings_inner.appendChild(settings_header);
            settings_inner.appendChild(settings_blocks);
            settings_inner.appendChild(settings_buttons);
            settings_container_inner.appendChild(settings_inner);
        
            settings.appendChild(settings_container_inner);
            settings_container_valign.appendChild(settings);
            settings_container.appendChild(settings_container_valign);

            all_modals_container.appendChild(settings_container);

            // Finally append everything to body (main_container holds both modals)
            (root || document.body).appendChild(main_container);
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
                            if(category_toggles[i].disabled){
                                c_cookie_level += '"' + category_toggles[i].value + '",';
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
                            category_toggles[i].checked = true;
                            c_cookie_level += '"' + category_toggles[i].value +'",';
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
                if(conf_params['autoclear_cookies'] && cookie_consent_accepted){

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

            _saved_cookie_content = '{"level": ['+c_cookie_level+']}';

            // save cookie with preferences 'level' (only if never accepted or settings were updated)
            if(!cookie_consent_accepted || changedSettings)
                _setCookie('cc_cookie', _saved_cookie_content, _config.cookie_expiration, _getDomain());

            if(typeof conf_params['onAccept'] === "function" && !cookie_consent_accepted){
                cookie_consent_accepted = true;
                return conf_params['onAccept'](JSON.parse(_saved_cookie_content));
            }

            // fire onChange only if settings were changed
            if(typeof conf_params['onChange'] === "function" && changedSettings){
                conf_params['onChange'](JSON.parse(_saved_cookie_content));
            }
        }

        /**
         * Load style via ajax in background (and then show modal)
         * @param {Object} conf_params 
         * @param {Function} callback
         */
        var _loadCSS = function(conf_params, callback){
            if(conf_params['autoload_css'] && !document.getElementById('cc--style')){

                // Create style tag
                var style = _createNode('style');
                
                // ad an id so that in SPA apps (react-like) the style doesn't get loaded multiple times when plugin is called
                style.id = 'cc--style';
                
                var xhr = new XMLHttpRequest();
                
                xhr.onreadystatechange = function() {
                    if(this.readyState == 4 && this.status == 200){

                        // Necessary for <IE9
                        style.setAttribute('type', 'text/css');
                        
                        if(style.styleSheet){ // if <IE9
                            style.styleSheet.cssText = this.responseText;
                        }else{ // all other browsers
                            style.appendChild(document.createTextNode(this.responseText)); 
                        }

                        // Append css text content
                        document.getElementsByTagName('head')[0].appendChild(style);
                        _log("CookieConsent [AUTOLOAD_CSS]: loaded style = '"+ conf_params['theme_css'] + "'");
                        
                        // Call function with minimal delay (to make sure that initial fade-zoom-in animations dont get skipped)
                        setTimeout(function(){
                            callback();
                        }, 10);
                    }
                };
                  
                xhr.open("GET", conf_params['theme_css']);
                xhr.send();
            }else{
                callback();
            }
        }

        /**
         * Returns true if value is found inside array
         * @param {Array} arr 
         * @param {Object} value
         * @returns {Boolean}
         */
        var _arrayContains = function(arr, value){
            var len = arr.length;
            for(var i=0; i<len; i++){
                if(arr[i] == value)
                    return true;  
            }
            return false;
        }

        /**
         * Helper function which prints info (console.log())
         * @param {Object} print_msg 
         * @param {Object} optional_param 
         */
        var _log = function(print_msg, optional_param, error){
            ENABLE_LOGS && (!error ? console.log(print_msg, optional_param || ' ') : console.error(print_msg, optional_param || ""));
        }

        /**
         * Helper function which creates an HTMLElement object based on 'type' and returns it.
         * @param {String} type 
         * @returns {HTMLElement}
         */
        var _createNode = function(type){
            return document.createElement(type);
        }
        
        /**
         * Get current client - browser language
         * Used when 'auto_language' config property is set to 'true' (boolean)
         * @returns {String}
         */
        var _getBrowserLang = function(){
            var browser_lang = navigator.language || navigator.browserLanguage;
            browser_lang.length > 2 && (browser_lang = browser_lang[0]+browser_lang[1]);
            _log("CookieConsent [LANG]: detected_browser_lang = '"+ browser_lang + "'");
            return browser_lang.toLowerCase()
        }

        /**
         * Traps focus inside modal && focuses the first focusable element of current active modal
         */
        var _handleFocusOutline = function(){
            var tabbedOutsideDiv = false;
            var tabbedInsideModal = false;
            
            _addEvent(document, 'keydown', function(e){
                e = e || window.event;
                
                // If is tab key => ok
                if(e.key !== 'Tab') return;

                // If there is any modal to focus
                if(current_modal_focusable){
                    // If reached natural end of the tab sequence => restart
                    if(e.shiftKey){
                        if (document.activeElement === current_modal_focusable[0]) {
                            current_modal_focusable[1].focus();
                            e.preventDefault();         
                        }
                    }else{
                        if (document.activeElement === current_modal_focusable[1]) {
                            current_modal_focusable[0].focus();
                            e.preventDefault();
                        }
                    }

                    // If have not yet used tab (or shift+tab) and modal is open ...
                    // Focus the first focusable element
                    if(!tabbedInsideModal && !clicked_inside_modal){
                        tabbedInsideModal = true;
                        !tabbedOutsideDiv && e.preventDefault();

                        if(e.shiftKey){
                            if(current_modal_focusable[3]){
                                if(!current_modal_focusable[2]){
                                    current_modal_focusable[0].focus();
                                }else{
                                    current_modal_focusable[2].focus();
                                }
                            }else{
                                current_modal_focusable[1].focus();
                            }
                        }else{
                            if(current_modal_focusable[3]){
                                current_modal_focusable[3].focus();
                            }else{
                                current_modal_focusable[0].focus();
                            }
                        }
                    }
                }

                !tabbedInsideModal && (tabbedOutsideDiv = true);
            });

            if(document.contains){
                _addEvent(main_container, 'click', function(e){
                    e = e || window.event;
                    /**
                     * If click is on the foreground overlay (and not inside settings_modal),
                     * hide settings modal
                     * 
                     * Notice: click on div is not supported in IE
                     */
                    if(settings_modal_visible){
                        if(!settings_inner.contains(e.target)){
                            _cookieconsent.hideSettings(0);
                            clicked_inside_modal = false;
                        }else{
                            clicked_inside_modal = true;
                        }
                    }else if(consent_modal_visible){
                        if(consent_modal.contains(e.target)){
                            clicked_inside_modal = true;
                        }
                    }
                    
                }, true);
            } 
        }
        

        /**
         * Returns true cookie category is saved into cc_cookie
         * @param {String} cookie_name 
         * @returns {Boolean}
         */
        _cookieconsent.allowedCategory = function(cookie_name){
            return _arrayContains(JSON.parse(_getCookie('cc_cookie') || '{}')['level'] || [], cookie_name);
        }

        /**
         * Check if cookieconsent is alredy attached to dom
         * If not, create one, configure it and attach it to body
         */
        _cookieconsent.run = function(conf_params){
            if(!main_container){
                // configure all parameters
                _setConfig(conf_params);

                // Retrieve cookie value (if set)
                _saved_cookie_content = _getCookie('cc_cookie');

                // If cookie is empty => create consent modal
                consent_modal_exists = _saved_cookie_content == '';
  
                _loadCSS(conf_params, function(){
                    // Generate cookie-settings dom (& consent modal)
                    _createCookieConsentHTML(!consent_modal_exists, conf_params);
                    _addCookieSettingsButtonListener();
                    _getModalFocusableData();

                    if(!_saved_cookie_content && _config.autorun){
                        _cookieconsent.show(conf_params['delay'] || 0);
                    }

                    // Add class to enable animations
                    setTimeout(function(){_addClass(main_container, 'c--anim');}, 15);

                    // Accessibility :=> if tab pressed => show outline focus
                    setTimeout(function(){_handleFocusOutline();}, 100);
                });

                // if cookie accepted => fire once onAccept method (if defined)
                if(_saved_cookie_content && typeof conf_params['onAccept'] === "function" && !cookie_consent_accepted){
                    cookie_consent_accepted = true;
                    conf_params['onAccept'](JSON.parse(_saved_cookie_content || "{}"));
                }
            }else{
                _log("CookieConsent [NOTICE]: cookie consent alredy attached to body!");
            }
        }

        /**
         * Show settings modal
         * @param {Number} delay 
         */
        _cookieconsent.showSettings = function(delay){
            setTimeout(function() {
                _addClass(html_dom, "show--settings");
                settings_container.setAttribute('aria-hidden', 'false');
                settings_modal_visible = true;
                
                // If there is no consent-modal, keep track of last focused elem
                if(!consent_modal_visible){
                    last_elem_before_modal = document.activeElement;
                }else{
                    last_consent_modal_btn_focus = document.activeElement;
                }

                /**
                 * Set focus to first focusable element inside settings modal
                 */
                setTimeout(function(){
                    if(settings_modal_focusable[3]){
                        settings_modal_focusable[3].focus();
                    }else{
                        settings_modal_focusable[0].focus();
                    }
                    current_modal_focusable = settings_modal_focusable;
                }, 100);

                _log("CookieConsent [SETTINGS]: show settings_modal");
            }, delay > 0 ? delay : 0);
        }

        /**
         * Dynamically load script
         * @param {String} src 
         * @param {Function} callback
         * @param {Array} attrs
         */
        _cookieconsent.loadScript = function(src, callback, attrs){

            // Load script only if not alredy loaded
            if(!document.querySelector('script[src="' + src + '"]')){
                
                var script = _createNode('script');
                
                // if an array is provided => add custom attributes
                if(attrs && attrs.length > 0){
                    for(var i=0; i<attrs.length; ++i){
                        attrs[i] && script.setAttribute(attrs[i]['name'], attrs[i]['value']);
                    }
                }

                if(script.readyState) {  // only required for IE <9
                    script.onreadystatechange = function() {
                        if ( script.readyState === "loaded" || script.readyState === "complete" ) {
                            script.onreadystatechange = null;
                            callback();
                        }
                    };
                }else{  //Others
                    script.onload = callback;
                }

                script.src = src;
                
                /**
                 * Append script to head
                 */
                (document.head ? document.head : document.getElementsByTagName('head')[0]).appendChild(script);
            }else{
                callback();
            }
        }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {Number} delay 
         */
        _cookieconsent.show = function(delay){
            if(consent_modal_exists){
                setTimeout(function() {
                    _addClass(html_dom, "show--consent");

                    /**
                     * Update attributes/internal statuses
                     */
                    consent_modal.setAttribute('aria-hidden', 'false');
                    consent_modal_visible = true;
                    last_elem_before_modal = document.activeElement;
                    current_modal_focusable = consent_modal_focusable;
                    
                    _log("CookieConsent [MODAL]: show consent_modal");
                }, delay > 0 ? delay : 0);
            }
        }

        /**
         * Hide consent modal
         */
        _cookieconsent.hide = function(){ 
            if(consent_modal_exists){
                _removeClass(html_dom, "show--consent");
                consent_modal.setAttribute('aria-hidden', 'true');
                consent_modal_visible = false;

                //restore focus to last page element which had focus before modal opening
                last_elem_before_modal.focus();
                current_modal_focusable = null;
                _log("CookieConsent [MODAL]: hide");
            }
        }

        /**
         * Hide settings modal
         */
        _cookieconsent.hideSettings = function(){
            _removeClass(html_dom, "show--settings");
            settings_modal_visible = false;
            settings_container.setAttribute('aria-hidden', 'true');
            
            /**
             * If consent modal is visible, focus him (instead of page document)
             */
            if(consent_modal_visible){
                last_consent_modal_btn_focus.focus();
                current_modal_focusable = consent_modal_focusable;
            }else{
                /**
                 * Restore focus to last page element which had focus before modal opening
                 */
                last_elem_before_modal.focus();
                current_modal_focusable = null;
            }

            clicked_inside_modal = false;
            _log("CookieConsent [SETTINGS]: hide settings_modal");
        }

        /**
        * Gets root domain of current location
        * Won't work for top-level domains that contain a '.' such as co.uk, ...
        * Ignore's IP addresses
        * @returns {String}
        */
        var _getRootDomain = function(){
            const r = /.*\.([^.]*[^0-9][^.]*\.[^.]*[^.0-9][^.]*$)/;
            return window.location.hostname.replace(r, '$1');
        }

        /**
        * Get domain for the cookie
        * Returns .${root domain} of current location if 'share_across_subdomains' is true, else current window location
        * @returns {String}
        */
        var _getDomain = function(){
            return (_config.share_across_subdomains) ? `.${_getRootDomain()}` : window.location.hostname;
        }

        /**
         * Set cookie, specifying name, value and expiration time
         * @param {String} name 
         * @param {String} value 
         * @param {Number} days 
         */
        var _setCookie = function(name, value, days) {
            var expires = "";
        
            var date = new Date();
            date.setTime(date.getTime() + (1000 * (days * 24 * 60 * 60)));
            expires = "; expires=" + date.toUTCString();

            var cookieStr = name + "=" + (value || "") + expires + "; path=/;";

            // assures cookie works with localhost
            if(window.location.hostname.includes(".")){
                cookieStr += " Domain=" + domain + ";";
            }
            cookieStr += " SameSite=Lax;"
            if(location.protocol === "https:") {
                cookieStr += " Secure;";
            }

            document.cookie = cookieStr;

            _log("CookieConsent [SET_COOKIE]: cookie "+ name + "='" + value + "' was set!");
        }

        /**
         * Get cookie value by name,
         * returns cookie value if found, otherwise empty string: ""
         * @param {String} name 
         * @returns {String}
         */
        var _getCookie = function(name) {
            return (name = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")) ? name.pop() : ""
        }

        /**
         * Delete cookie by name
         * @param {String} name 
         */
        var _eraseCookie = function(name) {   
            document.cookie = name +'=; Path=/; Domain=' + window.location.hostname + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            document.cookie = name +'=; Path=/; Domain=.' + window.location.hostname + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            if(_config.share_across_subdomains){
                document.cookie = name +'=; Path=/; Domain=.' + _getRootDomain() + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            }
        }

        /**
         * Return true if cookie was found and has valid value (not empty string)
         * @param {String} cookie_name
         * @returns {Boolean}
         */
        _cookieconsent.validCookie = function(cookie_name){
            return _getCookie(cookie_name) != "";
        }

        /**
         * Add event listener to dom object (cross browser function)
         * @param {Object} elem 
         * @param {String} event //event type
         * @param {Object } fn 
         * @param {Boolean} passive
         */
        var _addEvent = function(elem, event, fn, passive) {
            var passive = passive || false;
            
            if (elem.addEventListener) {
                passive ? elem.addEventListener(event, fn , { passive: true }) : elem.addEventListener(event, fn, false);
            } else {
                /**
                 * For old browser, add 'on' before event:
                 * 'click':=> 'onclick'
                 */
                elem.attachEvent("on" + event, fn);
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
         * @param {String} classname 
         */
        var _addClass = function (elem, classname){
            if(elem.classList)
                elem.classList.add(classname)
            else{
                if(!_hasClass(elem, classname))
                    elem.className += ' '+classname;
            }
        }

        /**
         * Remove specified class from dom element
         * @param {HTMLElement} elem 
         * @param {String} classname 
         */
        var _removeClass = function (el, className) {
            el.classList ? el.classList.remove(className) : el.className = el.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
        }

        /**
         * Check if html element has classname
         * @param {HTMLElement} el 
         * @param {String} className 
         */
        var _hasClass = function(el, className) {
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
    if(typeof window['initCookieConsent'] !== 'function'){
        window['initCookieConsent'] = CookieConsent;
    }
})();
