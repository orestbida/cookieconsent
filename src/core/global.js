/**
 * Service's object structure
 * @typedef {Object} Service
 * @property {string} [label]
 * @property {boolean} [enabled]
 * @property {boolean} [runOnce]
 * @property {Element} [script]
 * @property {Function} [onAccept]
 * @property {Function} [onReject]
 */

/**
 * @typedef {Object.<string, Service>} Services
 */

/**
 * Cookie's structure inside autoClear object
 * @typedef {Object} Cookie
 * @property {string | RegExp} name
 * @property {string} [domain]
 * @property {string} [path]
 */

/**
 * autoClear's object structure
 * @typedef {Object} AutoClear
 * @property {Cookie[]} cookies
 * @property {boolean} [reloadPage]
 */

/**
 * Structure of each category
 * @typedef {Object} Category
 * @property {AutoClear} [autoClear]
 * @property {boolean} [enabled]
 * @property {boolean} [readOnly]
 * @property {Services} [services]
 */

/**
 * @typedef {object} CookieConfig
 * @property {string} [name]
 * @property {string | Function} [expiresAfterDays]
 * @property {string} [domain]
 * @property {string} [path]
 * @property {string} [sameSite]
 */


/**
 * @typedef {object} ConsentModal
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [acceptAllBtn]
 * @property {string} [acceptNecessaryBtn]
 * @property {string} [showPreferencesBtn]
 * @property {string} [closeIconLabel]
 * @property {string} [revisionMessage]
 * @property {string} [footer] html string
 */

/**
 * @typedef {object} CookieTable
 * @property {Object.<string, string>} headers
 * @property {Object.<string, string>[]} body
 */

/**
 * @typedef {object} Section
 * @property {string} [title]
 * @property {string} [description]
 * @property {string} [linkedCategory]
 * @property {CookieTable} [cookieTable]
 */

/**
 * @typedef {object} PreferencesModal
 * @property {string} [title]
 * @property {string} [acceptAllBtn]
 * @property {string} [acceptNecessaryBtn]
 * @property {string} [savePreferencesBtn]
 * @property {string} [closeIconLabel]
 * @property {Section[]} [sections]
 */

/**
 * @typedef {object} Translation
 * @property {ConsentModal} consentModal Default language
 * @property {PreferencesModal} preferencesModal Language detection strategy
 */

/**
 * @typedef {object} Language
 * @property {string} default Default language
 * @property {string} [autoDetect] Language detection strategy
 * @property {Object.<string, Translation | string>} translations
 */

/**
 * @typedef {object} GuiModalOption
 * @property {string} [layout]
 * @property {string} [position]
 * @property {boolean} [flipButtons]
 * @property {boolean} [equalWeightButtons]
 */

/**
 * @typedef {object} GuiOptions
 * @property {GuiModalOption} [consentModal]
 * @property {GuiModalOption} [preferencesModal]
 */

/**
 * @typedef {object} UserConfig
 * @property {HTMLElement} [root]
 * @property {string} [mode]
 * @property {number} [revision]
 * @property {boolean} [autoShow]
 * @property {boolean} [autoClearCookies]
 * @property {boolean} [manageScriptTags]
 * @property {boolean} [disablePageInteraction]
 * @property {Function} [onFirstConsent]
 * @property {Function} [onConsent]
 * @property {Function} [onChange]
 * @property {CookieConfig} [cookie]
 * @property {Object.<string, Category>} [categories]
 * @property {boolean} [hideFromBots]
 * @property {GuiOptions} [guiOptions]
 * @property {Language} language
 */

/**
 * @typedef {object} UserPreferences
 * @property {string} acceptType
 * @property {string[]} acceptedCategories
 * @property {string[]} rejectedCategories
 */

/**
 * @typedef {object} Api
 * @property {Function} run
 * @property {Function} show
 * @property {Function} hide
 * @property {Function} showPreferences
 * @property {Function} hidePreferences
 * @property {Function} accept
 * @property {Function} acceptedCategory
 * @property {Function} validCookie
 * @property {Function} eraseCookies
 * @property {Function} setLanguage
 * @property {Function} validConsent
 * @property {Function} updateScripts
 * @property {Function} loadScript
 * @property {Function} getConfig
 * @property {Function} getCookie
 * @property {Function} getUserPreferences
 * @property {Function} setCookieData
 */

