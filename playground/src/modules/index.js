import * as CookieConsent from '../../../dist/cookieconsent.esm'
import { fireEvent, customEvents } from './utils';
import { getCurrentUserConfig, getState, clearInvalidDemoState } from './stateManager';

import './categories'
import './language'
import './translations'
import './translationEditor'
import './guiOptions'
import './misc'
import './customThemes'
import './downloadConfig'

window.CookieConsent = CookieConsent;

clearInvalidDemoState();
fireEvent(customEvents._PLAYGROUND_READY);

CookieConsent
    .run(getCurrentUserConfig(getState()))
    .then(() => {
        fireEvent(customEvents._INIT);
    });