import { state, dom } from '../core/global';
import { _addClass, _elContains, _removeClass } from './general';

/**
 * @typedef {Object} Layout
 * @property {string[]} _variants
 * @property {string[]} _alignV
 * @property {string[]} _alignH
 * @property {string} _defaultAlignV
 * @property {string} _defaultAlignH
 */

/**
 * @typedef {Object.<string, Layout>} Layouts
 */

/**
 * Manage each modal's layout
 * @param {number} applyToModal 0: consentModal, 1: preferencesModal
 */
export const _guiManager = (applyToModal) => {

    /**
     * @type {import("../core/global").GuiOptions}
     */
    var guiOptions = state._userConfig.guiOptions;

    var consentModalOptions = guiOptions && guiOptions.consentModal;
    var preferencesModalOptions = guiOptions && guiOptions.preferencesModal;

    /**
     * Helper function to set the proper layout classes
     * @param {HTMLElement} modal
     * @param {Layouts} allowedLayoutsObj
     * @param {import("../core/global").GuiModalOption} userGuiOptions
     * @param {string} prefix
     * @param {string} defaultLayoutName
     */
    function _setLayout(modal, allowedLayoutsObj, userGuiOptions, prefix, defaultLayoutName, modalClassName){

        var layout = userGuiOptions && userGuiOptions.layout;
        var position = userGuiOptions && userGuiOptions.position;
        var flipButtons = userGuiOptions && userGuiOptions.flipButtons === true;
        var notSameWeightButtons = userGuiOptions && userGuiOptions.equalWeightButtons === false;
        var userLayoutStr = layout && layout.split(' ') || [];
        var userPositionStr = position && position.split(' ') || [];

        var userLayoutName = userLayoutStr[0];
        var userLayoutVariant = userLayoutStr[1];
        var userAlignV = userPositionStr[0];
        var userAlignH = prefix === 'pm--' ? userPositionStr[0] : userPositionStr[1];

        var currentLayoutName = userLayoutName,
            currentLayout = allowedLayoutsObj[userLayoutName];

        if(!currentLayout){
            currentLayout = allowedLayoutsObj[defaultLayoutName];
            currentLayoutName = defaultLayoutName;
        }

        var currentLayoutVariant = _elContains(currentLayout._variants, userLayoutVariant) && userLayoutVariant;
        var currentAlignV = _elContains(currentLayout._alignV, userAlignV) ? userAlignV : currentLayout._defaultAlignV;
        var currentAlignH = _elContains(currentLayout._alignH, userAlignH) ? userAlignH : currentLayout._defaultAlignH;

        /**
         * Reset modal classes to default
         */
        modal.className = modalClassName;

        /**
         * Add layout + position classes
         */
        _addClass(modal, prefix + currentLayoutName);
        currentLayoutVariant && _addClass(modal, prefix + currentLayoutVariant);
        currentAlignV && _addClass(modal, prefix + currentAlignV);
        currentAlignH && _addClass(modal, prefix + currentAlignH);
        flipButtons && _addClass(modal, prefix + 'flip');

        var secondaryBtnClass = 'btn--secondary';
        var classPrefix = modalClassName + '__';

        /**
         * Add classes to buttons
         */
        if(modalClassName === 'cm'){
            dom._consentAcceptNecessaryBtn && _removeClass(dom._consentAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
            dom._cmCloseIconBtn && _removeClass(dom._cmCloseIconBtn, classPrefix + secondaryBtnClass);
            if(notSameWeightButtons){
                dom._consentAcceptNecessaryBtn && _addClass(dom._consentAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
                dom._cmCloseIconBtn && _addClass(dom._cmCloseIconBtn, classPrefix + secondaryBtnClass);
            }
        }else{
            dom._pmAcceptNecessaryBtn &&  _removeClass(dom._pmAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
            if(notSameWeightButtons){
                dom._pmAcceptNecessaryBtn &&  _addClass(dom._pmAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
            }
        }
    }

    if(applyToModal === 0 && state._consentModalExists){

        var alignV = ['middle', 'top', 'bottom'];
        var alignH = ['left', 'center', 'right'];

        var cmLayouts = {
            box: {
                _variants: ['wide', 'inline'],
                _alignV: alignV,
                _alignH: alignH,
                _defaultAlignV: 'bottom',
                _defaultAlignH: 'right'
            },
            cloud: {
                _variants: ['inline'],
                _alignV: alignV,
                _alignH: alignH,
                _defaultAlignV: 'bottom',
                _defaultAlignH: 'center'
            },
            bar: {
                _variants: ['inline'],
                _alignV: alignV.slice(1),   //remove the first "middle" option
                _alignH: [],
                _defaultAlignV: 'bottom',
                _defaultAlignH: ''
            }
        };

        _setLayout(dom._consentModal, cmLayouts, consentModalOptions, 'cm--', 'box', 'cm');
    }

    if(applyToModal === 1){
        var pmLayouts = {
            box: {
                _variants: [],
                _alignV: [],
                _alignH: [],
                _defaultAlignV: '',
                _defaultAlignH: ''
            },
            bar: {
                _variants: ['wide'],
                _alignV: [],
                _alignH: ['left', 'right'],
                _defaultAlignV: '',
                _defaultAlignH: 'left'
            }
        };

        _setLayout(dom._pm, pmLayouts, preferencesModalOptions, 'pm--', 'box', 'pm');
    }
};