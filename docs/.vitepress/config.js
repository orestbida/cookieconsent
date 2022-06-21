import { defineConfig } from "vitepress"

export default defineConfig({
    lang: 'en-US',
    title: 'CookieConsent',
    description: 'Simple cross-browser cookie-consent plugin written in vanilla js',
    lastUpdated: false,

    // head: [
    //     ['link', {rel: 'preconnect', href: 'https://fonts.googleapis.com'}],
    //     ['link', {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true}],
    //     ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'}],
    //     ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap'}]
    // ],

    themeConfig: {

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2020-present Orest Bida'
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/orestbida/cookieconsent' }
        ],

        editLink: {
            pattern: 'https://github.com/orestbida/cookieconsent/edit/v3.0-beta/docs/:path',
            text: 'Suggest changes to this page'
        },
        algolia: {
            appId: 'MUS0JJVOAF',
            apiKey: 'cb39e9ad1410faa5acd6e1d22f5258cc',
            indexName: 'cookieconsent_docs'
        },

        nav: [
            {
                text: 'Guide',
                link: '/essential/getting-started.html'
            },
            {
                text: 'API',
                link: '/reference/api-reference.html'
            },
            {
                text: 'Config',
                link: '/reference/configuration-reference.html'
            }
        ],

        sidebar: {
            '/essential/': getGuideSidebar(),
            '/reference/': getGuideSidebar(),
            '/advanced/': getGuideSidebar(),
            '/additional/': getGuideSidebar()
        },
    }
});


function getGuideSidebar() {
    return [
        {
            text: 'Essential',
            collapsible: true,
            items: [
                { text: 'Introduction', link: '/essential/introduction' },
                { text: 'Getting Started', link: '/essential/getting-started' },
            ]
        },
        {
            text: 'Advanced',
            collapsible: true,
            items: [
                { text: 'Language Config', link: '/advanced/language-configuration' },
                { text: 'UI Customization', link: '/advanced/ui-customization' },
                { text: 'Callbacks and Events', link: '/advanced/callbacks-events' },
                { text: 'Custom Attribute', link: '/advanced/custom-attribute' },
                { text: 'Scripts Management', link: '/advanced/manage-scripts' },
                { text: 'Revision Management', link: '/advanced/revision-management'}
            ]
        },
        {
            text: 'API',
            items: [
                { text: 'API Reference', link: '/reference/api-reference' },
            ]
        },
        {
            text: 'Config',
            items: [
                { text: 'Config Reference', link: '/reference/configuration-reference' },
            ]
        },
        {
            text: 'Additional resources',
            collapsible: true,
            items: [
                { text: 'FAQ', link: '/additional/faq' },
                { text: 'Troubleshooting', link: '/additional/troubleshooting' },
                { text: 'License', link: '/additional/license' },
            ]
        }
    ]
}