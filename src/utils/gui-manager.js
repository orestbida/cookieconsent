import { state, dom } from '../core/global';
import { _inArray, _addClass } from './general';

/**
 * Manage each modal's layout
 * @param {Object} guiOptions
 */
export const _guiManager = (applyToModal) => {

    var guiOptions = state._userConfig['guiOptions'];

    // If guiOptions is not object => exit
    if(typeof guiOptions !== 'object') return;

    var consentModalOptions = guiOptions['consentModal'];
    var preferencesModalOptions = guiOptions['preferencesModal'];

    /**
     * Helper function which adds layout and
     * position classes to given modal
     *
     * @param {HTMLElement} modal
     * @param {string[]} allowedLayouts
     * @param {string[]} allowedPositions
     * @param {string} layout
     * @param {string[]} position
     */
    function _setLayout(modal, allowedLayouts, allowedPositions, allowed_transitions, layout, position, transition){
        position = (position && position.split(' ')) || [];

        // Check if specified layout is valid
        if(_inArray(allowedLayouts, layout) > -1){

            // Add layout classes
            _addClass(modal, layout);

            // Add position class (if specified)
            if(!(layout === 'bar' && position[0] === 'middle') && _inArray(allowedPositions, position[0]) > -1){
                for(var i=0; i<position.length; i++){
                    _addClass(modal, position[i]);
                }
            }
        }

        // Add transition class
        (_inArray(allowed_transitions, transition) > -1) && _addClass(modal, transition);
    }

    if(applyToModal === 0 && state._consentModalExists && consentModalOptions){
        // [TODO]

        dom._consentModal.classList.add('cm--bar');
        dom._consentModal.classList.add('cm--bottom-center');
        // _setLayout(
        //     dom._consentModal,
        //     ['box', 'bar', 'cloud'],
        //     ['top', 'middle', 'bottom'],
        //     ['zoom', 'slide'],
        //     consentModalOptions['layout'],
        //     consentModalOptions['position'],
        //     consentModalOptions['transition']
        // );
    }

    if(applyToModal === 1 && preferencesModalOptions){
        _setLayout(
            dom._preferencesContainer,
            ['bar'],
            ['left', 'right'],
            ['zoom', 'slide'],
            preferencesModalOptions['layout'],
            preferencesModalOptions['position'],
            preferencesModalOptions['transition']
        );
    }
};