/**
 * @typedef {object} CookieStructure
 * @property {string[]} categories Array of accepted categories
 * @property {number} revision Current revision number
 * @property {string} consentId Unique id
 * @property {any} data Unique id
 * @property {string} consentTimestamp First consent timestamp
 * @property {string} lastConsentTimestamp Last update timestamp
 * @property {Object.<string, string[]>} services
 */


/**
 * @typedef {Object.<string, HTMLElement>} ServiceToggle
 */

/**
 * Default config. options
 */
export const config = {
    /**
     * Valid modes: 'opt-in' or 'opt-out'
     */
    mode: 'opt-in',
    revision: 0,
    autoShow: true,
    autoClearCookies: true,
    manageScriptTags: true,
    hideFromBots: true,

    cookie: {
        name: 'cc_cookie',
        expiresAfterDays: 182,
        domain: '',
        path: '/',
        sameSite: 'Lax'
    }
};

/**
 * Pointers to callback functions,
 * avoid calling userConfig['<callback_name>']
 */
export const callbacks = {
    /** @type {number|Function} **/ _onFirstConsent: 0,
    /** @type {number|Function} **/ _onConsent: 0,
    /** @type {number|Function} **/ _onChange: 0
};

export const customEvents = {
    _onFirstConsent: new Event('cc:onFirstConsent'),
    _onConsent: new Event('cc:onConsent'),
    _onChange: new Event('cc:onChange')
};

/**
 * Fire custom event
 * @param {Event} event
 */
export const _fireEvent = (event) => {
    window.dispatchEvent(event);

    if(event === customEvents._onFirstConsent && isFunction(callbacks._onFirstConsent))
        callbacks._onFirstConsent(state._savedCookieContent);

    if(event === customEvents._onConsent && isFunction(callbacks._onConsent))
        callbacks._onConsent(state._savedCookieContent);

    if(event === customEvents._onChange && isFunction(callbacks._onChange))
        callbacks._onChange(state._savedCookieContent, state._lastChangedCategoryNames);

    /**
     * Check if el is a function
     * @param {any} fn
     * @returns {boolean}
     */
    function isFunction(fn){
        return typeof fn === 'function';
    }
};

/**
 * Pointers to main dom elements
 * (avoid retrieving them later using dom._document.getElementById)
 */
export const dom = {
    /** @type {number|HTMLElement} */ _document: 0, // defined after config
    /** @type {number|HTMLElement} */ _htmlDom: 0, // defined after config

    /** @type {number|HTMLElement} */ _ccMain: 0,
    /** @type {number|HTMLElement} */ _cmContainer: 0,
    /** @type {number|HTMLElement} */ _pmContainer: 0,

    /** @type {number|HTMLElement} */ _consentModal: 0,
    /** @type {number|HTMLElement} */ _consentModalBody: 0,
    /** @type {number|HTMLElement} */ _consentModalTexts: 0,
    /** @type {number|HTMLElement} */ _consentModalTitle: 0,
    /** @type {number|HTMLElement} */ _consentModalDescription: 0,
    /** @type {number|HTMLElement} */ _consentModalBtns: 0,
    /** @type {number|HTMLElement} */ _consentModalBtnGroup: 0,
    /** @type {number|HTMLElement} */ _consentModalBtnGroup2: 0,
    /** @type {number|HTMLElement} */ _consentAcceptAllBtn: 0,
    /** @type {number|HTMLElement} */ _consentAcceptNecessaryBtn: 0,
    /** @type {number|HTMLElement} */ _consentShowPreferencesBtn: 0,
    /** @type {number|HTMLElement} */ _consentModalFooterLinksGroup: 0,
    /** @type {number|HTMLElement} */ _cmCloseIconBtn: 0,

    /** @type {number|HTMLElement} */ _pm: 0,
    /** @type {number|HTMLElement} */ _pmHeader: 0,
    /** @type {number|HTMLElement} */ _pmTitle: 0,
    /** @type {number|HTMLElement} */ _pmCloseBtn: 0,
    /** @type {number|HTMLElement} */ _pmBody: 0,
    /** @type {number|HTMLElement} */ _pmNewBody: 0,
    /** @type {number|HTMLElement} */ _pmSections: 0,
    /** @type {number|HTMLElement} */ _pmFooter: 0,
    /** @type {number|HTMLElement} */ _pmAcceptAllBtn: 0,
    /** @type {number|HTMLElement} */ _pmAcceptNecessaryBtn: 0,
    /** @type {number|HTMLElement} */ _pmSavePreferencesBtn: 0,

    /** @type {Object.<string, HTMLElement>} */ _categoryCheckboxInputs: {},
    /** @type {Object.<string, ServiceToggle>} */ _serviceCheckboxInputs: {}
};

