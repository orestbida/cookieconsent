import crypto from 'crypto';

export const defineCryptoRandom = () => {
    if(!global.crypto){
        Object.defineProperty(global, 'crypto', {
            value: {
              getRandomValues: (arr) => crypto.randomBytes(arr.length)
            }
        });
    }
}

export function htmlHasClass(className){
    return document.documentElement.className.includes(className);
}

export function setUserAgent(userAgent) {
    Object.defineProperty(global.navigator, "userAgent", {
        get: function () {
            return userAgent; // customized user agent
        },
        configurable: true
    });
}

/**
 * Simulate user click
 * @param {HTMLElement} el
 */
export function fireClickEvent(el){
    el.dispatchEvent(new Event('click'));
}