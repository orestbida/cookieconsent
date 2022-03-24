import { state, dom } from '../../global';
import { _createNode, _addClass, _setAttribute, _removeClass, _addEvent, _appendChild, _inArray, _getKeys, _hasClass } from '../../../utils/general';
import { _guiManager } from '../../../utils/gui-manager';

export const _createPreferencesModal = (api) => {

    /** TODO */
    if(state) return;

    var preferencesModalData = state._currentTranslation['preferencesModal'];

    /**
     * Create all _consentModal elements
     */
    if(!dom._pmContainer){
        dom._pmContainer = _createNode('div');
        dom._pmContainer.className = 'pm-container';

        dom._preferencesContainer = _createNode('div');
        var preferencesContainerValign = _createNode('div');
        var preferences = _createNode('div');
        var preferencesContainerInner = _createNode('div');
        dom._preferencesInner = _createNode('div');
        dom._preferencesTitle = _createNode('div');
        var preferencesHeader = _createNode('div');
        dom._preferencesCloseBtn = _createNode('button');
        var preferencesCloseBtnContainer = _createNode('div');
        dom._sectionsContainer = _createNode('div');

        /**
         * Set ids
         */
        dom._preferencesContainer.id = 's-cnt';
        preferencesContainerValign.id = 'c-vln';
        preferencesContainerInner.id = 'c-s-in';
        preferences.id = 'cs';
        dom._preferencesTitle.id = 's-ttl';
        dom._preferencesInner.id = 's-inr';
        preferencesHeader.id = 's-hdr';
        dom._sectionsContainer.id = 's-bl';
        dom._preferencesCloseBtn.id = 's-c-bn';
        preferencesCloseBtnContainer.id = 's-c-bnc';
        dom._preferencesCloseBtn.className = 'c-bn';

        _setAttribute(dom._preferencesContainer, 'role', 'dialog');
        _setAttribute(dom._preferencesContainer, 'aria-modal', 'true');
        _setAttribute(dom._preferencesContainer, 'aria-hidden', 'true');
        _setAttribute(dom._preferencesContainer, 'aria-labelledby', 's-ttl');
        _setAttribute(dom._preferencesTitle, 'role', 'heading');

        _appendChild(preferencesCloseBtnContainer, dom._preferencesCloseBtn);

        // If 'esc' key is pressed inside _preferencesContainer div => hide preferences
        _addEvent(preferencesContainerValign, 'keydown', (evt) => {
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                api.hidePreferences(0);
            }
        }, true);

        _addEvent(dom._preferencesCloseBtn, 'click', () => {
            api.hidePreferences(0);
        });

        _guiManager(1);
    }else{
        dom._newSectionsContainer = _createNode('div');
        dom._newSectionsContainer.id = 's-bl';
    }

    // Add label to close button
    _setAttribute(dom._preferencesCloseBtn, 'aria-label', preferencesModalData['closeIconLabel'] || '');

    // Set preferences modal title
    dom._preferencesTitle.innerHTML = preferencesModalData['title'];

    var allSections = preferencesModalData['sections'];

    // Create preferences modal content (_sectionsContainer)
    for(var i=0; i<allSections.length; ++i){

        var titleData = allSections[i]['title'],
            descriptionTextData = allSections[i]['description'],
            linkedCategory = allSections[i]['linkedCategory'],
            currentCategoryObject = linkedCategory && state._allDefinedCategories[linkedCategory],
            cookieTableData = allSections[i]['cookieTable'],
            cookieTableHeaders = cookieTableData && cookieTableData['headers'],
            cookieTableBody = cookieTableData && cookieTableData['body'],
            createCookieTable = cookieTableBody && cookieTableBody.length > 0,
            isExpandable = !!descriptionTextData || createCookieTable;

        // Create title
        var section = _createNode('div');
        var tableParent = _createNode('div');

        // Create description
        if(descriptionTextData){
            var description = _createNode('div');
            description.className = 'p';
            description.insertAdjacentHTML('beforeend', descriptionTextData);
        }

        var titleContainer = _createNode('div');
        titleContainer.className = 'title';

        section.className = 'c-bl';
        tableParent.className = 'desc';

        // Create toggle if specified (opt in/out)
        if(typeof currentCategoryObject !== 'undefined'){

            var expandableDivId = 'c-ac-'+i;

            // Create button (to collapse/expand section description)
            var sectionTitleBtn = isExpandable ? _createNode('button') : _createNode('div');

            var toggleLabel = _createNode('label');
            var toggle = _createNode('input');
            var toggleSpan = _createNode('span');
            var toggleLabelSpan = _createNode('span');

            // These 2 spans will contain each 2 pseudo-elements to generate 'tick' and 'x' icons
            var toggleOnIcon = _createNode('span');
            var toggleOffIcon = _createNode('span');

            sectionTitleBtn.className = isExpandable ? 'b-tl exp' : 'b-tl';
            toggleLabel.className = 'b-tg';
            toggle.className = 'c-tgl';
            toggleOnIcon.className = 'on-i';
            toggleOffIcon.className = 'off-i';
            toggleSpan.className = 'c-tg';
            toggleLabelSpan.className = 't-lb';

            if(isExpandable){
                _setAttribute(sectionTitleBtn, 'aria-expanded', 'false');
                _setAttribute(sectionTitleBtn, 'aria-controls', expandableDivId);
            }

            toggle.type = 'checkbox';
            _setAttribute(toggleSpan, 'aria-hidden', 'true');

            toggle.value = linkedCategory;

            toggleLabelSpan.textContent = titleData;

            sectionTitleBtn.insertAdjacentHTML('beforeend', titleData);

            _appendChild(titleContainer, sectionTitleBtn);
            _appendChild(toggleSpan, toggleOnIcon);
            _appendChild(toggleSpan, toggleOffIcon);

            /**
             * If consent is valid => retrieve category states from cookie
             * Otherwise use states defined in the userConfig. object
             */
            if(!state._invalidConsent){
                if(_inArray(state._savedCookieContent['categories'], linkedCategory) > -1){
                    toggle.checked = true;
                    !dom._newSectionsContainer && state._allToggleStates.push(true);
                }else{
                    !dom._newSectionsContainer && state._allToggleStates.push(false);
                }
            }else if(currentCategoryObject && currentCategoryObject['enabled']){
                toggle.checked = true;
                !dom._newSectionsContainer && state._allToggleStates.push(true);

                /**
                 * Keep track of categories enabled by default (useful when mode=='opt-out')
                 */
                if(currentCategoryObject['enabled'])
                    !dom._newSectionsContainer && state._defaultEnabledCategories.push(linkedCategory);
            }else{
                !dom._newSectionsContainer && state._allToggleStates.push(false);
            }

            /**
             * Set toggle as readonly if true (disable checkbox)
             */
            if(currentCategoryObject && currentCategoryObject['readOnly']){
                toggle.disabled = true;
                _addClass(toggleSpan, 'c-ro');
            }

            _addClass(tableParent, 'b-acc');
            _addClass(titleContainer, 'b-bn');
            _addClass(section, 'b-ex');

            tableParent.id = expandableDivId;
            _setAttribute(tableParent, 'aria-hidden', 'true');

            _appendChild(toggleLabel, toggle);
            _appendChild(toggleLabel, toggleSpan);
            _appendChild(toggleLabel, toggleLabelSpan);
            _appendChild(titleContainer, toggleLabel);

            /**
             * On button click handle the following :=> aria-expanded, aria-hidden and act class for current section
             */
            isExpandable && ((accordion, section, btn) => {
                _addEvent(sectionTitleBtn, 'click', () => {
                    if(!_hasClass(section, 'act')){
                        _addClass(section, 'act');
                        _setAttribute(btn, 'aria-expanded', 'true');
                        _setAttribute(accordion, 'aria-hidden', 'false');
                    }else{
                        _removeClass(section, 'act');
                        _setAttribute(btn, 'aria-expanded', 'false');
                        _setAttribute(accordion, 'aria-hidden', 'true');
                    }
                }, false);
            })(tableParent, section, sectionTitleBtn);

        }else{
            /**
             * If section is not a button (no toggle defined),
             * create a simple div instead
             */
            if(titleData){
                var title = _createNode('div');
                title.className = 'b-tl';
                _setAttribute(title, 'role', 'heading');
                _setAttribute(title, 'aria-level', '3');
                title.insertAdjacentHTML('beforeend', titleData);
                _appendChild(titleContainer, title);
            }
        }

        titleData && _appendChild(section, titleContainer);
        descriptionTextData && _appendChild(tableParent, description);

        // if cookie table found, generate table for this section
        if(createCookieTable){
            var allTableKeys = _getKeys(cookieTableHeaders);
            var trTmpFragment = document.createDocumentFragment();

            if(allTableKeys){
                /**
                 * Create table header
                 */
                for(var p=0; p<allTableKeys.length; ++p){
                    // create new header
                    var th1 = _createNode('th');
                    var key = allTableKeys[p];
                    _setAttribute(th1, 'scope', 'col');

                    if(key){
                        th1.textContent = cookieTableHeaders[key];
                        _appendChild(trTmpFragment, th1);
                    }
                }


                var trTmp = _createNode('tr');
                _appendChild(trTmp, trTmpFragment);

                // create table header & append fragment
                var thead = _createNode('thead');
                _appendChild(thead, trTmp);

                // append header to table
                var table = _createNode('table');
                _appendChild(table, thead);

                var tbodyFragment = document.createDocumentFragment();

                // create table content
                for(var n=0; n<cookieTableBody.length; n++){
                    var tr = _createNode('tr');

                    for(var g=0; g<allTableKeys.length; ++g){

                        var columnKey = allTableKeys[g];
                        var columnHeader = cookieTableHeaders[columnKey];
                        var columnValue = cookieTableBody[n][columnKey];

                        var td_tmp = _createNode('td');

                        // Allow html inside table cells
                        td_tmp.insertAdjacentHTML('beforeend', columnValue);
                        _setAttribute(td_tmp, 'data-column', columnHeader);

                        _appendChild(tr, td_tmp);
                    }

                    _appendChild(tbodyFragment, tr);
                }

                // append tbodyFragment to tbody & append the latter into the table
                var tbody = _createNode('tbody');
                _appendChild(tbody, tbodyFragment);
                _appendChild(table, tbody);

                _appendChild(tableParent, table);
            }
        }

        /**
         * Append only if is either:
         * - togglable div with title
         * - a simple div with at least a title or description
         */
        if(state._allCategoryNames[linkedCategory] && titleData || (!state._allCategoryNames[linkedCategory] && (titleData || descriptionTextData))){
            _appendChild(section, tableParent);

            if(dom._newSectionsContainer)
                _appendChild(dom._newSectionsContainer, section);
            else
                _appendChild(dom._sectionsContainer, section);
        }
    }

    var _preferencesButtonsContainer = dom._preferencesButtonsContainer;

    // Create preferences buttons
    if(!_preferencesButtonsContainer){
        _preferencesButtonsContainer = _createNode('div');
        _preferencesButtonsContainer.id = 's-bns';
    }

    var _preferencesacceptAllBtn = dom._preferencesacceptAllBtn;

    if(!_preferencesacceptAllBtn){
        _preferencesacceptAllBtn = _createNode('button');
        _preferencesacceptAllBtn.id = 's-all-bn';
        _preferencesacceptAllBtn.className ='c-bn';
        _appendChild(_preferencesButtonsContainer, _preferencesacceptAllBtn);

        _addEvent(_preferencesacceptAllBtn, 'click', () => {
            api.hidePreferences();
            api.hide();
            api.accept('all');
        });
    }

    _preferencesacceptAllBtn.innerHTML = preferencesModalData['acceptAllBtn'];

    var acceptNecessaryBtnText = preferencesModalData['acceptNecessaryBtn'];

    // Add third [optional] reject all button if provided
    if(acceptNecessaryBtnText){

        var _preferencesacceptNecessaryBtn = dom._preferencesacceptNecessaryBtn;

        if(!_preferencesacceptNecessaryBtn){
            _preferencesacceptNecessaryBtn = _createNode('button');
            _preferencesacceptNecessaryBtn.id = 's-rall-bn';
            _preferencesacceptNecessaryBtn.className = 'c-bn';

            _addEvent(_preferencesacceptNecessaryBtn, 'click', () => {
                api.hidePreferences();
                api.hide();
                api.accept([]);
            });

            dom._preferencesInner.className = 'bns-t';
            _appendChild(_preferencesButtonsContainer, _preferencesacceptNecessaryBtn);
        }

        _preferencesacceptNecessaryBtn.innerHTML = acceptNecessaryBtnText;
    }

    var _preferencesSaveBtn = dom._preferencesSaveBtn;

    if(!_preferencesSaveBtn){
        _preferencesSaveBtn = _createNode('button');
        _preferencesSaveBtn.id = 's-sv-bn';
        _preferencesSaveBtn.className ='c-bn';
        _appendChild(_preferencesButtonsContainer, _preferencesSaveBtn);

        // Add save preferences button onClick event
        // Hide both preferences modal and consent modal
        _addEvent(_preferencesSaveBtn, 'click', () => {
            api.hidePreferences();
            api.hide();
            api.accept();
        });
    }

    _preferencesSaveBtn.innerHTML = preferencesModalData['savePreferencesBtn'];

    if(dom._newSectionsContainer) {
        // replace entire existing cookie category _sectionsContainer with the new cookie categories new _sectionsContainer (in a different language)
        dom._preferencesInner.replaceChild(dom._newSectionsContainer, dom._sectionsContainer);
        dom._sectionsContainer = dom._newSectionsContainer;
        return;
    }

    _appendChild(preferencesHeader, dom._preferencesTitle);
    _appendChild(preferencesHeader, preferencesCloseBtnContainer);
    _appendChild(dom._preferencesInner, preferencesHeader);
    _appendChild(dom._preferencesInner, dom._sectionsContainer);
    _appendChild(dom._preferencesInner, _preferencesButtonsContainer);
    _appendChild(preferencesContainerInner, dom._preferencesInner);

    _appendChild(preferences, preferencesContainerInner);
    _appendChild(preferencesContainerValign, preferences);
    _appendChild(dom._preferencesContainer, preferencesContainerValign);

    _appendChild(dom._pmContainer, dom._preferencesContainer);
    _appendChild(dom._ccMain, dom._pmContainer);
};