export const _config = {
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

/**
 * Pointers to callback functions,
 * avoid calling userConfig['<callback_name>']
 */
export const _callbacks = {
    _onFirstConsent: false,
    _onConsent: false,
    _onChange: false
}

/**
 * Pointers to main dom elements
 * (avoid retrieving them later using document.getElementById)
 */
export const _dom = {

    /** @type {HTMLElement} */ htmlDom : document.documentElement,
    /** @type {HTMLElement} */ mainContainer: null,
    /** @type {HTMLElement} */ allModalsContainer: null,

    /** @type {HTMLElement} */ consentModal: null,
    /** @type {HTMLElement} */ consentModalTitle: null,
    /** @type {HTMLElement} */ consentModalDescription: null,
    /** @type {HTMLElement} */ consentAcceptAllBtn: null,
    /** @type {HTMLElement} */ consentAcceptNecessaryBtn: null,
    /** @type {HTMLElement} */ consentButtonsContainer: null,
    /** @type {HTMLElement} */ consentModalInner: null,

    /** @type {HTMLElement} */ preferencesContainer: null,
    /** @type {HTMLElement} */ preferencesInner: null,
    /** @type {HTMLElement} */ preferencesTitle: null,
    /** @type {HTMLElement} */ preferencesCloseBtn: null,
    /** @type {HTMLElement} */ sectionsContainer: null,
    /** @type {HTMLElement} */ newSectionsContainer: null,
    /** @type {HTMLElement} */ preferencesButtonsContainer: null,
    /** @type {HTMLElement} */ preferencesSaveBtn: null,
    /** @type {HTMLElement} */ preferencesacceptAllBtn: null,
    /** @type {HTMLElement} */ preferencesacceptNecessaryBtn: null
}


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
 * @typedef {object} cookieConfig
 * @property {string} [name]
 * @property {string | Function} [expiresAfterDays]
 * @property {string} [domain]
 * @property {string} [path]
 * @property {string} [sameSite]
 */

/**
 * @typedef {object} userConfig
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
 * @property {{}} language
 */

/**
 * @type {cookieConfig}
 */
export const cookieConfig = _config.cookie;

export const _state = {

    /**
     * @type {userConfig}
     */
    userConfig: null,

    currentLanguageCode: '',
    allTranslations: [],
    currentTranslation: '',

    /**
     * Internal state variables
     */
    savedCookieContent : {},
    cookieData : null,

    /**
     * @type {Date}
     */
    consentTimestamp: null,

    /**
     * @type {Date}
     */
    lastConsentTimestamp: null,

    /**
     * @type {string}
     */
    consentId: null,

    /**
     * @type {boolean}
     */
    invalidConsent : true,

    consentModalExists : false,
    consentModalVisible : false,

    preferencesModalVisible : false,
    clickedInsideModal : false,
    currentModalFocusableElements: [],

    revisionEnabled : false,
    validRevision : true,

    /**
     * Array containing the last changed categories (enabled/disabled)
     * @type {string[]}
     */
    lastChangedCategoryNames : [],

    reloadPage : false,

    /**
     * Accept type:
     *  - "all"
     *  - "necessary"
     *  - "custom"
     * @type {string}
     */
    acceptType: '',

    /**
     * Object containing all user's defined categories
     * @type {Object.<string, Category>}
     */
    allDefinedCategories: null,

    /**
     * Stores all available categories
     * @type {string[]}
     */
    allCategoryNames: null,

    /**
     * Contains all accepted categories
     * @type {string[]}
     */
    acceptedCategories : [],

    /**
     * Keep track of readonly toggles
     * @type {boolean[]}
     */
    readOnlyCategories : [],

    /**
     * Contains all categories enabled by default
     * @type {string[]}
     */
    defaultEnabledCategories : [],

    /**
     * Don't run plugin (to avoid indexing its text content) if bot detected
     */
    botAgentDetected : false,

    /**
     * Save reference to the last focused element on the page
     * (used later to restore focus when both modals are closed)
     */
    lastFocusedElemBeforeModal: null,
    lastFocusedModalElement: null,

    /**
     * Both of the arrays below have the same structure:
     * [0] :> holds reference to the FIRST focusable element inside modal
     * [1] :> holds reference to the LAST focusable element inside modal
     */
    allConsentModalFocusableElements : [],
    allPreferencesModalFocusableElements : [],

    /**
     * Keep track of enabled/disabled categories
     * @type {boolean[]}
     */
    allToggleStates : [],
}