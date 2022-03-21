import { _state, _dom } from "../global";
import { _createNode, _addClass, _setAttribute, _removeClass, _addEvent, _appendChild, _inArray, _getKeys, _hasClass } from "../utils/general";
import { _guiManager } from "../utils/gui-manager";
import { api } from "../api";

export const _createPreferencesModal = function(){
    var preferencesModalData = _state.currentTranslation['preferencesModal'];

    /**
     * Create all consentModal elements
     */
    if(!_dom.preferencesContainer){
        _dom.preferencesContainer = _createNode('div');
        var preferencesContainerValign = _createNode('div');
        var preferences = _createNode('div');
        var preferencesContainerInner = _createNode('div');
        _dom.preferencesInner = _createNode('div');
        _dom.preferencesTitle = _createNode('div');
        var preferencesHeader = _createNode('div');
        _dom.preferencesCloseBtn = _createNode('button');
        var preferencesCloseBtnContainer = _createNode('div');
        _dom.sectionsContainer = _createNode('div');
        var overlay = _createNode('div');

        /**
         * Set ids
         */
        _dom.preferencesContainer.id = 's-cnt';
        preferencesContainerValign.id = "c-vln";
        preferencesContainerInner.id = "c-s-in";
        preferences.id = "cs";
        _dom.preferencesTitle.id = 's-ttl';
        _dom.preferencesInner.id = 's-inr';
        preferencesHeader.id = "s-hdr";
        _dom.sectionsContainer.id = 's-bl';
        _dom.preferencesCloseBtn.id = 's-c-bn';
        overlay.id = 'cs-ov';
        preferencesCloseBtnContainer.id = 's-c-bnc';
        _dom.preferencesCloseBtn.className = 'c-bn';

        _setAttribute(_dom.preferencesContainer, 'role', 'dialog');
        _setAttribute(_dom.preferencesContainer, 'aria-modal', 'true');
        _setAttribute(_dom.preferencesContainer, 'aria-hidden', 'true');
        _setAttribute(_dom.preferencesContainer, 'aria-labelledby', 's-ttl');
        _setAttribute(_dom.preferencesTitle, 'role', 'heading');
        _dom.preferencesContainer.style.visibility = overlay.style.visibility = "hidden";
        overlay.style.opacity = 0;

        _appendChild(preferencesCloseBtnContainer, _dom.preferencesCloseBtn);

        // If 'esc' key is pressed inside preferencesContainer div => hide preferences
        _addEvent(preferencesContainerValign, 'keydown', function(evt){
            evt = evt || window.event;
            if (evt.keyCode === 27) {
                api.hidePreferences(0);
            }
        }, true);

        _addEvent(_dom.preferencesCloseBtn, 'click', function(){
            api.hidePreferences(0);
        });

        _guiManager(1);
    }else{
        _dom.newSectionsContainer = _createNode('div');
        _dom.newSectionsContainer.id = 's-bl';
    }

    // Add label to close button
    _setAttribute(_dom.preferencesCloseBtn, 'aria-label', preferencesModalData['closeIconLabel'] || '');

    _state.allDefinedCategories = _state.userConfig['categories'];
    _state.allCategoryNames = _getKeys(_state.allDefinedCategories);

    // Set preferences modal title
    _dom.preferencesTitle.innerHTML = preferencesModalData['title'];

    var allSections = preferencesModalData['sections'];

    // Create preferences modal content (sectionsContainer)
    for(var i=0; i<allSections.length; ++i){

        var titleData = allSections[i]['title'],
            descriptionTextData = allSections[i]['description'],
            linkedCategory = allSections[i]['linkedCategory'],
            currentCategoryObject = linkedCategory && _state.allDefinedCategories[linkedCategory],
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

            var expandableDivId = "c-ac-"+i;

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
            toggleLabelSpan.className = "t-lb";

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
            if(!_state.invalidConsent){
                if(_inArray(_state.savedCookieContent['categories'], linkedCategory) > -1){
                    toggle.checked = true;
                    !_dom.newSectionsContainer && _state.allToggleStates.push(true);
                }else{
                    !_dom.newSectionsContainer && _state.allToggleStates.push(false);
                }
            }else if(currentCategoryObject && currentCategoryObject['enabled']){
                toggle.checked = true;
                !_dom.newSectionsContainer && _state.allToggleStates.push(true);

                /**
                 * Keep track of categories enabled by default (useful when mode=='opt-out')
                 */
                if(currentCategoryObject['enabled'])
                    !_dom.newSectionsContainer && _state.defaultEnabledCategories.push(linkedCategory);
            }else{
                !_dom.newSectionsContainer && _state.allToggleStates.push(false);
            }

            /**
             * Set toggle as readonly if true (disable checkbox)
             */
            if(currentCategoryObject && currentCategoryObject['readOnly']){
                toggle.disabled = true;
                _addClass(toggleSpan, 'c-ro');
                !_dom.newSectionsContainer && _state.readOnlyCategories.push(true);
            }else{
                !_dom.newSectionsContainer && _state.readOnlyCategories.push(false);
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
            isExpandable && (function(accordion, section, btn){
                _addEvent(sectionTitleBtn, 'click', function(){
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
                    _setAttribute(th1, 'scope', 'col')

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
        if(_state.allCategoryNames[linkedCategory] && titleData || (!_state.allCategoryNames[linkedCategory] && (titleData || descriptionTextData))){
            _appendChild(section, tableParent);

            if(_dom.newSectionsContainer)
                _appendChild(_dom.newSectionsContainer, section);
            else
                _appendChild(_dom.sectionsContainer, section);
        }
    }

    var preferencesButtonsContainer = _dom.preferencesButtonsContainer;

    // Create preferences buttons
    if(!preferencesButtonsContainer){
        preferencesButtonsContainer = _createNode('div');
        preferencesButtonsContainer.id = 's-bns';
    }

    var preferencesacceptAllBtn = _dom.preferencesacceptAllBtn;

    if(!preferencesacceptAllBtn){
        preferencesacceptAllBtn = _createNode('button');
        preferencesacceptAllBtn.id = 's-all-bn';
        preferencesacceptAllBtn.className ='c-bn';
        _appendChild(preferencesButtonsContainer, preferencesacceptAllBtn);

        _addEvent(preferencesacceptAllBtn, 'click', function(){
            api.hidePreferences();
            api.hide();
            api.accept('all');
        });
    }

    preferencesacceptAllBtn.innerHTML = preferencesModalData["acceptAllBtn"];

    var acceptNecessaryBtnText = preferencesModalData['acceptNecessaryBtn'];

    // Add third [optional] reject all button if provided
    if(acceptNecessaryBtnText){

        var preferencesacceptNecessaryBtn = _dom.preferencesacceptNecessaryBtn;

        if(!preferencesacceptNecessaryBtn){
            preferencesacceptNecessaryBtn = _createNode('button');
            preferencesacceptNecessaryBtn.id = 's-rall-bn';
            preferencesacceptNecessaryBtn.className = 'c-bn';

            _addEvent(preferencesacceptNecessaryBtn, 'click', function(){
                api.hidePreferences();
                api.hide();
                api.accept([]);
            });

            _dom.preferencesInner.className = "bns-t";
            _appendChild(preferencesButtonsContainer, preferencesacceptNecessaryBtn);
        }

        preferencesacceptNecessaryBtn.innerHTML = acceptNecessaryBtnText;
    }

    var preferencesSaveBtn = _dom.preferencesSaveBtn;

    if(!preferencesSaveBtn){
        preferencesSaveBtn = _createNode('button');
        preferencesSaveBtn.id = 's-sv-bn';
        preferencesSaveBtn.className ='c-bn';
        _appendChild(preferencesButtonsContainer, preferencesSaveBtn);

        // Add save preferences button onClick event
        // Hide both preferences modal and consent modal
        _addEvent(preferencesSaveBtn, 'click', function(){
            api.hidePreferences();
            api.hide();
            api.accept();
        });
    }

    preferencesSaveBtn.innerHTML = preferencesModalData['savePreferencesBtn'];

    if(_dom.newSectionsContainer) {
        // replace entire existing cookie category sectionsContainer with the new cookie categories new sectionsContainer (in a different language)
        _dom.preferencesInner.replaceChild(_dom.newSectionsContainer, _dom.sectionsContainer);
        _dom.sectionsContainer = _dom.newSectionsContainer;
        return;
    }

    _appendChild(preferencesHeader, _dom.preferencesTitle);
    _appendChild(preferencesHeader, preferencesCloseBtnContainer);
    _appendChild(_dom.preferencesInner, preferencesHeader);
    _appendChild(_dom.preferencesInner, _dom.sectionsContainer);
    _appendChild(_dom.preferencesInner, preferencesButtonsContainer);
    _appendChild(preferencesContainerInner, _dom.preferencesInner);

    _appendChild(preferences, preferencesContainerInner);
    _appendChild(preferencesContainerValign, preferences);
    _appendChild(_dom.preferencesContainer, preferencesContainerValign);

    _appendChild(_dom.allModalsContainer, _dom.preferencesContainer);
    _appendChild(_dom.allModalsContainer, overlay);
}