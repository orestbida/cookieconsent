import '../assets/printValidConsent.scss';
import { onEvent, customEvents } from './utils';

const statsuDiv = document.getElementById('consent-status');
const ENABLED_CLASS = 'consent-status--valid';

onEvent(customEvents._ON_CONSENT, () => {
    statsuDiv.classList.add(ENABLED_CLASS);
});

onEvent(customEvents._RESET, () => {
    statsuDiv.classList.remove(ENABLED_CLASS);
});