export const cookieConfig = config.cookie;


export const state = {
    /**
     * @type {UserConfig}
     */
    _userConfig: null,

    _currentLanguageCode: '',

    /**
     * @type {Object.<string, Translation>}
     */
    _allTranslations: {},

    /**
     * @type {Translation}
     */
    _currentTranslation: null,

    /**
     * Internal state variables
     * @type {CookieStructure}
     */
    _savedCookieContent : null,

    /**
     * @type {any}
     */
    _cookieData : null,

    /**
     * @type {Date}
     */
    _consentTimestamp: null,

    /**
     * @type {Date}
     */
    _lastConsentTimestamp: null,

    /**
     * @type {string}
     */
    _consentId: '',

    _invalidConsent : true,

    _consentModalExists : false,
    _consentModalVisible : false,

    _preferencesModalVisible : false,
    _clickedInsideModal : false,

    /**
     * @type {HTMLElement[]}
     */
    _currentModalFocusableElements: [],

    _revisionEnabled : false,
    _validRevision : true,

    /**
     * Array containing the last changed categories (enabled/disabled)
     * @type {string[]}
     */
    _lastChangedCategoryNames : [],

    _reloadPage : false,

    /**
     * Accept type:
     *  - "all"
     *  - "necessary"
     *  - "custom"
     * @type {string}
     */
    _acceptType: '',

    /**
     * Object containing all user's defined categories
     * @type {Object.<string, Category>}
     */
    _allDefinedCategories: false,

    /**
     * Stores all available categories
     * @type {string[]}
     */
    _allCategoryNames: [],

    /**
     * Contains all accepted categories
     * @type {string[]}
     */
    _acceptedCategories : [],

    /**
     * Keep track of readonly toggles
     * @type {string[]}
     */
    _readOnlyCategories : [],

    /**
     * Contains all categories enabled by default
     * @type {string[]}
     */
    _defaultEnabledCategories : [],

    /**
     * Don't run plugin (to avoid indexing its text content) if bot detected
     */
    _botAgentDetected : false,

    /**
     * Save reference to the last focused element on the page
     * (used later to restore focus when both modals are closed)
     */
    /** @type {HTMLElement} **/_lastFocusedElemBeforeModal: false,
    /** @type {HTMLElement} **/_lastFocusedModalElement: false,

    /**
     * Both of the arrays below have the same structure:
     * [0] :> holds reference to the FIRST focusable element inside modal
     * [1] :> holds reference to the LAST focusable element inside modal
     */
    /** @type {HTMLElement[]} **/ _allConsentModalFocusableElements : [],
    /** @type {HTMLElement[]} **/ _allPreferencesModalFocusableElements : [],

    /**
     * Keep track of enabled/disabled categories
     * @type {boolean[]}
     */
    _allToggleStates : [],

    /**
     * @type {Object.<string, Services>}
     */
    _allDefinedServices: {},

    /**
     * @type {Object.<string, string[]>}
     */
    _enabledServices: {},

    /**
     * @type {Object.<string, string[]>}
     */
    _customServicesSelection: {},

    /**
     * @type {Object.<string, string[]>}
     */
    _lastChangedServices: {},

    /**
     * @type {Object.<string, string[]>}
     */
    _lastEnabledServices: {}
};