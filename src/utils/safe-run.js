/**
 * @param {CallableFunction} fn
 */
export const safeRun = (fn, hideError) => {
    try {
        return fn();
    } catch (e) {
        !hideError && console.warn('CookieConsent:', e);
        return false;
    }
};
