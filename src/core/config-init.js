import { globalObj } from './global';
import { _log, getKeys, isObject, retrieveScriptElements, fetchCategoriesAndServices } from '../utils/general';
import { OPT_OUT_MODE } from '../utils/constants';
import { resolveCurrentLanguageCode, setCurrentLanguageCode } from '../utils/language';

/**
 * Configure CookieConsent
 * @param {import("./global").UserConfig} userConfig
 */
export const setConfig = (userConfig) => {

    const { _dom, _config, _state } = globalObj;

    const
        config = _config,
        state = _state,
        { cookie } = config,
        callbacks = globalObj._callbacks,
        userCookieConfig = userConfig.cookie,
        userCategories = userConfig.categories,
        allCategoryNames = getKeys(userCategories) || [],
        nav = navigator,
        doc = document;

    /**
     * Access the 'window' and 'document' objects
     * during execution, rather than on import
     * (avoid window/document is not defined error)
     */
    _dom._document = doc;
    _dom._htmlDom = doc.documentElement;
    cookie.domain = location.hostname;

    /**
     * Make user configuration globally available
     */
    state._userConfig = userConfig;
    state._allTranslations = userConfig.language.translations;
    state._allDefinedCategories = userCategories;
    state._allCategoryNames = allCategoryNames;
    state._disablePageInteraction = !!userConfig.disablePageInteraction;

    /**
     * Save references to callback functions
     */
    callbacks._onFirstConsent = userConfig.onFirstConsent;
    callbacks._onConsent = userConfig.onConsent;
    callbacks._onChange = userConfig.onChange;
    callbacks._onModalHide = userConfig.onModalHide;
    callbacks._onModalShow = userConfig.onModalShow;
    callbacks._onModalReady = userConfig.onModalReady;

    const {
        mode,
        autoShow,
        autoClearCookies,
        revision,
        manageScriptTags,
        hideFromBots,
        lazyHtmlGeneration
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

    if(typeof lazyHtmlGeneration === 'boolean')
        config.lazyHtmlGeneration = lazyHtmlGeneration;

    if(hideFromBots === false)
        config.hideFromBots = false;

    if(config.hideFromBots === true && nav)
        state._botAgentDetected = (nav.userAgent && /bot|crawl|spider|slurp|teoma/i.test(nav.userAgent)) || nav.webdriver;

    if(isObject(userCookieConfig))
        config.cookie = {...cookie, ...userCookieConfig};

    _log('CookieConsent [CONFIG]: configuration:', userConfig);
    _log('CookieConsent [CONFIG]: autoClearCookies:', config.autoClearCookies);
    _log('CookieConsent [CONFIG]: revision enabled:', state._revisionEnabled);
    _log('CookieConsent [CONFIG]: manageScriptTags:', config.manageScriptTags);

    fetchCategoriesAndServices(allCategoryNames);
    retrieveScriptElements();
    setCurrentLanguageCode(resolveCurrentLanguageCode());
};