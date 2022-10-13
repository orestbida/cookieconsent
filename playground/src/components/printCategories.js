import '../assets/printCategories.scss';
import { onEvent, customEvents } from './utils';

const divs = {
    necessary: document.getElementById('necessary-category'),
    analytics: document.getElementById('analytics-category'),
    ads: document.getElementById('ads-category')
};

const ENABLED_CLASS = 'category--enabled';

onEvent(customEvents._ON_CONSENT, ({detail}) => {

    /**
     * @type {import('vanilla-cookieconsent').CookieValue}
     */
    const cookie = detail.cookie;

    cookie.categories.forEach(categoryName => {
        divs[categoryName].classList.add(ENABLED_CLASS);
    });
});

onEvent(customEvents._ON_CHANGE, ({detail}) => {
    /**
     * @type {string[]}
     */
    const changedCategories = detail.changedCategories;

    changedCategories.forEach(categoryName => {

        const classListAction = window.CookieConsent.acceptedCategory(categoryName)
            ? 'add'
            : 'remove';

        divs[categoryName].classList[classListAction](ENABLED_CLASS);
    });
});

onEvent(customEvents._RESET, () => {
    toggleAll(false);
});

/**
 * @param {HTMLElement} el
 * @param {boolean} enable
 */
function toggleCategory(el, enable){
    const action = enable
        ? 'add'
        : 'remove';

    el.classList[action](ENABLED_CLASS);
}

/**
 * @param {boolean} enable
 */
function toggleAll(enable){
    for(let key in divs){
        toggleCategory(divs[key], enable);
    }
}