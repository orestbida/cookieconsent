import { onEvent, customEvents, addEvent } from './utils';
import { defaultState, getState, reRunPlugin, saveState } from './stateManager';

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const categoryInputs = document.querySelectorAll('.category-input');

onEvent(customEvents._PLAYGROUND_READY, () => {
    const state = getState();
    toggleCategories(state._enabledCategories);

    for(const input of categoryInputs) {
        addEvent(input, 'change', inputChangeHandler);
    }
});

/**
 * @param {Event} event
 */
const inputChangeHandler = (event) => {
    /**
     * @type {HTMLInputElement}
     */
    const input = event.target;

    const enabled = input.checked;
    const category = input.value;
    const state = getState();

    state._enabledCategories = [...new Set(
        !enabled
            ? state._enabledCategories.filter(cat => cat !== category)
            : [...state._enabledCategories, category]
    )];

    saveState(state);
    reRunPlugin(state, 1);
};

/**
 * @param {string[]} enabledCategories
 */
const toggleCategories = (enabledCategories) => {
    for (const input of categoryInputs) {
        input.checked = enabledCategories.includes(input.value);
    }
}

onEvent(customEvents._RESET, () => {
    toggleCategories(defaultState._enabledCategories);
});