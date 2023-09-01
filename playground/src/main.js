import '../../dist/cookieconsent.css';
import * as CookieConsent from '../../dist/cookieconsent.esm';
import { fireEvent, customEvents } from './components/utils';
import { getCurrentUserConfig, getState, clearInvalidDemoState } from './components/stateManager';

window.CookieConsent = CookieConsent;

import './components/language';
import './components/translations';
import './components/editTranslationsDialog';
import './components/categories';
import './components/disablePageInteraction';
import './components/darkmode';
import './components/buttons';
import './components/guiOptions';
import './components/consentModalElements';
import './components/customThemes';
import './components/downloadConfig';
import './components/textareaHighlight';

clearInvalidDemoState();
fireEvent(customEvents._PLAYGROUND_READY);

CookieConsent
    .run(getCurrentUserConfig(getState()))
    .then(() => {
        fireEvent(customEvents._INIT);
    });