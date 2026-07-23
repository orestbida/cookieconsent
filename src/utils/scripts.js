import { globalObj } from '../core/global';
import { createNode, setAttribute, getAttribute, removeAttribute, querySelectorAll } from './dom';
import { isFunction } from './type-guards';
import { elContains } from './collections';
import { isGpcOptOutActive, isCategoryAlwaysEnabled } from './category-service-logic';
import { SCRIPT_TAG_SELECTOR, OPT_OUT_MODE } from './constants';

/**
 * @param {string} type
 */
const validMimeType = type => ['text/javascript', 'module'].includes(type);

/**
 * Retrieves all script elements with 'data-category' attribute
 * and save the following attributes: category-name and service
 */
export const retrieveScriptElements = () => {
    if (!globalObj._config.manageScriptTags)
        return;

    const state = globalObj._state;

    /**
     * @type {NodeListOf<HTMLScriptElement>}
     */
    const scripts = querySelectorAll(document, 'script[' + SCRIPT_TAG_SELECTOR +']');

    for (const scriptTag of scripts) {
        let scriptCategoryName = getAttribute(scriptTag, SCRIPT_TAG_SELECTOR);
        let scriptServiceName = scriptTag.dataset.service || '';
        let runOnDisable = false;

        /**
         * Remove the '!' char if it is present
         */
        if (scriptCategoryName && scriptCategoryName.charAt(0) === '!') {
            scriptCategoryName = scriptCategoryName.slice(1);
            runOnDisable = true;
        }

        if (scriptServiceName.charAt(0) === '!') {
            scriptServiceName = scriptServiceName.slice(1);
            runOnDisable = true;
        }

        if (elContains(state._allCategoryNames, scriptCategoryName)) {
            state._allScriptTags.push({
                _script: scriptTag,
                _executed: false,
                _runOnDisable: runOnDisable,
                _categoryName: scriptCategoryName,
                _serviceName: scriptServiceName
            });

            if (scriptServiceName) {
                const categoryServices = state._allDefinedServices[scriptCategoryName];
                if (!categoryServices[scriptServiceName]) {
                    categoryServices[scriptServiceName] = {
                        _enabled: false
                    };
                }
            }
        }
    }
};

/**
 * Resolve once the script's onload/onerror event fires
 * @param {HTMLScriptElement} script
 * @returns {Promise<void>}
 */
const waitForScriptLoad = (script) => new Promise((resolve) => {
    script.onload = script.onerror = () => resolve();
});

/**
 * This function handles the loading/activation logic of the already
 * existing scripts based on the current accepted cookie categories
 *
 * @param {string[]} [defaultEnabledCategories]
 */
