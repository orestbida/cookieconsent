import { _state,  _config, cookieConfig, _callbacks } from "./global";
import { _log} from "./utils/general";
import { _resolveCurrentLanguageCode } from "./utils/language";

/**
 * Update config preferences
 * @param {Object} userConfig
 */
export const _setConfig = function(_userConfig){

    /**
     * Make user configuration globally available
     */
    _state.userConfig = _userConfig;

    _state.allTranslations = _userConfig['language']['translations'];

    _log("CookieConsent [CONFIG]: configuration:", _userConfig);

    if(typeof _state.userConfig['autoShow'] === "boolean")
        _config.autoShow = _state.userConfig['autoShow'];

    var newCookieConfig = _state.userConfig['cookie'];

    if(!!newCookieConfig && typeof newCookieConfig === 'object'){

        var name = newCookieConfig['name'],
            domain = newCookieConfig['domain'],
            path = newCookieConfig['path'],
            sameSite = newCookieConfig['sameSite'],
            expiresAfterDays = newCookieConfig['expiresAfterDays'];

        name && (cookieConfig.name = name);
        domain && (cookieConfig.domain = domain);
        path && (cookieConfig.path = path);
        sameSite && (cookieConfig.sameSite = sameSite);
        expiresAfterDays && (cookieConfig.expiresAfterDays = expiresAfterDays);
    }

    /**
     * Save references to callback functions
     */
    _callbacks._onFirstConsent = _state.userConfig['onFirstConsent'];
    _callbacks._onConsent = _state.userConfig['onConsent'];
    _callbacks._onChange = _state.userConfig['onChange'];

    var mode = _state.userConfig['mode'];
    var revision = _state.userConfig['revision'];
    var autoClearCookies = _state.userConfig['autoClearCookies'];
    var manageScriptTags = _state.userConfig['manageScriptTags'];

    if(mode === 'opt-out'){
        _config.mode = mode;
    }

    if(typeof revision === 'number'){
        revision > -1 && (_config.revision = revision);
        _state.revisionEnabled = true;
    }

    if(typeof autoClearCookies === 'boolean'){
        _config.autoClearCookies = autoClearCookies;
    }

    if(typeof manageScriptTags === 'boolean'){
        _config.manageScriptTags = manageScriptTags;
    }

    if(_state.userConfig['hideFromBots'] === true){
        _state.botAgentDetected = navigator &&
            ((navigator.userAgent && /bot|crawl|spider|slurp|teoma/i.test(navigator.userAgent)) || navigator.webdriver);
    }

    _log("CookieConsent [CONFIG]: autoClearCookies:", _config.autoClearCookies);
    _log("CookieConsent [CONFIG]: revision enabled:", _state.revisionEnabled);
    _log("CookieConsent [CONFIG]: manageScriptTags:", _config.manageScriptTags);

    /**
     * Determine current language code
     */
    _state.currentLanguageCode = _resolveCurrentLanguageCode();

    /**
     * Get translation relative to the current language code
     */
    _state.currentTranslation = _state.allTranslations[_state.currentLanguageCode];

    _log("CookieConsent [LANG]: current language: '" + _state.currentLanguageCode + "'");
}