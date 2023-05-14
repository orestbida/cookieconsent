import '../assets/printValidConsent.scss';
import { onEvent, customEvents, getById } from './utils';

const statusDiv = getById('consent-status');
const ENABLED_CLASS = 'consent-status--valid';

onEvent(customEvents._ON_CONSENT, () => {
    statusDiv.classList.add(ENABLED_CLASS);
});

onEvent(customEvents._RESET, () => {
    statusDiv.classList.remove(ENABLED_CLASS);
});