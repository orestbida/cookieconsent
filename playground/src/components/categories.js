import { onEvent, customEvents } from './utils'
import { getState, defaultState, saveState } from './stateManager'

/**
 * @type {NodeListOf<HTMLInputElement>}
 */
const categoryInputs = document.querySelectorAll('.category-input');

const state = getState();

toggleCategories(state._enabledCategories);

categoryInputs.forEach(input => {

    input.value !== 'necessary' && input.addEventListener('change', () => {
        const enabled = input.checked;
        const category = input.value;
        const state = getState();

        state._enabledCategories = [...new Set(
            !enabled
                ? state._enabledCategories.filter(cat => cat !== category)
                : [...state._enabledCategories, category]
        )];

        saveState(state);
    });
})

/**
 * @param {string[]} enabledCategories
 */
function toggleCategories(enabledCategories) {

    enabledCategories = Array.from(new Set([
        ...enabledCategories,
        ...defaultState._enabledCategories
    ]));

    for(const input of categoryInputs) {
        input.checked = enabledCategories.includes(input.value);
    }
}

onEvent(customEvents._RESET, () => {
    toggleCategories([]);
});