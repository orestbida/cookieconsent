import { globalObj } from '../core/global';
import { addClass, elContains, removeClass } from './general';

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
export const guiManager = (applyToModal) => {

    /**
     * @type {import("../core/global").GuiOptions}
     */
    const guiOptions = globalObj._state._userConfig.guiOptions,
        consentModalOptions = guiOptions && guiOptions.consentModal,
        preferencesModalOptions = guiOptions && guiOptions.preferencesModal;

    /**
     * Helper function to set the proper layout classes
     * @param {HTMLElement} modal
     * @param {Layouts} allowedLayoutsObj
     * @param {import("../core/global").GuiModalOption} userGuiOptions
     * @param {string} prefix
     * @param {string} defaultLayoutName
     */
    const setLayout = (modal, allowedLayoutsObj, userGuiOptions, prefix, defaultLayoutName, modalClassName) => {

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

        var currentLayoutVariant = elContains(currentLayout._variants, userLayoutVariant) && userLayoutVariant;
        var currentAlignV = elContains(currentLayout._alignV, userAlignV) ? userAlignV : currentLayout._defaultAlignV;
        var currentAlignH = elContains(currentLayout._alignH, userAlignH) ? userAlignH : currentLayout._defaultAlignH;

        /**
         * Reset modal classes to default
         */
        modal.className = modalClassName;

        /**
         * Add layout + position classes
         */
        addClass(modal, prefix + currentLayoutName);
        currentLayoutVariant && addClass(modal, prefix + currentLayoutVariant);
        currentAlignV && addClass(modal, prefix + currentAlignV);
        currentAlignH && addClass(modal, prefix + currentAlignH);
        flipButtons && addClass(modal, prefix + 'flip');

        const secondaryBtnClass = 'btn--secondary',
            classPrefix = modalClassName + '__';

        /**
         * Add classes to buttons
         */
        if(modalClassName === 'cm'){

            const {_consentAcceptNecessaryBtn, _cmCloseIconBtn} = globalObj._dom;

            _consentAcceptNecessaryBtn && removeClass(_consentAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
            _cmCloseIconBtn && removeClass(_cmCloseIconBtn, classPrefix + secondaryBtnClass);

            if(notSameWeightButtons){
                _consentAcceptNecessaryBtn && addClass(_consentAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
                _cmCloseIconBtn && addClass(_cmCloseIconBtn, classPrefix + secondaryBtnClass);
            }
        }else{
            const { _pmAcceptNecessaryBtn } =  globalObj._dom;

            _pmAcceptNecessaryBtn && removeClass(_pmAcceptNecessaryBtn, classPrefix + secondaryBtnClass);

            if(notSameWeightButtons)
                _pmAcceptNecessaryBtn && addClass(_pmAcceptNecessaryBtn, classPrefix + secondaryBtnClass);
        }
    };

    if(applyToModal === 0){

        const alignV = ['middle', 'top', 'bottom'];
        const alignH = ['left', 'center', 'right'];

        const cmLayouts = {
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

        setLayout(globalObj._dom._consentModal, cmLayouts, consentModalOptions, 'cm--', 'box', 'cm');
    }

    if(applyToModal === 1){
        const pmLayouts = {
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

        setLayout(globalObj._dom._pm, pmLayouts, preferencesModalOptions, 'pm--', 'box', 'pm');
    }
};