import type { CookieConsentConfig } from '../../../../types';

/**
 * Cookie Consent config to use in the Nextjs demo.
 */
const config: CookieConsentConfig = {
  // root: 'body',
  // autoShow: true,
  // disablePageInteraction: true,
  // hideFromBots: true,
  // mode: 'opt-in',
  // revision: 0,
  isTcfCompliant: true,
  tcfComplianceConfig: {
    disclosedVendorIds: [755, 12, 32, 416]
  },

  cookie: {
    // name: 'cc_cookie',
    // domain: location.hostname,
    // path: '/',
    // sameSite: "Lax",
    // expiresAfterDays: 365,
  },

  /**
   * Callback functions
   */
  onFirstConsent: ({ cookie }) => {
    console.log('onFirstConsent fired', cookie);
  },

  onConsent: ({ cookie }) => {
    console.log('onConsent fired!', cookie);
  },

  onChange: ({ changedCategories, changedServices }) => {
    console.log('onChange fired!', changedCategories, changedServices);
  },

  onModalReady: ({ modalName }) => {
    console.log('ready:', modalName);
  },

  onModalShow: ({ modalName }) => {
    console.log('visible:', modalName);
  },

  onModalHide: ({ modalName }) => {
    console.log('hidden:', modalName);
  },

  // https://cookieconsent.orestbida.com/reference/configuration-reference.html#guioptions
  guiOptions: {
    consentModal: {
      layout: 'box inline',
      position: 'bottom left',
      equalWeightButtons: true,
      flipButtons: false
    },
    preferencesModal: {
      layout: 'box',
      equalWeightButtons: true,
      flipButtons: false
    }
  },

  categories: {
    necessary: {
      enabled: true, // this category is enabled by default
      readOnly: true // this category cannot be disabled
    },
    analytics: {
      autoClear: {
        cookies: [
          {
            name: /^_ga/ // regex: match all cookies starting with '_ga'
          },
          {
            name: '_gid' // string: exact cookie name
          }
        ]
      },

      // https://cookieconsent.orestbida.com/reference/configuration-reference.html#category-services
      services: {
        ga: {
          label: 'Google Analytics',
          onAccept: () => {},
          onReject: () => {}
        },
        youtube: {
          label: 'Youtube Embed',
          onAccept: () => {},
          onReject: () => {}
        }
      }
    },
    ads: {}
  },

  language: {
    default: 'en',
    autoDetect: 'document',
    translations: {
      en: {
        consentModal: {
          title: 'We Care About Your Privacy',
          description: 'We and our partners ({{count}}) store and/or access information on a device, such as unique IDs in cookies to process personal data. You may find out more about the purposes for which we and our partners use cookies or exercise your preferences by clicking the ‘Cookie settings’ button below. You can revisit your consent choices or withdraw consent at any time by clicking the link to your cookie settings in our Cookie Policy. These choices will be signaled to our partners and will not affect browsing data.',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Accept necessary',
          showPreferencesBtn: 'Cookie settings',
          footer: `
                      <a href="#path-to-impressum.html" target="_blank">Impressum</a>
                      <a href="#path-to-privacy-policy.html" target="_blank">Privacy Policy</a>
                  `
        },
        preferencesModal: {
          title: 'Manage cookie preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Accept necessary',
          savePreferencesBtn: 'Accept current selection',
          closeIconLabel: 'Close modal',
          serviceCounterLabel: 'Service|Services',
          sections: [
            {
              title: 'Your Privacy Choices',
              description: 'In this panel you can express some preferences related to the processing of your personal information. You may review and change expressed choices at any time by resurfacing this panel via the provided link. To deny your consent to the specific processing activities described below, switch the toggles to off or use the “Reject all” button and confirm you want to save your choices.'
            },
            {
              title: 'Strictly Necessary',
              description:
                'These cookies are essential for the proper functioning of the website and cannot be disabled.',

              //this field will generate a toggle linked to the 'necessary' category
              linkedCategory: 'necessary'
            },
            {
              title: 'Performance and Analytics',
              description:
                'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
              linkedCategory: 'analytics',
              cookieTable: {
                caption: 'Cookie table',
                headers: {
                  name: 'Cookie',
                  domain: 'Domain',
                  desc: 'Description'
                },
                body: [
                  {
                    name: '_ga',
                    domain: location.hostname,
                    desc: 'Description 1'
                  },
                  {
                    name: '_gid',
                    domain: location.hostname,
                    desc: 'Description 2'
                  }
                ]
              }
            },
            {
              title: 'Targeting and Advertising',
              description:
                'These cookies are used to make advertising messages more relevant to you and your interests. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.',
              linkedCategory: 'ads'
            },
            {
              title: 'More information',
              description:
                'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>'
            }
          ]
        }
      },
      hr: {
        consentModal: {
          description: 'We and our partners ({{count}}) store and/or access information on a device, such as unique IDs in cookies to process personal data. You may find out more about the purposes for which we and our partners use cookies or exercise your preferences by clicking the ‘Cookie settings’ button below. You can revisit your consent choices or withdraw consent at any time by clicking the link to your cookie settings in our Cookie Policy. These choices will be signaled to our partners and will not affect browsing data.'
        },
        preferencesModal: {
          sections: []
        }
      }
    }
  }
};

export default config;