import { globalObj, fireEvent } from '../global';
import {
    createNode,
    addClass,
    addClassPm,
    setAttribute,
    removeClass,
    addEvent,
    appendChild,
    getKeys,
    hasClass,
    elContains,
    getModalFocusableData,
    _log
} from '../../utils/general';

import { guiManager } from '../../utils/gui-manager';
import {
    PREFERENCES_MODAL_NAME,
    SCRIPT_TAG_SELECTOR,
    DIV_TAG,
    ARIA_HIDDEN,
    BUTTON_TAG,
    BTN_GROUP_CLASS,
    CLICK_EVENT,
    DATA_ROLE
} from '../../utils/constants';

/**
 * @callback CreateMainContainer
 */

/**
 * Generates preferences modal and appends it to "cc-main" el.
 * @param {import("../../global").Api} api
 * @param {CreateMainContainer} createMainContainer
 */
export const createPreferencesModal = (api, createMainContainer) => {

    const state = globalObj._state;
    const dom = globalObj._dom;

    /**
     * @type {import("../../global").PreferencesModalOptions}
     */
    const modalData = state._currentTranslation && state._currentTranslation.preferencesModal;

    if(!modalData) return;

    var titleData = modalData.title,
        closeIconLabelData = modalData.closeIconLabel,
        acceptAllBtnData = modalData.acceptAllBtn,
        acceptNecessaryBtnData = modalData.acceptNecessaryBtn,
        savePreferencesBtnData = modalData.savePreferencesBtn,
        sectionsData = modalData.sections;

    if(!dom._pmContainer){

        // modal container
        dom._pmContainer = createNode(DIV_TAG);
        addClass(dom._pmContainer, 'pm-wrapper');

        // preferences modal
        dom._pm = createNode(DIV_TAG);
        dom._pm.style.visibility = 'hidden';

        addClass(dom._pm, 'pm');
        setAttribute(dom._pm, 'role', 'dialog');
        setAttribute(dom._pm, ARIA_HIDDEN, true);
        setAttribute(dom._pm, 'aria-modal', true);

        // If 'esc' key is pressed inside _preferencesContainer div => hide preferences
        addEvent(dom._htmlDom, 'keydown', (event) => {
            if (event.keyCode === 27) {
                api.hidePreferences();
            }
        }, true);

        // modal header
        dom._pmHeader = createNode(DIV_TAG);
        addClassPm(dom._pmHeader, 'header');

        // modal title
        dom._pmTitle = createNode(DIV_TAG);
        addClassPm(dom._pmTitle, 'title');
        setAttribute(dom._pmTitle, 'role', 'heading');

        dom._pmCloseBtn = createNode(BUTTON_TAG);
        addClassPm(dom._pmCloseBtn, 'close-btn');
        setAttribute(dom._pmCloseBtn, 'aria-label', modalData.closeIconLabel || '');
        addEvent(dom._pmCloseBtn, CLICK_EVENT, api.hidePreferences);

        // modal body
        dom._pmBody = createNode(DIV_TAG);
        addClassPm(dom._pmBody, 'body');

        // modal footer
        dom._pmFooter = createNode(DIV_TAG);
        addClassPm(dom._pmFooter, 'footer');

        var _pmBtnContainer = createNode(DIV_TAG);
        addClass(_pmBtnContainer, 'btns');

        var _pmBtnGroup1 = createNode(DIV_TAG);
        var _pmBtnGroup2 = createNode(DIV_TAG);
        addClassPm(_pmBtnGroup1, BTN_GROUP_CLASS);
        addClassPm(_pmBtnGroup2, BTN_GROUP_CLASS);

        appendChild(dom._pmFooter, _pmBtnGroup2);
        appendChild(dom._pmFooter, _pmBtnGroup1);

        appendChild(dom._pmHeader, dom._pmTitle);
        appendChild(dom._pmHeader, dom._pmCloseBtn);

        appendChild(dom._pm, dom._pmHeader);
        appendChild(dom._pm, dom._pmBody);
        appendChild(dom._pm, dom._pmFooter);

        appendChild(dom._pmContainer, dom._pm);
    }else{
        dom._pmNewBody = createNode(DIV_TAG);
        addClassPm(dom._pmNewBody, 'body');
    }

    if(titleData){
        dom._pmTitle.innerHTML = titleData;
        closeIconLabelData && setAttribute(dom._pmCloseBtn, 'aria-label', closeIconLabelData);
    }

    let sectionToggleContainer;

    sectionsData && sectionsData.forEach(section => {

        var sTitleData = section.title,
            sDescriptionData = section.description,
            sLinkedCategory = section.linkedCategory,
            sCurrentCategoryObject = sLinkedCategory && state._allDefinedCategories[sLinkedCategory],
            sCookieTableData = section.cookieTable,
            sCookieTableBody = sCookieTableData && sCookieTableData.body,
            sCreateCookieTable = sCookieTableBody && sCookieTableBody.length > 0,
            hasToggle = !!sCurrentCategoryObject,
            sServices = hasToggle && state._allDefinedServices[sLinkedCategory] || false,
            sServiceNames = sServices && getKeys(sServices) || [],
            sIsExpandableToggle = hasToggle && (!!sDescriptionData || !!sCreateCookieTable || getKeys(sServices).length>0);


        // section
        var s = createNode(DIV_TAG);
        addClassPm(s, 'section');

        if(sIsExpandableToggle || sDescriptionData){
            var sDescContainer = createNode(DIV_TAG);
            addClassPm(sDescContainer, 'section-desc-wrapper');
        }

        let nServices = sServiceNames.length;

        if(sIsExpandableToggle){

            if(nServices > 0){

                var servicesContainer = createNode(DIV_TAG);
                addClassPm(servicesContainer, 'section-services');

                sServiceNames.forEach(name => {

                    const service = sServices[name];

                    var serviceName = service.label || name;
                    var serviceDiv = createNode(DIV_TAG);
                    var serviceHeader = createNode(DIV_TAG);
                    var serviceIconContainer = createNode(DIV_TAG);
                    var serviceTitle = createNode(DIV_TAG);

                    addClassPm(serviceDiv, 'service');
                    addClassPm(serviceTitle, 'service-title');
                    addClassPm(serviceHeader, 'service-header');
                    addClassPm(serviceIconContainer, 'service-icon');

                    var toggleLabel = createToggleLabel(serviceName, name, sCurrentCategoryObject, true, sLinkedCategory);

                    serviceTitle.innerHTML = serviceName;

                    appendChild(serviceHeader, serviceIconContainer);
                    appendChild(serviceHeader, serviceTitle);
                    appendChild(serviceDiv, serviceHeader);
                    appendChild(serviceDiv, toggleLabel);
                    appendChild(servicesContainer, serviceDiv);
                });

                appendChild(sDescContainer, servicesContainer);
            }
        }

        if(sTitleData){

            var sTitleContainer = createNode(DIV_TAG);

            var sTitle = hasToggle
                ? createNode(BUTTON_TAG)
                : createNode(DIV_TAG);

            addClassPm(sTitleContainer, 'section-title-wrapper');
            addClassPm(sTitle, 'section-title');

            sTitle.innerHTML = sTitleData;
            appendChild(sTitleContainer, sTitle);

            if(hasToggle){

                /**
                 * Arrow icon span
                 */
                var sTitleIcon = createNode('span');
                addClassPm(sTitleIcon, 'section-arrow');
                appendChild(sTitleContainer, sTitleIcon);

                s.className += '--toggle';

                var toggleLabel = createToggleLabel(sTitleData, sLinkedCategory, sCurrentCategoryObject);

                let serviceCounterLabel = modalData.serviceCounterLabel;

                if(nServices > 0 && typeof serviceCounterLabel === 'string'){
                    let serviceCounter = createNode('span');

                    addClassPm(serviceCounter, 'badge');
                    addClassPm(serviceCounter, 'service-counter');
                    setAttribute(serviceCounter, ARIA_HIDDEN, true);
                    setAttribute(serviceCounter, 'data-servicecounter', nServices);

                    if(serviceCounterLabel){
                        serviceCounterLabel = serviceCounterLabel.split('|');

                        if(serviceCounterLabel.length > 1 && nServices > 1)
                            serviceCounterLabel = serviceCounterLabel[1];
                        else
                            serviceCounterLabel = serviceCounterLabel[0];

                        setAttribute(serviceCounter, 'data-counterlabel', serviceCounterLabel);
                    }

                    serviceCounter.innerHTML = nServices + (serviceCounterLabel
                        ? ' ' + serviceCounterLabel
                        : '');

                    appendChild(sTitle, serviceCounter);
                }

                if(sIsExpandableToggle){
                    addClassPm(s, 'section--expandable');
                    var expandableDivId = sLinkedCategory + '-desc';
                    setAttribute(sTitle, 'aria-expanded', false);
                    setAttribute(sTitle, 'aria-controls', expandableDivId);
                }

                appendChild(sTitleContainer, toggleLabel);

            }else{
                setAttribute(sTitle, 'role', 'heading');
                setAttribute(sTitle, 'aria-level', '3');
            }

            appendChild(s, sTitleContainer);
        }

        if(sDescriptionData){
            var sDesc = createNode(DIV_TAG);
            addClassPm(sDesc, 'section-desc');

            sDesc.innerHTML = sDescriptionData;

            appendChild(sDescContainer, sDesc);
        }

        if(sIsExpandableToggle){
            setAttribute(sDescContainer, ARIA_HIDDEN, 'true');
            sDescContainer.id = expandableDivId;

            /**
             * On button click handle the following :=> aria-expanded, aria-hidden and act class for current section
             */
            ((accordion, section, btn) => {
                addEvent(sTitle, CLICK_EVENT, () => {
                    if(!hasClass(section, 'is-expanded')){
                        addClass(section, 'is-expanded');
                        setAttribute(btn, 'aria-expanded', 'true');
                        setAttribute(accordion, ARIA_HIDDEN, 'false');
                    }else{
                        removeClass(section, 'is-expanded');
                        setAttribute(btn, 'aria-expanded', 'false');
                        setAttribute(accordion, ARIA_HIDDEN, 'true');
                    }
                });
            })(sDescContainer, s, sTitle);


            if(sCreateCookieTable){
                var table = createNode('table');
                var thead = createNode('thead');
                var tbody = createNode('tbody');

                addClassPm(table, 'section-table');
                addClassPm(thead, 'table-head');
                addClassPm(tbody, 'table-body');

                var headerData = sCookieTableData.headers;
                var tableHeadersKeys = getKeys(headerData);

                /**
                 * Create table headers
                 */
                var trHeadFragment = dom._document.createDocumentFragment();
                var trHead = createNode('tr');
                setAttribute(trHead, 'role', 'row');

                for(var i=0; i<tableHeadersKeys.length; i++){
                    var headerKey = tableHeadersKeys[i];
                    var headerName = headerData[headerKey];

                    var th = createNode('th');
                    th.id = 'cc__row-' + headerName;
                    setAttribute(th, 'role', 'columnheader');
                    setAttribute(th, 'scope', 'col');
                    addClassPm(th, 'table-th');

                    th.innerHTML = headerName;
                    appendChild(trHeadFragment, th);
                }

                appendChild(trHead, trHeadFragment);
                appendChild(thead, trHead);

                /**
                 * Create table body
                 */
                var bodyFragment = dom._document.createDocumentFragment();

                for(i=0; i<sCookieTableBody.length; i++){
                    var currentCookieData = sCookieTableBody[i];
                    var tr = createNode('tr');
                    setAttribute(tr, 'role', 'row');
                    addClassPm(tr, 'table-tr');

                    for(var j=0; j<tableHeadersKeys.length; j++){

                        var tdKey = tableHeadersKeys[j];
                        var tdHeaderName = headerData[tdKey];
                        var tdValue = currentCookieData[tdKey];

                        var td = createNode('td');
                        var tdInner = createNode(DIV_TAG);
                        addClassPm(td, 'table-td');
                        setAttribute(td, 'data-column', tdHeaderName);
                        setAttribute(td, 'headers', 'cc__row-' + tdHeaderName);

                        tdInner.insertAdjacentHTML('beforeend', tdValue);

                        appendChild(td, tdInner);
                        appendChild(tr, td);
                    }

                    appendChild(bodyFragment, tr);
                }

                appendChild(tbody, bodyFragment);
                appendChild(table, thead);
                appendChild(table, tbody);
                appendChild(sDescContainer, table);
            }
        }

        if(sIsExpandableToggle || sDescriptionData)
            appendChild(s, sDescContainer);

        const currentBody = dom._pmNewBody || dom._pmBody;

        if(hasToggle){
            if(!sectionToggleContainer){
                sectionToggleContainer = createNode(DIV_TAG);
                addClassPm(sectionToggleContainer, 'section-toggles');
            }
            sectionToggleContainer.appendChild(s);
        }else{
            sectionToggleContainer = null;
        }

        appendChild(currentBody, sectionToggleContainer || s);

    });

    if(acceptAllBtnData || acceptNecessaryBtnData){

        if(acceptNecessaryBtnData){
            if(!dom._pmAcceptNecessaryBtn){
                dom._pmAcceptNecessaryBtn = createNode(BUTTON_TAG);
                addClassPm(dom._pmAcceptNecessaryBtn, 'btn');
                setAttribute(dom._pmAcceptNecessaryBtn, DATA_ROLE, 'necessary');
                appendChild(_pmBtnGroup1, dom._pmAcceptNecessaryBtn);
                addEvent(dom._pmAcceptNecessaryBtn, CLICK_EVENT, () => {
                    acceptHelper([]);
                });
            }

            dom._pmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
        }

        if(acceptAllBtnData){
            if(!dom._pmAcceptAllBtn){
                dom._pmAcceptAllBtn = createNode(BUTTON_TAG);
                addClassPm(dom._pmAcceptAllBtn, 'btn');
                setAttribute(dom._pmAcceptAllBtn, DATA_ROLE, 'all');
                appendChild(_pmBtnGroup1, dom._pmAcceptAllBtn);
                addEvent(dom._pmAcceptAllBtn, CLICK_EVENT, () => {
                    acceptHelper('all');
                });
            }

            dom._pmAcceptAllBtn.innerHTML = acceptAllBtnData;
        }
    }

    if(savePreferencesBtnData){
        if(!dom._pmSavePreferencesBtn){
            dom._pmSavePreferencesBtn = createNode(BUTTON_TAG);
            addClassPm(dom._pmSavePreferencesBtn, 'btn');
            addClassPm(dom._pmSavePreferencesBtn, 'btn--secondary');
            setAttribute(dom._pmSavePreferencesBtn, DATA_ROLE, 'save');
            appendChild(_pmBtnGroup2, dom._pmSavePreferencesBtn);

            addEvent(dom._pmSavePreferencesBtn, CLICK_EVENT, () => {
                acceptHelper();
            });
        }

        dom._pmSavePreferencesBtn.innerHTML = savePreferencesBtnData;
    }

    function acceptHelper(acceptType){
        api.acceptCategory(acceptType);
        api.hidePreferences();
        api.hide();
    }

    if(dom._pmNewBody) {
        dom._pm.replaceChild(dom._pmNewBody, dom._pmBody);
        dom._pmBody = dom._pmNewBody;
    }

    guiManager(1);

    if(!state._preferencesModalExists){
        state._preferencesModalExists = true;

        _log('CookieConsent [HTML] created', PREFERENCES_MODAL_NAME);

        fireEvent(globalObj._customEvents._onModalReady, PREFERENCES_MODAL_NAME, dom._pm);
        getModalFocusableData();
        createMainContainer(api);
        appendChild(dom._ccMain, dom._pmContainer);

        /**
         * Enable transition
         */
        setTimeout(() => addClass(dom._pmContainer, 'cc--anim'), 100);
    }
};

