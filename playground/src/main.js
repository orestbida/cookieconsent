import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';
import { getState } from './components/stateManager';

window.CookieConsent = CookieConsent;

import './components/disablePageInteraction';
import './components/languages';
import './components/darkmode';
import './components/buttons';
import './components/consentDetails';
import './components/printCategories';
import './components/printValidConsent';

CookieConsent.run(getState().cookieConsentConfig);