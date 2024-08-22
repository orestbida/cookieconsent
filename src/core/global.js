import { COOKIE_NAME, OPT_IN_MODE } from '../utils/constants';

/**
 * @typedef {import('../../types')} CookieConsent
 *
 * @typedef {CookieConsent} Api
 * @typedef {CookieConsent.CookieConsentConfig} UserConfig
 * @typedef {CookieConsent.Category} Category
 * @typedef {CookieConsent.Service} Service
 * @typedef {Object.<string, Service>} Services
 * @typedef {CookieConsent.AutoClear} AutoClear
 * @typedef {CookieConsent.GuiOptions} GuiOptions
 * @typedef {GuiOptions['consentModal']} GuiModalOption
 * @typedef {CookieConsent.CookieConsentConfig['language']} Language
 * @typedef {CookieConsent.Translation} Translation
 * @typedef {CookieConsent.ConsentModalOptions} ConsentModalOptions
 * @typedef {CookieConsent.PreferencesModalOptions} PreferencesModalOptions
 * @typedef {CookieConsent.CookieTable} CookieTable
 * @typedef {CookieConsent.Section} Section
 * @typedef {CookieConsent.CookieValue} CookieValue
 * @typedef {CookieConsent.UserPreferences} UserPreferences
 */

/**
 * Internal state for each script tag
 * @typedef {Object} ScriptInfo
 * @property {HTMLScriptElement} _script
 * @property {string} _categoryName
 * @property {string} [_serviceName]
 * @property {boolean} _executed
 * @property {boolean} _runOnDisable
 */

/**
 * Pointers to main dom elements
 * @typedef {Object} DomElements
 * @property {Document} _document
 * @property {HTMLElement} _htmlDom
 *
 * @property {HTMLElement} _ccMain
 * @property {HTMLElement} _cmContainer
 * @property {HTMLElement} _pmContainer
 *
 * @property {HTMLElement} _cm
 * @property {HTMLElement} _cmBody
 * @property {HTMLElement} _cmTexts
 * @property {HTMLElement} _cmTitle
 * @property {HTMLElement} _cmDescription
 * @property {HTMLElement} _cmBtns
 * @property {HTMLElement} _cmBtnGroup
 * @property {HTMLElement} _cmBtnGroup2
 * @property {HTMLElement} _cmAcceptAllBtn
 * @property {HTMLElement} _cmAcceptNecessaryBtn
 * @property {HTMLElement} _cmShowPreferencesBtn
 * @property {HTMLElement} _cmFooterLinksGroup
 * @property {HTMLElement} _cmCloseIconBtn
 *
 * @property {HTMLElement} _pm
 * @property {HTMLElement} _pmHeader
 * @property {HTMLElement} _pmTitle
 * @property {HTMLElement} _pmCloseBtn
 * @property {HTMLElement} _pmBody
 * @property {HTMLElement} _pmNewBody
 * @property {HTMLElement} _pmSections
 * @property {HTMLElement} _pmFooter
 * @property {HTMLElement} _pmAcceptAllBtn
 * @property {HTMLElement} _pmAcceptNecessaryBtn
 * @property {HTMLElement} _pmSavePreferencesBtn
 *
 * @property {Object.<string, HTMLInputElement>} _categoryCheckboxInputs
 * @property {Object.<string, ServiceToggle>} _serviceCheckboxInputs
 *
 * // Used to properly restore focus when modal is closed
 * @property {HTMLSpanElement} _focusSpan
 * @property {HTMLSpanElement} _pmFocusSpan
 */

/**
 * @typedef {Object} CustomCallbacks
 * @property {Function} _onFirstConsent
 * @property {Function} _onConsent
 * @property {Function} _onChange
 * @property {Function} _onModalShow
 * @property {Function} _onModalHide
 * @property {Function} _onModalReady
 */

/**
 * Pointers to all services toggles relative to a category
 * @typedef {Object.<string, HTMLInputElement>} ServiceToggle
 */

