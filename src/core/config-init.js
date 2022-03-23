import { state, config, cookieConfig, callbacks, dom } from './global';
import { _log } from '../utils/general';
import { _resolveCurrentLanguageCode } from '../utils/language';

/**
 * Update config preferences
 * @param {import("./global").UserConfig} _userConfig
 */
export const _setConfig = (_userConfig) => {

    /**
     * Make user configuration globally available
     */
    state._userConfig = _userConfig;
    state._allTranslations = _userConfig.language.translations;

    _log('CookieConsent [CONFIG]: configuration:', _userConfig);

    if(typeof _userConfig.autoShow === 'boolean')
        config.autoShow = _userConfig.autoShow;

    /**
     * @type {import("./global").CookieConfig}
     */
    var newCookieConfig = _userConfig.cookie;

    if(!!newCookieConfig && typeof newCookieConfig === 'object'){

        var name = newCookieConfig.name,
            domain = newCookieConfig.domain,
            path = newCookieConfig.path,
            sameSite = newCookieConfig.sameSite,
            expiresAfterDays = newCookieConfig.expiresAfterDays;

        name && (cookieConfig.name = name);
        domain && (cookieConfig.domain = domain);
        path && (cookieConfig.path = path);
        sameSite && (cookieConfig.sameSite = sameSite);
        expiresAfterDays && (cookieConfig.expiresAfterDays = expiresAfterDays);
    }

    /**
     * Save references to callback functions
     */
    callbacks._onFirstConsent = _userConfig.onFirstConsent;
    callbacks._onConsent = _userConfig.onConsent;
    callbacks._onChange = _userConfig.onChange;

    var mode = _userConfig;
    var revision = _userConfig.revision;
    var autoClearCookies = _userConfig.autoClearCookies;
    var manageScriptTags = _userConfig.manageScriptTags;
    var hideFromBots = _userConfig.hideFromBots;

    if(mode === 'opt-out'){
        config.mode = mode;
    }

    if(typeof revision === 'number'){
        revision > -1 && (config.revision = revision);
        state._revisionEnabled = true;
    }

    if(typeof autoClearCookies === 'boolean'){
        config.autoClearCookies = autoClearCookies;
    }

    if(typeof manageScriptTags === 'boolean'){
        config.manageScriptTags = manageScriptTags;
    }

    if(hideFromBots === false) config.hideFromBots = false;

    if(config.hideFromBots === true){
        state._botAgentDetected = navigator &&
            ((navigator.userAgent && /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)) || navigator.webdriver);
    }

    _log('CookieConsent [CONFIG]: autoClearCookies:', config.autoClearCookies);
    _log('CookieConsent [CONFIG]: revision enabled:', state._revisionEnabled);
    _log('CookieConsent [CONFIG]: manageScriptTags:', config.manageScriptTags);

    /**
     * Determine current language code
     */
    state._currentLanguageCode = _resolveCurrentLanguageCode();

    /**
     * Get translation relative to the current language code
     */
    state._currentTranslation = state._allTranslations[state._currentLanguageCode];

    _log('CookieConsent [LANG]: current language: \'' + state._currentLanguageCode + '\'');

    /**
     * Define document properties after config.
     * to avoid errors like "document is not defined"
     */
    dom._htmlDom = document.documentElement;
};