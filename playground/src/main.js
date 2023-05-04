import '../../dist/cookieconsent.css';
import * as CookieConsent from '../../dist/cookieconsent.esm';
import { fireEvent, customEvents } from './components/utils';
import { getCurrentUserConfig, getState } from './components/stateManager';

window.CookieConsent = CookieConsent;

import './components/language';
import './components/translations';
import './components/categories';
import './components/disablePageInteraction';
import './components/darkmode';
import './components/buttons';
// import './components/consentDetails';
// import './components/printCategories';
// import './components/printValidConsent';
import './components/guiOptions';
import './components/consentModalElements';
import './components/customThemes';
import './components/downloadConfig';

CookieConsent
    .run(getCurrentUserConfig(getState()))
    .then(() => fireEvent(customEvents._INIT));