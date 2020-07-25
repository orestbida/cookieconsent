/*!
 * CookieConsent v1.0
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 */
(function(window){
	'use strict';
	 var CookieConsent = function(){
		
		var _cookieconsent = {};
		var _isAttachedToDom = false;
		var _isHidden = true;
		var _ccModalDom = null;
		
		/**
		 * Default cookieConsent config settings
		 */
		var _config = {
			cc_container : "body",  					// supports only "body", and ids like "#example_id"
			cc_current_lang : "en",         		
			cc_default_lang : "en",						// default language (from those defined below)
			cc_autorun: false, 							// run as soon as loaded
			cc_delay: 20,								// milliseconds delay
			cc_website_name : null,		
			cc_website_url: null,
			cc_enable_verbose: true,					// if enabled, show on console all events/errors
			cc_auto_language: false,    				// if enabled, overrides default cc_current_lang
			cc_cookie_expires : new Date((new Date).getTime() + 2592000),	// 30 days
			cc_banner_type: "simple",
			cc_policy_url: "",
			privacy_policy_url: null,
			cc_cookie_name: "cc_cookie",
			cc_theme_css: "/public/assets/css/cookie_consent.css",
			cc_ids : {
				modal_id : "cc__modal",
				modal_title : "cc__modal__title",
				modal_text : "cc__modal__text",
				modal_accept_btn : "cc__modal__accept__btn",
				modal_more_btn : "cc__modal__more__btn",
				modal_edit_btn : "cc__modal__edit__btn"
			}
		};

		/**
		 * Here you can also add additional languages
		 */
		var _cc_languages = {
			"en" : {
				dialog : {
					cc_title :  "I use cookies",
					cc_more_text :  "Learn more", 
					cc_accept_text : "I understand",
					cc_edit_preferences_text :  "Change preferences",
					cc_description :  'My website uses cookies necessary for its basic functioning. By continuing browsing, you consent to my use of cookies and other technologies.',
				}
			},
			"it" : {
				dialog : {
					cc_title :  "Noi usiamo i cookies",
					cc_more_text :  "Learn more", 
					cc_accept_text : "I understand",
					cc_edit_preferences_text :  "Change preferences",
					cc_description :  'My website uses cookies necessary for its basic functioning. By continuing browsing, you consent to my use of cookies and other technologies.',
				}
			}
		};

		/**
		 * Update config settings (if user provided an config object)
		 * @param {Object} conf_params 
		 */
		var _setConfig = function(conf_params){
			try{
				if(conf_params != undefined && conf_params != null){

					if(conf_params['cc_enable_verbose'] != undefined && conf_params['cc_enable_verbose'] != null){
						typeof conf_params['cc_enable_verbose'] == "boolean" ? _config.cc_enable_verbose = conf_params['cc_enable_verbose'] : _printVerbose("CookieConsent [config_error]: 'cc_enable_verbose' value is not valid (boolean required)!");
					}
	
					_printVerbose("CookieConsent [config_notice]: recieved_config_settings ", conf_params);
					_printVerbose("CookieConsent [config_notice]: Updating config settings!");
					
					if(conf_params['cc_website_name'] != undefined && conf_params['cc_website_name'] != null ){
						typeof conf_params['cc_website_name'] == "string" ? _config.cc_website_name = conf_params['cc_website_name'] : _printVerbose("CookieConsent [config_error]: 'cc_website_name' value is not valid (string required)!");
					}

					if(conf_params['cc_auto_language'] != undefined && conf_params['cc_auto_language'] != null ){
						typeof conf_params['cc_auto_language'] == "boolean" ? _config.cc_auto_language = conf_params['cc_auto_language'] : _printVerbose("CookieConsent [config_error]: 'cc_auto_language' value is not valid (boolean required)!");
					}
	
					if(conf_params['cc_theme_css'] != undefined && conf_params['cc_theme_css'] != null){
						typeof conf_params['cc_theme_css'] == "string" ? _config.cc_theme_css = conf_params['cc_theme_css'] : _printVerbose("CookieConsent [config_error]: 'cc_theme_css' value is not valid (string required)!");
					}

					if(conf_params['cc_delay'] != undefined && conf_params['cc_delay'] != null){
						typeof conf_params['cc_delay'] == "number" &&  conf_params['cc_delay'] >=0 ? _config.cc_delay = conf_params['cc_delay'] : _printVerbose("CookieConsent [config_error]: 'cc_delay' value is not valid (number >=0 required)!");
					}

					if(conf_params['cc_autorun'] != undefined && conf_params['cc_autorun'] != null){
						typeof conf_params['cc_autorun'] == "boolean" ? _config.cc_autorun = conf_params['cc_autorun'] : _printVerbose("CookieConsent [config_error]: 'cc_autorun' value is not valid (boolean required)!");
					}

					if(conf_params['cc_website_url'] != undefined && conf_params['cc_website_url'] != null){
						typeof conf_params['cc_website_url'] == "string" ? _config.cc_website_url = conf_params['cc_website_url'] : _printVerbose("CookieConsent [config_error]: 'cc_website_url' value is not valid (string required)!");
					}else{
						_config.cc_website_url = _getServerHostname();
					}

					if(_config.cc_auto_language){
						_config.cc_current_lang = _config.cc_current_lang = _getValidatedLanguage(_getBrowserLang());
					}else{
						if(conf_params['cc_current_lang'] != undefined && conf_params['cc_current_lang'] != null ){
							typeof conf_params['cc_current_lang'] == "string" ? _config.cc_current_lang = conf_params['cc_current_lang'] :  _printVerbose("CookieConsent [config_error]: 'cc_current_lang' value is not valid (string required)!");
						}
					}

				}else{
	
					_printVerbose("CookieConsent [config_notice]: No initial config object found, using default values!");
	
					if(_config.cc_auto_language){
						_config.cc_current_lang = _getValidatedLanguage(_getBrowserLang())
					}
	
					_config.cc_website_url = _getServerHostname();
				}
			}catch(ex){
				_printVerbose("CookieConsent [ERROR]: ", ex);
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
			passive = passive || false;
		
			if (elem.addEventListener) {
				if (passive) {
					elem.addEventListener(event, fn, { capture: true, passive: true });
				} else {
					elem.addEventListener(event, fn, false);
				}
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

		/**
		 * Append class to specified dom element
		 * @param {Object} elem 
		 * @param {string} classname 
		 */
		var _addClass = function (elem, classname){
			elem.classList ? elem.classList.add(classname) : elem.className += ' '+classname;
		}

		/**
		 * Check if specified dom element has a specific class
		 * @param {Object} elem 
		 * @param {string} classname 
		 */
		var _hasClass = function(el, className) {
			if (el.classList) {
				return el.classList.contains(className);
			}
			return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
		}
		/**
		 * Remove specified class from dom element
		 * @param {Object} elem 
		 * @param {string} classname 
		 */
		var _removeClass = function (el, className) {
			if (el.classList) {
				el.classList.remove(className)
			}
			else if (_hasClass(el, className)) {
				var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
				el.className = el.className.replace(reg, ' ');
			}
		}

		/**
		 * Check if given lang index exists as a defined property inside _config object
		 * If it exists -> desired language is implemented for cookieconsent
		 * Otherwise switch back to default cc_current_lang
		 * @param {string} lang 
		 */
		var _getValidatedLanguage = function(lang){
			if(_cc_languages.hasOwnProperty(lang)) return lang;
			_printVerbose("CookieConsent [lang_notice]: lang '"+lang+"' is not implemented, using default '"+_config.cc_default_lang+"' lang!");
			return _config.cc_default_lang;
		}

		
		/**
		 * Helper function which prints info (console.log()) only if verbose mode is enabled
		 * @param {object} print_msg 
		 * @param {object} optional_param 
		 */
		var _printVerbose = function(print_msg, optional_param){
			_config.cc_enable_verbose && console.log(print_msg, optional_param || "");
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

			if(browser_lang.length > 2){
				browser_lang = (browser_lang[0]+browser_lang[1]);
			}
			
			_printVerbose("CookieConsent [browser_lang_notice]: detected_browser_lang = '"+ browser_lang + "'");
			return browser_lang.toLowerCase()
		}
			
		/**
		 * Get hostname/server of this script
		 */
		var _getServerHostname = function(){
			var host = window.location.hostname;
			_printVerbose("CookieConsent [hostname_notice]: detected_hostname = '"+ host+ "'");
			return window.location.protocol+"//"+host
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
			var cc_btn_more = document.createElement("button");

			/**
			 * Set for each of them, their default configured ids
			 */
			cc_modal.id = _config.cc_ids.modal_id;
			cc_titolo.id = _config.cc_ids.modal_title;
			cc_text.id = _config.cc_ids.modal_text;
			cc_btn_container.id = "cc__modal__btns";
			cc_btn_accept.id = _config.cc_ids.modal_accept_btn;
			cc_btn_more.id = _config.cc_ids.modal_more_btn;
			cc_btn_accept.setAttribute('type', 'button');
			cc_btn_more.setAttribute('type', 'button');
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
			
			
			/**
			 * Check if cc_container prop. is configured
			 * If valid, check if it is and id or body
			 */
			if(_config.cc_container != undefined && _config.cc_container != null && typeof _config.cc_container == "string"){
				if(_config.cc_container[0] != "#"){
					document.body.appendChild(cc_modal)
				}else{
					/**
					 * Remove '#' character from string
					 * Append cc_modal object inside the specified dom element with id = _config.cc_container
					 */
					var id_without_hashtag = _config.cc_container.substr(1);
					document.getElementById(id_without_hashtag).appendChild(cc_modal);
				}
			}
			
		}

		/**
		 * Load .css file for CookieConsent specified via the parameter
		 * @param {string} css_file_path 
		 */
		var _loadCookieConsentCSS = function(css_file_path, callback){
			var link  = document.createElement('link');
			link.rel  = 'stylesheet';
			link.type = 'text/css';
			try{
				link.onload = callback();
			}catch(ex){
				link.onreadystatechange = callback();
			}

			link.href = css_file_path;
			document.getElementsByTagName('head')[0].appendChild(link);
			_printVerbose("CookieConsent [css_notice]: loading_css = '"+ css_file_path + "'");
		}
		
		
		/**
		 * Check if cookieconsent is alredy attached to dom
		 * If not, create one, configure it and attach it to body
		 */
		_cookieconsent.run = function(conf_params){
			// 
			if(!document.getElementById(_config.cc_ids.modal_id)){
				var cc_cookie_value = _getCookie(_config.cc_cookie_name);
				if(cc_cookie_value == undefined || cc_cookie_value == null || cc_cookie_value == ""){
					_setConfig(conf_params);
					_loadCookieConsentCSS(_config.cc_theme_css, function(){
						_createCookieConsentHTML();
						_ccModalDom = document.getElementById(_config.cc_ids.modal_id);
						_setCookieConsentContent(_config.cc_current_lang);
						_acceptCookieConsentListener();
						if(_config.cc_autorun){
							_cookieconsent.show(_config.cc_delay);
						}
					});
					
				}else{
					_printVerbose("CookieConsent [NOTICE]: cookie consent alredy accepted!");
				}
			}else{
				_printVerbose("CookieConsent [NOTICE]: cookie consent alredy attached to body!");
			}
		}

		/**
		 * Show cookie consent modal (with delay parameter)
		 * @param {number} cc_delay 
		 */
		_cookieconsent.show = function(cc_delay){
			if(_isAttachedToDom){
				setTimeout(function() {
					if(_isHidden){
						_addClass(_ccModalDom, "cc__anim");
						_addClass(_ccModalDom, "cc__show");
						_printVerbose("CookieConsent [ready_notice]: show_cookie_consent");
						_isHidden = false;
					}else{
						_printVerbose("CookieConsent [cookie_notice]: alredy_shown");
					}
				}, typeof cc_delay == "number" && cc_delay > 15 ? cc_delay : 15);
				
			}else{
				_printVerbose("CookieConsent [cookie_notice]: cookie consent was not initialized!");
			}
		}

		/**
		 * Hide cookie consent (after it has been attached to dom)
		 */
		_cookieconsent.hide = function(){
			if(_isAttachedToDom){
				if(!_isHidden){
					_removeClass(document.getElementById(_config.cc_ids.modal_id), "cc__show");
					_isHidden = true;
					_printVerbose("CookieConsent [cookie_notice]: hide_cookie_consent");
				}else{
					_printVerbose("CookieConsent [cookie_notice]: alredy_hidden");
				}
			}else{
				_printVerbose("CookieConsent [cookie_notice]: nothing to hide!");
			}
		}

		_cookieconsent.remove = function(){
			if(_isAttachedToDom){
				// ....
			}else{
				_printVerbose("CookieConsent [cookie_notice]: nothing to remove!");
			}
		}

		/**
		 * TODO
		 */
		_cookieconsent.clearCookies = function(){
			var cookie_val = _getCookie(_config.cc_cookie_name);
			if(cookie_val != undefined && cookie_val != null && cookie_val != ""){
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
			_addEvent(document.getElementById(_config.cc_ids.modal_accept_btn), "click", function(event){
				_cookieconsent.hide();
				_printVerbose("CookieConsent [cookie_consent]: cookie_consent was accepted!");
				_setCookie(_config.cc_cookie_name, "accepted", 30, 0, 0);
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
		
			document.cookie = name + "=" + (value || "") + expires + "; path=/";
			//document.cookie = "tagname = test;secure";
		}

		/**
		 * Get cookie value by name
		 * @param {string} a 
		 */
		var _getCookie = function(a) {
			var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
			return b ? b.pop() : '';
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
			// check if selected language is defined in config file
			var lang = _getValidatedLanguage(selected_lang);
			_printVerbose("CookieConsent [lang_notice]: current_lang = '"+ lang + "'");
			_setText(_config.cc_ids.modal_title, _cc_languages[lang].dialog.cc_title);
			_setHtml(_config.cc_ids.modal_text, _cc_languages[lang].dialog.cc_description);
			_setText(_config.cc_ids.modal_accept_btn, _cc_languages[lang].dialog.cc_accept_text);
			_setText(_config.cc_ids.modal_more_btn, _cc_languages[lang].dialog.cc_more_text);
			_isAttachedToDom = true;
		}

		return _cookieconsent;
	};
	/**
	 * Make CookieConsent object accessible globally
	 */
	if(typeof(window.CookieConsent === 'undefined')){
		window.CookieConsent = CookieConsent();
	}
})(window);