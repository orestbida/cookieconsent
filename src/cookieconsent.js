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
                'sameSite': 'Lax'
            }
        };

        var
            /**
             * Object which holds the main methods/API (.show, .run, ...)
            */
            cookieconsent = {},

            /**
             * Global user configuration object
             */
            userConfig,

            currentLanguageCode,
            allTranslations,
            currentTranslation,

            scriptTagSelector = 'data-cookiecategory',

            /**
             * @type {{
             *  name: string,
             *  expiresAfterDays: number | Function,
             *  domain: string,
             *  path: string,
             *  sameSite: string
             * }}
             */
            cookieConfig = _config.cookie,

            /**
             * Pointers to callback functions,
             * avoid calling userConfig['<callback_name>']
             */

            onFirstConsent,
            onConsent,
            onChange,

            /**
             * Can be number of function
             * @type {number | Function}
             */
            expiresAfterDays,

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

            preferencesModalVisible = false,
            clickedInsideModal = false,
            currentModalFocusableElements,

            revisionEnabled = false,
            validRevision = true,

            /**
             * Array containing the last changed categories (enabled/disabled)
             * @type {string[]}
             */
            lastChangedCategoryNames = [],

            reloadPage = false,

            /**
             * Accept type:
             *  - "all"
             *  - "necessary"
             *  - "custom"
             * @type {string}
             */
            acceptType,

            /**
             * Cookie's structure inside autoClear object
             * @typedef {Object} Cookie
             * @property {string|RegExp} name
             * @property {string} [domain]
             * @property {string} [path]
             */

            /**
             * autoClear's object structure
             * @typedef {Object} AutoClear
             * @property {Cookie} cookies
             * @property {boolean} reloadPage
             */

            /**
             * Structure of each category
             * @typedef {Object} Category
             * @property {AutoClear} autoClear
             * @property {boolean} enabled
             * @property {boolean} readOnly
             */

            /**
             * Object containing all user's defined categories
             * @type {Object.<string, Category>}
             */
            allDefinedCategories,

            /**
             * Stores all available categories
             * @type {string[]}
             */
            allCategoryNames,

            /**
             * Contains all accepted categories
             * @type {string[]}
             */
            acceptedCategories = [],

            /**
             * Keep track of readonly toggles
             * @type {boolean[]}
             */
            readOnlyCategories = [],

            /**
             * Contains all categories enabled by default
             * @type {string[]}
             */
            defaultEnabledCategories = [],

            /**
             * Don't run plugin (to avoid indexing its text content) if bot detected
             */
            botAgentDetected = false,

            /**
             * Save reference to the last focused element on the page
             * (used later to restore focus when both modals are closed)
             */
            lastFocusedElemBeforeModal,
            lastFocusedModalElement,

            /**
             * Both of the arrays below have the same structure:
             * [0] => holds reference to the FIRST focusable element inside modal
             * [1] => holds reference to the LAST focusable element inside modal
             */
            allConsentModalFocusableElements = [],
            allPreferencesModalFocusableElements = [],

            /**
             * Keep track of enabled/disabled categories
             * @type {boolean[]}
             */
            allToggleStates = [],

            /**
             * Pointers to main dom elements
             * (avoid retrieving them later using document.getElementById)
             */

            /** @type {HTMLElement} */ htmlDom = document.documentElement,
            /** @type {HTMLElement} */ mainContainer,
            /** @type {HTMLElement} */ allModalsContainer,

            /** @type {HTMLElement} */ consentModal,
            /** @type {HTMLElement} */ consentModalTitle,
            /** @type {HTMLElement} */ consentModalDescription,
            /** @type {HTMLElement} */ consentAcceptAllBtn,
            /** @type {HTMLElement} */ consentAcceptNecessaryBtn,
            /** @type {HTMLElement} */ consentButtonsContainer,
            /** @type {HTMLElement} */ consentModalInner,

            /** @type {HTMLElement} */ preferencesContainer,
            /** @type {HTMLElement} */ preferencesInner,
            /** @type {HTMLElement} */ preferencesTitle,
            /** @type {HTMLElement} */ preferencesCloseBtn,
            /** @type {HTMLElement} */ sectionsContainer,
            /** @type {HTMLElement} */ newSectionsContainer,
            /** @type {HTMLElement} */ preferencesButtonsContainer,
            /** @type {HTMLElement} */ preferencesSaveBtn,
            /** @type {HTMLElement} */ preferencesacceptAllBtn,
            /** @type {HTMLElement} */ preferencesacceptNecessaryBtn;

        /**
         * Update config preferences
         * @param {Object} userConfig
         */
        var _setConfig = function(_userConfig){

            /**
             * Make user configuration globally available
             */
            userConfig = _userConfig;
            cookieConfig = _config.cookie;
            allTranslations = userConfig['language']['translations'];

            _log("CookieConsent [CONFIG]: configuration:", userConfig);

            if(typeof userConfig['autoShow'] === "boolean")
                _config.autoShow = userConfig['autoShow'];

            var newCookieConfig = userConfig['cookie'];

            if(!!newCookieConfig && typeof newCookieConfig === 'object'){

                var name = newCookieConfig['name'],
                    domain = newCookieConfig['domain'],
                    path = newCookieConfig['path'],
                    sameSite = newCookieConfig['sameSite'];

                expiresAfterDays = newCookieConfig['expiresAfterDays'];

                name && (cookieConfig.name = name);
                domain && (cookieConfig.domain = domain);
                path && (cookieConfig.path = path);
                sameSite && (cookieConfig.sameSite = sameSite);
                expiresAfterDays && (cookieConfig.expiresAfterDays = expiresAfterDays);
            }

            expiresAfterDays = cookieConfig.expiresAfterDays;

            /**
             * Save references to callback functions
             */
            onFirstConsent = userConfig['onFirstConsent'];
            onConsent = userConfig['onConsent'];
            onChange = userConfig['onChange'];

            var mode = userConfig['mode'];
            var revision = userConfig['revision'];
            var autoClearCookies = userConfig['autoClearCookies'];
            var manageScriptTags = userConfig['manageScriptTags'];

            if(mode === 'opt-out'){
                _config.mode = mode;
            }

            if(typeof revision === 'number'){
                revision > -1 && (_config.revision = revision);
                revisionEnabled = true;
            }

            if(typeof autoClearCookies === 'boolean'){
                _config.autoClearCookies = autoClearCookies;
            }

            if(typeof manageScriptTags === 'boolean'){
                _config.manageScriptTags = manageScriptTags;
            }

            if(userConfig['hideFromBots'] === true){
                botAgentDetected = navigator &&
                    ((navigator.userAgent && /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)) || navigator.webdriver);
            }

            _log("CookieConsent [CONFIG]: autoClearCookies:", _config.autoClearCookies);
            _log("CookieConsent [CONFIG]: revision enabled:", revisionEnabled);
            _log("CookieConsent [CONFIG]: manageScriptTags:", _config.manageScriptTags);

            /**
             * Determine current language code
             */
            currentLanguageCode = _resolveCurrentLanguageCode();

            /**
             * Get translation relative to the current language code
             */
            currentTranslation = allTranslations[currentLanguageCode];

            _log("CookieConsent [LANG]: current language: '" + currentLanguageCode + "'");
        }

        /**
         * Add an onClick listeners to all html elements with data-cc attribute
         */
        var _addDataButtonListeners = function(elem){

            var _a = 'accept-';

            var showPreferencesElements = _getElements('show-preferences');
            var acceptAllElements = _getElements(_a + 'all');
            var acceptNecessaryElements = _getElements(_a + 'necessary');
            var acceptCustomElements = _getElements(_a + 'custom');

            for(var i=0; i<showPreferencesElements.length; i++){
                _setAttribute(showPreferencesElements[i], 'aria-haspopup', 'dialog');
                _addEvent(showPreferencesElements[i], 'click', function(event){
                    event.preventDefault();
                    cookieconsent.showPreferences(0);
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
             * @param {string} [_acceptType]
             */
            function _acceptAction(e, _acceptType){
                e.preventDefault();
                cookieconsent.accept(_acceptType);
                cookieconsent.hidePreferences();
                cookieconsent.hide();
            }
        }

        /**
         * Get a valid language code
         * (assumes that there is at least one translation defined)
         * @param {string} languageCode - desired language
         * @returns {string} validated language
         */
        var _getValidLanguageCode = function(languageCode){

            var allLanguageCodes = _getKeys(allTranslations);

            if(_inArray(allLanguageCodes, languageCode) > -1) return languageCode;
            if(_inArray(allLanguageCodes, currentLanguageCode) > -1) return currentLanguageCode;

            /**
             * If we got here, return the very first language code (hopefully there is one)
             */
            return allLanguageCodes[0];
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
             * Get preferences modal's all focusable elements
             * Save first and last elements (used to lock/trap focus inside modal)
             */
            _getAllFocusableElements(preferencesInner, allPreferencesModalFocusableElements);

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
        var _createConsentModal = function(){

            if(userConfig['disablePageInteraction'] === true)
                _addClass(htmlDom, 'force--consent');

            var consentModalData = currentTranslation['consentModal'];

            // Create modal if it doesn't exist
            if(!consentModal){

                consentModal = _createNode('div');
                var consentModalInner_inner = _createNode('div');
                var overlay = _createNode('div');

                consentModal.id = 'cm';
                consentModalInner_inner.id = 'c-inr-i';
                overlay.id = 'cm-ov';

                _setAttribute(consentModal, 'role', 'dialog');
                _setAttribute(consentModal, 'aria-modal', 'true');
                _setAttribute(consentModal, 'aria-hidden', 'false');
                _setAttribute(consentModal, 'aria-labelledby', 'c-ttl');
                _setAttribute(consentModal, 'aria-describedby', 'c-txt');

                // Append consent modal to main container
                _appendChild(allModalsContainer, consentModal);
                _appendChild(allModalsContainer, overlay);

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
                    _setAttribute(consentModalTitle, 'role', 'heading');
                    _setAttribute(consentModalTitle, 'aria-level', '2');
                    _appendChild(consentModalInner_inner, consentModalTitle);
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
                _appendChild(consentModalInner_inner, consentModalDescription);
            }

            // Set description content
            consentModalDescription.innerHTML = description;

            var acceptAllBtnData = consentModalData['acceptAllBtn'],   // accept current selection
                acceptNecessaryBtnData = consentModalData['acceptNecessaryBtn'];

            // Add primary button if not falsy
            if(acceptAllBtnData){

                if(!consentAcceptAllBtn){
                    consentAcceptAllBtn = _createNode('button');
                    consentAcceptAllBtn.id = 'c-p-bn';
                    consentAcceptAllBtn.className =  "c-bn";

                    _addEvent(consentAcceptAllBtn, "click", function(){
                        cookieconsent.hide();
                        _log("CookieConsent [ACCEPT]: all");
                        cookieconsent.accept('all');
                    });
                }

                consentAcceptAllBtn.innerHTML = acceptAllBtnData;
            }

            // Add secondary button if not falsy
            if(acceptNecessaryBtnData){

                if(!consentAcceptNecessaryBtn){
                    consentAcceptNecessaryBtn = _createNode('button');
                    consentAcceptNecessaryBtn.id = 'c-s-bn';
                    consentAcceptNecessaryBtn.className = "c-bn c_link";

                    _addEvent(consentAcceptNecessaryBtn, 'click', function(){
                        cookieconsent.hide();
                        _log("CookieConsent [ACCEPT]: necessary");
                        cookieconsent.accept([]); // accept necessary only
                    });
                }

                consentAcceptNecessaryBtn.innerHTML = consentModalData['acceptNecessaryBtn'];
            }

            // Swap buttons
            var guiOptionsData = userConfig['guiOptions'];

            if(!consentModalInner){
                consentModalInner = _createNode('div');
                consentModalInner.id = 'c-inr';

                _appendChild(consentModalInner, consentModalInner_inner);
            }

            if(!consentButtonsContainer){
                consentButtonsContainer = _createNode('div');
                consentButtonsContainer.id = "c-bns";

                if(guiOptionsData && guiOptionsData['consentModal'] && guiOptionsData['consentModal']['swapButtons'] === true){
                    acceptNecessaryBtnData && _appendChild(consentButtonsContainer, consentAcceptNecessaryBtn);
                    acceptAllBtnData && _appendChild(consentButtonsContainer, consentAcceptAllBtn);
                    consentButtonsContainer.className = 'swap';
                }else{
                    acceptAllBtnData && _appendChild(consentButtonsContainer, consentAcceptAllBtn);
                    acceptNecessaryBtnData && _appendChild(consentButtonsContainer, consentAcceptNecessaryBtn);
                }

                (acceptAllBtnData || acceptNecessaryBtnData ) && _appendChild(consentModalInner, consentButtonsContainer);
                _appendChild(consentModal, consentModalInner);
            }

            consentModalExists = true;

            _guiManager(0);
        }

        var _createPreferencesModal = function(){
            var preferencesModalData = currentTranslation['preferencesModal'];

            /**
             * Create all consentModal elements
             */
            if(!preferencesContainer){
                preferencesContainer = _createNode('div');
                var preferencesContainerValign = _createNode('div');
                var preferences = _createNode('div');
                var preferencesContainerInner = _createNode('div');
                preferencesInner = _createNode('div');
                preferencesTitle = _createNode('div');
                var preferencesHeader = _createNode('div');
                preferencesCloseBtn = _createNode('button');
                var preferencesCloseBtnContainer = _createNode('div');
                sectionsContainer = _createNode('div');
                var overlay = _createNode('div');

                /**
                 * Set ids
                 */
                preferencesContainer.id = 's-cnt';
                preferencesContainerValign.id = "c-vln";
                preferencesContainerInner.id = "c-s-in";
                preferences.id = "cs";
                preferencesTitle.id = 's-ttl';
                preferencesInner.id = 's-inr';
                preferencesHeader.id = "s-hdr";
                sectionsContainer.id = 's-bl';
                preferencesCloseBtn.id = 's-c-bn';
                overlay.id = 'cs-ov';
                preferencesCloseBtnContainer.id = 's-c-bnc';
                preferencesCloseBtn.className = 'c-bn';

                _setAttribute(preferencesContainer, 'role', 'dialog');
                _setAttribute(preferencesContainer, 'aria-modal', 'true');
                _setAttribute(preferencesContainer, 'aria-hidden', 'true');
                _setAttribute(preferencesContainer, 'aria-labelledby', 's-ttl');
                _setAttribute(preferencesTitle, 'role', 'heading');
                preferencesContainer.style.visibility = overlay.style.visibility = "hidden";
                overlay.style.opacity = 0;

                _appendChild(preferencesCloseBtnContainer, preferencesCloseBtn);

                // If 'esc' key is pressed inside preferencesContainer div => hide preferences
                _addEvent(preferencesContainerValign, 'keydown', function(evt){
                    evt = evt || window.event;
                    if (evt.keyCode === 27) {
                        cookieconsent.hidePreferences(0);
                    }
                }, true);

                _addEvent(preferencesCloseBtn, 'click', function(){
                    cookieconsent.hidePreferences(0);
                });

                _guiManager(1);
            }else{
                newSectionsContainer = _createNode('div');
                newSectionsContainer.id = 's-bl';
            }

            // Add label to close button
            _setAttribute(preferencesCloseBtn, 'aria-label', preferencesModalData['closeIconLabel'] || '');

            allDefinedCategories = userConfig['categories'];
            allCategoryNames = _getKeys(allDefinedCategories);

            // Set preferences modal title
            preferencesTitle.innerHTML = preferencesModalData['title'];

            var allSections = preferencesModalData['sections'];

            // Create preferences modal content (sectionsContainer)
            for(var i=0; i<allSections.length; ++i){

                var titleData = allSections[i]['title'],
                    descriptionTextData = allSections[i]['description'],
                    linkedCategory = allSections[i]['linkedCategory'],
                    currentCategoryObject = linkedCategory && allDefinedCategories[linkedCategory],
                    cookieTableData = allSections[i]['cookieTable'],
                    cookieTableHeaders = cookieTableData && cookieTableData['headers'],
                    cookieTableBody = cookieTableData && cookieTableData['body'],
                    createCookieTable = cookieTableBody && cookieTableBody.length > 0,
                    isExpandable = !!descriptionTextData || createCookieTable;

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
                if(typeof currentCategoryObject !== 'undefined'){

                    var expandableDivId = "c-ac-"+i;

                    // Create button (to collapse/expand section description)
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
                        _setAttribute(sectionTitleBtn, 'aria-expanded', 'false');
                        _setAttribute(sectionTitleBtn, 'aria-controls', expandableDivId);
                    }

                    toggle.type = 'checkbox';
                    _setAttribute(toggleSpan, 'aria-hidden', 'true');

                    toggle.value = linkedCategory;

                    toggleLabelSpan.textContent = titleData;

                    sectionTitleBtn.insertAdjacentHTML('beforeend', titleData);

                    _appendChild(titleContainer, sectionTitleBtn);
                    _appendChild(toggleSpan, toggleOnIcon);
                    _appendChild(toggleSpan, toggleOffIcon);

                    /**
                     * If consent is valid => retrieve category states from cookie
                     * Otherwise use states defined in the userConfig. object
                     */
                    if(!invalidConsent){
                        if(_inArray(savedCookieContent['categories'], linkedCategory) > -1){
                            toggle.checked = true;
                            !newSectionsContainer && allToggleStates.push(true);
                        }else{
                            !newSectionsContainer && allToggleStates.push(false);
                        }
                    }else if(currentCategoryObject && currentCategoryObject['enabled']){
                        toggle.checked = true;
                        !newSectionsContainer && allToggleStates.push(true);

                        /**
                         * Keep track of categories enabled by default (useful when mode=='opt-out')
                         */
                        if(currentCategoryObject['enabled'])
                            !newSectionsContainer && defaultEnabledCategories.push(linkedCategory);
                    }else{
                        !newSectionsContainer && allToggleStates.push(false);
                    }

                    /**
                     * Set toggle as readonly if true (disable checkbox)
                     */
                    if(currentCategoryObject && currentCategoryObject['readOnly']){
                        toggle.disabled = true;
                        _addClass(toggleSpan, 'c-ro');
                        !newSectionsContainer && readOnlyCategories.push(true);
                    }else{
                        !newSectionsContainer && readOnlyCategories.push(false);
                    }

                    _addClass(tableParent, 'b-acc');
                    _addClass(titleContainer, 'b-bn');
                    _addClass(section, 'b-ex');

                    tableParent.id = expandableDivId;
                    _setAttribute(tableParent, 'aria-hidden', 'true');

                    _appendChild(toggleLabel, toggle);
                    _appendChild(toggleLabel, toggleSpan);
                    _appendChild(toggleLabel, toggleLabelSpan);
                    _appendChild(titleContainer, toggleLabel);

                    /**
                     * On button click handle the following :=> aria-expanded, aria-hidden and act class for current section
                     */
                    isExpandable && (function(accordion, section, btn){
                        _addEvent(sectionTitleBtn, 'click', function(){
                            if(!_hasClass(section, 'act')){
                                _addClass(section, 'act');
                                _setAttribute(btn, 'aria-expanded', 'true');
                                _setAttribute(accordion, 'aria-hidden', 'false');
                            }else{
                                _removeClass(section, 'act');
                                _setAttribute(btn, 'aria-expanded', 'false');
                                _setAttribute(accordion, 'aria-hidden', 'true');
                            }
                        }, false);
                    })(tableParent, section, sectionTitleBtn);

                }else{
                    /**
                     * If section is not a button (no toggle defined),
                     * create a simple div instead
                     */
                    if(titleData){
                        var title = _createNode('div');
                        title.className = 'b-tl';
                        _setAttribute(title, 'role', 'heading');
                        _setAttribute(title, 'aria-level', '3');
                        title.insertAdjacentHTML('beforeend', titleData);
                        _appendChild(titleContainer, title);
                    }
                }

                titleData && _appendChild(section, titleContainer);
                descriptionTextData && _appendChild(tableParent, description);

                // if cookie table found, generate table for this section
                if(createCookieTable){
                    var allTableKeys = _getKeys(cookieTableHeaders);
                    var trTmpFragment = document.createDocumentFragment();

                    if(allTableKeys){
                        /**
                         * Create table header
                         */
                        for(var p=0; p<allTableKeys.length; ++p){
                            // create new header
                            var th1 = _createNode('th');
                            var key = allTableKeys[p];
                            _setAttribute(th1, 'scope', 'col')

                            if(key){
                                th1.textContent = cookieTableHeaders[key];
                                _appendChild(trTmpFragment, th1);
                            }
                        }


                        var trTmp = _createNode('tr');
                        _appendChild(trTmp, trTmpFragment);

                        // create table header & append fragment
                        var thead = _createNode('thead');
                        _appendChild(thead, trTmp);

                        // append header to table
                        var table = _createNode('table');
                        _appendChild(table, thead);

                        var tbodyFragment = document.createDocumentFragment();

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
                                _setAttribute(td_tmp, 'data-column', columnHeader);

                                _appendChild(tr, td_tmp);
                            }

                            _appendChild(tbodyFragment, tr);
                        }

                        // append tbodyFragment to tbody & append the latter into the table
                        var tbody = _createNode('tbody');
                        _appendChild(tbody, tbodyFragment);
                        _appendChild(table, tbody);

                        _appendChild(tableParent, table);
                    }
                }

                /**
                 * Append only if is either:
                 * - togglable div with title
                 * - a simple div with at least a title or description
                 */
                if(allCategoryNames[linkedCategory] && titleData || (!allCategoryNames[linkedCategory] && (titleData || descriptionTextData))){
                    _appendChild(section, tableParent);

                    if(newSectionsContainer)
                        _appendChild(newSectionsContainer, section);
                    else
                        _appendChild(sectionsContainer, section);
                }
            }

            // Create preferences buttons
            if(!preferencesButtonsContainer){
                preferencesButtonsContainer = _createNode('div');
                preferencesButtonsContainer.id = 's-bns';
            }

            if(!preferencesacceptAllBtn){
                preferencesacceptAllBtn = _createNode('button');
                preferencesacceptAllBtn.id = 's-all-bn';
                preferencesacceptAllBtn.className ='c-bn';
                _appendChild(preferencesButtonsContainer, preferencesacceptAllBtn);

                _addEvent(preferencesacceptAllBtn, 'click', function(){
                    cookieconsent.hidePreferences();
                    cookieconsent.hide();
                    cookieconsent.accept('all');
                });
            }

            preferencesacceptAllBtn.innerHTML = preferencesModalData["acceptAllBtn"];

            var acceptNecessaryBtnText = preferencesModalData['acceptNecessaryBtn'];

            // Add third [optional] reject all button if provided
            if(acceptNecessaryBtnText){

                if(!preferencesacceptNecessaryBtn){
                    preferencesacceptNecessaryBtn = _createNode('button');
                    preferencesacceptNecessaryBtn.id = 's-rall-bn';
                    preferencesacceptNecessaryBtn.className = 'c-bn';

                    _addEvent(preferencesacceptNecessaryBtn, 'click', function(){
                        cookieconsent.hidePreferences();
                        cookieconsent.hide();
                        cookieconsent.accept([]);
                    });

                    preferencesInner.className = "bns-t";
                    _appendChild(preferencesButtonsContainer, preferencesacceptNecessaryBtn);
                }

                preferencesacceptNecessaryBtn.innerHTML = acceptNecessaryBtnText;
            }

            if(!preferencesSaveBtn){
                preferencesSaveBtn = _createNode('button');
                preferencesSaveBtn.id = 's-sv-bn';
                preferencesSaveBtn.className ='c-bn';
                _appendChild(preferencesButtonsContainer, preferencesSaveBtn);

                // Add save preferences button onClick event
                // Hide both preferences modal and consent modal
                _addEvent(preferencesSaveBtn, 'click', function(){
                    cookieconsent.hidePreferences();
                    cookieconsent.hide();
                    cookieconsent.accept();
                });
            }

            preferencesSaveBtn.innerHTML = preferencesModalData['savePreferencesBtn'];

            if(newSectionsContainer) {
                // replace entire existing cookie category sectionsContainer with the new cookie categories new sectionsContainer (in a different language)
                preferencesInner.replaceChild(newSectionsContainer, sectionsContainer);
                sectionsContainer = newSectionsContainer;
                return;
            };

            _appendChild(preferencesHeader, preferencesTitle);
            _appendChild(preferencesHeader, preferencesCloseBtnContainer);
            _appendChild(preferencesInner, preferencesHeader);
            _appendChild(preferencesInner, sectionsContainer);
            _appendChild(preferencesInner, preferencesButtonsContainer);
            _appendChild(preferencesContainerInner, preferencesInner);

            _appendChild(preferences, preferencesContainerInner);
            _appendChild(preferencesContainerValign, preferences);
            _appendChild(preferencesContainer, preferencesContainerValign);

            _appendChild(allModalsContainer, preferencesContainer);
            _appendChild(allModalsContainer, overlay);
        }

        /**
         * Generate cookie consent html markup
         */
        var _createCookieConsentHTML = function(){

            // Create main container which holds both consent modal & preferences modal
            mainContainer = _createNode('div');
            mainContainer.id = 'cc--main';

            // Fix layout flash
            mainContainer.style.position = "fixed";
            mainContainer.style.zIndex = "1000000";
            mainContainer.innerHTML = '<div id="cc_div" class="cc_div"></div>';
            allModalsContainer = mainContainer.children[0];

            // Create consent modal
            if(consentModalExists)
                _createConsentModal();

            // Always create preferences modal
            _createPreferencesModal();

            // Finally append everything (mainContainer holds both modals)
            _appendChild((userConfig['root'] || document.body), mainContainer);
        }

        /**
         * Update/change modals language
         * @param {string} lang new language
         * @param {boolean} [force] update language fields forcefully
         * @returns {boolean}
         */
        cookieconsent.updateLanguage = function(newLanguage, forceUpdate){

            if(typeof newLanguage !== 'string') return;

            /**
             * Validate language to avoid errors
             */
            var newLanguageCode = _getValidLanguageCode(newLanguage);

            /**
             * Set language only if it differs from current
             */
            if(newLanguageCode !== currentLanguageCode || forceUpdate === true){
                currentLanguageCode = newLanguageCode;

                _loadTranslationData(currentLanguageCode, function(){
                    if(consentModalExists){
                        _createConsentModal();
                        _addDataButtonListeners(consentModalInner);
                    }

                    _createPreferencesModal();

                    _log("CookieConsent [LANG]: current language: '" + newLanguageCode + "'");
                });

                return true;
            }

            return false;
        }



        /**
         * Delete all cookies which are unused (based on selected preferences)
         *
         * @param {boolean} [clearOnFirstConsent]
         */
        var _autoclearCookies = function(clearOnFirstConsent){

            /**
             *  @type {string}
             */
            var currentDomain = cookieConfig.domain;

            // reset reload state
            reloadPage = false;

            // Retrieve all cookies
            var allCookiesArray = _getCookie('', 'all');

            // delete cookies on current domain
            var domains = [currentDomain, '.'+currentDomain];

            // if domain has the "www" prefix, delete cookies also for 'domain.com' and '.domain.com'
            if(currentDomain.slice(0, 4) === 'www.'){
                var domainWithoutPrefix = currentDomain.substring(4);  // remove first 4 chars (www.)
                domains.push(domainWithoutPrefix, '.' + domainWithoutPrefix);
            }

            var categoriesToCheck = clearOnFirstConsent ? allCategoryNames : lastChangedCategoryNames;

            /**
             * Filter out categories with readOnly=true or don't have an autoClear object
             */
            categoriesToCheck = categoriesToCheck.filter(function(categoryName){
                var currentCategoryObject = allDefinedCategories[categoryName];

                /**
                 * Make sure that:
                 *  category != falsy
                 *  readOnly = falsy
                 *  autoClear = truthy (assuming that it is a valid object)
                 */
                return(
                    !!currentCategoryObject
                    && !currentCategoryObject['readOnly']
                    && !!currentCategoryObject['autoClear']
                );
            });

            // For each category that was just changed (enabled/disabled)
            for(var i=0; i<categoriesToCheck.length; i++){

                var currentCategoryName = categoriesToCheck[i],
                    currentCategoryObject = allDefinedCategories[currentCategoryName],
                    currentCategoryAutoClear = currentCategoryObject['autoClear'],
                    currentAutoClearCookies = currentCategoryAutoClear && currentCategoryAutoClear['cookies'] || [],

                    categoryWasJustChanged = _inArray(lastChangedCategoryNames, currentCategoryName) > -1,
                    categoryIsDisabled = _inArray(acceptedCategories, currentCategoryName) === -1,
                    categoryWasJustDisabled = categoryWasJustChanged && categoryIsDisabled;

                if((clearOnFirstConsent && categoryIsDisabled) || (!clearOnFirstConsent && categoryWasJustDisabled)){

                    // Get number of cookies defined in cookie_table
                    var cookiesToClear = currentAutoClearCookies.length;

                    // check if page needs to be reloaded after autoClear (if category was just disabled)
                    if(currentCategoryAutoClear['reloadPage'] === true && categoryWasJustDisabled)
                        reloadPage = true;

                    // delete each cookie in the cookies array
                    for(var j=0; j<cookiesToClear; j++){

                        /**
                         * List of all cookies matching the current cookie name
                         * @type {string[]}
                         */
                        var foundCookies = [];

                        /**
                         * @type {string|RegExp}
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
                            var foundCookieIndex = _inArray(allCookiesArray, currCookieName);
                            if(foundCookieIndex > -1) foundCookies.push(allCookiesArray[foundCookieIndex]);
                        }

                        _log("CookieConsent [AUTOCLEAR]: search cookie: '" + currCookieName + "', found:", foundCookies);

                        // Delete cookie(s)
                        if(foundCookies.length > 0){
                            _eraseCookies(foundCookies, currCookiePath, domains);
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

            lastChangedCategoryNames = [];

            // Retrieve all toggle/checkbox values
            var categoryToggle = document.querySelectorAll('.c-tgl') || [];

            // If there are opt in/out toggles ...
            if(categoryToggle.length > 0){

                for(var i=0; i<categoryToggle.length; i++){
                    if(_inArray(acceptedCategories, allCategoryNames[i]) !== -1){
                        categoryToggle[i].checked = true;
                        if(!allToggleStates[i]){
                            lastChangedCategoryNames.push(allCategoryNames[i]);
                            allToggleStates[i] = true;
                        }
                    }else{
                        categoryToggle[i].checked = false;
                        if(allToggleStates[i]){
                            lastChangedCategoryNames.push(allCategoryNames[i]);
                            allToggleStates[i] = false;
                        }
                    }
                }
            }

            /**
             * Clear cookies when preferences/preferences change
             */
            if(!invalidConsent && _config.autoClearCookies && lastChangedCategoryNames.length > 0)
                _autoclearCookies();

            if(!consentTimestamp) consentTimestamp = new Date();
            if(!consentId) consentId = _uuidv4();

            savedCookieContent = {
                'categories': acceptedCategories,
                'revision': _config.revision,
                'data': cookieData,
                'consentTimestamp': consentTimestamp.toISOString(),
                'consentId': consentId
            }

            var firstUserConsent = false;

            if(invalidConsent || lastChangedCategoryNames.length > 0){
                /**
                 * Set consent as valid
                 */
                if(invalidConsent) {
                    invalidConsent = false;
                    firstUserConsent = true;
                }

                _updateAcceptType();

                /**
                 * Update "lastConsentTimestamp"
                 */
                if(!lastConsentTimestamp)
                    lastConsentTimestamp = consentTimestamp;
                else
                    lastConsentTimestamp = new Date();

                savedCookieContent['lastConsentTimestamp'] = lastConsentTimestamp.toISOString();

                _setCookie(cookieConfig.name, JSON.stringify(savedCookieContent));
                _manageExistingScripts();
            }

            if(firstUserConsent){
                /**
                 * Delete unused/"zombie" cookies if consent is not valid (not yet expressed or cookie has expired)
                 */
                if(_config.autoClearCookies)
                    _autoclearCookies(true);

                if(typeof onFirstConsent === 'function')
                    onFirstConsent(cookieconsent.getUserPreferences(), savedCookieContent);

                if(typeof onConsent === 'function')
                    onConsent(savedCookieContent);

                if(_config.mode === 'opt-in') return;
            }

            // Fire onChange only if preferences were changed
            if(typeof onChange === 'function' && lastChangedCategoryNames.length > 0)
                onChange(savedCookieContent, lastChangedCategoryNames);

            /**
             * Reload page if needed
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
         * @param {Object} printMsg
         * @param {Object} [optionalParam]
         */
        var _log = function(printMsg, optionalParam, error){
            ENABLE_LOGS && (!error ? console.log(printMsg, optionalParam !== undefined ? optionalParam : ' ') : console.error(printMsg, optionalParam || ""));
        }

        /**
         * Helper function which creates an HTMLElement object based on 'type' and returns it.
         * @param {string} type
         * @returns {HTMLElement}
         */
        var _createNode = function(type){
            var el = document.createElement(type);
            if(type === 'button'){
                _setAttribute(el, 'type', type);
            }
            return el;
        }

        /**
         * Helper function to set attribute
         * @param {HTMLElement} el
         * @param {string} attribute
         * @param {string|number|boolean} value
         */
        var _setAttribute = function(el, attribute, value){
            el.setAttribute(attribute, value);
        }

        /**
         * Helper function to append child to parent
         * @param {Node} parent
         * @param {Node} child
         */
        var _appendChild = function(parent, child){
            parent.appendChild(child);
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
         */
        var _resolveCurrentLanguageCode = function () {
            var autoDetect = userConfig.language['autoDetect'];

            if(autoDetect){
                _log("CookieConsent [LANG]: autoDetect strategy: '" + autoDetect + "'");

                if (autoDetect === 'browser')
                    return _getValidLanguageCode(_getBrowserLanguageCode());

                if(autoDetect === 'document')
                    return _getValidLanguageCode(document.documentElement.lang);
            }

            /**
             * If we got here, autoDetect value is not valid,
             * use default language
             */
            return _getValidLanguageCode(userConfig['language']['default']);
        }

        /**
         * Get current client's browser language
         * @returns {string}
         */
        var _getBrowserLanguageCode = function(){
            var browserLanguage = navigator.language || navigator.browserLanguage;
            browserLanguage.length > 2 && (browserLanguage = browserLanguage[0]+browserLanguage[1]);
            _log("CookieConsent [LANG]: browser language is '"+ browserLanguage + "'");
            return browserLanguage.toLowerCase();
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
                     * If click is on the foreground overlay (and not inside preferencesModal),
                     * hide preferences modal
                     *
                     * Notice: click on div is not supported in IE
                     */
                    if(preferencesModalVisible){
                        if(!preferencesInner.contains(e.target)){
                            cookieconsent.hidePreferences(0);
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
        var _guiManager = function(applyToModal){

            var guiOptions = userConfig['guiOptions'];

            // If guiOptions is not object => exit
            if(typeof guiOptions !== 'object') return;

            var consentModalOptions = guiOptions['consentModal'];
            var preferencesModalOptions = guiOptions['preferencesModal'];

            /**
             * Helper function which adds layout and
             * position classes to given modal
             *
             * @param {HTMLElement} modal
             * @param {string[]} allowedLayouts
             * @param {string[]} allowedPositions
             * @param {string} layout
             * @param {string[]} position
             */
            function _setLayout(modal, allowedLayouts, allowedPositions, allowed_transitions, layout, position, transition){
                position = (position && position.split(" ")) || [];

                // Check if specified layout is valid
                if(_inArray(allowedLayouts, layout) > -1){

                    // Add layout classes
                    _addClass(modal, layout);

                    // Add position class (if specified)
                    if(!(layout === 'bar' && position[0] === 'middle') && _inArray(allowedPositions, position[0]) > -1){
                        for(var i=0; i<position.length; i++){
                            _addClass(modal, position[i]);
                        }
                    }
                }

                // Add transition class
                (_inArray(allowed_transitions, transition) > -1) && _addClass(modal, transition);
            }

            if(applyToModal===0 && consentModalExists && consentModalOptions){
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

            if(applyToModal===1 && preferencesModalOptions){
                _setLayout(
                    preferencesContainer,
                    ['bar'],
                    ['left', 'right'],
                    ['zoom', 'slide'],
                    preferencesModalOptions['layout'],
                    preferencesModalOptions['position'],
                    preferencesModalOptions['transition']
                );
            }
        }

        /**
         * Returns true if cookie category is accepted by the user
         * @param {string} category
         * @returns {boolean}
         */
        cookieconsent.acceptedCategory = function(category){

            if(!invalidConsent || _config.mode === 'opt-in')
                var acceptedCategories = cookieconsent.getUserPreferences().acceptedCategories;
            else  // mode is 'opt-out'
                var acceptedCategories = defaultEnabledCategories;

            return _inArray(acceptedCategories, category) > -1;
        }

        /**
         * Helper function to retrieve cookie duration
         * @returns {number}
         */
        var _getExpiresAfterDaysValue = function(){
            return typeof expiresAfterDays === 'function' ? expiresAfterDays(acceptType) : expiresAfterDays;
        }

        /**
         * Update global "acceptType" variable
         * Note: getUserPreferences() depends on "acceptType"
         */
        var _updateAcceptType = function(){
            acceptType = _getAcceptType(_getCurrentCategoriesState());
        }

        /**
         *
         * @param {string | null} desiredLanguageCode
         * @param {Function} callback
         */
        var _loadTranslationData = function(desiredLanguageCode, callback){

            /**
             * Make sure languageCode is valid before retrieving the translation object
             */
            desiredLanguageCode && (currentLanguageCode = _getValidLanguageCode(desiredLanguageCode));
            currentTranslation = allTranslations[currentLanguageCode];

            /**
             * If translation is a string, fetch the external json file and replace
             * the string (path to json file) with parsed language object
             */
            if(typeof currentTranslation === 'string'){
                _xhr({
                    method: 'GET',
                    path: currentTranslation
                }, function(status, translationData){
                    if(status === 200){
                        currentTranslation = translationData;
                        allTranslations[currentLanguageCode] = translationData;
                        callback();
                    }
                });
            }else{
                currentTranslation = allTranslations[currentLanguageCode];
                callback();
            }
        }

        /**
         * "Init" method. Will run once and only if modals do not exist
         */
        cookieconsent.run = function(config){
            if(!document.getElementById('cc_div')){

                // configure all parameters
                _setConfig(config);

                // Don't run plugin if bot is detected
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
                var dataTemp = savedCookieContent['data'];
                cookieData = typeof dataTemp !== 'undefined' ? dataTemp : null;

                // If revision is enabled and current value !== saved value inside the cookie => revision is not valid
                if(revisionEnabled && cookieConsentAccepted && savedCookieContent['revision'] !== _config.revision)
                    validRevision = false;

                // If consent is not valid => create consent modal
                consentModalExists = invalidConsent = (!cookieConsentAccepted || !validRevision || !consentTimestamp || !lastConsentTimestamp || !consentId);

                _log("CookieConsent [STATUS] valid consent:", !invalidConsent);
                /**
                 * Load translation before generating modals
                 */
                _loadTranslationData(null, function(){

                    // Generate cookie-preferences dom (& consent modal)
                    _createCookieConsentHTML();

                    _getModalFocusableData();
                    _addDataButtonListeners();

                    if(_config.autoShow && consentModalExists)
                        cookieconsent.show();

                    // Add class to enable animations/transitions
                    setTimeout(function(){_addClass(mainContainer, 'c--anim');}, 50);

                    // Accessibility :=> if tab pressed => trap focus inside modal
                    setTimeout(function(){_handleFocusTrap();}, 100);

                    // If consent is valid
                    if(!invalidConsent){

                        _manageExistingScripts();

                        if(typeof onConsent === 'function')
                            onConsent(savedCookieContent);

                    }else{
                        if(_config.mode === 'opt-out'){
                            _log("CookieConsent [CONFIG] mode='" + _config.mode + "', default enabled categories:", defaultEnabledCategories);
                            _manageExistingScripts(defaultEnabledCategories);
                        }
                    }
                });
            }
        }

        /**
         * Show preferences modal (with optional delay)
         * @param {number} [delay]
         */
        cookieconsent.showPreferences = function(delay){
            setTimeout(function() {
                _addClass(htmlDom, "show--settings");
                _setAttribute(preferencesContainer, 'aria-hidden', 'false');
                preferencesModalVisible = true;

                /**
                 * Set focus to the first focusable element inside preferences modal
                 */
                setTimeout(function(){
                    // If there is no consent-modal, keep track of the last focused elem.
                    if(!consentModalVisible){
                        lastFocusedElemBeforeModal = document.activeElement;
                    }else{
                        lastFocusedModalElement = document.activeElement;
                    }

                    if (allPreferencesModalFocusableElements.length === 0) return;

                    if(allPreferencesModalFocusableElements[3]){
                        allPreferencesModalFocusableElements[3].focus();
                    }else{
                        allPreferencesModalFocusableElements[0].focus();
                    }
                    currentModalFocusableElements = allPreferencesModalFocusableElements;
                }, 200);

                _log("CookieConsent [TOGGLE]: show preferencesModal");
            }, delay > 0 ? delay : 0);
        }

        /**
         * This function handles the loading/activation logic of the already
         * existing scripts based on the current accepted cookie categories
         *
         * @param {string[]} [mustEnableCategories]
         */
        var _manageExistingScripts = function(mustEnableCategories){

            if(!_config.manageScriptTags) return;

            // get all the scripts with "cookie-category" attribute
            var scripts = document.querySelectorAll('script[' + scriptTagSelector + ']');
            var acceptedCategories = mustEnableCategories || savedCookieContent['categories'] || [];

            /**
             * Load scripts (sequentially), using a recursive function
             * which loops through the scripts array
             * @param {Element[]} scripts scripts to load
             * @param {number} index current script to load
             */
            var _loadScripts = function(scripts, index){
                if(index < scripts.length){

                    var currScript = scripts[index];
                    var currScript_category = currScript.getAttribute(scriptTagSelector);

                    /**
                     * If current script's category is on the array of categories
                     * accepted by the user => load script
                     */
                    if(_inArray(acceptedCategories, currScript_category) > -1){

                        currScript.type = 'text/javascript';
                        currScript.removeAttribute(scriptTagSelector);

                        // get current script data-src
                        var src = currScript.getAttribute('data-src');

                        // some scripts (like ga) might throw warning if data-src is present
                        src && currScript.removeAttribute('data-src');

                        // create fresh script (with the same code)
                        var freshScript = _createNode('script');
                        freshScript.textContent = currScript.innerHTML;

                        // Copy attributes over to the new "revived" script
                        (function(destination, source){
                            var attributes = source.attributes;
                            var len = attributes.length;
                            for(var i=0; i<len; i++){
                                var attrName = attributes[i].nodeName;
                                _setAttribute(destination, attrName , source[attrName] || source.getAttribute(attrName));
                            }
                        })(freshScript, currScript);

                        // set src (if data-src found)
                        src ? (freshScript.src = src) : (src = currScript.src);

                        // if script has "src" attribute
                        // try loading it sequentially
                        if(src){
                            // load script sequentially => the next script will not be loaded
                            // until the current's script onload event triggers
                            if(freshScript.readyState) {  // only required for IE <9
                                freshScript.onreadystatechange = function() {
                                    if (freshScript.readyState === "loaded" || freshScript.readyState === "complete" ) {
                                        freshScript.onreadystatechange = null;
                                        _loadScripts(scripts, ++index);
                                    }
                                };
                            }else{  // others
                                freshScript.onload = function(){
                                    freshScript.onload = null;
                                    _loadScripts(scripts, ++index);
                                };
                            }
                        }

                        // Replace current "sleeping" script with the new "revived" one
                        currScript.parentNode.replaceChild(freshScript, currScript);

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
         * @param {{
         *  value: any,
         *  mode: string
         * }} props
         * @returns {boolean}
         */
        cookieconsent.setCookieData = function(props){

            var newData = props['value'],
                mode = props['mode'],
                set = false;

            /**
             * If mode is 'update':
             * add/update only the specified props.
             */
            if(mode === 'update'){
                cookieData = cookieconsent.getCookie('data');
                var sameType = typeof cookieData === typeof newData;

                if(sameType && typeof cookieData === "object"){
                    !cookieData && (cookieData = {});

                    for(var prop in newData){
                        if(cookieData[prop] !== newData[prop]){
                            cookieData[prop] = newData[prop]
                            set = true;
                        }
                    }
                }else if((sameType || !cookieData) && cookieData !== newData){
                    cookieData = newData;
                    set = true;
                }
            }else{
                cookieData = newData;
                set = true;
            }

            if(set){
                savedCookieContent['data'] = cookieData;
                _setCookie(cookieConfig.name, JSON.stringify(savedCookieContent), true);
            }

            return set;
        }

        /**
         * Retrieve data from existing cookie
         * @param {string} field
         * @param {string} [cookieName]
         * @returns {any}
         */
        cookieconsent.getCookie = function(field, cookieName){
            var cookie = JSON.parse(_getCookie(cookieName || cookieConfig.name, 'one', true, true) || "{}");
            return field ? cookie[field] : cookie;
        }

        /**
         * Read current configuration value
         * @returns {any}
         */
        cookieconsent.getConfig = function(field){
            return  _config[field] || userConfig[field];
        }

        /**
         * Obtain accepted and rejected categories
         * @returns {{accepted: string[], rejected: string[]}}
         */
        var _getCurrentCategoriesState = function(){

            // calculate rejected categories (allCategoryNames - acceptedCategories)
            var rejectedCategories = allCategoryNames.filter(function(category){
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
            var necessaryCategoriesLength = readOnlyCategories.filter(function(readonly){
                return readonly === true;
            }).length;

            // calculate accept type based on accepted/rejected categories
            if(currentCategoriesState.accepted.length === allCategoryNames.length)
                type = 'all';
            else if(currentCategoriesState.accepted.length === necessaryCategoriesLength)
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
        cookieconsent.getUserPreferences = function(){
            var currentCategoriesState = !invalidConsent && _getCurrentCategoriesState();

            return {
                'acceptType': acceptType,
                'acceptedCategories': !invalidConsent ? currentCategoriesState.accepted : [],
                'rejectedCategories': !invalidConsent ? currentCategoriesState.rejected : []
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
        cookieconsent.loadScript = function(src, callback, attrs){

            var function_defined = typeof callback === 'function';

            // Load script only if not already loaded
            if(!document.querySelector('script[src="' + src + '"]')){

                var script = _createNode('script');

                // if an array is provided => add custom attributes
                if(attrs && attrs.length > 0){
                    for(var i=0; i<attrs.length; ++i){
                        attrs[i] && _setAttribute(script, attrs[i]['name'], attrs[i]['value']);
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
                _appendChild(document.head, script);
            }else{
                function_defined && callback();
            }
        }

        /**
         * Manage dynamically loaded scripts: https://github.com/orestbida/cookieconsent/issues/101
         * If plugin has already run, call this method to enable
         * the newly added scripts based on currently selected preferences
         */
        cookieconsent.updateScripts = function(){
            _manageExistingScripts();
        }

        /**
         * Show cookie consent modal (with delay parameter)
         * @param {number} [delay]
         * @param {boolean} [create_modal] create modal if it doesn't exist
         */
        cookieconsent.show = function(delay, createModal){

            if(createModal === true){
                _createConsentModal();
            }

            if(consentModalExists){
                setTimeout(function() {
                    _addClass(htmlDom, "show--consent");

                    /**
                     * Update attributes/internal statuses
                     */
                    _setAttribute(consentModal, 'aria-hidden', 'false');
                    consentModalVisible = true;

                    setTimeout(function(){
                        lastFocusedElemBeforeModal = document.activeElement;
                        currentModalFocusableElements = allConsentModalFocusableElements;
                    }, 200);

                    _log("CookieConsent [TOGGLE]: show consentModal");
                }, delay > 0 ? delay : (createModal ? 30 : 0));
            }
        }

        /**
         * Hide consent modal
         */
        cookieconsent.hide = function(){
            if(consentModalExists){
                _removeClass(htmlDom, "show--consent");
                _setAttribute(consentModal, 'aria-hidden', 'true');
                consentModalVisible = false;

                setTimeout(function(){
                    //restore focus to the last page element which had focus before modal opening
                    lastFocusedElemBeforeModal.focus();
                    currentModalFocusableElements = null;
                }, 200);

                _log("CookieConsent [TOGGLE]: hide consentModal");
            }
        }

        /**
         * Hide preferences modal
         */
        cookieconsent.hidePreferences = function(){
            _removeClass(htmlDom, "show--settings");
            preferencesModalVisible = false;
            _setAttribute(preferencesContainer, 'aria-hidden', 'true');

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

            _log("CookieConsent [TOGGLE]: hide preferencesModal");
        }

        /**
         * Accept cookieconsent function API
         * @param {string[]|string} _categories - Categories to accept
         * @param {string[]} [_exclusions] - Excluded categories [optional]
         */
        cookieconsent.accept = function(_categories, _exclusions){
            var categories = _categories || undefined;
            var exclusions = _exclusions || [];
            var categoriesToAccept = [];

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
                categoriesToAccept = _getCurrentPreferences();
            }else{
                if(
                    typeof categories === "object" &&
                    typeof categories.length === "number"
                ){
                    for(var i=0; i<categories.length; i++){
                        if(_inArray(allCategoryNames, categories[i]) !== -1)
                            categoriesToAccept.push(categories[i]);
                    }
                }else if(typeof categories === "string"){
                    if(categories === 'all')
                        categoriesToAccept = allCategoryNames.slice();
                    else{
                        if(_inArray(allCategoryNames, categories) !== -1)
                            categoriesToAccept.push(categories);
                    }
                }
            }

            // Remove excluded categories
            if(exclusions.length >= 1){
                for(i=0; i<exclusions.length; i++){
                    categoriesToAccept = categoriesToAccept.filter(function(item) {
                        return item !== exclusions[i]
                    })
                }
            }

            // Add back all the categories set as "readonly/required"
            for(i=0; i<allCategoryNames.length; i++){
                if(
                    readOnlyCategories[i] === true &&
                    _inArray(categoriesToAccept, allCategoryNames[i]) === -1
                ){
                    categoriesToAccept.push(allCategoryNames[i]);
                }
            }
            /**
             * Keep acceptedCategories array updated
             */
            acceptedCategories = categoriesToAccept;

            _saveCookiePreferences(categoriesToAccept);
        }

        /**
         * API function to easily erase cookies
         * @param {(string|string[])} cookies
         * @param {string} [path] - optional
         * @param {string} [domain] - optional
         */
        cookieconsent.eraseCookies = function(cookies, path, domain){
            var allCookies = [];
            var domains = domain
                ? [domain, "."+domain]
                : [cookieConfig.domain, "."+cookieConfig.domain];

            if(typeof cookies === "object" && cookies.length > 0){
                for(var i=0; i<cookies.length; i++){
                    cookieconsent.validCookie(cookies[i]) && allCookies.push(cookies[i]);
                }
            }else{
                cookieconsent.validCookie(cookies) && allCookies.push(cookies);
            }

            _eraseCookies(allCookies, path, domains);
        }

        /**
         * Calculate the existing cookie's remaining time until expiration (in milliseconds)
         * @returns {number}
         */
        var _getRemainingExpirationTimeMS = function(){
            var elapsedTimeMilliseconds = lastConsentTimestamp ? new Date() - lastConsentTimestamp : 0;
            return _getExpiresAfterDaysValue()*86400000 - elapsedTimeMilliseconds;
        }

        /**
         * Set cookie, by specifying name and value
         * @param {string} name
         * @param {string} value
         * @param {number} [useRemainingExpirationTime]
         */
        var _setCookie = function(name, value, useRemainingExpirationTime) {

            /**
             * Encode cookie's value so that it is rfcCompliant
             */
            var cookieValue = encodeURIComponent(value);
            var expiresAfterMs = useRemainingExpirationTime ? _getRemainingExpirationTimeMS() : _getExpiresAfterDaysValue()*86400000;

            var date = new Date();
            date.setTime(date.getTime() + expiresAfterMs);

            /**
             * Specify "expires" field only if expiresAfterMs != 0 
             * (allow cookie to have same duration as current session)
             */
            var expires = expiresAfterMs !== 0 ? "; expires=" + date.toUTCString() : '';

            var cookieStr = name + "=" + (cookieValue || "") + expires + "; Path=" + cookieConfig.path + ";";
            cookieStr += " SameSite=" + cookieConfig.sameSite + ";";

            // assures cookie works with localhost (=> don't specify domain if on localhost)
            if(window.location.hostname.indexOf(".") > -1){
                cookieStr += " Domain=" + cookieConfig.domain + ";";
            }

            if(window.location.protocol === "https:") {
                cookieStr += " Secure;";
            }

            document.cookie = cookieStr;

            _log("CookieConsent [SET_COOKIE]: " + name + ":", JSON.parse(decodeURIComponent(cookieValue)));
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
         * @param {string} [customPath] - optional
         * @param {string[]} domains - example: ['domain.com', '.domain.com']
         */
        var _eraseCookies = function(cookies, customPath, domains) {
            var path = customPath ? customPath : '/';
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
         * @param {string} cookieName
         * @returns {boolean}
         */
        cookieconsent.validCookie = function(cookieName){
            return _getCookie(cookieName, 'one', true) !== '';
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

        /**
         * Helper function to create xhr objects
         * @param {{
         *  method: string,
         *  path: string,
         *  data: any
         * }} params
         * @param {Function} [callback]
         */
        var _xhr = function(params, callback) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === 4) {
                    var status=httpRequest.status, data;
                    if (status === 200) {
                        try{
                            data = JSON.parse(httpRequest.responseText);
                        }catch(e){
                            _log("CookieConsent [XHR] JSON.parse error:", e);
                        }
                    }else{
                        _log("CookieConsent [XHR] error:", httpRequest.statusText);
                    }
                    if (typeof callback === 'function') callback(status, data);
                }
            };
            httpRequest.open(params.method, params.path);
            httpRequest.send(params.data);
        }

        return cookieconsent;
    };

    var init = 'initCookieConsent';
    /**
     * Make CookieConsent object accessible globally
     */
    if(typeof window === 'object' && typeof window[init] !== 'function'){
        window[init] = CookieConsent
    }
})();