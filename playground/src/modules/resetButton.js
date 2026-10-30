import { resetState } from "./stateManager";
import { addEvent, getById } from "./utils";

const btn = getById('reset-btn');

addEvent(btn, 'click', () => {
    if (confirm('Reset all settings and translation changes?'))
        resetState();
});