export class GlobalState {
    constructor() {

        /**
         * Default config. options
         * @type {CookieConsent.CookieConsentConfig}
         */
        this._config = {
            mode: OPT_IN_MODE,
            revision: 0,

            //{{START: GUI}}
            autoShow: true,
            lazyHtmlGeneration: true,
            //{{END: GUI}}

            autoClearCookies: true,
            manageScriptTags: true,
            hideFromBots: true,

            cookie: {
                name: COOKIE_NAME,
                expiresAfterDays: 182,
                domain: '',
                path: '/',
                secure: true,
                sameSite: 'Lax'
            }
        };

        this._state = {
            /**
            * @type {UserConfig}
            */
            _userConfig: {},

            _currentLanguageCode: '',

            /**
            * @type {Object.<string, Translation>}
            */
            _allTranslations: {},

            /**
            * @type {Translation}
            */
            _currentTranslation: {},

            /**
            * Internal state variables
            * @type {CookieValue}
            */
            _savedCookieContent : {},

            /**
             * Store all event data-cc event listeners
             * (so that they can be removed on .reset())
             *
             * @type {{
             *  _element: HTMLElement,
             *  _event: string,
             *  _listener: Function
             * }[]}
             */
            _dataEventListeners: [],

            _disablePageInteraction: false,

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

            //{{START: GUI}}
            _consentModalExists : false,
            _consentModalVisible : false,

            _preferencesModalVisible : false,
            _preferencesModalExists: false,

            /**
            * @type {HTMLElement[]}
            */
            _currentModalFocusableElements: [],
            //{{END: GUI}}

            _revisionEnabled : false,
            _validRevision : true,

            /**
            * Array containing the last changed categories (enabled/disabled)
            * @type {string[]}
            */
            _lastChangedCategoryNames : [],

            _reloadPage : false,

            /**
            * @type {CookieConsent.AcceptType}
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
            * Don't run plugin if bot detected
            * (to avoid indexing its text content)
            */
            _botAgentDetected : false,

            /**
            * Save reference to the last focused element on the page
            * (used later to restore focus when both modals are closed)
            */

            //{{START: GUI}}

            /** @type {HTMLElement} **/_lastFocusedElemBeforeModal: false,
            /** @type {HTMLElement} **/_lastFocusedModalElement: false,

            /**
            * Both of the arrays below have the same structure:
            * [0]: first focusable element inside modal
            * [1]: last focusable element inside modal
            */

            /** @type {HTMLElement[]} **/ _cmFocusableElements : [],
            /** @type {HTMLElement[]} **/ _pmFocusableElements : [],

            /**
            * Keep track of enabled/disabled categories
            * @type {boolean[]}
            */
            _allToggleStates : [],

            //{{END: GUI}}

            /**
            * @type {Object.<string, Services>}
            */
            _allDefinedServices: {},

            /**
            * @type {Object.<string, string[]>}
            */
            _acceptedServices: {},

            /**
             * Keep track of the current state of the services
             * (may not be the same as enabledServices)
             *
             * @type {Object.<string, string[]>}
             */
            _enabledServices: {},

            /**
            * @type {Object.<string, string[]>}
            */
            _lastChangedServices: {},

            /**
            * @type {Object.<string, string[]>}
            */
            _lastEnabledServices: {},

            /**
            * @type {ScriptInfo[]}
            */
            _allScriptTags: []
        };

        //{{START: GUI}}

        /**
         * Pointers to main dom elements
         * @type {DomElements}
         */
        this._dom = {
            _categoryCheckboxInputs: {},
            _serviceCheckboxInputs: {}
        };

        //{{END: GUI}}

        /**
         * Callback functions
         * @type {CustomCallbacks}
         */
        this._callbacks = {};

        this._customEvents = {
            _onFirstConsent: 'cc:onFirstConsent',
            _onConsent: 'cc:onConsent',
            _onChange: 'cc:onChange',
            //{{START: GUI}}
            _onModalShow: 'cc:onModalShow',
            _onModalHide: 'cc:onModalHide',
            _onModalReady: 'cc:onModalReady'
            //{{END: GUI}}
        };
    }
}

export const globalObj = new GlobalState();