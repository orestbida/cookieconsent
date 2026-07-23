import { globalObj } from '../core/global';
import { CLICK_EVENT } from './constants';
import { addEvent, setAttribute, preventDefault, querySelectorAll } from './dom';

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback createModal
 * @param {import('../core/global').Api} api
 */

/**
 * Add an onClick listeners to all html elements with data-cc attribute
 * @param {HTMLElement} [elem]
 * @param {import('../core/global').Api} api
 * @param {createModal} [createPreferencesModal]
 */
export const addDataButtonListeners = (elem, api, createPreferencesModal, createMainContainer) => {
    const ACCEPT_PREFIX = 'accept-';

    const {
        show,
        showPreferences,
        hide,
        hidePreferences,
        acceptCategory
    } = api;

    const rootEl = elem || document;
    const getElements = dataRole => querySelectorAll(rootEl, `[data-cc="${dataRole}"]`);

    /**
     * Helper function: accept and then hide modals
     * @param {Event} event source event
     * @param {string|string[]} [acceptType]
     */
    const acceptAction = (event, acceptType) => {
        preventDefault(event);
        acceptCategory(acceptType);
        hidePreferences();
        hide();
    };

    const
        showPreferencesModalElements = getElements('show-preferencesModal'),
        showConsentModalElements = getElements('show-consentModal'),
        acceptAllElements = getElements(ACCEPT_PREFIX + 'all'),
        acceptNecessaryElements = getElements(ACCEPT_PREFIX + 'necessary'),
        acceptCustomElements = getElements(ACCEPT_PREFIX + 'custom'),
        createPreferencesModalOnHover = globalObj._config.lazyHtmlGeneration;

    //{{START: GUI}}
    for (const el of showPreferencesModalElements) {
        setAttribute(el, 'aria-haspopup', 'dialog');
        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            showPreferences();
        });

        if (createPreferencesModalOnHover) {
            addEvent(el, 'mouseenter', (event) => {
                preventDefault(event);
                if (!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            }, true);

            addEvent(el, 'focus', () => {
                if (!globalObj._state._preferencesModalExists)
                    createPreferencesModal(api, createMainContainer);
            });
        }
    }

    for (let el of showConsentModalElements) {
        setAttribute(el, 'aria-haspopup', 'dialog');
        addEvent(el, CLICK_EVENT, (event) => {
            preventDefault(event);
            show(true);
        }, true);
    }
    //{{END: GUI}}

    for (let el of acceptAllElements) {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, 'all');
        }, true);
    }

    for (let el of acceptCustomElements) {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event);
        }, true);
    }

    for (let el of acceptNecessaryElements) {
        addEvent(el, CLICK_EVENT, (event) => {
            acceptAction(event, []);
        }, true);
    }
};
