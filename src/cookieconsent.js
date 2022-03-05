/*!
 * CookieConsent v3.0.0-beta.1
 * https://www.github.com/orestbida/cookieconsent
 * Author Orest Bida
 * Released under the MIT License
 */
(function(){
    'use strict';
    /**
     * @returns {Object} cookieconsent object with API
     */
    var CookieConsent = function(){

        /**
         * CHANGE THIS FLAG FALSE TO DISABLE console.log()
         */
        var ENABLE_LOGS = true;

        var _config = {
            'mode': 'opt-in',
            'revision': 0,
            'autoShow': true,
            'autoClearCookies': true,
            'manageScriptTags': true,
            'hideFromBots': true,

            'cookie': {
                'name': 'cc_cookie',
                'expiresAfterDays': 182,
                'domain': window.location.hostname,
                'path': '/',
                'sameSite': 'Lax',
                'rfcCompliant': false
            },

            scriptTagSelector: 'data-cookiecategory',
        };

        var
            /**
             * Object which holds the main methods/API (.show, .run, ...)
            */
            _cookieconsent = {},

            /**
             * Global user configuration object
             */
            userConfig,

            /**
             * @type {{
             *  name: string,
             *  expiresAfterDays: number | Function,
             *  domain: string,
             *  path: string,
             *  sameSite: string,
             *  rfcCompliant: boolean
             * }}
             */
            cookieConfig = _config.cookie,

            /**
             * Can be number of function
             * @type {number | Function}
             */
            _expiresAfterDays,

            /**
             * Internal state variables
             */
            savedCookieContent = {},
            cookieData = null,

            /**
             * @type {Date}
             */
            consentTimestamp,

            /**
             * @type {Date}
             */
            lastConsentTimestamp,

            /**
             * @type {string}
             */
            consentId,

            /**
             * @type {boolean}
             */
            invalidConsent = true,

            consentModalExists = false,
            consentModalVisible = false,

            settingsModalVisible = false,
            clickedInsideModal = false,
            currentModalFocusableElements,

            allSections,

            // Helper callback functions
            // (avoid calling "userConfig['onAccept']" all the time)
            onAccept,
            onChange,
            onFirstAction,

            revisionEnabled = false,
            validRevision = true,

            // State variables for the autoclearCookies function
            changedSettings = [],
            reloadPage = false;

        /**
         * Accept type:
         *  - "all"
         *  - "necessary"
         *  - "custom"
         * @type {string}
         */
        var acceptType;

        /**
         * Stores all available categories
         * @type {string[]}
         */
         var allCategories = [];

        /**
         * Contains all accepted categories
         * @type {string[]}
         */
        var acceptedCategories = [];

        /**
         * Contains all non-accepted (rejected) categories
         * @type {string[]}
         */
        var rejectedCategories = [];

         /**
          * Keep track of readonly toggles
          * @type {boolean[]}
          */
         var readonlyCategories = [];

        /**
         * Contains all categories enabled by default
         * @type {string[]}
         */
        var defaultEnabledCategories = [];

        /**
         * Don't run plugin (to avoid indexing its text content) if bot detected
         */
        var botAgentDetected = false;

        /**
         * Save reference to the last focused element on the page
         * (used later to restore focus when both modals are closed)
         */
        var lastFocusedElemBeforeModal,
            lastFocusedModalElement;

        /**
         * Both of the arrays below have the same structure:
         * [0] => holds reference to the FIRST focusable element inside modal
         * [1] => holds reference to the LAST focusable element inside modal
         */
        var allConsentModalFocusableElements = [],
            allSettingsModalFocusableElements = [];

        /**
         * Keep track of enabled/disabled categories
         * @type {boolean[]}
         */
        var allToggleStates = [];

        /**
         * Pointers to main dom elements (to avoid retrieving them later using document.getElementById)
         */
        var
            /** @type {HTMLElement} */ htmlDom = document.documentElement,
            /** @type {HTMLElement} */ mainContainer,
            /** @type {HTMLElement} */ allModalsContainer,

            /** @type {HTMLElement} */ consentModal,
            /** @type {HTMLElement} */ consentModalTitle,
            /** @type {HTMLElement} */ consentModalDescription,
            /** @type {HTMLElement} */ consentPrimaryBtn,
            /** @type {HTMLElement} */ consentSecondaryBtn,
            /** @type {HTMLElement} */ consentButtonsContainer,
            /** @type {HTMLElement} */ consentModalInner,

            /** @type {HTMLElement} */ settingsContainer,
            /** @type {HTMLElement} */ settingsInner,
            /** @type {HTMLElement} */ settingsTitle,
            /** @type {HTMLElement} */ settingsCloseBtn,
            /** @type {HTMLElement} */ settingsSections,
            /** @type {HTMLElement} */ newSettingsSections,
            /** @type {HTMLElement} */ settingsButtonsContainer,
            /** @type {HTMLElement} */ settingsSaveBtn,
            /** @type {HTMLElement} */ settingsAcceptAllBtn,
            /** @type {HTMLElement} */ settingsRejectAllBtn;

        /**
         * Update config settings
         * @param {Object} userConfig
         */
        var _setConfig = function(_userConfig){

            /**
             * Make user configuration globally available
             */
            userConfig = _userConfig;

            _log("CookieConsent [CONFIG]: userConfig:", userConfig);

            if(typeof userConfig['autoShow'] === "boolean")
                _config.autoShow = userConfig['autoShow'];

            var cookieSettings = userConfig['cookie'];

            if(typeof cookieSettings === 'object' && _getKeys(cookieSettings).length > 0){

                var
                    name = cookieSettings['name'],
                    domain = cookieSettings['domain'],
                    path = cookieSettings['path'],
                    sameSite = cookieSettings['sameSite'],
                    rfcCompliant = cookieSettings['rfcCompliant'];
                    _expiresAfterDays = cookieSettings['expiresAfterDays'];

                cookieConfig = _config.cookie;

                name && (cookieConfig.name = name);
                domain && (cookieConfig.domain = domain);
                path && (cookieConfig.path = path);
                sameSite && (cookieConfig.sameSite = sameSite);
                rfcCompliant && (cookieConfig.rfcCompliant = rfcCompliant);
                _expiresAfterDays && (cookieConfig.expiresAfterDays = _expiresAfterDays);
            }

            if(typeof userConfig['onAccept'] === "function")
                onAccept = userConfig['onAccept'];

            if(typeof userConfig['onFirstAction'] === "function")
                onFirstAction = userConfig['onFirstAction'];

            if(typeof userConfig['onChange'] === "function")
                onChange = userConfig['onChange'];

            if(userConfig['mode'] === 'opt-out')
                _config.mode = 'opt-out';

            if(typeof userConfig['revision'] === "number"){
                userConfig['revision'] > -1 && (_config.revision = userConfig['revision']);
                revisionEnabled = true;
            }

            if(typeof userConfig['autoClearCookies'] === "boolean")
                _config.autoClearCookies = userConfig['autoClearCookies'];

            if(userConfig['hideFromBots'] === true){
                botAgentDetected = navigator &&
                    ((navigator.userAgent && /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)) || navigator.webdriver);
            }

            _config.manageScriptTags = userConfig['manageScriptTags'] === true;

            var autoDetect = userConfig.languages['autoDetect'];

            if (autoDetect === 'browser' || autoDetect === 'document'){
                _config.autoDetect = autoDetect;
                _log("CookieConsent [LANG]: autoDetect strategy is '" + autoDetect + "'");
            }

            _config.currentLanguageCode = _resolveCurrentLang(userConfig.languages['translations'], userConfig.languages['default']);

            _log("CookieConsent [LANG]: current language is '" + _config.currentLanguageCode + "'");
        }

        // /**
        //  * Print consent date
        //  */
        // var _printconsentTimestampHTML = function(){
        //     if(!consentTimestamp) return;

        //     var consentTimestamp_elements = document.querySelectorAll('[data-cc="consent-date"]');
        //     var lastConsentTimestamp_elements = document.querySelectorAll('[data-cc="last-consent-update"]');

        //     for(var i=0; i<consentTimestamp_elements.length; i++)
        //         consentTimestamp_elements[i].textContent = consentTimestamp.toLocaleString();

        //     for(var i=0; i<lastConsentTimestamp_elements.length; i++)
        //         lastConsentTimestamp_elements[i].textContent = lastConsentTimestamp.toLocaleString();
        // }

        /**
         * Add an onClick listeners to all html elements with data-cc attribute
         */
        var _addDataButtonListeners = function(elem){

            var _a = 'accept-';

            var showSettingsElements = _getElements('c-settings');
            var acceptAllElements = _getElements(_a + 'all');
            var acceptNecessaryElements = _getElements(_a + 'necessary');
            var acceptCustomElements = _getElements(_a + 'custom');

            for(var i=0; i<showSettingsElements.length; i++){
                showSettingsElements[i].setAttribute('aria-haspopup', 'dialog');
                _addEvent(showSettingsElements[i], 'click', function(event){
                    event.preventDefault();
                    _cookieconsent.showSettings(0);
                });
            }

            for(i=0; i<acceptAllElements.length; i++){
                _addEvent(acceptAllElements[i], 'click', function(event){
                    _acceptAction(event, 'all');
                });
            }

            for(i=0; i<acceptCustomElements.length; i++){
                _addEvent(acceptCustomElements[i], 'click', function(event){
                    _acceptAction(event);
                });
            }

            for(i=0; i<acceptNecessaryElements.length; i++){
                _addEvent(acceptNecessaryElements[i], 'click', function(event){
                    _acceptAction(event, []);
                });
            }

            /**
             * Return all elements with given data-cc role
             * @param {string} dataRole
             * @returns {NodeListOf<Element>}
             */
            function _getElements(dataRole){
                return (elem || document).querySelectorAll('a[data-cc="' + dataRole + '"], button[data-cc="' + dataRole + '"]');
            }

            /**
             * Helper function: accept and then hide modals
             * @param {PointerEvent} e source event
             * @param {string} [acceptType]
             */
            function _acceptAction(e, acceptType){
                e.preventDefault();
                _cookieconsent.accept(acceptType);
                _cookieconsent.hideSettings();
                _cookieconsent.hide();
            }

            //_printconsentTimestampHTML();
        }

        /**
         * Get a valid language (at least 1 must be defined)
         * @param {string} lang - desired language
         * @param {Object} allTranslations - all defined languages
         * @returns {string} validated language
         */
        var _getValidLanguageCode = function(languageCode, allTranslations){
            if(Object.prototype.hasOwnProperty.call(allTranslations, languageCode)){
                return languageCode;
            }else if(_getKeys(allTranslations).length > 0){
                if(Object.prototype.hasOwnProperty.call(allTranslations, _config.currentLanguageCode)){
                    return _config.currentLanguageCode;
                }else{
                    return _getKeys(allTranslations)[0];
                }
            }
        }

        /**
         * Save reference to first and last focusable elements inside each modal
         * to prevent losing focus while navigating with TAB
         */
        var _getModalFocusableData = function(){

            /**
             * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
             * the first or last element of the modal, won't receive focus during "open/close" modal
             */
            var allowed_focusable_types = ['[href]', 'button', 'input', 'details', '[tabindex="0"]'];

            function _getAllFocusableElements(modal, _array){
                var focusLater=false, focusFirst=false;

                // ie might throw exception due to complex unsupported selector => a:not([tabindex="-1"])
                try{
                    var focusableElements = modal.querySelectorAll(allowed_focusable_types.join(':not([tabindex="-1"]), '));
                    var attr, len=focusableElements.length, i=0;

                    while(i < len){

                        attr = focusableElements[i].getAttribute('data-focus');

                        if(!focusFirst && attr === "1"){
                            focusFirst = focusableElements[i];

                        }else if(attr === "0"){
                            focusLater = focusableElements[i];
                            if(!focusFirst && focusableElements[i+1].getAttribute('data-focus') !== "0"){
                                focusFirst = focusableElements[i+1];
                            }
                        }

                        i++;
                    }

                }catch(e){
                    return modal.querySelectorAll(allowed_focusable_types.join(', '));
                }

                /**
                 * Save first and last elements (used to lock/trap focus inside modal)
                 */
                _array[0] = focusableElements[0];
                _array[1] = focusableElements[focusableElements.length - 1];
                _array[2] = focusLater;
                _array[3] = focusFirst;
            }

            /**
             * Get settings modal'S all focusable elements
             * Save first and last elements (used to lock/trap focus inside modal)
             */
            _getAllFocusableElements(settingsInner, allSettingsModalFocusableElements);

            /**
             * If consent modal exists, do the same
             */
            if(consentModalExists){
                _getAllFocusableElements(consentModal, allConsentModalFocusableElements);
            }
        }

        /**
         * Create consent modal and append it to main div
         * @param {string} lang
         */
        var _createConsentModal = function(lang){

            if(userConfig['disablePageInteraction'] === true)
                _addClass(htmlDom, 'force--consent');

            var consentModalData = userConfig.languages['translations'][lang]['consentModal'];

            // Create modal if it doesn't exist
            if(!consentModal){

                consentModal = _createNode('div');
                var consentModalInner_inner = _createNode('div');
                var overlay = _createNode('div');

                consentModal.id = 'cm';
                consentModalInner_inner.id = 'c-inr-i';
                overlay.id = 'cm-ov';

                consentModal.setAttribute('role', 'dialog');
                consentModal.setAttribute('aria-modal', 'true');
                consentModal.setAttribute('aria-hidden', 'false');
                consentModal.setAttribute('aria-labelledby', 'c-ttl');
                consentModal.setAttribute('aria-describedby', 'c-txt');

                // Append consent modal to main container
                allModalsContainer.appendChild(consentModal);
                allModalsContainer.appendChild(overlay);

                /**
                 * Make modal by default hidden to prevent weird page jumps/flashes (shown only once css is loaded)
                 */
                consentModal.style.visibility = overlay.style.visibility = "hidden";
                overlay.style.opacity = 0;
            }

            // Use insertAdjacentHTML instead of innerHTML
            var consentModalTitle_value = consentModalData['title'];

            // Add title (if valid)
            if(consentModalTitle_value){

                if(!consentModalTitle){
                    consentModalTitle = _createNode('div');
                    consentModalTitle.id = 'c-ttl';
                    consentModalTitle.setAttribute('role', 'heading');
                    consentModalTitle.setAttribute('aria-level', '2');
                    consentModalInner_inner.appendChild(consentModalTitle);
                }

                consentModalTitle.innerHTML = consentModalTitle_value;
            }

            var description = consentModalData['description'];

            if(revisionEnabled){
                description = description.replace(
                    '{{revisionMessage}}',
                    validRevision
                        ? ''
                        : consentModalData['revisionMessage'] || ''
                );
            }

            if(!consentModalDescription){
                consentModalDescription = _createNode('div');
                consentModalDescription.id = 'c-txt';
                consentModalInner_inner.appendChild(consentModalDescription);
            }

            // Set description content
            consentModalDescription.innerHTML = description;

            var primaryBtnData = consentModalData['primaryBtn'],   // accept current selection
                secondaryBtnData = consentModalData['secondaryBtn'];

            // Add primary button if not falsy
            if(primaryBtnData){

                if(!consentPrimaryBtn){
                    consentPrimaryBtn = _createNode('button');
                    consentPrimaryBtn.id = 'c-p-bn';
                    consentPrimaryBtn.className =  "c-bn";

                    _addEvent(consentPrimaryBtn, "click", function(){
                        _cookieconsent.hide();
                        _log("CookieConsent [ACCEPT]: cookie_consent was accepted!");
                        _cookieconsent.accept('all');
                    });
                }

                consentPrimaryBtn.innerHTML = primaryBtnData;
            }

            // Add secondary button if not falsy
            if(secondaryBtnData){

                if(!consentSecondaryBtn){
                    consentSecondaryBtn = _createNode('button');
                    consentSecondaryBtn.id = 'c-s-bn';
                    consentSecondaryBtn.className = "c-bn c_link";

                    _addEvent(consentSecondaryBtn, 'click', function(){
                        _cookieconsent.hide();
                        _cookieconsent.accept([]); // accept necessary only
                    });
                }

                consentSecondaryBtn.innerHTML = consentModalData['secondaryBtn'];
            }

            // Swap buttons
            var guiOptionsData = userConfig['guiOptions'];

            if(!consentModalInner){
                consentModalInner = _createNode('div');
                consentModalInner.id = 'c-inr';

                consentModalInner.appendChild(consentModalInner_inner);
            }

            if(!consentButtonsContainer){
                consentButtonsContainer = _createNode('div');
                consentButtonsContainer.id = "c-bns";

                if(guiOptionsData && guiOptionsData['consentModal'] && guiOptionsData['consentModal']['swapButtons'] === true){
                    secondaryBtnData && consentButtonsContainer.appendChild(consentSecondaryBtn);
                    primaryBtnData && consentButtonsContainer.appendChild(consentPrimaryBtn);
                    consentButtonsContainer.className = 'swap';
                }else{
                    primaryBtnData && consentButtonsContainer.appendChild(consentPrimaryBtn);
                    secondaryBtnData && consentButtonsContainer.appendChild(consentSecondaryBtn);
                }

                (primaryBtnData || secondaryBtnData ) && consentModalInner.appendChild(consentButtonsContainer);
                consentModal.appendChild(consentModalInner);
            }

            consentModalExists = true;
        }

        var _createSettingsModal = function(lang){

            var settingsModalData = userConfig.languages['translations'][lang]['settingsModal'];

            /**
             * Create all consentModal elements
             */
            if(!settingsContainer){
                settingsContainer = _createNode('div');
                var settingsContainerValign = _createNode('div');
                var settings = _createNode('div');
                var settingsContainerInner = _createNode('div');
                settingsInner = _createNode('div');
                settingsTitle = _createNode('div');
                var settingsHeader = _createNode('div');
                settingsCloseBtn = _createNode('button');
                var settingsCloseBtn_container = _createNode('div');
                settingsSections = _createNode('div');
                var overlay = _createNode('div');

                /**
                 * Set ids
                 */
                settingsContainer.id = 's-cnt';
                settingsContainerValign.id = "c-vln";
                settingsContainerInner.id = "c-s-in";
                settings.id = "cs";
                settingsTitle.id = 's-ttl';
                settingsInner.id = 's-inr';
                settingsHeader.id = "s-hdr";
                settingsSections.id = 's-bl';
                settingsCloseBtn.id = 's-c-bn';
                overlay.id = 'cs-ov';
                settingsCloseBtn_container.id = 's-c-bnc';
                settingsCloseBtn.className = 'c-bn';

                settingsContainer.setAttribute('role', 'dialog');
                settingsContainer.setAttribute('aria-modal', 'true');
                settingsContainer.setAttribute('aria-hidden', 'true');
                settingsContainer.setAttribute('aria-labelledby', 's-ttl');
                settingsTitle.setAttribute('role', 'heading');
                settingsContainer.style.visibility = overlay.style.visibility = "hidden";
                overlay.style.opacity = 0;

                settingsCloseBtn_container.appendChild(settingsCloseBtn);

                // If 'esc' key is pressed inside settingsContainer div => hide settings
                _addEvent(settingsContainerValign, 'keydown', function(evt){
                    evt = evt || window.event;
                    if (evt.keyCode === 27) {
                        _cookieconsent.hideSettings(0);
                    }
                }, true);

                _addEvent(settingsCloseBtn, 'click', function(){
                    _cookieconsent.hideSettings(0);
                });
            }else{
                newSettingsSections = _createNode('div');
                newSettingsSections.id = 's-bl';
            }

            // Add label to close button
            settingsCloseBtn.setAttribute('aria-label', settingsModalData['closeBtnLabel'] || '');

            allSections = settingsModalData['sections'];

            var nSections = allSections.length;
            var _allCategories = userConfig['categories'];   /* todo: already declared this once */

            // Set settings modal title
            settingsTitle.innerHTML = settingsModalData['title'];

            // Create settings modal content (blocks)
            for(var i=0; i<nSections; ++i){

                var title_data = allSections[i]['title'],
                    descriptionTextData = allSections[i]['description'],
                    toggleCategory = allSections[i]['linkedCategory'],
                    categoryData = toggleCategory && _allCategories[toggleCategory],
                    cookieTableData = allSections[i]['cookieTable'],
                    cookieTableHeaders = cookieTableData && cookieTableData['headers'],
                    cookieTableBody = cookieTableData && cookieTableData['body'],
                    createCookieTable = cookieTableBody && cookieTableBody.length > 0,
                    isExpandable = (descriptionTextData && 'truthy') || createCookieTable;

                // Create title
                var section = _createNode('div');
                var tableParent = _createNode('div');

                // Create description
                if(descriptionTextData){
                    var description = _createNode('div');
                    description.className = 'p';
                    description.insertAdjacentHTML('beforeend', descriptionTextData);
                }

                var titleContainer = _createNode('div');
                titleContainer.className = 'title';

                section.className = 'c-bl';
                tableParent.className = 'desc';

                // Create toggle if specified (opt in/out)
                if(typeof categoryData !== 'undefined'){

                    var expandableDivId = "c-ac-"+i;

                    // Create button (to collapse/expand block description)
                    var sectionTitleBtn = isExpandable ? _createNode('button') : _createNode('div');

                    var toggleLabel = _createNode('label');
                    var toggle = _createNode('input');
                    var toggleSpan = _createNode('span');
                    var toggleLabelSpan = _createNode('span');

                    // These 2 spans will contain each 2 pseudo-elements to generate 'tick' and 'x' icons
                    var toggleOnIcon = _createNode('span');
                    var toggleOffIcon = _createNode('span');

                    sectionTitleBtn.className = isExpandable ? 'b-tl exp' : 'b-tl';
                    toggleLabel.className = 'b-tg';
                    toggle.className = 'c-tgl';
                    toggleOnIcon.className = 'on-i';
                    toggleOffIcon.className = 'off-i';
                    toggleSpan.className = 'c-tg';
                    toggleLabelSpan.className = "t-lb";

                    if(isExpandable){
                        sectionTitleBtn.setAttribute('aria-expanded', 'false');
                        sectionTitleBtn.setAttribute('aria-controls', expandableDivId);
                    }

                    toggle.type = 'checkbox';
                    toggleSpan.setAttribute('aria-hidden', 'true');

                    toggle.value = toggleCategory;

                    toggleLabelSpan.textContent = title_data;

                    sectionTitleBtn.insertAdjacentHTML('beforeend', title_data);

                    titleContainer.appendChild(sectionTitleBtn);
                    toggleSpan.appendChild(toggleOnIcon);
                    toggleSpan.appendChild(toggleOffIcon);

                    /**
                     * If consent is valid => retrieve category states from cookie
                     * Otherwise use states defined in the userConfig. object
                     */
                    if(!invalidConsent){
                        if(_inArray(savedCookieContent['categories'], toggleCategory) > -1){
                            toggle.checked = true;
                            !newSettingsSections && allToggleStates.push(true);
                        }else{
                            !newSettingsSections && allToggleStates.push(false);
                        }
                    }else if(_allCategories[toggleCategory]['enabled']){
                        toggle.checked = true;
                        !newSettingsSections && allToggleStates.push(true);

                        /**
                         * Keep track of categories enabled by default (useful when mode=='opt-out')
                         */
                        if(_allCategories[toggleCategory]['enabled'])
                            !newSettingsSections && defaultEnabledCategories.push(toggleCategory);

                    }else{
                        !newSettingsSections && allToggleStates.push(false);
                    }

                    !newSettingsSections && allCategories.push(toggleCategory);

                    /**
                     * Set toggle as readonly if true (disable checkbox)
                     */
                    if(_allCategories[toggleCategory]['readOnly']){
                        toggle.disabled = true;
                        _addClass(toggleSpan, 'c-ro');
                        !newSettingsSections && readonlyCategories.push(true);
                    }else{
                        !newSettingsSections && readonlyCategories.push(false);
                    }

                    _addClass(tableParent, 'b-acc');
                    _addClass(titleContainer, 'b-bn');
                    _addClass(section, 'b-ex');

                    tableParent.id = expandableDivId;
                    tableParent.setAttribute('aria-hidden', 'true');

                    toggleLabel.appendChild(toggle);
                    toggleLabel.appendChild(toggleSpan);
                    toggleLabel.appendChild(toggleLabelSpan);
                    titleContainer.appendChild(toggleLabel);

                    /**
                     * On button click handle the following :=> aria-expanded, aria-hidden and act class for current block
                     */
                    isExpandable && (function(accordion, section, btn){
                        _addEvent(sectionTitleBtn, 'click', function(){
                            if(!_hasClass(section, 'act')){
                                _addClass(section, 'act');
                                btn.setAttribute('aria-expanded', 'true');
                                accordion.setAttribute('aria-hidden', 'false');
                            }else{
                                _removeClass(section, 'act');
                                btn.setAttribute('aria-expanded', 'false');
                                accordion.setAttribute('aria-hidden', 'true');
                            }
                        }, false);
                    })(tableParent, section, sectionTitleBtn);

                }else{
                    /**
                     * If block is not a button (no toggle defined),
                     * create a simple div instead
                     */
                    if(title_data){
                        var title = _createNode('div');
                        title.className = 'b-tl';
                        title.setAttribute('role', 'heading');
                        title.setAttribute('aria-level', '3');
                        title.insertAdjacentHTML('beforeend', title_data);
                        titleContainer.appendChild(title);
                    }
                }

                title_data && section.appendChild(titleContainer);
                descriptionTextData && tableParent.appendChild(description);

                // if cookie table found, generate table for this block
                if(createCookieTable){
                    var allTableKeys = _getKeys(cookieTableHeaders);
                    var tr_tmp_fragment = document.createDocumentFragment();

                    if(allTableKeys){
                        /**
                         * Create table header
                         */
                        for(var p=0; p<allTableKeys.length; ++p){
                            // create new header
                            var th1 = _createNode('th');
                            var key = allTableKeys[p];
                            th1.setAttribute('scope', 'col');

                            if(key){
                                th1.textContent = cookieTableHeaders[key];
                                tr_tmp_fragment.appendChild(th1);
                            }
                        }


                        var tr_tmp = _createNode('tr');
                        tr_tmp.appendChild(tr_tmp_fragment);

                        // create table header & append fragment
                        var thead = _createNode('thead');
                        thead.appendChild(tr_tmp);

                        // append header to table
                        var table = _createNode('table');
                        table.appendChild(thead);

                        var tbody_fragment = document.createDocumentFragment();

                        // create table content
                        for(var n=0; n<cookieTableBody.length; n++){
                            var tr = _createNode('tr');

                            for(var g=0; g<allTableKeys.length; ++g){

                                var columnKey = allTableKeys[g];
                                var columnHeader = cookieTableHeaders[columnKey];
                                var columnValue = cookieTableBody[n][columnKey];

                                var td_tmp = _createNode('td');

                                // Allow html inside table cells
                                td_tmp.insertAdjacentHTML('beforeend', columnValue);
                                td_tmp.setAttribute('data-column', columnHeader);

                                tr.appendChild(td_tmp);
                            }

                            tbody_fragment.appendChild(tr);
                        }

                        // append tbody_fragment to tbody & append the latter into the table
                        var tbody = _createNode('tbody');
                        tbody.appendChild(tbody_fragment);
                        table.appendChild(tbody);

                        tableParent.appendChild(table);
                    }
                }

                /**
                 * Append only if is either:
                 * - togglable div with title
                 * - a simple div with at least a title or description
                 */
                if(allCategories[toggleCategory] && title_data || (!allCategories[toggleCategory] && (title_data || descriptionTextData))){
                    section.appendChild(tableParent);

                    if(newSettingsSections)
                        newSettingsSections.appendChild(section);
                    else
                        settingsSections.appendChild(section);
                }
            }

            // Create settings buttons
            if(!settingsButtonsContainer){
                settingsButtonsContainer = _createNode('div');
                settingsButtonsContainer.id = 's-bns';
            }

            if(!settingsAcceptAllBtn){
                settingsAcceptAllBtn = _createNode('button');
                settingsAcceptAllBtn.id = 's-all-bn';
                settingsAcceptAllBtn.className ='c-bn';
                settingsButtonsContainer.appendChild(settingsAcceptAllBtn);

                _addEvent(settingsAcceptAllBtn, 'click', function(){
                    _cookieconsent.hideSettings();
                    _cookieconsent.hide();
                    _cookieconsent.accept('all');
                });
            }

            settingsAcceptAllBtn.innerHTML = settingsModalData['acceptAllBtn'];

            var rejectAllBtnText = settingsModalData['rejectAllBtn'];

            // Add third [optional] reject all button if provided
            if(rejectAllBtnText){

                if(!settingsRejectAllBtn){
                    settingsRejectAllBtn = _createNode('button');
                    settingsRejectAllBtn.id = 's-rall-bn';
                    settingsRejectAllBtn.className = 'c-bn';

                    _addEvent(settingsRejectAllBtn, 'click', function(){
                        _cookieconsent.hideSettings();
                        _cookieconsent.hide();
                        _cookieconsent.accept([]);
                    });

                    settingsInner.className = "bns-t";
                    settingsButtonsContainer.appendChild(settingsRejectAllBtn);
                }

                settingsRejectAllBtn.innerHTML = rejectAllBtnText;
            }

            if(!settingsSaveBtn){
                settingsSaveBtn = _createNode('button');
                settingsSaveBtn.id = 's-sv-bn';
                settingsSaveBtn.className ='c-bn';
                settingsButtonsContainer.appendChild(settingsSaveBtn);

                // Add save preferences button onClick event
                // Hide both settings modal and consent modal
                _addEvent(settingsSaveBtn, 'click', function(){
                    _cookieconsent.hideSettings();
                    _cookieconsent.hide();
                    _cookieconsent.accept();
                });
            }

            settingsSaveBtn.innerHTML = settingsModalData['saveSettingsBtn'];

            if(newSettingsSections) {
                // replace entire existing cookie category blocks with the new cookie categories new blocks (in a different language)
                settingsInner.replaceChild(newSettingsSections, settingsSections);
                settingsSections = newSettingsSections;
                return;
            };

            settingsHeader.appendChild(settingsTitle);
            settingsHeader.appendChild(settingsCloseBtn_container);
            settingsInner.appendChild(settingsHeader);
            settingsInner.appendChild(settingsSections);
            settingsInner.appendChild(settingsButtonsContainer);
            settingsContainerInner.appendChild(settingsInner);

            settings.appendChild(settingsContainerInner);
            settingsContainerValign.appendChild(settings);
            settingsContainer.appendChild(settingsContainerValign);

            allModalsContainer.appendChild(settingsContainer);
            allModalsContainer.appendChild(overlay);
        }

        /**
         * Generate cookie consent html markup
         */
        var _createCookieConsentHTML = function(){

            // Create main container which holds both consent modal & settings modal
            mainContainer = _createNode('div');
            mainContainer.id = 'cc--main';

            // Fix layout flash
            mainContainer.style.position = "fixed";
            mainContainer.style.zIndex = "1000000";
            mainContainer.innerHTML = '<div id="cc_div" class="cc_div"></div>';
            allModalsContainer = mainContainer.children[0];

            // Get current language
            var lang = _config.currentLanguageCode;

            // Create consent modal
            if(consentModalExists)
                _createConsentModal(lang);

            // Always create settings modal
            _createSettingsModal(lang);

            // Finally append everything (mainContainer holds both modals)
            (userConfig['root'] || document.body).appendChild(mainContainer);
        }

        /**
         * Update/change modals language
         * @param {String} lang new language
         * @param {Boolean} [force] update language fields forcefully
         * @returns {Boolean}
         */
        _cookieconsent.updateLanguage = function(lang, force){

            if(typeof lang !== 'string') return;

            /**
             * Validate language to avoid errors
             */
            var newValidatedLanguage = _getValidLanguageCode(lang, userConfig.languages['translations']);

            /**
             * Set language only if it differs from current
             */
            if(newValidatedLanguage !== _config.currentLanguageCode || force === true){
                _config.currentLanguageCode = newValidatedLanguage;

                if(consentModalExists){
                    _createConsentModal(newValidatedLanguage);
                    _addDataButtonListeners(consentModalInner);
                }

                _createSettingsModal(newValidatedLanguage);

                _log("CookieConsent [LANGUAGE]: curr_lang: '" + newValidatedLanguage + "'");

                return true;
            }

            return false;
        }

        /**
         * Delete all cookies which are unused (based on selected preferences)
         *
         * @param {boolean} [clearOnFirstAction]
         */
        var _autoclearCookies = function(clearOnFirstAction){

            var allCategories = userConfig['categories'];

            // Get number of blocks
            var len = allSections.length;
            var count = -1;

            // reset reload state
            reloadPage = false;

            // Retrieve all cookies
            var allCookiesArray = _getCookie('', 'all');

            // delete cookies on 'www.domain.com' and '.www.domain.com' (can also be without www)
            var domains = [cookieConfig.domain, '.'+cookieConfig.domain];

            // if domain has www, delete cookies also for 'domain.com' and '.domain.com'
            if(cookieConfig.domain.slice(0, 4) === 'www.'){
                var non_www_domain = cookieConfig.domain.substr(4);  // remove first 4 chars (www.)
                domains.push(non_www_domain);
                domains.push('.' + non_www_domain);
            }

            // For each block
            for(var i=0; i<len; i++){

                // Save current block (local scope & less accesses -> ~faster value retrieval)
                var currSection = allSections[i];

                // If current block has a toggle for opt in/out
                var toggleCategory = currSection['linkedCategory'];

                if(typeof toggleCategory === 'string'){

                    var currentCategory = allCategories[toggleCategory];
                    var currentCategoryAutoClear = currentCategory && currentCategory['autoClear'];
                    var currentAutoClearCookies = currentCategoryAutoClear && currentCategoryAutoClear['cookies'];

                    // if current block has a cookie table, an off toggle,
                    // and its preferences were just changed => delete cookies
                    var categoryWasJustDisabled = _inArray(changedSettings, toggleCategory) > -1;

                    if(
                        !allToggleStates[++count] &&
                        currentAutoClearCookies &&
                        (clearOnFirstAction || categoryWasJustDisabled)
                    ){

                        // Get number of cookies defined in cookie_table
                        var clen = currentAutoClearCookies.length;

                        // check if page needs to be reloaded after autoClear
                        if(currentCategoryAutoClear['reloadPage'] === true)
                            categoryWasJustDisabled && (reloadPage = true);

                        // delete each cookie in the cookies array
                        for(var j=0; j<clen; j++){

                            // Get current row of table (corresponds to all cookie params)
                            var foundCookies = [];
                            /**
                             * @type {RegExp}
                             */
                            var currCookieName = currentAutoClearCookies[j]['name'];
                            var isRegex = currCookieName && typeof currCookieName !== 'string';
                            var currCookieDomain = currentAutoClearCookies[j]['domain'] || null;
                            var currCookiePath = currentAutoClearCookies[j]['path'] || false;

                            // set domain to the specified domain
                            currCookieDomain && ( domains = [currCookieDomain, '.'+currCookieDomain]);

                            // If regex provided => filter cookie array
                            if(isRegex){
                                for(var n=0; n<allCookiesArray.length; n++){
                                    if(currCookieName.test(allCookiesArray[n]))
                                        foundCookies.push(allCookiesArray[n]);
                                }
                            }else{
                                var found_index = _inArray(allCookiesArray, currCookieName);
                                if(found_index > -1) foundCookies.push(allCookiesArray[found_index]);
                            }

                            /* todo: fix this line, printing regex throws error */
                            _log("CookieConsent [AUTOCLEAR]: search cookie: '" + currCookieName + "', found:", foundCookies);

                            // If cookie exists -> delete it
                            if(foundCookies.length > 0){
                                _eraseCookies(foundCookies, currCookiePath, domains);
                            }
                        }
                    }
                }
            }
        }

        /**
         * Set toggles/checkboxes based on accepted categories and save cookie
         * @param {string[]} acceptedCategories - Array of categories to accept
         */
        var _saveCookiePreferences = function(acceptedCategories){

            changedSettings = [];

            // Retrieve all toggle/checkbox values
            var category_toggles = document.querySelectorAll('.c-tgl') || [];

            // If there are opt in/out toggles ...
            if(category_toggles.length > 0){

                for(var i=0; i<category_toggles.length; i++){
                    if(_inArray(acceptedCategories, allCategories[i]) !== -1){
                        category_toggles[i].checked = true;
                        if(!allToggleStates[i]){
                            changedSettings.push(allCategories[i]);
                            allToggleStates[i] = true;
                        }
                    }else{
                        category_toggles[i].checked = false;
                        if(allToggleStates[i]){
                            changedSettings.push(allCategories[i]);
                            allToggleStates[i] = false;
                        }
                    }
                }
            }

            /**
             * Clear cookies when settings/preferences change
             */
            if(!invalidConsent && _config.autoClearCookies && changedSettings.length > 0)
                _autoclearCookies();

            if(!consentTimestamp) consentTimestamp = new Date();
            if(!consentId) consentId = _uuidv4();

            savedCookieContent = {
                'categories': acceptedCategories,
                'revision': _config.revision,
                'data': cookieData,
                'rfcCompliant': cookieConfig.rfcCompliant,
                'consentTimestamp': consentTimestamp.toISOString(),
                'consentId': consentId
            }

            if(invalidConsent || changedSettings.length > 0){
                validRevision = true;

                /**
                 * Update "lastConsentTimestamp"
                 */
                if(!lastConsentTimestamp)
                    lastConsentTimestamp = consentTimestamp;
                else
                    lastConsentTimestamp = new Date();

                savedCookieContent['lastConsentTimestamp'] = lastConsentTimestamp.toISOString();

                /**
                 * Update accept type
                 */
                acceptType = _getAcceptType(_getCurrentCategoriesState());

                _setCookie(cookieConfig.name, JSON.stringify(savedCookieContent));
                _manageExistingScripts();

                //_printconsentTimestampHTML();
            }

            if(invalidConsent){

                /**
                 * Delete unused/"zombie" cookies if consent is not valid (not yet expressed or cookie has expired)
                 */
                if(_config.autoClearCookies)
                    _autoclearCookies(true);

                if(typeof onFirstAction === 'function')
                    onFirstAction(_cookieconsent.getUserPreferences(), savedCookieContent);

                if(typeof onAccept === 'function')
                    onAccept(savedCookieContent);

                /**
                 * Set consent as valid
                 */
                invalidConsent = false;

                if(_config.mode === 'opt-in') return;
            }

            // fire onChange only if settings were changed
            if(typeof onChange === "function" && changedSettings.length > 0)
                onChange(savedCookieContent, changedSettings);

            /**
             * reload page if needed
             */
            if(reloadPage)
                window.location.reload();
        }

        /**
         * Returns index of found element inside array, otherwise -1
         * @param {Array} arr
         * @param {Object} value
         * @returns {number}
         */
        var _inArray = function(arr, value){
            return arr.indexOf(value);
        }

        /**
         * Helper function which prints info (console.log())
         * @param {Object} print_msg
         * @param {Object} [optional_param]
         */
        var _log = function(print_msg, optional_param, error){
            ENABLE_LOGS && (!error ? console.log(print_msg, optional_param !== undefined ? optional_param : ' ') : console.error(print_msg, optional_param || ""));
        }

        /**
         * Helper function which creates an HTMLElement object based on 'type' and returns it.
         * @param {string} type
         * @returns {HTMLElement}
         */
        var _createNode = function(type){
            var el = document.createElement(type);
            if(type === 'button'){
                el.setAttribute('type', type);
            }
            return el;
        }

        /**
         * Generate RFC4122-compliant UUIDs.
         * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid?page=1&tab=votes#tab-top
         * @returns {string}
         */
        var _uuidv4 = function(){
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c){
                return (c ^ (window.crypto || window.msCrypto).getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            });
        }

        /**
         * Resolve which language should be used.
         *
         * @param {Object} languages Object with language translations
         * @param {string} [requested_language] Language specified by given configuration parameters
         * @returns {string}
         */
        var _resolveCurrentLang = function (languages, requested_language) {

            if (_config.autoDetect === 'browser') {
                return _getValidLanguageCode(_getBrowserLanguageCode(), languages);
            } else if (_config.autoDetect === 'document') {
                return _getValidLanguageCode(document.documentElement.lang, languages);
            } else {
                if (typeof requested_language === 'string') {
                    return _config.currentLanguageCode = _getValidLanguageCode(requested_language, languages);
                }
            }

            _log("CookieConsent [LANG]: setting currentLanguageCode = '" + _config.currentLanguageCode + "'");
            return _config.currentLanguageCode; // otherwise return default
        }

        /**
         * Get current client's browser language
         * @returns {string}
         */
        var _getBrowserLanguageCode = function(){
            var browser_lang = navigator.language || navigator.browserLanguage;
            browser_lang.length > 2 && (browser_lang = browser_lang[0]+browser_lang[1]);
            _log("CookieConsent [LANG]: browser language is '"+ browser_lang + "'");
            return browser_lang.toLowerCase();
        }

        /**
         * Trap focus inside modal and focus the first
         * focusable element of current active modal
         */
        var _handleFocusTrap = function(){
            var tabbedOutsideDiv = false;
            var tabbedInsideModal = false;

            _addEvent(document, 'keydown', function(e){
                e = e || window.event;

                // If is tab key => ok
                if(e.key !== 'Tab') return;

                // If there is any modal to focus
                if(currentModalFocusableElements){
                    // If reached natural end of the tab sequence => restart
                    if(e.shiftKey){
                        if (document.activeElement === currentModalFocusableElements[0]) {
                            currentModalFocusableElements[1].focus();
                            e.preventDefault();
                        }
                    }else{
                        if (document.activeElement === currentModalFocusableElements[1]) {
                            currentModalFocusableElements[0].focus();
                            e.preventDefault();
                        }
                    }

                    // If have not yet used tab (or shift+tab) and modal is open ...
                    // Focus the first focusable element
                    if(!tabbedInsideModal && !clickedInsideModal){
                        tabbedInsideModal = true;
                        !tabbedOutsideDiv && e.preventDefault();

                        if(e.shiftKey){
                            if(currentModalFocusableElements[3]){
                                if(!currentModalFocusableElements[2]){
                                    currentModalFocusableElements[0].focus();
                                }else{
                                    currentModalFocusableElements[2].focus();
                                }
                            }else{
                                currentModalFocusableElements[1].focus();
                            }
                        }else{
                            if(currentModalFocusableElements[3]){
                                currentModalFocusableElements[3].focus();
                            }else{
                                currentModalFocusableElements[0].focus();
                            }
                        }
                    }
                }

                !tabbedInsideModal && (tabbedOutsideDiv = true);
            });

            if(document.contains){
                _addEvent(mainContainer, 'click', function(e){
                    e = e || window.event;
                    /**
                     * If click is on the foreground overlay (and not inside settingsModal),
                     * hide settings modal
                     *
                     * Notice: click on div is not supported in IE
                     */
                    if(settingsModalVisible){
                        if(!settingsInner.contains(e.target)){
                            _cookieconsent.hideSettings(0);
                            clickedInsideModal = false;
                        }else{
                            clickedInsideModal = true;
                        }
                    }else if(consentModalVisible){
                        if(consentModal.contains(e.target)){
                            clickedInsideModal = true;
                        }
                    }

                }, true);
            }
        }

        /**
         * Manage each modal's layout
         * @param {Object} guiOptions
         */
        var _guiManager = function(guiOptions, only_consent_modal){ //todo: check only_consent_modal

            // If guiOptions is not object => exit
            if(typeof guiOptions !== 'object') return;

            var consentModalOptions = guiOptions['consentModal'];
            var settingsModalOptions = guiOptions['settingsModal'];

            /**
             * Helper function which adds layout and
             * position classes to given modal
             *
             * @param {HTMLElement} modal
             * @param {string[]} allowed_layouts
             * @param {string[]} allowed_positions
             * @param {string} layout
             * @param {string[]} position
             */
            function _setLayout(modal, allowed_layouts, allowed_positions, allowed_transitions, layout, position, transition){
                position = (position && position.split(" ")) || [];

                // Check if specified layout is valid
                if(_inArray(allowed_layouts, layout) > -1){

                    // Add layout classes
                    _addClass(modal, layout);

                    // Add position class (if specified)
                    if(!(layout === 'bar' && position[0] === 'middle') && _inArray(allowed_positions, position[0]) > -1){
                        for(var i=0; i<position.length; i++){
                            _addClass(modal, position[i]);
                        }
                    }
                }

                // Add transition class
                (_inArray(allowed_transitions, transition) > -1) && _addClass(modal, transition);
            }

            if(consentModalExists && consentModalOptions){
                _setLayout(
                    consentModal,
                    ['box', 'bar', 'cloud'],
                    ['top', 'middle', 'bottom'],
                    ['zoom', 'slide'],
                    consentModalOptions['layout'],
                    consentModalOptions['position'],
                    consentModalOptions['transition']
                );
            }

            if(!only_consent_modal && settingsModalOptions){
                _setLayout(
                    settingsContainer,
                    ['bar'],
                    ['left', 'right'],
                    ['zoom', 'slide'],
                    settingsModalOptions['layout'],
                    settingsModalOptions['position'],
                    settingsModalOptions['transition']
                );
            }
        }

        /**
         * Returns true if cookie category is accepted by the user
         * @param {string} toggleCategory
         * @returns {boolean}
         */
        _cookieconsent.allowedCategory = function(toggleCategory){

            if(!invalidConsent || _config.mode === 'opt-in')
                var allowedCategories = _cookieconsent.getUserPreferences().acceptedCategories;
            else  // mode is 'opt-out'
                var allowedCategories = defaultEnabledCategories;

            return _inArray(allowedCategories, toggleCategory) > -1;
        }

        /**
         * Helper function to retrieve cookie duration
         * @returns {number}
         */
        var _getExpiresAfterDaysValue = function(){
            return typeof _expiresAfterDays === 'function' ? _expiresAfterDays() : _expiresAfterDays;
        }

        /**
         * "Init" method. Will run once and only if modals do not exist
         */
        _cookieconsent.run = function(userConfig){
            if(!document.getElementById('cc_div')){

                // configure all parameters
                _setConfig(userConfig);

                // if is bot, don't run plugin
                if(botAgentDetected) return;

                // Retrieve cookie value (if set)
                savedCookieContent = JSON.parse(_getCookie(cookieConfig.name, 'one', true) || "{}");

                // Retrieve "consentId"
                consentId = savedCookieContent['consentId'];

                // If "consentId" is present => assume that consent was previously given
                var cookieConsentAccepted = consentId !== undefined;

                // Retrieve "consentTimestamp"
                consentTimestamp = savedCookieContent['consentTimestamp'];
                consentTimestamp && (consentTimestamp = new Date(consentTimestamp));

                // Retrieve "lastConsentTimestamp"
                lastConsentTimestamp = savedCookieContent['lastConsentTimestamp'];
                lastConsentTimestamp && (lastConsentTimestamp = new Date(lastConsentTimestamp));

                // Retrieve "data"
                cookieData = savedCookieContent['data'] !== undefined ? savedCookieContent['data'] : null;

                // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
                if(revisionEnabled && cookieConsentAccepted && savedCookieContent['revision'] !== _config.revision)
                    validRevision = false;

                // If consent is not valid => create consent modal
                consentModalExists = invalidConsent = (!cookieConsentAccepted || !validRevision || !consentTimestamp || !lastConsentTimestamp || !consentId);

                // Generate cookie-settings dom (& consent modal)
                _createCookieConsentHTML();

                _getModalFocusableData();
                _guiManager(userConfig['guiOptions']);
                _addDataButtonListeners();

                if(_config.autoShow && consentModalExists)
                    _cookieconsent.show();

                // Add class to enable animations/transitions
                setTimeout(function(){_addClass(mainContainer, 'c--anim');}, 30);

                // Accessibility :=> if tab pressed => trap focus inside modal
                setTimeout(function(){_handleFocusTrap();}, 100);

                // If consent is valid
                if(!invalidConsent){
                    /**
                     * Update accept type
                     */
                    acceptType = _getAcceptType(_getCurrentCategoriesState());

                    var rfcPropExists = typeof savedCookieContent['rfcCompliant'] === "boolean";

                    /*
                     * Convert cookie to rfc format (if `use_rfcCompliant` is enabled)
                     */
                    if(!rfcPropExists || (rfcPropExists && savedCookieContent['rfcCompliant'] !== cookieConfig.rfcCompliant)){

                        savedCookieContent['rfcCompliant'] = cookieConfig.rfcCompliant;

                        /**
                         * Before converting the cookie to/from its rfcCompliant version,
                         * calculate the existing cookie's remaining time until expiration
                         * to avoid re-setting it for the full "cookieExpiresAfterDays" duration
                         * (which should only happen when preferences are changed or consent is renewed)
                         */
                        var elapsedTimeMilliseconds = new Date() - lastConsentTimestamp,
                            remainingTimeMilliseconds = _getExpiresAfterDaysValue()*86400000 - elapsedTimeMilliseconds;

                        _setCookie(cookieConfig.name, JSON.stringify(savedCookieContent), remainingTimeMilliseconds);
                    }

                    _manageExistingScripts();

                    if(typeof onAccept === 'function')
                        onAccept(savedCookieContent);

                    _log("CookieConsent [NOTICE]: consent already given!", savedCookieContent);

                }else{
                    if(_config.mode === 'opt-out'){
                        _log("CookieConsent [CONFIG] mode='" + _config.mode + "', default enabled categories:", defaultEnabledCategories);
                        _manageExistingScripts(defaultEnabledCategories);
                    }
                    _log("CookieConsent [NOTICE]: ask for consent!");
                }
            }else{
                _log("CookieConsent [NOTICE]: cookie consent already attached to body!");
            }
        }

        /**
         * Show settings modal (with optional delay)
         * @param {number} [delay]
         */
        _cookieconsent.showSettings = function(delay){
            setTimeout(function() {
                _addClass(htmlDom, "show--settings");
                settingsContainer.setAttribute('aria-hidden', 'false');
                settingsModalVisible = true;

                /**
                 * Set focus to the first focusable element inside settings modal
                 */
                setTimeout(function(){
                    // If there is no consent-modal, keep track of the last focused elem.
                    if(!consentModalVisible){
                        lastFocusedElemBeforeModal = document.activeElement;
                    }else{
                        lastFocusedModalElement = document.activeElement;
                    }

                    if (allSettingsModalFocusableElements.length === 0) return;

                    if(allSettingsModalFocusableElements[3]){
                        allSettingsModalFocusableElements[3].focus();
                    }else{
                        allSettingsModalFocusableElements[0].focus();
                    }
                    currentModalFocusableElements = allSettingsModalFocusableElements;
                }, 200);

                _log("CookieConsent [SETTINGS]: show settingsModal");
            }, delay > 0 ? delay : 0);
        }

        /**
         * This function handles the loading/activation logic of the already
         * existing scripts based on the current accepted cookie categories
         *
         * @param {string[]} [must_enable_categories]
         */
        var _manageExistingScripts = function(must_enable_categories){

            if(!_config.manageScriptTags) return;

            // get all the scripts with "cookie-category" attribute
            var scripts = document.querySelectorAll('script[' + _config.scriptTagSelector + ']');
            var acceptedCategories = must_enable_categories || savedCookieContent['categories'] || [];

            /**
             * Load scripts (sequentially), using a recursive function
             * which loops through the scripts array
             * @param {Element[]} scripts scripts to load
             * @param {number} index current script to load
             */
            var _loadScripts = function(scripts, index){
                if(index < scripts.length){

                    var curr_script = scripts[index];
                    var curr_script_category = curr_script.getAttribute(_config.scriptTagSelector);

                    /**
                     * If current script's category is on the array of categories
                     * accepted by the user => load script
                     */
                    if(_inArray(acceptedCategories, curr_script_category) > -1){

                        curr_script.type = 'text/javascript';
                        curr_script.removeAttribute(_config.scriptTagSelector);

                        // get current script data-src
                        var src = curr_script.getAttribute('data-src');

                        // some scripts (like ga) might throw warning if data-src is present
                        src && curr_script.removeAttribute('data-src');

                        // create fresh script (with the same code)
                        var fresh_script = _createNode('script');
                        fresh_script.textContent = curr_script.innerHTML;

                        // Copy attributes over to the new "revived" script
                        (function(destination, source){
                            var attributes = source.attributes;
                            var len = attributes.length;
                            for(var i=0; i<len; i++){
                                var attr_name = attributes[i].nodeName;
                                destination.setAttribute(attr_name , source[attr_name] || source.getAttribute(attr_name));
                            }
                        })(fresh_script, curr_script);

                        // set src (if data-src found)
                        src ? (fresh_script.src = src) : (src = curr_script.src);

                        // if script has "src" attribute
                        // try loading it sequentially
                        if(src){
                            // load script sequentially => the next script will not be loaded
                            // until the current's script onload event triggers
                            if(fresh_script.readyState) {  // only required for IE <9
                                fresh_script.onreadystatechange = function() {
                                    if (fresh_script.readyState === "loaded" || fresh_script.readyState === "complete" ) {
                                        fresh_script.onreadystatechange = null;
                                        _loadScripts(scripts, ++index);
                                    }
                                };
                            }else{  // others
                                fresh_script.onload = function(){
                                    fresh_script.onload = null;
                                    _loadScripts(scripts, ++index);
                                };
                            }
                        }

                        // Replace current "sleeping" script with the new "revived" one
                        curr_script.parentNode.replaceChild(fresh_script, curr_script);

                        /**
                         * If we managed to get here and scr is still set, it means that
                         * the script is loading/loaded sequentially so don't go any further
                         */
                        if(src) return;
                    }

                    // Go to next script right away
                    _loadScripts(scripts, ++index);
                }
            }

            _loadScripts(scripts, 0);
        }

        /**
         * Save custom data inside cookie
         * @param {object|string} new_data
         * @param {string} [mode]
         * @returns {boolean}
         */
        var _setCookieData = function(new_data, mode){

            var set = false;
            /**
             * If mode is 'update':
             * add/update only the specified props.
             */
            if(mode === 'update'){
                cookieData = _cookieconsent.get('data');
                var same_type = typeof cookieData === typeof new_data;

                if(same_type && typeof cookieData === "object"){
                    !cookieData && (cookieData = {});

                    for(var prop in new_data){
                        if(cookieData[prop] !== new_data[prop]){
                            cookieData[prop] = new_data[prop]
                            set = true;
                        }
                    }
                }else if((same_type || !cookieData) && cookieData !== new_data){
                    cookieData = new_data;
                    set = true;
                }
            }else{
                cookieData = new_data;
                set = true;
            }

            if(set){
                savedCookieContent['data'] = cookieData;
                _setCookie(cookieConfig.name, JSON.stringify(savedCookieContent));
            }

            return set;
        }

        /**
         * Helper method to set a variety of fields
         * @param {string} field
         * @param {object} data
         * @returns {boolean}
         */
        _cookieconsent.set = function(field, data){
            switch(field){
                case 'data': return _setCookieData(data['value'], data['mode']);
                default: return false;
            }
        }

        /**
         * Retrieve data from existing cookie
         * @param {string} field
         * @param {string} [cookie_name]
         * @returns {any}
         */
        _cookieconsent.get = function(field, cookieName){
            var cookie = JSON.parse(_getCookie(cookieName || cookieConfig.name, 'one', true, true) || "{}");

            return cookie[field];
        }

        /**
         * Read current configuration value
         * @returns {any}
         */
        _cookieconsent.getConfig = function(field){
            return _config[field] || userConfig[field];
        }

        /**
         * Obtain accepted and rejected categories
         * @returns {{accepted: string[], rejected: string[]}}
         */
        var _getCurrentCategoriesState = function(){

            // get accepted categories
            acceptedCategories = savedCookieContent['categories'] || [];

            // calculate rejected categories (allCategories - acceptedCategories)
            rejectedCategories = allCategories.filter(function(category){
                return (_inArray(acceptedCategories, category) === -1);
            });

            return {
                accepted: acceptedCategories,
                rejected: rejectedCategories
            }
        }

        /**
         * Calculate "accept type" given current categories state
         * @param {{accepted: string[], rejected: string[]}} currentCategoriesState
         * @returns {string}
         */
        var _getAcceptType = function(currentCategoriesState){

            var type = 'custom';

            // number of categories marked as necessary/readonly
            var necessary_categories_length = readonlyCategories.filter(function(readonly){
                return readonly === true;
            }).length;

            // calculate accept type based on accepted/rejected categories
            if(currentCategoriesState.accepted.length === allCategories.length)
                type = 'all';
            else if(currentCategoriesState.accepted.length === necessary_categories_length)
                type = 'necessary'

            return type;
        }

        /**
         * @typedef {object} userPreferences
         * @property {string} acceptType
         * @property {string[]} acceptedCategories
         * @property {string[]} rejectedCategories
         */

        /**
         * Retrieve current user preferences (summary)
         * @returns {userPreferences}
         */
        _cookieconsent.getUserPreferences = function(){
            var currentCategoriesState = acceptType && _getCurrentCategoriesState();
            var _acceptType = acceptType && _getAcceptType(currentCategoriesState);

            return {
                'acceptType': _acceptType,
                'acceptedCategories': _acceptType ? currentCategoriesState.accepted : [],
                'rejectedCategories': _acceptType ? currentCategoriesState.rejected : []
            }
        }

        /**
         * Function which will run after script load
         * @callback scriptLoaded
         */

        /**
         * Dynamically load script (append to head)
         * @param {string} src
         * @param {scriptLoaded} callback
         * @param {object[]} [attrs] Custom attributes
         */
        _cookieconsent.loadScript = function(src, callback, attrs){

            var function_defined = typeof callback === 'function';

            // Load script only if not already loaded
            if(!document.querySelector('script[src="' + src + '"]')){

                var script = _createNode('script');

                // if an array is provided => add custom attributes
                if(attrs && attrs.length > 0){
                    for(var i=0; i<attrs.length; ++i){
                        attrs[i] && script.setAttribute(attrs[i]['name'], attrs[i]['value']);
                    }
                }

                // if callback function defined => run callback onload
                if(function_defined){
                    script.onload = callback;
                }

                script.src = src;

                /**
                 * Append script to head
                 */
                document.head.appendChild(script);
            }else{
                function_defined && callback();
            }
        }

        /**
         * Manage dynamically loaded scripts: https://github.com/orestbida/cookieconsent/issues/101
         * If plugin has already run, call this method to enable
         * the newly added scripts based on currently selected preferences
         */
        _cookieconsent.updateScripts = function(){
            _manageExistingScripts();
        }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {number} [delay]
         * @param {boolean} [create_modal] create modal if it doesn't exist
         */
        _cookieconsent.show = function(delay, create_modal){

            if(create_modal === true)
                _createConsentModal(_config.currentLanguageCode);

            if(consentModalExists){
                setTimeout(function() {
                    _addClass(htmlDom, "show--consent");

                    /**
                     * Update attributes/internal statuses
                     */
                    consentModal.setAttribute('aria-hidden', 'false');
                    consentModalVisible = true;

                    setTimeout(function(){
                        lastFocusedElemBeforeModal = document.activeElement;
                        currentModalFocusableElements = allConsentModalFocusableElements;
                    }, 200);

                    _log("CookieConsent [MODAL]: show consentModal");
                }, delay > 0 ? delay : (create_modal ? 30 : 0));
            }
        }

        /**
         * Hide consent modal
         */
        _cookieconsent.hide = function(){
            if(consentModalExists){
                _removeClass(htmlDom, "show--consent");
                consentModal.setAttribute('aria-hidden', 'true');
                consentModalVisible = false;

                setTimeout(function(){
                    //restore focus to the last page element which had focus before modal opening
                    lastFocusedElemBeforeModal.focus();
                    currentModalFocusableElements = null;
                }, 200);

                _log("CookieConsent [MODAL]: hide");
            }
        }

        /**
         * Hide settings modal
         */
        _cookieconsent.hideSettings = function(){
            _removeClass(htmlDom, "show--settings");
            settingsModalVisible = false;
            settingsContainer.setAttribute('aria-hidden', 'true');


            setTimeout(function(){
                /**
                 * If consent modal is visible, focus him (instead of page document)
                 */
                if(consentModalVisible){
                    lastFocusedModalElement && lastFocusedModalElement.focus();
                    currentModalFocusableElements = allConsentModalFocusableElements;
                }else{
                    /**
                     * Restore focus to last page element which had focus before modal opening
                     */
                    lastFocusedElemBeforeModal && lastFocusedElemBeforeModal.focus();
                    currentModalFocusableElements = null;
                }

                clickedInsideModal = false;
            }, 200);

            _log("CookieConsent [SETTINGS]: hide settingsModal");
        }

        /**
         * Accept cookieconsent function API
         * @param {string[]|string} _categories - Categories to accept
         * @param {string[]} [_exclusions] - Excluded categories [optional]
         */
        _cookieconsent.accept = function(_categories, _exclusions){
            var categories = _categories || undefined;
            var exclusions = _exclusions || [];
            var to_accept = [];

            /**
             * Get all accepted categories
             * @returns {string[]}
             */
            var _getCurrentPreferences = function(){
                var toggles = document.querySelectorAll('.c-tgl') || [];
                var states = [];

                for(var i=0; i<toggles.length; i++){
                    if(toggles[i].checked){
                        states.push(toggles[i].value);
                    }
                }
                return states;
            }

            if(!categories){
                to_accept = _getCurrentPreferences();
            }else{
                if(
                    typeof categories === "object" &&
                    typeof categories.length === "number"
                ){
                    for(var i=0; i<categories.length; i++){
                        if(_inArray(allCategories, categories[i]) !== -1)
                            to_accept.push(categories[i]);
                    }
                }else if(typeof categories === "string"){
                    if(categories === 'all')
                        to_accept = allCategories.slice();
                    else{
                        if(_inArray(allCategories, categories) !== -1)
                            to_accept.push(categories);
                    }
                }
            }

            // Remove excluded categories
            if(exclusions.length >= 1){
                for(i=0; i<exclusions.length; i++){
                    to_accept = to_accept.filter(function(item) {
                        return item !== exclusions[i]
                    })
                }
            }

            // Add back all the categories set as "readonly/required"
            for(i=0; i<allCategories.length; i++){
                if(
                    readonlyCategories[i] === true &&
                    _inArray(to_accept, allCategories[i]) === -1
                ){
                    to_accept.push(allCategories[i]);
                }
            }

            _saveCookiePreferences(to_accept);
        }

        /**
         * API function to easily erase cookies
         * @param {(string|string[])} _cookies
         * @param {string} [_path] - optional
         * @param {string} [_domain] - optional
         */
        _cookieconsent.eraseCookies = function(_cookies, _path, _domain){
            var cookies = [];
            var domains = _domain
                ? [_domain, "."+_domain]
                : [cookieConfig.domain, "."+cookieConfig.domain];

            if(typeof _cookies === "object" && _cookies.length > 0){
                for(var i=0; i<_cookies.length; i++){
                    this.validCookie(_cookies[i]) && cookies.push(_cookies[i]);
                }
            }else{
                this.validCookie(_cookies) && cookies.push(_cookies);
            }

            _eraseCookies(cookies, _path, domains);
        }

        /**
         * Set cookie, by specifying name and value
         * @param {string} name
         * @param {string} value
         * @param {number} [customExpirationMilliseconds] - used only when converting to/from "rfcCompliant" version
         */
        var _setCookie = function(name, value, customExpirationMilliseconds) {
            
            value = cookieConfig.rfcCompliant ? encodeURIComponent(value) : value;
            var expirationMs = typeof customExpirationMilliseconds === 'number' ? customExpirationMilliseconds : _getExpiresAfterDaysValue()*86400000;

            var date = new Date();
            date.setTime(date.getTime() + expirationMs);
            
            var expires = "; expires=" + date.toUTCString();

            var cookieStr = name + "=" + (value || "") + expires + "; Path=" + cookieConfig.path + ";";
            cookieStr += " SameSite=" + cookieConfig.sameSite + ";";

            // assures cookie works with localhost (=> don't specify domain if on localhost)
            if(window.location.hostname.indexOf(".") > -1){
                cookieStr += " Domain=" + cookieConfig.domain + ";";
            }

            if(window.location.protocol === "https:") {
                cookieStr += " Secure;";
            }

            document.cookie = cookieStr;

            _log("CookieConsent [SET_COOKIE]: cookie '" + name + "'=", JSON.parse(decodeURIComponent(value)));
            //_log("CookieConsent [SET_COOKIE]: '" + name + "' expires after " + cookieExpiration + " day(s)");
        }

        /**
         * Get cookie value by name,
         * returns the cookie value if found (or an array
         * of cookies if filter provided), otherwise empty string: ""
         * @param {string} name
         * @param {string} filter 'one' or 'all'
         * @param {boolean} [getValue] set to true to obtain its value
         * @param {boolean} [ignoreName]
         * @returns {string|string[]}
         */
        var _getCookie = function(name, filter, getValue, ignoreName) {
            var found;

            if(filter === 'one'){
                found = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
                found = found ? (getValue ? found.pop() : name) : '';

                /**
                 * If we are retrieving cookieconsent's own cookie
                 * => verify that its value is a valid json string
                 */
                if(found && (name === cookieConfig.name || ignoreName)){
                    try{
                        found = JSON.parse(decodeURIComponent(found));
                    }catch(e){
                        found = {}; // If I got here => cookie value is not valid
                    }
                    found = JSON.stringify(found);
                }
            }else if(filter === 'all'){

                // Get all existing cookies (<cookie_name>=<cookie_value>)
                var allCookies = document.cookie.split(/;\s*/); found = [];

                /**
                 * Save only the cookie names
                 */
                for(var i=0; i<allCookies.length; i++){
                    found.push(allCookies[i].split('=')[0]);
                }
            }

            return found;
        }

        /**
         * Delete cookie by name & path
         * @param {string[]} cookies
         * @param {string} [custom_path] - optional
         * @param {string[]} domains - example: ['domain.com', '.domain.com']
         */
        var _eraseCookies = function(cookies, custom_path, domains) {
            var path = custom_path ? custom_path : '/';
            var expires = 'Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            for(var i=0; i<cookies.length; i++){
                for(var j=0; j<domains.length; j++){
                    document.cookie = cookies[i] + '=; path=' + path +
                    (domains[j].indexOf('.') > -1 ? '; domain=' + domains[j] : "") + '; ' + expires;
                }
                _log("CookieConsent [AUTOCLEAR]: deleting cookie: '" + cookies[i] + "' path: '" + path + "' domain:", domains);
            }
        }

        /**
         * Returns true if cookie was found and has valid value (not empty string)
         * @param {string} cookie_name
         * @returns {boolean}
         */
        _cookieconsent.validCookie = function(cookie_name){
            return _getCookie(cookie_name, 'one', true) !== '';
        }

        /**
         * Function to run when event is fired
         * @callback eventFired
         */

        /**
         * Add event listener to dom object (cross browser function)
         * @param {Element} elem
         * @param {string} event
         * @param {eventFired} fn
         * @param {boolean} [isPasive]
         */
        var _addEvent = function(elem, event, fn, isPasive) {
            elem.addEventListener(event, fn , isPasive === true ? { passive: true } : false);
        }

        /**
         * Get all prop. keys defined inside object
         * @param {Object} obj
         */
        var _getKeys = function(obj){
            if(typeof obj === "object"){
                return Object.keys(obj);
            }
        }

        /**
         * Append class to the specified dom element
         * @param {HTMLElement} elem
         * @param {string} classname
         */
        var _addClass = function (elem, classname){
            elem.classList.add(classname);
        }

        /**
         * Remove specified class from dom element
         * @param {HTMLElement} elem
         * @param {string} classname
         */
        var _removeClass = function (el, className) {
            el.classList.remove(className);
        }

        /**
         * Check if html element has class
         * @param {HTMLElement} el
         * @param {string} className
         */
        var _hasClass = function(el, className) {
            return el.classList.contains(className);
        }

        return _cookieconsent;
    };

    var init = 'initCookieConsent';
    /**
     * Make CookieConsent object accessible globally
     */
    if(typeof window[init] !== 'function'){
        window[init] = CookieConsent
    }
})();