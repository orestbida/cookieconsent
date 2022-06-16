/* eslint-disable no-unreachable */
import { state, dom, scriptTagSelector } from '../../global';
import { _createNode, _addClass, _setAttribute, _removeClass, _addEvent, _appendChild,  _getKeys, _hasClass, _elContains } from '../../../utils/general';
import { _guiManager } from '../../../utils/gui-manager';

/**
 * Generates the preferences modal's html and appends it to "cc-main" el.
 * @param {import("../../global").Api} api
 * @returns {void}
 */
export const _createPreferencesModal = (api) => {

    /**
     * @type {import("../../global").PreferencesModal}
     */
    var modalData = state._currentTranslation.preferencesModal;

    if(!modalData) return;

    var titleData = modalData.title,
        closeIconLabelData = modalData.closeIconLabel,
        acceptAllBtnData = modalData.acceptAllBtn,
        acceptNecessaryBtnData = modalData.acceptNecessaryBtn,
        savePreferencesBtnData = modalData.savePreferencesBtn,
        sectionsData = modalData.sections;

    if(!dom._pmContainer){

        // modal container
        dom._pmContainer = _createNode('div');
        _addClass(dom._pmContainer, 'pm-wrapper');

        // preferences modal
        dom._pm = _createNode('div');
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
        dom._pmHeader = _createNode('div');
        _addClass(dom._pmHeader, 'pm__header');

        // modal title
        dom._pmTitle = _createNode('div');
        _addClass(dom._pmTitle, 'pm__title');
        _setAttribute(dom._pmTitle, 'role', 'heading');

        dom._pmCloseBtn = _createNode('button');
        _addClass(dom._pmCloseBtn, 'pm__close-btn');
        _setAttribute(dom._pmCloseBtn, 'aria-label', modalData.closeIconLabel || '');
        _addEvent(dom._pmCloseBtn, 'click', ()=>{api.hidePreferences();});

        // modal body
        dom._pmBody = _createNode('div');
        _addClass(dom._pmBody, 'pm__body');

        // modal footer
        dom._pmFooter = _createNode('div');
        _addClass(dom._pmFooter, 'pm__footer');

        var _pmBtnContainer = _createNode('div');
        _addClass(_pmBtnContainer, 'pm__btns');

        var _pmBtnGroup1 = _createNode('div');
        var _pmBtnGroup2 = _createNode('div');
        _addClass(_pmBtnGroup1, 'pm__btn-group');
        _addClass(_pmBtnGroup2, 'pm__btn-group');

        _appendChild(dom._pmFooter, _pmBtnGroup2);
        _appendChild(dom._pmFooter, _pmBtnGroup1);

        _appendChild(dom._pmHeader, dom._pmTitle);
        _appendChild(dom._pmHeader, dom._pmCloseBtn);

        _appendChild(dom._pm, dom._pmHeader);
        _appendChild(dom._pm, dom._pmBody);
        _appendChild(dom._pm, dom._pmFooter);

        _appendChild(dom._pmContainer, dom._pm);
        _appendChild(dom._ccMain, dom._pmContainer);
    }else{
        dom._pmNewBody = _createNode('div');
        _addClass(dom._pmNewBody, 'pm__body');
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
        var s = _createNode('div');
        _addClass(s, 'pm__section');

        if(sIsExpandableToggle || sDescriptionData){
            var sDescContainer = _createNode('div');
            _addClass(sDescContainer, 'pm__section-desc-wrapper');
        }

        if(sIsExpandableToggle){

            if(sServiceNames.length > 0){

                var servicesContainer = _createNode('div');
                _addClass(servicesContainer, 'pm__section-services');

                sServiceNames.forEach(name => {

                    const service = sServices[name];

                    var serviceName = service.label || name;
                    var serviceDiv = _createNode('div');
                    var serviceHeader = _createNode('div');
                    var serviceIconContainer = _createNode('div');
                    var serviceIcon = _createNode('span');
                    var serviceTitle = _createNode('div');

                    _addClass(serviceDiv, 'pm__service');
                    _addClass(serviceTitle, 'pm__service-title');
                    _addClass(serviceIcon, 'gg-code-slash');
                    _addClass(serviceHeader, 'pm__service-header');
                    _addClass(serviceIconContainer, 'pm__service-icon');

                    var toggleLabel = _createToggleLabel(serviceName, name, sCurrentCategoryObject, null, true, sLinkedCategory);

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

            var sTitleContainer = _createNode('div');
            var sTitle = hasToggle ? _createNode('button') : _createNode('div');

            _addClass(sTitleContainer, 'pm__section-title-wrapper');
            _addClass(sTitle, 'pm__section-title');

            sTitle.innerHTML = sTitleData;
            _appendChild(sTitleContainer, sTitle);

            if(hasToggle){
                s.className += '--toggle';

                var toggleLabel = _createToggleLabel(sTitleData, sLinkedCategory, sCurrentCategoryObject, servicesContainer);

                if(sServiceNames.length > 0){
                    var serviceCounter = _createNode('span');
                    _addClass(serviceCounter, 'pm__service-counter');
                    _setAttribute(serviceCounter, 'aria-hidden', true);
                    _setAttribute(serviceCounter, 'data-servicecounter', sServiceNames.length);

                    var serviceCounterLabel = modalData.serviceCounterLabel;

                    if(serviceCounterLabel && typeof serviceCounterLabel === 'string')
                        _setAttribute(serviceCounter, 'data-counterlabel', serviceCounterLabel);

                    _appendChild(sTitle, serviceCounter);
                }

                if(sIsExpandableToggle){
                    _addClass(s, 'pm__section--expandable');
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
            var sDesc = _createNode('div');
            _addClass(sDesc, 'pm__section-desc');

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
                }, false);
            })(sDescContainer, s, sTitle);


            if(sCreateCookieTable){
                var table = _createNode('table');
                var thead = _createNode('thead');
                var tbody = _createNode('tbody');

                _addClass(table, 'pm__section-table');
                _addClass(thead, 'pm__table-head');
                _addClass(tbody, 'pm__table-body');

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
                    _addClass(th, 'pm__table-th');

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
                    _addClass(tr, 'pm__table-tr');

                    for(var j=0; j<tableHeadersKeys.length; j++){

                        var tdKey = tableHeadersKeys[j];
                        var tdHeaderName = headerData[tdKey];
                        var tdValue = currentCookieData[tdKey];

                        var td = _createNode('td');
                        var tdInner = _createNode('div');
                        _addClass(td, 'pm__table-td');
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
                dom._pmAcceptNecessaryBtn = _createNode('button');
                _addClass(dom._pmAcceptNecessaryBtn, 'pm__btn');
                _appendChild(_pmBtnGroup1, dom._pmAcceptNecessaryBtn);
                _addEvent(dom._pmAcceptNecessaryBtn, 'click', () => {
                    acceptHelper([]);
                });
            }

            dom._pmAcceptNecessaryBtn.innerHTML = acceptNecessaryBtnData;
        }

        if(acceptAllBtnData){
            if(!dom._pmAcceptAllBtn){
                dom._pmAcceptAllBtn = _createNode('button');
                _addClass(dom._pmAcceptAllBtn, 'pm__btn');
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
            dom._pmSavePreferencesBtn = _createNode('button');
            dom._pmSavePreferencesBtn.className = 'pm__btn pm__btn--secondary';
            _appendChild(_pmBtnGroup2, dom._pmSavePreferencesBtn);

            _addEvent(dom._pmSavePreferencesBtn, 'click', () => {
                acceptHelper();
            });
        }

        dom._pmSavePreferencesBtn.innerHTML = savePreferencesBtnData;
    }

    function acceptHelper(acceptType){
        api.accept(acceptType);
        api.hidePreferences();
        api.hide();
    }

    if(dom._pmNewBody) {
        dom._pm.replaceChild(dom._pmNewBody, dom._pmBody);
        dom._pmBody = dom._pmNewBody;
    }

    _guiManager(1);
};

/**
 * Generate toggle
 * @param {string} label block title
 * @param {string} value category/service
 * @param {import('../../global').Category} sCurrentCategoryObject
 * @param {boolean} [isService]
 * @param {string} [categoryName]
 * @param {HTMLElement} [servicesContainer]
 */
function _createToggleLabel(label, value, sCurrentCategoryObject, servicesContainer, isService, categoryName){

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
        _setAttribute(toggle, scriptTagSelector, categoryName);

        // Save reference to toggles to avoid using document.querySelector later on
        dom._serviceCheckboxInputs[categoryName][value] = toggle;
    }else{
        dom._categoryCheckboxInputs[value] = toggle;
    }

    if(!isService){
        ((value)=>{
            _addEvent(toggle, 'click', ()=>{
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
            _addEvent(toggle, 'change', ()=>{

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