import * as CookieConsent from '../../../dist/cookieconsent.esm'
import { fireEvent, customEvents, addEvent } from './utils';
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

/**
 * Every change previews the consent modal, which takes the focus;
 * give it back to the playground control that was being used
 * (unless page interaction is disabled)
 */
addEvent(document, 'focusin', ({ target, relatedTarget }) => {
    if (
        target.matches('#cc-main .cm')
        && relatedTarget
        && !relatedTarget.closest('#cc-main')
        && !document.documentElement.classList.contains('disable--interaction')
    ) {
        relatedTarget.focus();
    }
});

clearInvalidDemoState();
fireEvent(customEvents._PLAYGROUND_READY);

CookieConsent
    .run(getCurrentUserConfig(getState()))
    .then(() => {
        fireEvent(customEvents._INIT);
        fireEvent(customEvents._RUN);
    });