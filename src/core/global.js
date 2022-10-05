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
 * @property {string} _categoryName
 * @property {string} [_serviceName]
 * @property {boolean} _executed
 * @property {boolean} _runOnDisable
 */

/**
 * Pointers to all services toggles relative to a category
 * @typedef {Object.<string, HTMLElement>} ServiceToggle
 */

/**
 * Check if el is a function
 * @param {any} fn
 * @returns {boolean}
 */
export const isFunction = (fn) => {
    return typeof fn === 'function';
};

/**
 * Returns a copy/clone of the object
 * @param {any} obj
 */
export const shallowCopy = (data) => {
    return JSON.parse(JSON.stringify(data));
};

const dispatchEvent = (eventName, data) => {
    window.dispatchEvent(new CustomEvent(eventName, {detail: data}));
};

/**
 * Fire custom event
 * @param {string} eventName
 * @param {string} [modalName]
 * @param {HTMLElement} [modal]
 */
export const fireEvent = (eventName, modalName, modal) => {

    const callbacks = globalObj._callbacks;
    const events = globalObj._customEvents;

    const params = {
        cookie: globalObj._state._savedCookieContent
    };

    /**
     * If it's a show/hide modal callback
     */
    if(modalName){

        const modalParams = {
            modalName: modalName,
            modal: modal
        };

        if(eventName === events._onModalShow)
            isFunction(callbacks._onModalShow) && callbacks._onModalShow(modalParams);
        else if(eventName === events._onModalHide)
            isFunction(callbacks._onModalHide) && callbacks._onModalHide(modalParams);
        else
            isFunction(callbacks._onModalReady) && callbacks._onModalReady(modalParams);

        return dispatchEvent(eventName, modalParams);
    }

    if(eventName === events._onFirstConsent){
        isFunction(callbacks._onFirstConsent) && callbacks._onFirstConsent(shallowCopy(params));
    }
    else if(eventName === events._onConsent){
        isFunction(callbacks._onConsent) && callbacks._onConsent(shallowCopy(params));
    }
    else if(eventName === events._onChange){
        params.changedCategories = globalObj._state._lastChangedCategoryNames;
        params.changedServices = globalObj._state._lastChangedServices;
        isFunction(callbacks._onChange) && callbacks._onChange(shallowCopy(params));
    }

    dispatchEvent(eventName, shallowCopy(params));
};

export class Global {
    constructor() {

        /**
         * Default config. options
         * @type {CookieConsent.CookieConsentConfig}
         */
        this._config = {
            mode: OPT_IN_MODE,
            revision: 0,
            autoShow: true,
            autoClearCookies: true,
            manageScriptTags: true,
            hideFromBots: true,
            lazyHtmlGeneration: true,

            cookie: {
                name: COOKIE_NAME,
                expiresAfterDays: 182,
                domain: '',
                path: '/',
                sameSite: 'Lax'
            }
        };

        this._state = {
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
            * @type {CookieValue}
            */
            _savedCookieContent : null,

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
            _preferencesModalExists: false,

            _clickedInsideModal : false,

            _preferencesModalVisibleDelayed : false,

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

            /** @type {HTMLElement} **/_lastFocusedElemBeforeModal: false,
            /** @type {HTMLElement} **/_lastFocusedModalElement: false,

            /**
            * Both of the arrays below have the same structure:
            * [0]: holds reference to the FIRST focusable element inside modal
            * [1]: holds reference to the LAST focusable element inside modal
            */

            /** @type {HTMLElement[]} **/ _cmFocusableElements : [],
            /** @type {HTMLElement[]} **/ _pmFocusableElements : [],

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
            _lastEnabledServices: {},

            /**
            * @type {NodeListOf<Element>}
            */
            _allScriptTags: [],

            /**
            * @type {ScriptInfo[]}
            */
            _allScriptTagsInfo: []
        };

        /**
         * Pointers to main dom elements
         */
        this._dom = {
            /** @type {number|Document} */ _document: 0,
            /** @type {number|HTMLElement} */ _htmlDom: 0,

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

        /**
         * Pointers to callback functions
         */
        this._callbacks = {
            /** @type {number|Function} **/ _onFirstConsent: 0,
            /** @type {number|Function} **/ _onConsent: 0,
            /** @type {number|Function} **/ _onChange: 0,
            /** @type {number|Function} **/ _onModalShow: 0,
            /** @type {number|Function} **/ _onModalHide: 0,
            /** @type {number|Function} **/ _onModalReady: 0
        };

        this._customEvents = {
            _onFirstConsent: 'cc:onFirstConsent',
            _onConsent: 'cc:onConsent',
            _onChange: 'cc:onChange',
            _onModalShow: 'cc:onModalShow',
            _onModalHide: 'cc:onModalHide',
            _onModalReady: 'cc:onModalReady'
        };
    }
}

export const globalObj = new Global();