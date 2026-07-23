import { globalObj } from '../core/global';
import { isArray, isString, isObject } from './type-guards';
import { elContains, unique, arrayDiff, getKeys, deepCopy } from './collections';
import { dispatchInputChangeEvent } from './dom';

/**
 * True if category is readOnly and not explicitly disabled
 * @param {import('../core/global').Category} category
 */
export const isCategoryAlwaysEnabled = (category) => !!category && !!category.readOnly && category.enabled !== false;

/**
 * True if category is readOnly and explicitly disabled (locked off)
 * @param {import('../core/global').Category} category
 */
export const isCategoryLockedOff = (category) => !!category && !!category.readOnly && category.enabled === false;

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
        if (isCategoryAlwaysEnabled(currCategory)) {
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
        _allDefinedServices,
        _allDefinedCategories
    } = globalObj._state;

    /**
     * @type {string[]}
     */
    let enabledCategories = [];

    const excludeLockedOff = (categoryName) => !isCategoryLockedOff(_allDefinedCategories[categoryName]);

    if (!categories) {
        enabledCategories = [..._acceptedCategories, ..._defaultEnabledCategories].filter(excludeLockedOff);
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

        // Locked off categories can never be turned on
        enabledCategories = enabledCategories.filter(excludeLockedOff);

        /**
         * If there are services, turn them all on or off
         */
        for (const categoryName of _allCategoryNames) {
            _enabledServices[categoryName] = elContains(enabledCategories, categoryName)
                ? getKeys(_allDefinedServices[categoryName])
                : [];
        }
    }

    // Remove invalid and excluded categories
    enabledCategories = enabledCategories.filter(category =>
        !elContains(_allCategoryNames, category) ||
        !elContains(excludedCategories, category)
    );

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
        const customServicesSelection = _enabledServices[categoryName] && _enabledServices[categoryName].length > 0;
        const readOnlyCategory = elContains(_readOnlyCategories, categoryName);

        /**
         * Stop here if there are no services
         */
        if (serviceNames.length === 0)
            continue;

        // Empty (previously) enabled services
        _acceptedServices[categoryName] = [];

        // If category is marked as readOnly enable all its services
        if (readOnlyCategory) {
            _acceptedServices[categoryName].push(...serviceNames);
        } else {
            if (customServicesSelection) {
                const selectedServices = _enabledServices[categoryName];
                _acceptedServices[categoryName].push(...selectedServices);
            } else {
                _acceptedServices[categoryName] = state._enabledServices[categoryName];
            }
        }

        /**
         * Make sure there are no duplicates inside array
         */
        _acceptedServices[categoryName] = unique(_acceptedServices[categoryName]);
    }
};

/**
 * Resolve the `service` argument (accepted by both `acceptService` and
 * `setAcceptedServices`) into the list of valid service names it refers to
 * @param {string|string[]} service
 * @param {string} category
 * @returns {string[]}
 */
export const resolveServiceNames = (service, category) => {
    const allServiceNames = getKeys(globalObj._state._allDefinedServices[category]);

    if (isString(service)) {
        return service === 'all'
            ? [...allServiceNames]
            : allServiceNames.filter(name => name === service);
    }

    if (isArray(service))
        return allServiceNames.filter(name => elContains(service, name));

    return [];
};

/**
 * Set the exact list of enabled services for a category (tick/untick
 * checkboxes to match) and keep the category itself in sync
 * @param {string[]} enabledServiceNames
 * @param {string} category
 */
export const updateModalToggles = (enabledServiceNames, category) => {
    const state = globalObj._state;
    const { _enabledServices, _preferencesModalExists } = state;

    const servicesInputs = globalObj._dom._serviceCheckboxInputs[category] || {};
    const categoryInput = globalObj._dom._categoryCheckboxInputs[category] || {};

    _enabledServices[category] = [...enabledServiceNames];

    if (_preferencesModalExists) {
        for (let serviceName in servicesInputs) {
            const checked = elContains(enabledServiceNames, serviceName);
            servicesInputs[serviceName].checked = checked;
            dispatchInputChangeEvent(servicesInputs[serviceName]);
        }
    }

    const uncheckCategory = enabledServiceNames.length === 0;

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
 * True when a Global Privacy Control opt-out signal must be enforced:
 * the feature is enabled, the browser sent the signal, and there is
 * no explicit consent decision (cookie) yet to override it.
 * @returns {boolean}
 */
export const isGpcOptOutActive = () => {
    const state = globalObj._state;
    return state._gpcSignalDetected && state._invalidConsent;
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
