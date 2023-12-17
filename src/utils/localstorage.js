export const localStorageManager = {
    /**
     * @param {string} key
     * @param {string} value
     */
    _setItem: (key, value) => {
        localStorage.setItem(key, value);
    },

    /**
     * @param {string} key
     */
    _getItem: (key) => localStorage.getItem(key) || '',

    /**
     * @param {string} key
     */
    _removeItem: (key) => localStorage.removeItem(key)
};