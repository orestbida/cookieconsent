import { globalObj } from './global';
import { debug, getKeys, isObject, retrieveScriptElements, fetchCategoriesAndServices } from '../utils/general';
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
    //{{START: GUI}}
    _dom._htmlDom = doc.documentElement;
    //{{END: GUI}}
    cookie.domain = location.hostname;

    /**
     * Make user configuration globally available
     */
    state._userConfig = userConfig;
    state._allDefinedCategories = userCategories;
    state._allCategoryNames = allCategoryNames;

    //{{START: GUI}}
    state._allTranslations = userConfig.language.translations;
    state._disablePageInteraction = !!userConfig.disablePageInteraction;
    //{{END: GUI}}

    /**
     * Save references to callback functions
     */
    callbacks._onFirstConsent = userConfig.onFirstConsent;
    callbacks._onConsent = userConfig.onConsent;
    callbacks._onChange = userConfig.onChange;

    //{{START: GUI}}
    callbacks._onModalHide = userConfig.onModalHide;
    callbacks._onModalShow = userConfig.onModalShow;
    callbacks._onModalReady = userConfig.onModalReady;
    //{{END: GUI}}

    const {
        mode,
        //{{START: GUI}}
        autoShow,
        lazyHtmlGeneration,
        //{{END: GUI}}
        autoClearCookies,
        revision,
        manageScriptTags,
        hideFromBots,
    } = userConfig;

    if (mode === OPT_OUT_MODE)
        config.mode = mode;

    if (typeof autoClearCookies === 'boolean')
        config.autoClearCookies = autoClearCookies;

    if (typeof manageScriptTags === 'boolean')
        config.manageScriptTags = manageScriptTags;

    if (typeof revision === 'number' && revision >= 0) {
        config.revision = revision;
        state._revisionEnabled = true;
    }

    //{{START: GUI}}

    if (typeof autoShow === 'boolean')
        config.autoShow = autoShow;

    if (typeof lazyHtmlGeneration === 'boolean')
        config.lazyHtmlGeneration = lazyHtmlGeneration;

    //{{END: GUI}}

    if (hideFromBots === false)
        config.hideFromBots = false;

    if (config.hideFromBots === true && nav)
        state._botAgentDetected = (nav.userAgent && /bot|crawl|spider|slurp|teoma/i.test(nav.userAgent)) || nav.webdriver;

    if (isObject(userCookieConfig))
        config.cookie = {...cookie, ...userCookieConfig};

    debug('CookieConsent [CONFIG]: configuration:', userConfig);
    debug('CookieConsent [CONFIG]: autoClearCookies:', config.autoClearCookies);
    debug('CookieConsent [CONFIG]: revision enabled:', state._revisionEnabled);
    debug('CookieConsent [CONFIG]: manageScriptTags:', config.manageScriptTags);

    fetchCategoriesAndServices(allCategoryNames);
    retrieveScriptElements();

    //{{START: GUI}}
    setCurrentLanguageCode(resolveCurrentLanguageCode());
    //{{END: GUI}}
};