import { globalObj } from './global';
import { _log, _getKeys, _isObject, _retrieveScriptElements } from '../utils/general';
import { OPT_OUT_MODE } from '../utils/constants';

/**
 * Configure CookieConsent
 * @param {import("../../types").CookieConsentConfig} userConfig
 */
export const _setConfig = (userConfig) => {

    setWindowData();

    const
        state = globalObj._state,
        config = globalObj._config,
        cookie = config.cookie,
        callbacks = globalObj._callbacks,
        userCookieConfig = userConfig.cookie,
        userCategories = userConfig.categories,
        allCategoryNames = _getKeys(userCategories) || [],
        nav = navigator;

    /**
     * Make user configuration globally available
     */
    state._userConfig = userConfig;
    state._allTranslations = userConfig.language.translations;
    state._allDefinedCategories = userCategories;
    state._allCategoryNames = allCategoryNames;

    /**
     * Save references to callback functions
     */
    callbacks._onFirstConsent = userConfig.onFirstConsent;
    callbacks._onConsent = userConfig.onConsent;
    callbacks._onChange = userConfig.onChange;
    callbacks._onModalHide = userConfig.onModalHide;
    callbacks._onModalShow = userConfig.onModalShow;

    const {
        mode,
        autoShow,
        autoClearCookies,
        revision,
        manageScriptTags,
        hideFromBots
    } = userConfig;

    if(mode === OPT_OUT_MODE)
        config.mode = mode;

    if(typeof autoShow === 'boolean')
        config.autoShow = autoShow;

    if(typeof autoClearCookies === 'boolean')
        config.autoClearCookies = autoClearCookies;

    if(typeof manageScriptTags === 'boolean')
        config.manageScriptTags = manageScriptTags;

    if(typeof revision === 'number' && revision >= 0){
        config.revision = revision;
        state._revisionEnabled = true;
    }

    if(hideFromBots === false)
        config.hideFromBots = false;

    if(config.hideFromBots === true && nav)
        state._botAgentDetected = ((nav.userAgent && /bot|crawl|spider|slurp|teoma/i.test(nav.userAgent)) || nav.webdriver);

    if(typeof userCookieConfig === 'object'){


        config.cookie = {...cookie, ...userCookieConfig};
    }

    _log('CookieConsent [CONFIG]: configuration:', userConfig);
    _log('CookieConsent [CONFIG]: autoClearCookies:', config.autoClearCookies);
    _log('CookieConsent [CONFIG]: revision enabled:', state._revisionEnabled);
    _log('CookieConsent [CONFIG]: manageScriptTags:', config.manageScriptTags);

    _fetchCategoriesAndServices(allCategoryNames);
    _retrieveScriptElements();
};

/**
 * Store categories and services' config. details
 * @param {string[]} allCategoryNames
 */
function _fetchCategoriesAndServices(allCategoryNames) {
    const state = globalObj._state;

    allCategoryNames.forEach(categoryName => {

        const currCategory = state._allDefinedCategories[categoryName];
        const services = currCategory.services || {};
        const serviceNames = services && _isObject(services) && _getKeys(services) || [];

        /**
         * Keep track of readOnly categories
         */
        if(currCategory.readOnly)
            state._readOnlyCategories.push(categoryName);

        state._allDefinedServices[categoryName] = {};
        state._enabledServices[categoryName] = [];
        globalObj._dom._serviceCheckboxInputs[categoryName] = {};

        serviceNames.forEach(serviceName => {
            const service = services[serviceName];
            service.enabled = false;
            state._allDefinedServices[categoryName][serviceName] = service;
        });
    });
}

/**
 * Access the 'window' and 'document' objects
 * during execution, rather than on import
 */
function setWindowData() {

    const doc = document;

    globalObj._dom._document = doc;
    globalObj._dom._htmlDom = doc.documentElement;
    globalObj._config.cookie.domain = window.location.hostname;
}