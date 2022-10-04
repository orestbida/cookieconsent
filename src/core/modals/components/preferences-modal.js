import { globalObj, _fireEvent } from '../../global';
import {
    _createNode,
    _addClass,
    _addClassPm,
    _setAttribute,
    _removeClass,
    _addEvent,
    _appendChild,
    _getKeys,
    _hasClass,
    _elContains,
    _getModalFocusableData,
    _log
} from '../../../utils/general';

import { _guiManager } from '../../../utils/gui-manager';
import {
    PREFERENCES_MODAL_NAME,
    SCRIPT_TAG_SELECTOR,
    DIV_TAG,
    BUTTON_TAG
} from '../../../utils/constants';

/**
 * Generates preferences modal and appends it to "cc-main" el.
 * @param {import("../../global").Api} api
 */
export const _createPreferencesModal = (api) => {

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
        dom._pmContainer = _createNode(DIV_TAG);
        _addClass(dom._pmContainer, 'pm-wrapper');

        // preferences modal
        dom._pm = _createNode(DIV_TAG);
        dom._pm.style.visibility = 'hidden';

        _addClass(dom._pm, 'pm');
        _setAttribute(dom._pm, 'role', 'dialog');
        _setAttribute(dom._pm, 'aria-hidden', true);
        _setAttribute(dom._pm, 'aria-modal', true);

        // If 'esc' key is pressed inside _preferencesContainer div => hide preferences
        _addEvent(dom._htmlDom, 'keydown', (event) => {
            if (event.keyCode === 27) {
                api.hidePreferences();
            }
        }, true);

        // modal header
        dom._pmHeader = _createNode(DIV_TAG);
        _addClassPm(dom._pmHeader, 'header');

        // modal title
        dom._pmTitle = _createNode(DIV_TAG);
        _addClassPm(dom._pmTitle, 'title');
        _setAttribute(dom._pmTitle, 'role', 'heading');

        dom._pmCloseBtn = _createNode(BUTTON_TAG);
        _addClassPm(dom._pmCloseBtn, 'close-btn');
        _setAttribute(dom._pmCloseBtn, 'aria-label', modalData.closeIconLabel || '');
        _addEvent(dom._pmCloseBtn, 'click', api.hidePreferences);

        // modal body
        dom._pmBody = _createNode(DIV_TAG);
        _addClassPm(dom._pmBody, 'body');

        // modal footer
        dom._pmFooter = _createNode(DIV_TAG);
        _addClassPm(dom._pmFooter, 'footer');

        var _pmBtnContainer = _createNode(DIV_TAG);
        _addClass(_pmBtnContainer, 'btns');

        var _pmBtnGroup1 = _createNode(DIV_TAG);
        var _pmBtnGroup2 = _createNode(DIV_TAG);
        _addClassPm(_pmBtnGroup1, 'btn-group');
        _addClassPm(_pmBtnGroup2, 'btn-group');

        _appendChild(dom._pmFooter, _pmBtnGroup2);
        _appendChild(dom._pmFooter, _pmBtnGroup1);

        _appendChild(dom._pmHeader, dom._pmTitle);
        _appendChild(dom._pmHeader, dom._pmCloseBtn);

        _appendChild(dom._pm, dom._pmHeader);
        _appendChild(dom._pm, dom._pmBody);
        _appendChild(dom._pm, dom._pmFooter);

        _appendChild(dom._pmContainer, dom._pm);
    }else{
        dom._pmNewBody = _createNode(DIV_TAG);
        _addClassPm(dom._pmNewBody, 'body');
    }

    if(titleData){
        dom._pmTitle.innerHTML = titleData;
        closeIconLabelData && _setAttribute(dom._pmCloseBtn, 'aria-label', closeIconLabelData);
    }

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
            sServiceNames = sServices && _getKeys(sServices) || [],
            sIsExpandableToggle = hasToggle && (!!sDescriptionData || !!sCreateCookieTable || _getKeys(sServices).length>0);


        // section
        var s = _createNode(DIV_TAG);
        _addClassPm(s, 'section');

        if(sIsExpandableToggle || sDescriptionData){
            var sDescContainer = _createNode(DIV_TAG);
            _addClassPm(sDescContainer, 'section-desc-wrapper');
        }

        if(sIsExpandableToggle){

            if(sServiceNames.length > 0){

                var servicesContainer = _createNode(DIV_TAG);
                _addClassPm(servicesContainer, 'section-services');

                sServiceNames.forEach(name => {

                    const service = sServices[name];

                    var serviceName = service.label || name;
                    var serviceDiv = _createNode(DIV_TAG);
                    var serviceHeader = _createNode(DIV_TAG);
                    var serviceIconContainer = _createNode(DIV_TAG);
                    var serviceIcon = _createNode('span');
                    var serviceTitle = _createNode(DIV_TAG);

                    _addClassPm(serviceDiv, 'service');
                    _addClassPm(serviceTitle, 'service-title');
                    _addClassPm(serviceIcon, 'code-icon');
                    _addClassPm(serviceHeader, 'service-header');
                    _addClassPm(serviceIconContainer, 'service-icon');

                    var toggleLabel = _createToggleLabel(serviceName, name, sCurrentCategoryObject, true, sLinkedCategory);

                    serviceTitle.innerHTML = serviceName;

                    _appendChild(serviceIconContainer, serviceIcon);
                    _appendChild(serviceHeader, serviceIconContainer);
                    _appendChild(serviceHeader, serviceTitle);
                    _appendChild(serviceDiv, serviceHeader);
                    _appendChild(serviceDiv, toggleLabel);
                    _appendChild(servicesContainer, serviceDiv);
                });

                _appendChild(sDescContainer, servicesContainer);
            }
        }

        if(sTitleData){

            var sTitleContainer = _createNode(DIV_TAG);
            var sTitle = hasToggle ? _createNode(BUTTON_TAG) : _createNode(DIV_TAG);

            _addClassPm(sTitleContainer, 'section-title-wrapper');
            _addClassPm(sTitle, 'section-title');

            sTitle.innerHTML = sTitleData;
            _appendChild(sTitleContainer, sTitle);

            if(hasToggle){

                /**
                 * Arrow icon span
                 */
                var sTitleIcon = _createNode('span');
                _addClassPm(sTitleIcon, 'section-arrow');
                _appendChild(sTitleContainer, sTitleIcon);

                s.className += '--toggle';

                var toggleLabel = _createToggleLabel(sTitleData, sLinkedCategory, sCurrentCategoryObject);

                if(sServiceNames.length > 0){
                    var serviceCounter = _createNode('span');
                    _addClassPm(serviceCounter, 'badge');
                    _addClassPm(serviceCounter, 'service-counter');
                    _setAttribute(serviceCounter, 'aria-hidden', true);
                    _setAttribute(serviceCounter, 'data-servicecounter', sServiceNames.length);

                    var serviceCounterLabel = modalData.serviceCounterLabel;

                    if(serviceCounterLabel && typeof serviceCounterLabel === 'string')
                        _setAttribute(serviceCounter, 'data-counterlabel', serviceCounterLabel);

                    _appendChild(sTitle, serviceCounter);
                }

                if(sIsExpandableToggle){
                    _addClassPm(s, 'section--expandable');
                    var expandableDivId = sLinkedCategory + '-desc';
                    _setAttribute(sTitle, 'aria-expanded', false);
                    _setAttribute(sTitle, 'aria-controls', expandableDivId);
                }

                _appendChild(sTitleContainer, toggleLabel);

            }else{
                _setAttribute(sTitle, 'role', 'heading');
                _setAttribute(sTitle, 'aria-level', '3');
            }

            _appendChild(s, sTitleContainer);
        }

        if(sDescriptionData){
            var sDesc = _createNode(DIV_TAG);
            _addClassPm(sDesc, 'section-desc');

            sDesc.innerHTML = sDescriptionData;

            _appendChild(sDescContainer, sDesc);
        }

        if(sIsExpandableToggle){
            _setAttribute(sDescContainer, 'aria-hidden', 'true');
            sDescContainer.id = expandableDivId;

            /**
             * On button click handle the following :=> aria-expanded, aria-hidden and act class for current section
             */
            ((accordion, section, btn) => {
                _addEvent(sTitle, 'click', () => {
                    if(!_hasClass(section, 'is-expanded')){
                        _addClass(section, 'is-expanded');
                        _setAttribute(btn, 'aria-expanded', 'true');
                        _setAttribute(accordion, 'aria-hidden', 'false');
                    }else{
                        _removeClass(section, 'is-expanded');
                        _setAttribute(btn, 'aria-expanded', 'false');
                        _setAttribute(accordion, 'aria-hidden', 'true');
                    }
                });
            })(sDescContainer, s, sTitle);


            if(sCreateCookieTable){
                var table = _createNode('table');
                var thead = _createNode('thead');
                var tbody = _createNode('tbody');

                _addClassPm(table, 'section-table');
                _addClassPm(thead, 'table-head');
                _addClassPm(tbody, 'table-body');

                var headerData = sCookieTableData.headers;
                var tableHeadersKeys = _getKeys(headerData);

                /**
                 * Create table headers
                 */
                var trHeadFragment = dom._document.createDocumentFragment();
                var trHead = _createNode('tr');
                _setAttribute(trHead, 'role', 'row');

                for(var i=0; i<tableHeadersKeys.length; i++){
                    var headerKey = tableHeadersKeys[i];
                    var headerName = headerData[headerKey];

                    var th = _createNode('th');
                    th.id = 'cc__row-' + headerName;
                    _setAttribute(th, 'role', 'columnheader');
                    _setAttribute(th, 'scope', 'col');
                    _addClassPm(th, 'table-th');

                    th.innerHTML = headerName;
                    _appendChild(trHeadFragment, th);
                }

                _appendChild(trHead, trHeadFragment);
                _appendChild(thead, trHead);

                /**
                 * Create table body
                 */
                var bodyFragment = dom._document.createDocumentFragment();

                for(i=0; i<sCookieTableBody.length; i++){
                    var currentCookieData = sCookieTableBody[i];
                    var tr = _createNode('tr');
                    _setAttribute(tr, 'role', 'row');
                    _addClassPm(tr, 'table-tr');

                    for(var j=0; j<tableHeadersKeys.length; j++){

                        var tdKey = tableHeadersKeys[j];
                        var tdHeaderName = headerData[tdKey];
                        var tdValue = currentCookieData[tdKey];

                        var td = _createNode('td');
                        var tdInner = _createNode(DIV_TAG);
                        _addClassPm(td, 'table-td');
                        _setAttribute(td, 'data-column', tdHeaderName);
                        _setAttribute(td, 'headers', 'cc__row-' + tdHeaderName);

                        tdInner.insertAdjacentHTML('beforeend', tdValue);

                        _appendChild(td, tdInner);
                        _appendChild(tr, td);
                    }

                    _appendChild(bodyFragment, tr);
                }

                _appendChild(tbody, bodyFragment);
                _appendChild(table, thead);
                _appendChild(table, tbody);
                _appendChild(sDescContainer, table);
            }
        }


        if(sIsExpandableToggle || sDescriptionData){
            _appendChild(s, sDescContainer);
        }

        _appendChild(dom._pmBody, s);

        if(dom._pmNewBody)
            _appendChild(dom._pmNewBody, s);
        else
            _appendChild(dom._pmBody, s);
    });

    if(acceptAllBtnData || acceptNecessaryBtnData){

        if(acceptNecessaryBtnData){
            if(!dom._pmAcceptNecessaryBtn){
                dom._pmAcceptNecessaryBtn = _createNode(BUTTON_TAG);
                _addClassPm(dom._pmAcceptNecessaryBtn, 'btn');
                _appendChild(_pmBtnGroup1, dom._pmAcceptNecessaryBtn);
                _addEvent(dom._pmAcceptNecessaryBtn, 'click', () => {
                    acceptHelper([]);
                });
            }

            dom._pmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
        }

        if(acceptAllBtnData){
            if(!dom._pmAcceptAllBtn){
                dom._pmAcceptAllBtn = _createNode(BUTTON_TAG);
                _addClassPm(dom._pmAcceptAllBtn, 'btn');
                _appendChild(_pmBtnGroup1, dom._pmAcceptAllBtn);
                _addEvent(dom._pmAcceptAllBtn, 'click', () => {
                    acceptHelper('all');
                });
            }

            dom._pmAcceptAllBtn.innerHTML = acceptAllBtnData;
        }
    }

    if(savePreferencesBtnData){
        if(!dom._pmSavePreferencesBtn){
            dom._pmSavePreferencesBtn = _createNode(BUTTON_TAG);
            _addClassPm(dom._pmSavePreferencesBtn, 'btn');
            _addClassPm(dom._pmSavePreferencesBtn, 'btn--secondary');
            _appendChild(_pmBtnGroup2, dom._pmSavePreferencesBtn);

            _addEvent(dom._pmSavePreferencesBtn, 'click', () => {
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

    _guiManager(1);

    if(!state._preferencesModalExists){
        state._preferencesModalExists = true;
        _appendChild(dom._ccMain, dom._pmContainer);
        _getModalFocusableData();

        _log('CookieConsent [HTML] created', PREFERENCES_MODAL_NAME);
        _fireEvent(globalObj._customEvents._onModalReady, PREFERENCES_MODAL_NAME);

        /**
         * Enable transition
         */
        setTimeout(() => _addClass(dom._pmContainer, 'c--anim'), 100);
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
function _createToggleLabel(label, value, sCurrentCategoryObject, isService, categoryName){

    const state = globalObj._state;
    const dom = globalObj._dom;

    /**
     * Create category toggle
     */
    var toggleLabel = _createNode('label');
    var toggle = _createNode('input');
    var toggleIcon = _createNode('span');
    var toggleLabelSpan = _createNode('span');

    // These 2 spans will contain each 2 pseudo-elements to generate 'tick' and 'x' icons
    var toggleOnIcon = _createNode('span');
    var toggleOffIcon = _createNode('span');

    toggle.type = 'checkbox';

    _addClass(toggleLabel, 'section__toggle-wrapper');
    _addClass(toggle, 'section__toggle');
    _addClass(toggleOnIcon, 'toggle__icon-on');
    _addClass(toggleOffIcon, 'toggle__icon-off');
    _addClass(toggleIcon, 'toggle__icon');
    _addClass(toggleLabelSpan, 'toggle__label');

    _setAttribute(toggleIcon, 'aria-hidden', 'true');

    if(isService){
        _addClass(toggleLabel, 'toggle-service');
        _addClass(toggle, 'toggle-service');
        _setAttribute(toggle, SCRIPT_TAG_SELECTOR, categoryName);

        // Save reference to toggles to avoid using document.querySelector later on
        dom._serviceCheckboxInputs[categoryName][value] = toggle;
    }else{
        dom._categoryCheckboxInputs[value] = toggle;
    }

    if(!isService){
        ((value)=>{
            _addEvent(toggle, 'click', () => {
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
            _addEvent(toggle, 'change', () => {

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

    toggleLabelSpan.textContent = label;

    _appendChild(toggleIcon, toggleOffIcon);
    _appendChild(toggleIcon, toggleOnIcon);

    /**
     * If consent is valid => retrieve category states from cookie
     * Otherwise use states defined in the userConfig. object
     */
    if(!state._invalidConsent){
        if(isService){
            var enabledServices = state._enabledServices[categoryName];

            if(enabledServices && _elContains(enabledServices, value)){
                toggle.checked = true;
            }

        }else if(_elContains(state._savedCookieContent.categories, value)){
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

    _appendChild(toggleLabel, toggle);
    _appendChild(toggleLabel, toggleIcon);
    _appendChild(toggleLabel, toggleLabelSpan);

    return toggleLabel;
}