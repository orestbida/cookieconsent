/* eslint-disable no-unreachable */
import { state, dom } from '../../global';
import { _createNode, _addClass, _setAttribute, _removeClass, _addEvent, _appendChild,  _getKeys, _hasClass, _elContains } from '../../../utils/general';
// import { _guiManager } from '../../../utils/gui-manager';

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
        dom._pmContainer.className = 'pm-wrapper';

        // preferences modal
        dom._pm = _createNode('div');
        dom._pm.className = 'pm';
        dom._pm.style.visibility = 'hidden';
        _setAttribute(dom._pm, 'role', 'dialog');
        _setAttribute(dom._pm, 'aria-hidden', true);
        _setAttribute(dom._pm, 'aria-modal', true);

        // If 'esc' key is pressed inside _preferencesContainer div => hide preferences
        _addEvent(dom._htmlDom, 'keydown', (evt) => {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                api.hidePreferences();
            }
        }, true);

        // modal header
        dom._pmHeader = _createNode('div');
        dom._pmHeader.className = 'pm__header';

        // modal title
        dom._pmTitle = _createNode('div');
        dom._pmTitle.className = 'pm__title';
        _setAttribute(dom._pmTitle, 'role', 'heading');

        dom._pmCloseBtn = _createNode('button');
        dom._pmCloseBtn.className = 'pm__close-btn';
        _setAttribute(dom._pmCloseBtn, 'aria-label', modalData.closeIconLabel || '');
        _addEvent(dom._pmCloseBtn, 'click', ()=>{api.hidePreferences();});

        // modal body
        dom._pmBody = _createNode('div');
        dom._pmBody.className = 'pm__body';

        // modal footer
        dom._pmFooter = _createNode('div');
        dom._pmFooter.className = 'pm__footer';

        var _pmBtnContainer = _createNode('div');
        _pmBtnContainer.className = 'pm__btns';

        var _pmBtnGroup1 = _createNode('div');
        var _pmBtnGroup2 = _createNode('div');
        _pmBtnGroup1.className = _pmBtnGroup2.className = 'pm__btn-group';

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
        dom._pmNewBody.className = 'pm__body';
    }

    if(titleData){
        dom._pmTitle.innerHTML = titleData;
        closeIconLabelData && _setAttribute(dom._pmCloseBtn, 'aria-label', closeIconLabelData);
    }

    sectionsData.forEach(section => {
        var sTitleData = section.title,
            sDescriptionData = section.description,
            sLinkedCategory = section.linkedCategory,
            sCurrentCategoryObject = sLinkedCategory && state._allDefinedCategories[sLinkedCategory],
            sCookieTableData = section.cookieTable,
            sCookieTableBody = sCookieTableData && sCookieTableData.body,
            sCreateCookieTable = sCookieTableBody && sCookieTableBody.length > 0,
            sIsExpandable = !!sCurrentCategoryObject || sCreateCookieTable;

        // section
        var s = _createNode('div');
        s.className = 'pm__section';

        if(sTitleData){

            var sTitleContainer = _createNode('div');
            var sTitle = sIsExpandable ? _createNode('button') : _createNode('div');

            sTitleContainer.className = 'pm__section-title-wrapper';
            sTitle.className = 'pm__section-title';

            if(sIsExpandable){

                var expandableDivId = sLinkedCategory + '-desc';
                s.className += '--expandable';
                _setAttribute(sTitle, 'aria-expanded', false);
                _setAttribute(sTitle, 'aria-controls', expandableDivId);

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

                toggleLabel.className = 'section__toggle-wrapper';
                toggle.className = 'section__toggle';
                toggleOnIcon.className = 'toggle__icon-on';
                toggleOffIcon.className = 'toggle__icon-off';
                toggleIcon.className = 'toggle__icon';
                toggleLabelSpan.className = 'toggle__label';

                _setAttribute(toggleIcon, 'aria-hidden', 'true');

                toggle.value = sLinkedCategory;

                toggleLabelSpan.textContent = sTitleData;

                _appendChild(toggleIcon, toggleOnIcon);
                _appendChild(toggleIcon, toggleOffIcon);

                /**
                 * If consent is valid => retrieve category states from cookie
                 * Otherwise use states defined in the userConfig. object
                 */
                if(!state._invalidConsent){
                    if(_elContains(state._savedCookieContent.categories, sLinkedCategory)){
                        toggle.checked = true;
                    }
                }else if(sCurrentCategoryObject.enabled || sCurrentCategoryObject.readOnly){
                    toggle.checked = true;

                    /**
                     * Keep track of categories enabled by default (useful when mode=='opt-out')
                     */
                    if(sCurrentCategoryObject.enabled)
                        !dom._pmNewBody && state._defaultEnabledCategories.push(sLinkedCategory);
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
                _appendChild(sTitleContainer, toggleLabel);

            }else{
                _setAttribute(sTitle, 'role', 'heading');
                _setAttribute(sTitle, 'aria-level', '3');
            }

            sTitle.innerHTML = sTitleData;

            _appendChild(sTitleContainer, sTitle);
            _appendChild(s, sTitleContainer);
        }

        if(sDescriptionData){

            var sDescContainer = _createNode('div');
            var sDesc = _createNode('div');

            sDescContainer.className = 'pm__section-desc-wrapper';
            sDesc.className = 'pm__section-desc';

            sDesc.innerHTML = sDescriptionData;

            _appendChild(sDescContainer, sDesc);

            if(sIsExpandable){
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

                    table.className = 'pm__section-table';
                    thead.className = 'pm__table-head';
                    tbody.className = 'pm__table-body';

                    var headerData = sCookieTableData.headers;
                    var tableHeadersKeys = _getKeys(headerData);

                    /**
                     * Create table headers
                     */
                    var trHeadFragment = document.createDocumentFragment();
                    var trHead = _createNode('tr');

                    for(var i=0; i<tableHeadersKeys.length; i++){
                        var headerKey = tableHeadersKeys[i];
                        var headerName = headerData[headerKey];

                        var th = _createNode('th');
                        th.className = 'pm__table-th';

                        th.innerHTML = headerName;
                        _appendChild(trHeadFragment, th);
                    }

                    _appendChild(trHead, trHeadFragment);
                    _appendChild(thead, trHead);

                    /**
                     * Create table body
                     */
                    var bodyFragment = document.createDocumentFragment();

                    for(i=0; i<sCookieTableBody.length; i++){
                        var currentCookieData = sCookieTableBody[i];
                        var tr = _createNode('tr');
                        tr.className = 'pm__table-tr';

                        for(var j=0; j<tableHeadersKeys.length; j++){

                            var tdKey = tableHeadersKeys[j];
                            var tdHeaderName = headerData[tdKey];
                            var tdValue = currentCookieData[tdKey];

                            var td = _createNode('td');
                            var tdInner = _createNode('div');
                            td.className = 'pm__table-td';
                            _setAttribute(td, 'data-column', tdHeaderName);

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

            _appendChild(s, sDescContainer);
        }

        _appendChild(dom._pmBody, s);

        if(dom._pmNewBody)
            _appendChild(dom._pmNewBody, s);
        else
            _appendChild(dom._pmBody, s);
    });

    // acceptAllBtnData = modalData.acceptAllBtn,
    // acceptNecessaryBtnData = modalData.acceptNecessaryBtn,
    // savePreferencesBtnData

    if(acceptAllBtnData || acceptNecessaryBtnData){

        if(acceptNecessaryBtnData){
            if(!dom._pmAcceptNecessaryBtn){
                dom._pmAcceptNecessaryBtn = _createNode('button');
                dom._pmAcceptNecessaryBtn.className = 'pm__btn';
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
                dom._pmAcceptAllBtn.className = 'pm__btn';
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
};