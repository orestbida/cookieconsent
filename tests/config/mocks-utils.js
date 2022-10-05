import crypto from 'crypto';

export const botUserAgent = 'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)';

export const defineCryptoRandom = () => {
    if(!global.crypto){
        Object.defineProperty(global, 'crypto', {
            value: {
              getRandomValues: (arr) => crypto.randomBytes(arr.length)
            }
        });
    }
}
export const setCookie = (name,value,days=1) => {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
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