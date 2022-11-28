export {}

declare global {
    type MODE = 'opt-in' | 'opt-out'

    type AUTO_LANGUAGE_ORIGIN = 'browser' | 'document'

    type ModalLayout = 'box' | 'cloud' | 'bar'

    type ModalPosition = 'bottom left' | 'bottom right' | 'bottom center' | 'middle left' | 'middle right' | 'middle center' | 'top left' | 'top right' | 'top center'

    type GUITransition = 'zoom' | 'slide'

    type SettingLayout = 'box' | 'bar'

    type SettingPosition = 'left' | 'right'

    interface SavedCookieContent {
        categories: string[]
        level: string[]
        revision: number
        data?: null | Record<string, Record<string, any> | string>
        rfc_cookie: boolean
        consent_date: string
        consent_uuid: string
        last_consent_update: string
    }

    interface GUIOptions {
        consent_modal?: {
            layout?: ModalLayout
            position?: ModalPosition
            transition?: GUITransition
            swap_buttons?: boolean
        },
        settings_modal?: {
            layout?: SettingLayout
            position?: SettingPosition
            transition?: GUITransition
        }
    }

    interface UserPreferences {
        accept_type: string
        accepted_categories: string[]
        rejected_categories: string[]
    }

    type PrimaryButtonRole = 'accept_selected' | 'accept_all'

    type SecondaryButtonRole = 'settings' | 'accept_necessary'

    interface ButtonSetting<Role> {
        text: string
        role: Role
    }

    interface ConsentModalLanguageSetting {
        title?: string
        description?: string
        primary_btn?: ButtonSetting<PrimaryButtonRole>
        secondary_btn?: ButtonSetting<SecondaryButtonRole>
        revision_message?: string
    }

    interface ToggleSetting {
        value: string
        enabled?: boolean
        readonly?: boolean
        reload?: 'on_disable' | 'on_clear'
    }

    interface BlockSetting {
        title: string
        description: string
        toggle?: ToggleSetting
        cookie_table_headers?: Record<string, string>[]
        cookie_table?: Record<string, string | boolean>[]
    }

    interface SettingsModalLanguageSetting {
        title?: string
        save_settings_btn?: string
        accept_all_btn?: string
        reject_all_btn?: string
        close_btn_label?: string
        cookie_table_headers?: Record<string, string>[]
        blocks?: BlockSetting[]
    }

    interface LanguageSetting {
        consent_modal?: ConsentModalLanguageSetting
        settings_modal?: SettingsModalLanguageSetting
    }

    interface UserConfig {
        autorun?: boolean
        delay?: number
        mode?: MODE
        cookie_expiration?: number
        cookie_necessary_only_expiration?: number
        cookie_path?: string
        cookie_domain?: string
        cookie_same_site?: string
        cookie_name?: string
        use_rfc_cookie?: boolean
        force_consent?: boolean
        revision?: number
        current_lang?: string
        auto_language?: AUTO_LANGUAGE_ORIGIN
        autoclear_cookies?: boolean
        page_scripts?: boolean
        remove_cookie_tables?: boolean
        hide_from_bots?: boolean
        gui_options?: GUIOptions
        onAccept?: (savedCookieContent: SavedCookieContent) => void
        onChange?: (cookie: SavedCookieContent, changedCookieCategories: string[]) => void
        onFirstAction? :(userPreferences: UserPreferences, cookie: SavedCookieContent) => void
        languages?: Record<string, LanguageSetting>
    }

    interface ScriptAttribute {
        name: string
        value: any
    }

    interface CookieConsent {
        run(config: UserConfig): void
        showSettings(delay: number): void
        accept(_categories: string | string[], _exclusions?: string[]): void
        hideSettings(): void
        hide(): void
        updateLanguage(lang: string, force: boolean): boolean
        getUserPreferences(): UserPreferences
        loadScript(src: string, callback: () => void | typeof onload, attrs?: ScriptAttribute[]): void
        updateScripts(): void
        show(delay?: number, create_modal?: boolean): void
        eraseCookies(_cookies: string | string[], _path?: string, _domain?: string): void
        validCookie(cookie_name: string): boolean
        allowedCategory(cookie_category: string): boolean
        set(field: string, data: Record<string, any>): boolean
        get(field: string, cookie_name?: string): Record<string, any>
        getConfig<Field extends keyof UserConfig>(field: Field): UserConfig[Field]
    }

    function initCookieConsent(root?: HTMLElement): CookieConsent

    interface Window {
        initCookieConsent: typeof initCookieConsent
    }
}
