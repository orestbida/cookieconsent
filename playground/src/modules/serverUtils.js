import { readdirSync, writeFileSync } from 'fs';

/**
 * @type {string[]}
 */
let translations;

export const getTranslationLocales = () => {
    if (!translations) {
        translations = readdirSync('./src/translations')
            .filter(isJson)
            .map(removeExtension)
    }
    return translations;
}

/**
 * @param {string} file
 */
const isJson = (file) => file.endsWith('.json');

/**
 * @param {string} file
 */
const removeExtension = (file) => file.split('.')[0];

/**
 * @type {string[]}
 */
let languages;

export const getTranslationLangs = () => {
    if (!languages) {
        languages = getTranslations().map(localeToLang);
    }
    return languages;
}

/**
 * @param {string} locale
 */
export const localeToLang = (locale) => {
    const language = new Intl.DisplayNames("en-US", { type: 'language' }).of(locale);
    return language.charAt(0).toUpperCase() + language.slice(1);
}

export const buildTranslationsExportFile = (filePath = './src/translations/translations.js') => {
    /**
     * @param {string} locale
     */
    const localToImport = (locale) => `import ${locale} from '../translations/${locale}.json';\n`;

    const locales = getTranslationLocales();
    const content = locales.map(localToImport).join('')
        + `\nexport {${locales.join(', ')}};`;
    writeFileSync(filePath, content);
}