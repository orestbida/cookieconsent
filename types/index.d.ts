export = CookieConsent
export as namespace CookieConsent

declare namespace CookieConsent {
    type AcceptType =
        'all'
        | 'custom'
        | 'necessary'

    type ConsentModalLayout =
        'box'
        | 'box wide'
        | 'box inline'
        | 'cloud'
        | 'cloud inline'
        | 'bar'
        | 'bar inline'

    type ConsentModalPosition =
        'top'
        | 'bottom'
        | 'middle'
        | 'top left'
        | 'top center'
        | 'top right'
        | 'middle left'
        | 'middle center'
        | 'middle right'
        | 'bottom left'
        | 'bottom center'
        | 'bottom right'

    type PreferencesModalLayout =
        'box'
        | 'bar'
        | 'bar wide'

    type PreferencesModalPosition = 'left' | 'right'

    type VendorsModalLayout = 'box' | 'bar'

    type VendorsModalPosition = 'left' | 'right'

    type ModalName = 'consentModal' | 'preferencesModal' | 'vendorsModal'

    /**
     * Cookie to clear
     */
    interface CookieItem {
        /**
         * Cookie name
         */
        name: string | RegExp

        /**
         * Expected cookie path
         */
        path?: string

        /**
         * Expected cookie domain. Useful if you want to erase
         * a cookie set in the main domain, from the subdomain.
         */
        domain?: string
    }

    interface AutoClear {
        /**
         * Array of cookies to clear.
         */
        cookies: CookieItem[]

        /**
         * Reload page after the autoClear function.
         *
         * @default false
         */
        reloadPage?: boolean
    }

    interface Service {
        /**
         * Custom visible label (can also be html markup).
         */
        label?: string

        /**
         * Callback executed when the service is accepted.
         */
        onAccept?: () => void

        /**
         * Callback executed when the service is rejected
         * (assuming that it was previously enabled).
         */
        onReject?: () => void,

        /**
         * Array of cookies to clear.
         */
        cookies?: CookieItem[]
    }

    interface UserPreferences {
        /**
         * - all: all categories were accepted
         * - necessary: only the necessary (if any) categories were accepted
         * - custom: a custom selection of categories was accepted
         */
        acceptType: AcceptType

        acceptedCategories: string[]
        rejectedCategories: string[]

        acceptedServices: {[key: string]: string[]}
        rejectedServices: {[key: string]: string[]}
    }

    interface Category {
        /**
         * Mark category as enabled by default.
         *
         * If mode is set to `'opt-out'` and consent has not yet been expressed, the category
         * is automatically enabled (and scripts under this category will be executed).
         *
         * @default false
         */
        enabled?: boolean

        /**
         * Treat the category as necessary. The user won't be able to disable the category.
         *
         * @default false
         */
        readOnly?: boolean

        /**
         * Configure individually togglable services.
         */
        services?: {[key: string]: Service}

        /**
         * Declare the cookies to erase when the user rejects the category.
         */
        autoClear?: AutoClear
    }

    interface CookieValue {
        /**
         * All accepted categories.
         */
        categories: string[]

        /**
         * Last accepted revision number.
         *
         * @default 0
         */
        revision: number

        /**
         * Used to store custom data.
         */
        data: any

        /**
         * Unique UUIDV4 string that identifies the current user.
         */
        consentId: string

        /**
         * User's first consent timestamp.
         */
        consentTimestamp: string

        /**
         * User's last consent update.
         */
        lastConsentTimestamp: string

        /**
         * All enabled services.
         */
        services: {[key: string]: string[]}

        /**
         * Expiration time of the cookie (in case localstorage is used)
         */
        expirationTime: number
    }

    interface CookieOptions {
        /**
         * Cookie name.
         *
         * @default 'cc_cookie'
         */
        name?: string

        /**
         * Cookie domain.
         *
         * @default location.hostname
         */
        domain?: string

        /**
         * Cookie path.
         *
         * @default '/'
         */
        path?: string

