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

const CLASS_CONSTANTS = {
    _top: 'top',
    _middle: 'middle',
    _bottom: 'bottom',
    _left: 'left',
    _center: 'center',
    _right: 'right',
    _inline: 'inline',
    _wide: 'wide',
    _pmPrefix: 'pm--',
    _cmPrefix: 'cm--',
    _box: 'box'
};

const alignV = [
    CLASS_CONSTANTS._middle,
    CLASS_CONSTANTS._top,
    CLASS_CONSTANTS._bottom
];

const alignH = [
    CLASS_CONSTANTS._left,
    CLASS_CONSTANTS._center,
    CLASS_CONSTANTS._right
];

const ALL_CM_LAYOUTS = {
    box: {
        _variants: [CLASS_CONSTANTS._wide, CLASS_CONSTANTS._inline],
        _alignV: alignV,
        _alignH: alignH,
        _defaultAlignV: CLASS_CONSTANTS._bottom,
        _defaultAlignH: CLASS_CONSTANTS._right
    },
    cloud: {
        _variants: [CLASS_CONSTANTS._inline],
        _alignV: alignV,
        _alignH: alignH,
        _defaultAlignV: CLASS_CONSTANTS._bottom,
        _defaultAlignH: CLASS_CONSTANTS._center
    },
    bar: {
        _variants: [CLASS_CONSTANTS._inline],
        _alignV: alignV.slice(1),   //remove the first "middle" option
        _alignH: [],
        _defaultAlignV: CLASS_CONSTANTS._bottom,
        _defaultAlignH: ''
    }
};

const ALL_PM_LAYOUTS = {
    box: {
        _variants: [],
        _alignV: [],
        _alignH: [],
        _defaultAlignV: '',
        _defaultAlignH: ''
    },
    bar: {
        _variants: [CLASS_CONSTANTS._wide],
        _alignV: [],
        _alignH: [CLASS_CONSTANTS._left, CLASS_CONSTANTS._right],
        _defaultAlignV: '',
        _defaultAlignH: CLASS_CONSTANTS._left
    }
};

/**
 * Add appropriate classes to modals and buttons
 * @param {0 | 1} applyToModal
 */
export const guiManager = (applyToModal) => {
    const guiOptions = globalObj._state._userConfig.guiOptions;
    const consentModalOptions = guiOptions && guiOptions.consentModal;
    const preferencesModalOptions = guiOptions && guiOptions.preferencesModal;

    if (applyToModal === 0) {
        setLayout(
            globalObj._dom._cm,
            ALL_CM_LAYOUTS,
            consentModalOptions,
            CLASS_CONSTANTS._cmPrefix,
            CLASS_CONSTANTS._box,
            'cm'
        );
    }

    if (applyToModal === 1) {
        setLayout(
            globalObj._dom._pm,
            ALL_PM_LAYOUTS,
            preferencesModalOptions,
            CLASS_CONSTANTS._pmPrefix,
            CLASS_CONSTANTS._box,
            'pm'
        );
    }
};

/**
 * Helper function to set the proper layout classes
 * @param {HTMLElement} modal
 * @param {Layouts} allowedLayoutsObj
 * @param {import("../core/global").GuiModalOption} userGuiOptions
 * @param {'cm--' | 'pm--'} modalClassPrefix
 * @param {string} defaultLayoutName
 * @param {'cm' | 'pm'} modalClassName
 */
const setLayout = (modal, allowedLayoutsObj, userGuiOptions, modalClassPrefix, defaultLayoutName, modalClassName) => {
    /**
     * Reset modal classes to default
     */
    modal.className = modalClassName;

    const layout = userGuiOptions && userGuiOptions.layout;
    const position = userGuiOptions && userGuiOptions.position;
    const flipButtons = userGuiOptions && userGuiOptions.flipButtons;
    const equalWeightButtons = !userGuiOptions || userGuiOptions.equalWeightButtons !== false;

    const layoutSplit = layout && layout.split(' ') || [];

    const layoutName = layoutSplit[0];
    const layoutVariant = layoutSplit[1];

    const currentLayoutName = layoutName in allowedLayoutsObj
        ? layoutName
        : defaultLayoutName;

    const currentLayout = allowedLayoutsObj[currentLayoutName];
    const currentLayoutVariant = elContains(currentLayout._variants, layoutVariant) && layoutVariant;

    const positionSplit = position && position.split(' ') || [];
    const positionV = positionSplit[0];

    const positionH = modalClassPrefix === CLASS_CONSTANTS._pmPrefix
        ? positionSplit[0]
        : positionSplit[1];

    const currentPositionV = elContains(currentLayout._alignV, positionV)
        ? positionV
        : currentLayout._defaultAlignV;

    const currentPositionH = elContains(currentLayout._alignH, positionH)
        ? positionH
        : currentLayout._defaultAlignH;

    const addModalClass = className => {
        className && addClass(modal, modalClassPrefix + className);
    };

    addModalClass(currentLayoutName);
    addModalClass(currentLayoutVariant);
    addModalClass(currentPositionV);
    addModalClass(currentPositionH);
    flipButtons && addModalClass('flip');

    const secondaryBtnClass = 'btn--secondary';
    const btnClassPrefix = modalClassName + '__';
    const btnClass = btnClassPrefix + secondaryBtnClass;

    /**
     * Add classes to buttons
     */
    if (modalClassName === 'cm') {
        const {_cmAcceptNecessaryBtn, _cmCloseIconBtn} = globalObj._dom;

        if (_cmAcceptNecessaryBtn) {
            equalWeightButtons
                ? removeClass(_cmAcceptNecessaryBtn, btnClass)
                : addClass(_cmAcceptNecessaryBtn, btnClass);
        }

        if (_cmCloseIconBtn) {
            equalWeightButtons
                ? removeClass(_cmCloseIconBtn, btnClass)
                : addClass(_cmCloseIconBtn, btnClass);
        }
    } else {
        const { _pmAcceptNecessaryBtn } =  globalObj._dom;

        if (_pmAcceptNecessaryBtn) {
            equalWeightButtons
                ? removeClass(_pmAcceptNecessaryBtn, btnClass)
                : addClass(_pmAcceptNecessaryBtn, btnClass);
        }
    }
};