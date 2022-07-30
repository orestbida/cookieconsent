import { globalObj } from './global';
import { _log, _getKeys, _isObject, _retrieveScriptElements } from '../utils/general';
import { _resolveCurrentLanguageCode } from '../utils/language';
import { OPT_OUT_MODE } from '../utils/constants';

/**
 * Update config preferences
 * @param {import("./global").UserConfig} _userConfig
 */
export const _setConfig = (_userConfig) => {

    setWindowData();
    globalObj._init = true;

    /**
     * Make user configuration globally available
     */
    globalObj._state._userConfig = _userConfig;
    globalObj._state._allTranslations = _userConfig.language.translations;
    globalObj._state._allDefinedCategories = globalObj._state._userConfig.categories;

    _log('CookieConsent [CONFIG]: configuration:', _userConfig);

    if(typeof _userConfig.autoShow === 'boolean')
        globalObj._config.autoShow = _userConfig.autoShow;

    var newCookieConfig = _userConfig.cookie;

    if(!!newCookieConfig && typeof newCookieConfig === 'object'){

        var name = newCookieConfig.name,
            domain = newCookieConfig.domain,
            path = newCookieConfig.path,
            sameSite = newCookieConfig.sameSite,
            expiresAfterDays = newCookieConfig.expiresAfterDays;

        name && (globalObj._config.cookie.name = name);
        domain && (globalObj._config.cookie.domain = domain);
        path && (globalObj._config.cookie.path = path);
        sameSite && (globalObj._config.cookie.sameSite = sameSite);
        expiresAfterDays && (globalObj._config.cookie.expiresAfterDays = expiresAfterDays);
    }

    /**
     * Save references to callback functions
     */
    globalObj._callbacks._onFirstConsent = _userConfig.onFirstConsent;
    globalObj._callbacks._onConsent = _userConfig.onConsent;
    globalObj._callbacks._onChange = _userConfig.onChange;
    globalObj._callbacks._onModalHide = _userConfig.onModalHide;
    globalObj._callbacks._onModalShow = _userConfig.onModalShow;

    var mode = _userConfig.mode;
    var revision = _userConfig.revision;
    var autoClearCookies = _userConfig.autoClearCookies;
    var manageScriptTags = _userConfig.manageScriptTags;
    var hideFromBots = _userConfig.hideFromBots;

    if(mode === OPT_OUT_MODE){
        globalObj._config.mode = mode;
    }

    if(typeof revision === 'number'){
        revision > -1 && (globalObj._config.revision = revision);
        globalObj._state._revisionEnabled = true;
    }

    if(typeof autoClearCookies === 'boolean'){
        globalObj._config.autoClearCookies = autoClearCookies;
    }

    if(typeof manageScriptTags === 'boolean'){
        globalObj._config.manageScriptTags = manageScriptTags;
    }

    if(hideFromBots === false) globalObj._config.hideFromBots = false;

    if(globalObj._config.hideFromBots === true){
        globalObj._state._botAgentDetected = navigator &&
            ((navigator.userAgent && /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)) || navigator.webdriver);
    }

    _log('CookieConsent [CONFIG]: autoClearCookies:', globalObj._config.autoClearCookies);
    _log('CookieConsent [CONFIG]: revision enabled:', globalObj._state._revisionEnabled);
    _log('CookieConsent [CONFIG]: manageScriptTags:', globalObj._config.manageScriptTags);


    var defaultLanguageCode = globalObj._state._userConfig.language.default;

    // Set default language as currentLanguage
    if(defaultLanguageCode){
        globalObj._state._currentLanguageCode = defaultLanguageCode;
    }

    /**
     * Determine current language code
     */
    globalObj._state._currentLanguageCode = _resolveCurrentLanguageCode();

    /**
     * Get translation relative to the current language code
     */
    globalObj._state._currentTranslation = globalObj._state._allTranslations[globalObj._state._currentLanguageCode];

    _log('CookieConsent [LANG]: current language: \'' + globalObj._state._currentLanguageCode + '\'');

    globalObj._state._allCategoryNames = _getKeys(globalObj._state._allDefinedCategories);

    globalObj._state._allCategoryNames.forEach(categoryName => {
        const services = globalObj._state._allDefinedCategories[categoryName].services || {};
        const serviceNames = services && _isObject(services) && _getKeys(services) || [];
        globalObj._state._allDefinedServices[categoryName] = {};
        globalObj._state._enabledServices[categoryName] = [];
        globalObj._dom._serviceCheckboxInputs[categoryName] = {};

        if(serviceNames.length === 0)
            return;

        serviceNames.forEach(serviceName => {
            const service = services[serviceName];
            service.enabled = false;
            globalObj._state._allDefinedServices[categoryName][serviceName] = service;
        });
    });

    /**
     * Save names of categories marked as readonly
     */
    for(var i=0; i<globalObj._state._allCategoryNames.length; i++){
        if(globalObj._state._allDefinedCategories[globalObj._state._allCategoryNames[i]].readOnly === true)
            globalObj._state._readOnlyCategories.push(globalObj._state._allCategoryNames[i]);
    }

    _retrieveScriptElements();
};

/**
 * This function needs to be called right after .init()
 */
export const setWindowData = () => {
    /**
     * Fix "window is not defined" error
     */
    globalObj._config.cookie.domain = window.location.hostname;

    /**
     * Define document properties after globalObj._config.
     * to avoid errors like "document is not defined"
     */
    globalObj._dom._document = document;
    globalObj._dom._htmlDom = globalObj._dom._document.documentElement;
};