        /**
         * Cookie sameSite.
         *
         * @default 'Lax'
         */
        sameSite?: 'Lax' | 'Strict' | 'None'

        /**
         * Cookie duration.
         *
         * @default 182
         */
        expiresAfterDays?: number | ((acceptType: AcceptType) => number)

        /**
         * Store the content of the cookie in localstorage
         *
         * @default false
         */
        useLocalStorage?: boolean
    }

    interface GuiOptions {
        /**
         * Configuration object for tweaking the consent modal UI. 
         * 
         * *Note: By enabling TCF compliance consent modal layout is fixed to bar-bottom and these settings will not be applied.*
         */
        consentModal?: {
            /**
             * Change consentModal layout.
             *
             * @default 'box'
             */
            layout?: ConsentModalLayout

            /**
             * Change modal position.
             */
            position?: ConsentModalPosition

            /**
             * Flip buttons.
             *
             * @default false
             */
            flipButtons?: boolean

            /**
             * Stylize the accept and reject buttons the same way (GDPR compliant).
             *
             * @default true
             */
            equalWeightButtons?: boolean
        }
        preferencesModal?: {

            /**
             * Change preferencesModal layout.
             */
            layout?: PreferencesModalLayout

            /**
             * This options is valid only if layout=bar.
             */
            position?: PreferencesModalPosition

            /**
             * Flip buttons.
             * @default false
             */
            flipButtons?: boolean

            /**
             * Stylize the accept and reject buttons the same way (GDPR compliant).
             *
             * @default true
             */
            equalWeightButtons?: boolean
        }
        vendorsModal?: {

            /**
             * Change vendorsModal layout.
             */
            layout?: VendorsModalLayout

            /**
             * This options is valid only if layout=bar.
             */
            position?: VendorsModalPosition
        }
    }

    interface ConsentModalOptions {
        /**
         * Accessibility label. Especially useful if no title is provided.
         */
        label?: string

        title?: string
        description?: string
        /**
         * Specifies what is the vendor count placeholder in the description text that should be replaced with the
         * appropriate count.
         * 
         * *NOTE: This is only used if the `isTcfCompliant` is set to `true`.*
         * 
         * @default "{{count}}"
         */
        descriptionCountPlaceholder?: string;
        acceptAllBtn?: string
        acceptNecessaryBtn?: string
        showPreferencesBtn?: string

        /**
         * Set the title displayed above the vendors section in the consent modal.
         *
         * *NOTE: This is only used if the `isTcfCompliant` is set to `true`.*
         *
         * @default "We and our partners perform the following based on your settings"
         */
        vendorTitle?: string;

        /**
         * Set the label for a vendors button.
         *
         * *NOTE: This is only used if the `isTcfCompliant` is set to `true`.*
         * 
         * @default "List of partners (vendors)"
         */
        showVendorsBtn?: string;

        /**
         * Specify to generate a big "X" (accept necessary) button. Visible in the `box` layout only.
         */
        closeIconLabel?: string

        /**
         * Set a revision message, visible when the revision number changes.
         * Check out the [docs](https://cookieconsent.orestbida.com/advanced/revision-management.html) for more.
         */
        revisionMessage?: string

        /**
         * Custom HTML string where you can put links pointing to your privacy policy.
         */
        footer?: string
    }

    interface CookieTable {

        /**
         * Table caption
         */
        caption?: string,

        /**
         * Define the table headers (columns).
         */
        headers: {[key: string]: string}

        /**
         * Define the table body items (rows).
         */
        body: {[key: string]: string}[]
    }

    interface Section {
        /**
         * Section title.
         */
        title?: string

        /**
         * Section description.
         */
        description?: string

        /**
         * Name of a valid category. This will convert the current section into a "togglable" category.
         */
        linkedCategory?: string

        /**
         * Create a custom html table (generally used to clarify cookies).
         */
        cookieTable?: CookieTable
    }

