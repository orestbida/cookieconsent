import { resetState } from "./stateManager";
import { addEvent, getById } from "./utils";

const btn = getById('reset-btn');

addEvent(btn, 'click', () => resetState());