/**
 * Generate toggle
 * @param {string} label block title
 * @param {string} value category/service
 * @param {import('../../global').Category} sCurrentCategoryObject
 * @param {boolean} [isService]
 * @param {string} [categoryName]
 */
function createToggleLabel(label, value, sCurrentCategoryObject, isService, categoryName){

    const state = globalObj._state;
    const dom = globalObj._dom;

    /**
     * Create category toggle
     */
    var toggleLabel = createNode('label');
    var toggle = createNode('input');
    var toggleIcon = createNode('span');
    var toggleLabelSpan = createNode('span');

    // These 2 spans will contain each 2 pseudo-elements to generate 'tick' and 'x' icons
    var toggleOnIcon = createNode('span');
    var toggleOffIcon = createNode('span');

    toggle.type = 'checkbox';

    addClass(toggleLabel, 'section__toggle-wrapper');
    addClass(toggle, 'section__toggle');
    addClass(toggleOnIcon, 'toggle__icon-on');
    addClass(toggleOffIcon, 'toggle__icon-off');
    addClass(toggleIcon, 'toggle__icon');
    addClass(toggleLabelSpan, 'toggle__label');

    setAttribute(toggleIcon, ARIA_HIDDEN, 'true');

    if(isService){
        addClass(toggleLabel, 'toggle-service');
        addClass(toggle, 'toggle-service');
        setAttribute(toggle, SCRIPT_TAG_SELECTOR, categoryName);

        // Save reference to toggles to avoid using document.querySelector later on
        dom._serviceCheckboxInputs[categoryName][value] = toggle;
    }else{
        dom._categoryCheckboxInputs[value] = toggle;
    }

    if(!isService){
        ((value)=>{
            addEvent(toggle, CLICK_EVENT, () => {
                var categoryServicesToggles = dom._serviceCheckboxInputs[value];

                state._customServicesSelection[value] = [];

                if(toggle.checked){
                    for(var serviceName in categoryServicesToggles){
                        categoryServicesToggles[serviceName].checked = true;
                    }
                }else{
                    for(serviceName in categoryServicesToggles){
                        categoryServicesToggles[serviceName].checked = false;
                    }
                }
            });
        })(value);
    }else{

        ((categoryName)=>{
            addEvent(toggle, 'change', () => {

                var categoryServicesToggles = dom._serviceCheckboxInputs[categoryName];
                var categoryToggle = dom._categoryCheckboxInputs[categoryName];

                state._customServicesSelection[categoryName] = [];

                for(var serviceName in categoryServicesToggles){
                    const serviceInput = categoryServicesToggles[serviceName];
                    if(serviceInput.checked){
                        state._customServicesSelection[categoryName].push(serviceInput.value);
                    }
                }

                if(state._customServicesSelection[categoryName].length > 0){
                    categoryToggle.checked = true;
                }else{
                    categoryToggle.checked = false;
                }
            });
        })(categoryName);

    }

    toggle.value = value;

    toggleLabelSpan.textContent = label.replace(/<.*>.*<\/.*>/gm, '');

    appendChild(toggleIcon, toggleOffIcon);
    appendChild(toggleIcon, toggleOnIcon);

    /**
     * If consent is valid => retrieve category states from cookie
     * Otherwise use states defined in the userConfig. object
     */
    if(!state._invalidConsent){
        if(isService){
            var enabledServices = state._enabledServices[categoryName];

            if(sCurrentCategoryObject.readOnly || elContains(enabledServices, value)){
                toggle.checked = true;
            }

        }else if(elContains(state._acceptedCategories, value)){
            toggle.checked = true;
        }
    }else if(sCurrentCategoryObject.enabled || sCurrentCategoryObject.readOnly){
        toggle.checked = true;
    }

    /**
     * Set toggle as readonly if true (disable checkbox)
     */
    if(sCurrentCategoryObject.readOnly){
        toggle.disabled = true;
    }

    appendChild(toggleLabel, toggle);
    appendChild(toggleLabel, toggleIcon);
    appendChild(toggleLabel, toggleLabelSpan);

    return toggleLabel;
}