    interface PreferencesModalOptions {
        title?: string
        acceptAllBtn?: string
        acceptNecessaryBtn?: string
        savePreferencesBtn?: string

        /**
         * Accessibility label.
         */
        closeIconLabel?: string

        /**
         * Label to append to services counter.
         */
        serviceCounterLabel?: string

        sections: Section[]
    }

    interface VendorsModalOptions {
      /**
       * Set the vendors modal title.
       *
       * @default "IAB Vendors List"
       */
      title?: string;

      /**
       * Accessibility label for the close icon.
       */
      closeIconLabel?: string;

      /**
       * Accessibility label for the back icon.
       */
      backIconLabel?: string;

      /**
       * Label for the button allowing all vendor consents.
       * 
       * @default "Allow all"
       */
      allowAllConsentBtn?: string;

      /**
       * Label for the button rejecting all vendor consents.
       *
       * @default "Reject all"
       */
      rejectAllConsentBtn?: string;

      /**
       * Label for the button allowing selected vendor consents.
       *
       * @default "Allow current selection"
       */
      allowSelectionBtn?: string;

      /**
       * Label for the vendor privacy policy link.
       *
       * @default "View Privacy Policy"
       */
      viewPrivacyPolicyLabel?: string;

      /**
       * Label for the vendor view legitimate interest claim link.
       *
       * @default "View Legitimate Interest Claim"
       */
      viewLegitimateInterestClaimLabel?: string;

      /**
       * Label for the vendor view device storage disclosure link.
       *
       * @default "View Device Storage Disclosure"
       */
      viewDeviceStorageDisclosureLabel?: string;

      /**
       * Label for the cookie lifespan header in the information list.
       *
       * @default "Cookie Lifespan"
       */
      cookieLifespanLabel?: string;

      /**
       * Translation label for the cookie lifespan information.
       *
       * @default "Months"
       */
      cookieLifespanMonthsLabel?: string;

      /**
       * Label if the vendor uses other methods of storage in addition to cookies.
       *
       * @default "This vendor utilizes other methods of storage or accessing information in addition to cookies"
       */
      usesNonCookieAccessLabel?: string;

      /**
       * Label for the data declaration header in the information list.
       *
       * @default "Data Declaration"
       */
      dataDeclarationLabel?: string;

      /**
       * Label for the data retention header in the information list.
       *
       * @default "Data Retention"
       */
      dataRetentionLabel?: string;

      /**
       * Label for the standard data retention information.
       *
       * @default "Standard Retention"
       */
      standardRetentionLabel?: string;

      /**
       * Translation label for the data retention days information.
       *
       * @default "Days"
       */
      dataRetentionDaysLabel?: string;

      /**
       * Label for the consent purposes header in the information list.
       *
       * @default "Consent Purposes"
       */
      consentPurposesLabel?: string;

      /**
       * Label for the legitimate interest purposes header in the information list.
       *
       * @default "Legitimate Interest Purposes"
       */
      legitimateInterestPurposesLabel?: string;

      /**
       * Label for the special purposes header in the information list.
       *
       * @default "Special Purposes"
       */
      specialPurposesLabel?: string;

      /**
       * Label for the features header in the information list.
       *
       * @default "Features"
       */
      featuresLabel?: string;

      /**
       * Label for the special features header in the information list.
       *
       * @default "Special Features"
       */
      specialFeaturesLabel?: string;
    }

    interface Translation {
        consentModal: ConsentModalOptions;
        preferencesModal: PreferencesModalOptions;

        /**
         * Translation information for vendors modal.
         *
         * *NOTE: Only used if the `isTcfCompliant` is set to `true`.*
         */
        vendorsModal?: VendorsModalOptions;
    }

    interface TcfComplianceConfig {
      /**
       * Number IDs of disclosed third party vendors you work with.
       * 
       * Leaving this undefined or empty will disclose all possible vendors registered in the IAB TCF.
       * https://vendor-list.consensu.org/v2/additional-vendor-information-list.json
       * 
       * *Note: An inappropriately large number of vendors may affect the ability of users to make informed decisions and
       * may increase legal risks for both publishers and vendors.*
       */
      disclosedVendorIds?: number[];
    }

