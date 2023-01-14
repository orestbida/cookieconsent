import { globalObj } from '../core/global';
import { createNode, setAttribute, elContains, getAttribute, removeAttribute, isFunction } from './general';
import { SCRIPT_TAG_SELECTOR } from './constants';

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
        _allScriptTagsInfo,
        _savedCookieContent,
        _lastChangedCategoryNames,
    } = globalObj._state;

    /**
     * Automatically Enable/Disable internal services
     */
    for(const categoryName of _allCategoryNames){

        const lastChangedServices = _lastChangedServices[categoryName]
            || _acceptedServices[categoryName]
            || [];

        for(const serviceName of lastChangedServices){
            const service = _allDefinedServices[categoryName][serviceName];

            if(!service)
                continue;

            const {onAccept, onReject} = service;

            if(
                !service._enabled
                && elContains(_acceptedServices[categoryName], serviceName)
                && isFunction(onAccept)
            ){
                service._enabled = true;
                onAccept();
            }

            else if(
                service._enabled
                && !elContains(_acceptedServices[categoryName], serviceName)
                && isFunction(onReject)
            ){
                service._enabled = false;
                onReject();
            }

        }
    }

    if(!globalObj._config.manageScriptTags)
        return;

    const scripts = _allScriptTags;
    const acceptedCategories = defaultEnabledCategories
        || _savedCookieContent.categories
        || [];

    /**
     * Load scripts (sequentially), using a recursive function
     * which loops through the scripts array
     * @param {Element[]} scripts scripts to load
     * @param {number} index current script to load
     */
    const loadScriptsHelper = (scripts, index) => {
        if(index < scripts.length){

            const currScript = scripts[index];
            const currScriptInfo = _allScriptTagsInfo[index];
            const currScriptCategory = currScriptInfo._categoryName;
            const currScriptService = currScriptInfo._serviceName;
            const categoryAccepted = elContains(acceptedCategories, currScriptCategory);
            const serviceAccepted = currScriptService
                ? elContains(_acceptedServices[currScriptCategory], currScriptService)
                : false;

            /**
             * Skip script if it was already executed
             */
            if(!currScriptInfo._executed){

                let categoryWasJustEnabled = !currScriptService
                    && !currScriptInfo._runOnDisable
                    && categoryAccepted;

                let serviceWasJustEnabled = currScriptService
                    && !currScriptInfo._runOnDisable
                    && serviceAccepted;

                let categoryWasJustDisabled = !currScriptService
                    && currScriptInfo._runOnDisable
                    && !categoryAccepted
                    && elContains(_lastChangedCategoryNames, currScriptCategory);

                let serviceWasJustDisabled = currScriptService
                    && currScriptInfo._runOnDisable
                    && !serviceAccepted
                    && elContains(_lastChangedServices[currScriptCategory] || [], currScriptService);

                if(
                    categoryWasJustEnabled
                    || categoryWasJustDisabled
                    || serviceWasJustEnabled
                    || serviceWasJustDisabled
                ){

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
                    for(const {nodeName} of currScript.attributes){
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

                    // If script has valid "src" attribute
                    // try loading it sequentially
                    if(src){
                        // load script sequentially => the next script will not be loaded
                        // until the current's script onload event triggers
                        freshScript.onload = freshScript.onerror = () => {
                            loadScriptsHelper(scripts, ++index);
                        };
                    }

                    // Replace current "sleeping" script with the new "revived" one
                    currScript.replaceWith(freshScript);

                    /**
                     * If we managed to get here and src is still set, it means that
                     * the script is loading/loaded sequentially so don't go any further
                     */
                    if(src)
                        return;
                }
            }

            // Go to next script right away
            loadScriptsHelper(scripts, ++index);
        }
    };

    loadScriptsHelper(scripts, 0);
};

/**
 * Keep track of categories enabled by default (useful when mode==OPT_OUT_MODE)
 */
export const retrieveEnabledCategoriesAndServices = () => {
    const state = globalObj._state;

    for(const categoryName of state._allCategoryNames){
        const category = state._allDefinedCategories[categoryName];

        if(category.enabled || category.readOnly){
            state._defaultEnabledCategories.push(categoryName);

            const services = state._allDefinedServices[categoryName] || {};

            for(let serviceName in services){
                state._acceptedServices[categoryName].push(serviceName);
            }
        }
    }
};