export const manageExistingScripts = (defaultEnabledCategories) => {
    const {
        _acceptedServices,
        _lastChangedServices,
        _allCategoryNames,
        _allDefinedServices,
        _allScriptTags,
        _savedCookieContent,
        _lastChangedCategoryNames,
    } = globalObj._state;

    /**
     * Automatically Enable/Disable internal services
     */
    for (const categoryName of _allCategoryNames) {
        const lastChangedServices = _lastChangedServices[categoryName]
            || _acceptedServices[categoryName]
            || [];

        for (const serviceName of lastChangedServices) {
            const service = _allDefinedServices[categoryName][serviceName];

            if (!service)
                continue;

            const { onAccept, onReject } = service;

            if (
                !service._enabled
                && elContains(_acceptedServices[categoryName], serviceName)
            ) {
                service._enabled = true;
                isFunction(onAccept) && onAccept();
            }

            else if (
                service._enabled
                && !elContains(_acceptedServices[categoryName], serviceName)
            ) {
                service._enabled = false;
                isFunction(onReject) && onReject();
            }
        }
    }

    if (!globalObj._config.manageScriptTags)
        return;

    const acceptedCategories = defaultEnabledCategories
        || _savedCookieContent.categories
        || [];

    /**
     * Load scripts sequentially: the next script only starts
     * loading once the current one's onload/onerror event fires
     */
    const loadScriptsSequentially = async () => {
        for (const currScriptInfo of _allScriptTags) {
            /**
             * Skip script if it was already executed
             */
            if (currScriptInfo._executed)
                continue;

            const currScript = currScriptInfo._script;
            const currScriptCategory = currScriptInfo._categoryName;
            const currScriptService = currScriptInfo._serviceName;
            const categoryAccepted = elContains(acceptedCategories, currScriptCategory);
            const serviceAccepted = currScriptService
                ? elContains(_acceptedServices[currScriptCategory], currScriptService)
                : false;

            const categoryWasJustEnabled = () => !currScriptService
                && !currScriptInfo._runOnDisable
                && categoryAccepted;

            const serviceWasJustEnabled = () => currScriptService
                && !currScriptInfo._runOnDisable
                && serviceAccepted;

            const categoryWasJustDisabled = () => !currScriptService
                && currScriptInfo._runOnDisable
                && !categoryAccepted
                && elContains(_lastChangedCategoryNames, currScriptCategory);

            const serviceWasJustDisabled = () => currScriptService
                && currScriptInfo._runOnDisable
                && !serviceAccepted
                && elContains(_lastChangedServices[currScriptCategory] || [], currScriptService);

            const shouldRunScript =
                categoryWasJustEnabled()
                || categoryWasJustDisabled()
                || serviceWasJustEnabled()
                || serviceWasJustDisabled();

            if (!shouldRunScript)
                continue;

            currScriptInfo._executed = true;
            const dataType = getAttribute(currScript, 'type', true);

            removeAttribute(currScript, 'type', !!dataType);
            removeAttribute(currScript, SCRIPT_TAG_SELECTOR);

            // Get current script data-src (if there is one)
            let src = getAttribute(currScript, 'src', true);

            // Some scripts (like ga) might throw warning if data-src is present
            src && removeAttribute(currScript, 'src', true);

            /**
             * Fresh script
             * @type {HTMLScriptElement}
             */
            const freshScript = createNode('script');

            freshScript.textContent = currScript.innerHTML;

            //Copy attributes over to the new "revived" script
            for (const {nodeName} of currScript.attributes) {
                setAttribute(
                    freshScript,
                    nodeName,
                    currScript[nodeName] || getAttribute(currScript, nodeName)
                );
            }

            /**
             * Set custom type
             */
            dataType && (freshScript.type = dataType);

            // Set src (if data-src found)
            src
                ? (freshScript.src = src)
                : (src = currScript.src);

            const externalScript = !!src && (dataType ? validMimeType(dataType) : true);

            // If script has a valid "src" attribute, wait for it to
            // load/error out before moving on to the next script
            const scriptLoaded = externalScript
                ? waitForScriptLoad(freshScript)
                : null;

            // Replace current "sleeping" script with the new "revived" one
            currScript.replaceWith(freshScript);

            if (scriptLoaded)
                await scriptLoaded;
        }
    };

    loadScriptsSequentially();
};

/**
 * Keep track of categories enabled by default (useful when mode==OPT_OUT_MODE)
 */
export const retrieveEnabledCategoriesAndServices = () => {
    const state = globalObj._state;

    for (const categoryName of state._allCategoryNames) {
        const category = state._allDefinedCategories[categoryName];

        if (isCategoryAlwaysEnabled(category) || (category.enabled && !isGpcOptOutActive())) {
            state._defaultEnabledCategories.push(categoryName);
            const services = state._allDefinedServices[categoryName] || {};

            for (let serviceName in services) {
                state._enabledServices[categoryName].push(serviceName);
                if (state._userConfig.mode === OPT_OUT_MODE) {
                    state._acceptedServices[categoryName].push(serviceName);
                }
            }
        }
    }
};