    interface CookieConsentConfig {
        /**
         * Root element where the modal will be appended.
         *
         * @default document.body
         */
        root?: string | Element | null

        /**
         * Check out the [docs](https://cookieconsent.orestbida.com/reference/configuration-reference.html#mode) for details.
         *
         * @default 'opt-in'
         */
        mode?: 'opt-in' | 'opt-out'

        /**
         * Should the consent modal be TCF compliant and use the `tcfComplianceConfig` for more detailed configuration.
         * 
         * *Note: By enabling TCF compliance the `disablePageInteraction` config value is set to `true` and consent modal layout is fixed to bar-bottom.*
         *
         * @default false
         */
        isTcfCompliant?: boolean;

        /**
         * Detailed configuration to use if the `isTcfCompliant` configuration option is set to `true`.
         */
        tcfComplianceConfig?: TcfComplianceConfig;

        /**
         * Automatically show the consentModal if consent is not valid.
         *
         * @default true
         */
        autoShow?: boolean

        /**
         * Manage revisions. Check out the [docs](https://cookieconsent.orestbida.com/reference/configuration-reference.html#revision) for details and examples.
         *
         * @default 0
         */
        revision?: number

        /**
         * Intercept script tags with a "data-category" attribute.
         *
         * @default true
         */
        manageScriptTags?: boolean

        /**
         * Automatically erase cookies when the user opts-out of a category.
         * Check out the [docs](https://cookieconsent.orestbida.com/reference/configuration-reference.html#categories-autoclear).
         *
         * @default true
         */
        autoClearCookies?: boolean

        /**
         * Create dark overlay and disable page scroll until consent.
         *
         * @default false
         */
        disablePageInteraction?: boolean

        /**
         * Stop the plugin's execution if a bot/crawler is detected
         * to prevent the indexing of the modal's content.
         *
         * @default true
         */
        hideFromBots?: boolean

        /**
         * Tweak some UI options.
         */
        guiOptions?: GuiOptions

        /**
         * Generates the modals on the fly
         * and only if needed
         *
         * @default true
         */
        lazyHtmlGeneration?: boolean

        /**
         * Change plugin's default cookie options.
         */
        cookie?: CookieOptions

        /**
         * Callback fired on the very first consent action.
         */
        onFirstConsent?: (param: {
            cookie: CookieValue
        }) => void

        /**
         * Callback fired on the very first consent action
         * and on each page load.
         */
        onConsent?: (param: {
            cookie: CookieValue
        }) => void

        /**
         * Callback fired when categories or services are changed.
         */
        onChange?: (param: {
            cookie: CookieValue
            changedCategories: string[],
            changedServices: {[key: string]: string[]}
        }) => void

        /**
         * Callback fired when one of the modals is visible.
         */
        onModalShow?: (param: {
            modalName: ModalName
        }) => void

        /**
         * Callback fired when one of the modals is hidden.
         */
        onModalHide?: (param: {
            modalName: ModalName
        }) => void

        /**
         * Callback fired when one of the modals is appended to the dom.
         */
        onModalReady?: (param: {
            modalName: ModalName,
            modal: HTMLElement
        }) => void

        /**
         * Configure cookie categories.
         */
        categories: {[key: string]: Category}

        /**
         * Configure language and translations.
         */
        language: {
            /**
             * Default language.
             *
             * E.g. 'en'
             */
            default: string,

            /**
             * RTL language(s).
             */
            rtl?: string | string[]

            /**
             * Language detection strategy.
             */
            autoDetect?: 'document' | 'browser'

            translations: {
                [locale: string]: Translation
                | string
                | (() => Translation)
                | (() => Promise<Translation>)
            }
        }
    }

