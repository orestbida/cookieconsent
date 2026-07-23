import { globalObj } from '../core/global';
import { isFunction } from './type-guards';
import { deepCopy } from './collections';

/**
 * @param {string} eventName
 */
const dispatchPluginEvent = (eventName, data) => dispatchEvent(new CustomEvent(eventName, {detail: data}));

/**
 * Fire custom event
 * @param {string} eventName
 * @param {string} [modalName]
 * @param {HTMLElement} [modal]
 */
export const fireEvent = (eventName, modalName, modal) => {
    const {
        _onChange,
        _onConsent,
        _onFirstConsent,
        _onModalHide,
        _onModalReady,
        _onModalShow
    } = globalObj._callbacks;

    const events = globalObj._customEvents;

    //{{START: GUI}}
    if (modalName) {
        const modalParams = { modalName };

        if (eventName === events._onModalShow) {
            isFunction(_onModalShow) && _onModalShow(modalParams);
        } else if (eventName === events._onModalHide) {
            isFunction(_onModalHide) && _onModalHide(modalParams);
        } else {
            modalParams.modal = modal;
            isFunction(_onModalReady) && _onModalReady(modalParams);
        }

        return dispatchPluginEvent(eventName, modalParams);
    }
    //{{END: GUI}}

    const params = {
        cookie: globalObj._state._savedCookieContent
    };

    if (eventName === events._onFirstConsent) {
        isFunction(_onFirstConsent) && _onFirstConsent(deepCopy(params));
    } else if (eventName === events._onConsent) {
        isFunction(_onConsent) && _onConsent(deepCopy(params));
    } else {
        params.changedCategories = globalObj._state._lastChangedCategoryNames;
        params.changedServices = globalObj._state._lastChangedServices;
        isFunction(_onChange) && _onChange(deepCopy(params));
    }

    dispatchPluginEvent(eventName, deepCopy(params));
};
