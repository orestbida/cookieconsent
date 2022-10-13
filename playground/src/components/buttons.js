import { resetState } from './stateManager';

/** @type {HTMLButtonElement} **/ const resetBtn = document.getElementById('resetBtn');

resetBtn.addEventListener('click', () => {
    resetState();
});