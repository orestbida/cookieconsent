import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from '../../src/index.js';
import { getState } from './components/stateManager';
import { fireEvent, customEvents } from './components/utils';

window.CookieConsent = CookieConsent;

import './components/disablePageInteraction';
import './components/languages';
import './components/darkmode';
import './components/buttons';
import './components/consentDetails';
import './components/printCategories';
import './components/printValidConsent';
import './components/guiOptions';
import './components/consentModalElements';

CookieConsent
    .run(getState().cookieConsentConfig)
    .then(() => fireEvent(customEvents._INIT));