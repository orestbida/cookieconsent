import { globalObj } from '../core/global';
import { BUTTON_TAG } from './constants';
import { addEvent, focus, preventDefault, getActiveElement, querySelectorAll } from './dom';

/**
 * Note: any of the below focusable elements, which has the attribute tabindex="-1" AND is either
 * the first or last element of the modal, won't receive focus during "open/close" modal
 */
const focusableTypesSelector = ['[href]', BUTTON_TAG, 'input', 'details', '[tabindex]']
    .map(selector => selector+':not([tabindex="-1"])').join(',');

export const getFocusableElements = (root) => querySelectorAll(root, focusableTypesSelector);

/**
 * Save reference to first and last focusable elements inside each modal
 * to prevent losing focus while navigating with TAB
 * @param {1 | 2} [modalId]
 */
export const getModalFocusableData = (modalId) => {
    const { _state, _dom } = globalObj;

    /**
     * Saves all focusable elements inside modal, into the array
     * @param {HTMLElement} modal
     * @param {Element[]} array
     */
    const saveAllFocusableElements = (modal, array) => {
        const focusableElements = getFocusableElements(modal);

        /**
         * Save first and last elements (trap focus inside modal)
         */
        array[0] = focusableElements[0];
        array[1] = focusableElements[focusableElements.length - 1];
    };

    if (modalId === 1 && _state._consentModalExists)
        saveAllFocusableElements(_dom._cm, _state._cmFocusableElements);

    if (modalId === 2 && _state._preferencesModalExists)
        saveAllFocusableElements(_dom._pm, _state._pmFocusableElements);
};

/**
 * Trap focus inside modal and focus the first
 * focusable element of current active modal
 * @param {HTMLDivElement} modal
 */
export const handleFocusTrap = (modal) => {
    const dom = globalObj._dom;
    const state = globalObj._state;

    /**
     * @param {HTMLDivElement} modal
     * @param {HTMLElement[]} focusableElements
     */
    const trapFocus = (modal) => {
        const isConsentModal = modal === dom._cm;

        const scope = state._userConfig.disablePageInteraction
            ? dom._htmlDom
            : isConsentModal
                ? dom._ccMain
                : dom._htmlDom;

        const getFocusableElements = () => isConsentModal
            ? state._cmFocusableElements
            : state._pmFocusableElements;

        const isModalVisible = () => isConsentModal
            ? state._consentModalVisible && !state._preferencesModalVisible
            : state._preferencesModalVisible;

        addEvent(scope, 'keydown', (e) => {
            if (e.key !== 'Tab' || !isModalVisible())
                return;

            const currentActiveElement = getActiveElement();
            const focusableElements = getFocusableElements();

            if (focusableElements.length === 0)
                return;

            /**
             * True when focus is on a non-tabbable element inside the modal,
             * e.g. the tabindex="-1" element the library focuses on open
             */
            const isUntrackedFocus = modal.contains(currentActiveElement) && currentActiveElement.tabIndex < 0;

            /**
             * If reached natural end of the tab sequence => restart
             * If current focused element is not inside modal, or is inside
             * but isn't one of the tracked focusable elements => focus modal
             */
            if (e.shiftKey) {
                if (currentActiveElement === focusableElements[0] || !modal.contains(currentActiveElement) || isUntrackedFocus) {
                    preventDefault(e);
                    focus(focusableElements[1]);
                }
            } else {
                if (currentActiveElement === focusableElements[1] || !modal.contains(currentActiveElement) || isUntrackedFocus) {
                    preventDefault(e);
                    focus(focusableElements[0]);
                }
            }
        }, true);
    };

    trapFocus(modal);
};