    /**
     * Configure and run the plugin.
     */
    function run(configOptions: CookieConsentConfig): Promise<void>

    /**
     * Show the consentModal.
     *
     * Pass the argument 'true' (boolean) to generate the modal if it doesn't exist.
     */
    function show(createModal?: boolean): void

    /**
     * Hide the consentModal.
     */
    function hide(): void

    /**
     * Show the preferencesModal.
     */
    function showPreferences(): void

    /**
     * Hide the preferencesModal.
     */
    function hidePreferences(): void

    /**
     * Shows the vendors modal.
     */
    function showVendors(): void;

    /**
     * Hides the vendors modal.
     */
    function hideVendors(): void;

    /**
     * Accept/Reject categories.
     *
     * @param categories Categories to accept
     * @param excludedCategories Categories to exclude
     */
    function acceptCategory(categories: string | string[], excludedCategories?: string[]): void

    /**
     * Accept/Reject services.
     * @param services Services to accept
     * @param category Category where the service is defined
     */
    function acceptService(services: string | string[], category: string): void

    /**
     * Returns true if category is accepted, otherwise false.
     * @param categoryName Name of the category
     * @returns boolean: true if category is accepted
     */
    function acceptedCategory(categoryName: string): boolean

    /**
     * Check if the service in the specified category is accepted.
     * @param serviceName Name of the service
     * @param categoryName Name of the category
     * @returns boolean: true if service is accepted
     */
    function acceptedService(serviceName: string, categoryName: string): boolean

    /**
     * Returns true if consent is valid, otherwise false.
     * @returns boolean: true if category is accepted
     */
    function validConsent(): boolean

    /**
     * Check if cookie is valid (exists and has a non empty value).
     * @param cookieName Name of the cookie
     * @returns boolean: true if cookie is valid
     */
    function validCookie(cookieName: string): boolean

    /**
     * Erase one or multiple cookies.
     * @param cookies Names of the cookies to erase
     * @param path Expected path
     * @param domain Expected domain
     */
    function eraseCookies(cookies: string | RegExp | (string|RegExp)[], path?: string, domain?: string): void

    /**
     * Load '.js' files.
     * @param src Path pointing to the js file
     * @param attributes Attributes added to the script
     * @returns Promise<boolean>: true if script is loaded successfully
     */
    function loadScript(src: string, attributes?: {[key: string]: string}): Promise<boolean>

    /**
     * Store custom data inside plugin's own cookie.
     * @param data Object containing the value to save, and the write method
     * @returns boolean: true on success
     */
    function setCookieData(data: {value: any, mode?: 'overwrite' | 'update'}): boolean

    /**
     * Get the entire cookie object.
     * @returns object with all the cookie fields
     */
    function getCookie(): CookieValue

    /**
     * Get a specific field from the cookie.
     * @param field Cookie field (string)
     * @returns value of the specified field
     */
    function getCookie<Field extends keyof CookieValue>(field: Field): CookieValue[Field]

    /**
     * Get the full config. object.
     * @returns config. object
     */
    function getConfig(): CookieConsentConfig

    /**
     * Get one of the configuration options.
     * @param field Configuration option
     * @returns value of the specified field
     */
    function getConfig<Field extends keyof CookieConsentConfig>(field: Field): CookieConsentConfig[Field]

    /**
     * Retrieve the user's preferences. Useful for logging purposes.
     * @returns object with the user's preferences
     */
    function getUserPreferences(): UserPreferences

    /**
     * Change modal's language. Language must already be declared in the config.
     * @param languageCode desired language
     * @param forceSet forcefully set language and reload modals
     * @returns Promise<boolean>: true if language is set successfully
     */
    function setLanguage(languageCode: string, forceSet?: boolean): Promise<boolean>

    /**
     * Reset cookieconsent.
     *
     * @param eraseCookie delete plugin's cookie
     */
    function reset(eraseCookie?: boolean): void
}

declare global {
    interface Window {
        CookieConsent: typeof CookieConsent
    }
}