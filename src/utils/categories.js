import { globalObj } from '../core/global';
import {
    arrayDiff,
    deepCopy,
    elContains,
    getKeys,
    unique
} from './collections';
import { dispatchInputChangeEvent } from './dom';
import { isArray, isObject, isString } from './type-guards';

/**
 * Store categories and services' config. details
 * @param {string[]} allCategoryNames
 */
export const fetchCategoriesAndServices = (allCategoryNames) => {
    const {
        _allDefinedCategories,
        _allDefinedServices,
        _acceptedServices,
        _enabledServices,
        _readOnlyCategories
    } = globalObj._state;

    for (let categoryName of allCategoryNames) {

        const currCategory = _allDefinedCategories[categoryName];
        const services = currCategory.services || {};
        const serviceNames = isObject(services) && getKeys(services) || [];

        _allDefinedServices[categoryName] = {};
        _acceptedServices[categoryName] = [];
        _enabledServices[categoryName] = [];

        /**
         * Keep track of readOnly categories
         */
        if (currCategory.readOnly) {
            _readOnlyCategories.push(categoryName);
            _acceptedServices[categoryName] = serviceNames;
        }

        globalObj._dom._serviceCheckboxInputs[categoryName] = {};

        for (let serviceName of serviceNames) {
            const service = services[serviceName];
            service._enabled = false;
            _allDefinedServices[categoryName][serviceName] = service;
        }
    }
};

/**
 * Calculate rejected services (all services - enabled services)
 * @returns {Object.<string, string[]>}
 */
export const retrieveRejectedServices = () => {
    const rejectedServices = {};

    const {
        _allCategoryNames,
        _allDefinedServices,
        _acceptedServices
    } = globalObj._state;

    for (const categoryName of _allCategoryNames) {
        rejectedServices[categoryName] = arrayDiff(
            _acceptedServices[categoryName],
            getKeys(_allDefinedServices[categoryName])
        );
    }

    return rejectedServices;
};

export const retrieveCategoriesFromModal = () => {
    const toggles = globalObj._dom._categoryCheckboxInputs;

    if (!toggles)
        return [];

    let enabledCategories = [];

    for (let categoryName in toggles) {
        if (toggles[categoryName].checked) {
            enabledCategories.push(categoryName);
        }
    }

    return enabledCategories;
};

/**
 * @param {string[]|string} categories - Categories to accept
 * @param {string[]} [excludedCategories]
 */
export const resolveEnabledCategories = (categories, excludedCategories) => {
    const {
        _allCategoryNames,
        _acceptedCategories,
        _readOnlyCategories,
        _preferencesModalExists,
        _enabledServices,
        _defaultEnabledCategories,
        _allDefinedServices
    } = globalObj._state;

    /**
     * @type {string[]}
     */
    let enabledCategories = [];

    if (!categories) {
        enabledCategories = [..._acceptedCategories, ..._defaultEnabledCategories];
        //{{START: GUI}}
        if (_preferencesModalExists) {
            enabledCategories = retrieveCategoriesFromModal();
        }
        //{{END: GUI}}
    } else {
        if (isArray(categories)) {
            enabledCategories.push(...categories);
        } else if (isString(categories)) {
            enabledCategories = categories === 'all'
                ? _allCategoryNames
                : [categories];
        }
    }

    // Remove invalid and excluded categories
    enabledCategories = enabledCategories.filter(category =>
        elContains(_allCategoryNames, category) &&
        !elContains(excludedCategories, category)
    );

    /**
     * If there are services, turn them all on or off
     */
    if (categories) {
        for (const categoryName of _allCategoryNames) {
            _enabledServices[categoryName] = elContains(enabledCategories, categoryName)
                ? getKeys(_allDefinedServices[categoryName])
                : [];
        }
    }

    // Add back all the categories set as "readonly/required"
    enabledCategories.push(..._readOnlyCategories);

    setAcceptedCategories(enabledCategories);
};

/**
 * @param {string} [relativeCategory]
 */
export const resolveEnabledServices = (relativeCategory) => {
    const state = globalObj._state;

    const {
        _enabledServices,
        _readOnlyCategories,
        _acceptedServices,
        _allDefinedServices,
        _allCategoryNames
    } = state;

    const categoriesToConsider = relativeCategory
        ? [relativeCategory]
        : _allCategoryNames;

    /**
     * Save previously enabled services to calculate later on which of them was changed
     */
    state._lastEnabledServices = deepCopy(_acceptedServices);

    for (const categoryName of categoriesToConsider) {
        const services = _allDefinedServices[categoryName];
        const serviceNames = getKeys(services);

        /**
         * Stop here if there are no services
         */
        if (serviceNames.length === 0)
            continue;

        // If category is marked as readOnly enable all its services
        _acceptedServices[categoryName] = unique(elContains(_readOnlyCategories, categoryName)
            ? serviceNames
            : _enabledServices[categoryName] || []
        );
    }
};

