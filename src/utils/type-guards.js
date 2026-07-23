export const isArray = el => Array.isArray(el);

export const isString = el => typeof el === 'string';

export const isObject = el => !!el && typeof el === 'object' && !isArray(el);

export const isFunction = el => typeof el === 'function';
