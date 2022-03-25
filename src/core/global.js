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
 * @property {boolean} [reloadPage]
 */

/**
 * Structure of each category
 * @typedef {Object} Category
 * @property {AutoClear} [autoClear]
 * @property {boolean} [enabled]
 * @property {boolean} [readOnly]
 */

/**
 * @typedef {object} CookieConfig
 * @property {string} [name]
 * @property {string | Function} [expiresAfterDays]
 * @property {string | Function} [domain]
 * @property {string} [path]
 * @property {string} [sameSite]
 */

/**
 * @typedef {object} Translation
 * @property {{}} consentModal Default language
 * @property {{}} preferencesModal Language detection strategy
 */

/**
 * @typedef {object} Language
 * @property {string} default Default language
 * @property {string} [autoDetect] Language detection strategy
 * @property {Object.<string, Translation | string>} translations
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
 * @property {cookieConfig} [cookie]
 * @property {Object.<string, Category>} [categories]
 * @property {boolean} [hideFromBots]
 * @property {{}} [guiOptions]
 * @property {Language} language
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
 * @property {Function} updateLanguage
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
 * @property {object} consentTimestamp First consent timestamp
 * @property {object} lastConsentTimestamp Last update timestamp
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
 * Fix "window is undefined error"
 */
Object.defineProperty(config.cookie, 'domain',{
    get: () => window.location.hostname
});

/**
 * Pointers to callback functions,
 * avoid calling userConfig['<callback_name>']
 */
export const callbacks = {
    _onFirstConsent: null,
    _onConsent: null,
    _onChange: null
};

/**
 * Pointers to main dom elements
 * (avoid retrieving them later using document.getElementById)
 */
export const dom = {

    /** @type {HTMLElement} */ _htmlDom: null, // defined after config
    /** @type {HTMLElement} */ _ccMain: null,
    /** @type {HTMLElement} */ _cmContainer: null,
    /** @type {HTMLElement} */ _pmContainer: null,

    /** @type {HTMLElement} */ _consentModal: null,
    /** @type {HTMLElement} */ _consentModalBody: null,
    /** @type {HTMLElement} */ _consentModalTexts: null,
    /** @type {HTMLElement} */ _consentModalTitle: null,
    /** @type {HTMLElement} */ _consentModalDescription: null,
    /** @type {HTMLElement} */ _consentModalBtns: null,
    /** @type {HTMLElement} */ _consentModalBtnGroup: null,
    /** @type {HTMLElement} */ _consentModalBtnGroup2: null,
    /** @type {HTMLElement} */ _consentAcceptAllBtn: null,
    /** @type {HTMLElement} */ _consentAcceptNecessaryBtn: null,
    /** @type {HTMLElement} */ _consentShowPreferencesBtn: null,
    /** @type {HTMLElement} */ _consentModalFooterLinksGroup: null,

    /** @type {HTMLElement} */ _preferencesContainer: null,
    /** @type {HTMLElement} */ _preferencesInner: null,
    /** @type {HTMLElement} */ _preferencesTitle: null,
    /** @type {HTMLElement} */ _preferencesCloseBtn: null,
    /** @type {HTMLElement} */ _sectionsContainer: null,
    /** @type {HTMLElement} */ _newSectionsContainer: null,
    /** @type {HTMLElement} */ _preferencesButtonsContainer: null,
    /** @type {HTMLElement} */ _preferencesSaveBtn: null,
    /** @type {HTMLElement} */ _preferencesacceptAllBtn: null,
    /** @type {HTMLElement} */ _preferencesacceptNecessaryBtn: null
};

/**
 * @type {CookieConfig}
 */
export const cookieConfig = config.cookie;

export const state = {

    /**
     * @type {UserConfig}
     */
    _userConfig: null,

    _currentLanguageCode: '',
    _allTranslations: [],
    _currentTranslation: null,

    /**
     * Internal state variables
     * @type {CookieStructure}
     */
    _savedCookieContent : null,

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

    /**
     * @type {boolean}
     */
    _invalidConsent : true,

    _consentModalExists : false,
    _consentModalVisible : false,

    _preferencesModalVisible : false,
    _clickedInsideModal : false,
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
    _lastFocusedElemBeforeModal: false,
    _lastFocusedModalElement: false,

    /**
     * Both of the arrays below have the same structure:
     * [0] :> holds reference to the FIRST focusable element inside modal
     * [1] :> holds reference to the LAST focusable element inside modal
     */
    _allConsentModalFocusableElements : [],
    _allPreferencesModalFocusableElements : [],

    /**
     * Keep track of enabled/disabled categories
     * @type {boolean[]}
     */
    _allToggleStates : [],
};