/**
 * True if the toggle of the category (or of one of its services) should be checked.
 * Without `useAcceptedState`, the defaults are used.
 * @param {string} categoryName
 * @param {string} [serviceName]
 * @param {boolean} [useAcceptedState]
 */
export const isToggleChecked = (categoryName, serviceName, useAcceptedState) => {
    const state = globalObj._state;

    if (state._allDefinedCategories[categoryName].readOnly)
        return true;

    if (!useAcceptedState)
        return elContains(state._defaultEnabledCategories, categoryName);

    return serviceName
        ? elContains(state._acceptedServices[categoryName], serviceName)
        : elContains(state._acceptedCategories, categoryName);
};

/**
 * Tick/untick all the modal's toggles and reset the enabled services to match
 * @param {boolean} [useAcceptedState]
 */
export const syncModalToggles = (useAcceptedState) => {
    const { _categoryCheckboxInputs, _serviceCheckboxInputs } = globalObj._dom;

    for (const categoryName in _categoryCheckboxInputs) {
        const enabledServices = [];

        _categoryCheckboxInputs[categoryName].checked = isToggleChecked(categoryName, '', useAcceptedState);

        for (const serviceName in _serviceCheckboxInputs[categoryName]) {
            const serviceInput = _serviceCheckboxInputs[categoryName][serviceName];

            serviceInput.checked = isToggleChecked(categoryName, serviceName, useAcceptedState);
            serviceInput.checked && enabledServices.push(serviceName);
        }

        globalObj._state._enabledServices[categoryName] = enabledServices;
    }
};

/**
 * Update services state internally and tick/untick checkboxes
 * @param {string|string[]} service
 * @param {string} category
 */
export const updateModalToggles = (service, category) => {
    const state = globalObj._state;
    const {
        _allDefinedServices,
        _enabledServices,
        _preferencesModalExists
    } = state;

    const servicesInputs = globalObj._dom._serviceCheckboxInputs[category] || {};
    const categoryInput = globalObj._dom._categoryCheckboxInputs[category] || {};
    const allServiceNames = getKeys(_allDefinedServices[category]);

    // Clear previously enabled services
    _enabledServices[category] = [];

    if (isString(service)) {
        if (service === 'all') {

            // Enable all services
            _enabledServices[category].push(...allServiceNames);

            if (_preferencesModalExists) {
                for (let serviceName in servicesInputs) {
                    servicesInputs[serviceName].checked = true;
                    dispatchInputChangeEvent(servicesInputs[serviceName]);
                }
            }

        } else {

            // Enable only one service (if valid) and disable all the others
            if (elContains(allServiceNames, service))
                _enabledServices[category].push(service);

            if (_preferencesModalExists) {
                for (let serviceName in servicesInputs) {
                    servicesInputs[serviceName].checked = service === serviceName;
                    dispatchInputChangeEvent(servicesInputs[serviceName]);
                }
            }
        }
    } else if (isArray(service)) {
        for (let serviceName of allServiceNames) {
            const validService = elContains(service, serviceName);
            validService && _enabledServices[category].push(serviceName);

            if (_preferencesModalExists) {
                servicesInputs[serviceName].checked = validService;
                dispatchInputChangeEvent(servicesInputs[serviceName]);
            }
        }
    }

    const uncheckCategory = _enabledServices[category].length === 0;

    /**
     * Remove/add the category from acceptedCategories
     */
    state._acceptedCategories = uncheckCategory
        ? state._acceptedCategories.filter(cat => cat !== category)
        : unique([...state._acceptedCategories, category]);

    /**
     * If there are no services enabled in the
     * current category, uncheck the category
     */
    if (_preferencesModalExists) {
        categoryInput.checked = !uncheckCategory;
        dispatchInputChangeEvent(categoryInput);
    }
};

/**
 * Calculate "accept type"
 * @returns {'all'|'custom'|'necessary'} accept type
 */
export const resolveAcceptType = () => {
    let type = 'custom';

    const { _acceptedCategories, _allCategoryNames, _readOnlyCategories } = globalObj._state;
    const nAcceptedCategories = _acceptedCategories.length;

    if (nAcceptedCategories === _allCategoryNames.length)
        type = 'all';
    else if (nAcceptedCategories === _readOnlyCategories.length)
        type = 'necessary';

    return type;
};

/**
 * Note: getUserPreferences() depends on "acceptType"
 * @param {string[]} acceptedCategories
 */
export const setAcceptedCategories = (acceptedCategories) => {
    globalObj._state._acceptedCategories = unique(acceptedCategories);
    globalObj._state._acceptType = resolveAcceptType();
};

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback createModal
 * @param {import('../core/global').Api} api
 */

/**
 * Obtain accepted and rejected categories
 * @returns {{accepted: string[], rejected: string[]}}
 */
export const getCurrentCategoriesState = () => {
    const {
        _invalidConsent,
        _acceptedCategories,
        _allCategoryNames
    } = globalObj._state;

    return {
        accepted: _acceptedCategories,
        rejected: _invalidConsent
            ? []
            : _allCategoryNames.filter(category =>
                !elContains(_acceptedCategories, category)
            )
    };
};
