import { globalObj, isFunction} from '../core/global';
import { createNode, setAttribute, elContains } from './general';
import { SCRIPT_TAG_SELECTOR } from './constants';

/**
 * This function handles the loading/activation logic of the already
 * existing scripts based on the current accepted cookie categories
 *
 * @param {string[]} [mustEnableCategories]
 */
export const manageExistingScripts = (mustEnableCategories) => {

    const state = globalObj._state;
    const enabledServices = state._enabledServices;

    /**
     * Automatically Enable/Disable internal services
     */
    state._allCategoryNames.forEach(categoryName => {
        const lastChangedServices = state._lastChangedServices[categoryName] || state._enabledServices[categoryName] || [];

        lastChangedServices.forEach(serviceName => {
            const service = state._allDefinedServices[categoryName][serviceName];

            if(
                !service.enabled
                && elContains(state._enabledServices[categoryName], serviceName)
                && isFunction(service.onAccept)
            ){
                service.enabled = true;
                service.onAccept();
            }

            else if(
                service.enabled
                && !elContains(state._enabledServices[categoryName], serviceName)
                && isFunction(service.onReject)
            ){
                service.enabled = false;
                service.onReject();
            }

        });
    });

    if(!globalObj._config.manageScriptTags) return;

    var scripts = state._allScriptTags;
    var acceptedCategories = mustEnableCategories || state._savedCookieContent.categories || [];

    /**
     * Load scripts (sequentially), using a recursive function
     * which loops through the scripts array
     * @param {Element[]} scripts scripts to load
     * @param {number} index current script to load
     */
    var loadScriptsHelper = (scripts, index) => {
        if(index < scripts.length){

            var currScript = scripts[index];

            var currScriptInfo = state._allScriptTagsInfo[index];
            var currScriptCategory = currScriptInfo._categoryName;
            var currScriptService = currScriptInfo._serviceName;
            var categoryAccepted = elContains(acceptedCategories, currScriptCategory);
            var serviceAccepted = currScriptService ? elContains(enabledServices[currScriptCategory], currScriptService) : false;

            /**
             * Skip script if it was already executed
             */
            if(!currScriptInfo._executed){

                var categoryWasJustEnabled = !currScriptService && !currScriptInfo._runOnDisable && categoryAccepted;
                var serviceWasJustEnabled = currScriptService && !currScriptInfo._runOnDisable && serviceAccepted;
                var categoryWasJustDisabled = !currScriptService && currScriptInfo._runOnDisable && !categoryAccepted && elContains(state._lastChangedCategoryNames, currScriptCategory);
                var serviceWasJustDisabled = currScriptService && currScriptInfo._runOnDisable && !serviceAccepted && elContains(state._lastChangedServices[currScriptCategory] || [], currScriptService);

                if(
                    categoryWasJustEnabled
                    || categoryWasJustDisabled
                    || serviceWasJustEnabled
                    || serviceWasJustDisabled
                ){

                    currScriptInfo._executed = true;

                    currScript.removeAttribute('type');
                    currScript.removeAttribute(SCRIPT_TAG_SELECTOR);

                    // Get current script data-src (if there is one)
                    var src = currScript.getAttribute('data-src');

                    // Some scripts (like ga) might throw warning if data-src is present
                    src && currScript.removeAttribute('data-src');

                    // Create a "fresh" script (with the same code)
                    var freshScript = createNode('script');
                    freshScript.textContent = currScript.innerHTML;

                    // Copy attributes over to the new "revived" script
                    ((destination, source) => {
                        var attributes = source.attributes;
                        var len = attributes.length;
                        for(var i=0; i<len; i++){
                            var attrName = attributes[i].nodeName;
                            setAttribute(destination, attrName , source[attrName] || source.getAttribute(attrName));
                        }
                    })(freshScript, currScript);

                    // Set src (if data-src found)
                    src ? (freshScript.src = src) : (src = currScript.src);

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
                    if(src) return;
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

    state._allCategoryNames.forEach(categoryName => {
        const category = state._allDefinedCategories[categoryName];

        if(category.enabled){
            state._defaultEnabledCategories.push(categoryName);

            const services = state._allDefinedServices[categoryName] || {};

            for(var serviceName in services){
                state._enabledServices[categoryName].push(serviceName);
            }
        }
    });
};