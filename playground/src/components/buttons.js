import { resetState } from './stateManager';
import { addEvent, getById } from './utils';

/**
 * @type {HTMLButtonElement}
 */
const resetBtn = getById('resetBtn');

addEvent(resetBtn, 'click', resetState);