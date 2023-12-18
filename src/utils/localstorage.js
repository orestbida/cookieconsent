import { safeRun } from './general';

export const localStorageManager = {
    /**
     * @param {string} key
     * @param {string} value
     */
    _setItem: (key, value) => {
        safeRun(() => localStorage.setItem(key, value));
    },

    /**
     * @param {string} key
     */
    _getItem: (key) => safeRun(() => localStorage.getItem(key)) || '',

    /**
     * @param {string} key
     */
    _removeItem: (key) => safeRun(() => localStorage.removeItem(key))
};