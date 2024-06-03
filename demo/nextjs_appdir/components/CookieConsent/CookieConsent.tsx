'use client';

import { useEffect } from 'react';
import * as CookieConsent from 'dist/cookieconsent.esm';

import 'dist/cookieconsent.css';
import config from './CookieConsentConfig';

/**
 * Function representing the CookieConsent component.
 *
 * @returns CookieConsent component
 */
export default function CookieConsentCmp() {
  useEffect(() => {
    CookieConsent.run(config);
  }, []);

  /**
   * Handles the Cookie Consent reset action.
   */
  const handleCookieConsentReset = () => {
    CookieConsent.reset(true);
    CookieConsent.run(config);
  };

  return (
    <div className="flex gap-x-3">
      <button
        type="button"
        className="border p-2"
        onClick={CookieConsent.showPreferences}
      >
        Manage cookie preferences
      </button>

      <button
        type="button"
        className="border p-2"
        onClick={CookieConsent.showVendors}
      >
        Show vendors list
      </button>

      <button
        type="button"
        className="border p-2"
        onClick={handleCookieConsentReset}
      >
        Reset cookie consent
      </button>
    </div>
  );
}