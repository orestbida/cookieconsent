import { defineConfig } from "vitepress"
import pkg from '../../package.json'

import { createWriteStream } from 'node:fs'
import { resolve } from 'node:path'
import { SitemapStream } from 'sitemap'

const sitemapLinks = []

export default defineConfig({
    lang: 'en-US',
    title: 'CookieConsent',
    description: 'Simple cross-browser cookie-consent plugin written in vanilla js',
    lastUpdated: false,
    appearance: 'dark',

    themeConfig: {

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2020-present Orest Bida'
        },
        socialLinks: [
            { icon: 'github', link: pkg.repository.url }
        ],

        editLink: {
            pattern: `${pkg.repository.url}/edit/v3.0-beta/docs/:path`,
            text: 'Suggest changes to this page'
        },
        algolia: {
            appId: 'MUS0JJVOAF',
            apiKey: 'cb39e9ad1410faa5acd6e1d22f5258cc',
            indexName: 'cookieconsent_docs'
        },

        nav: [
            {
                text: 'Demo',
                items: [
                    {
                        text: 'Playground',
                        link: 'https://playground.cookieconsent.orestbida.com'
                    },
                    {
                        text: 'Stackblitz',
                        link: 'https://stackblitz.com/@orestbida/collections/cookieconsent-v3'
                    }
                ]
            },
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
            },
            {
                text: `v${pkg.version}`,
                items: [
                    {
                        text: 'Changelog',
                        link: pkg.repository.url + '/releases/'
                    }
                ]
            },
        ],

        sidebar: {
            '/essential/': getGuideSidebar(),
            '/reference/': getGuideSidebar(),
            '/advanced/': getGuideSidebar(),
            '/additional/': getGuideSidebar()
        },
    },

    transformHtml: (_, id, { pageData }) => {
        if (!/[\\/]404\.html$/.test(id))
            sitemapLinks.push({
                url: pageData.relativePath.replace(/((^|\/)index)?\.md$/, '$2'),
                lastmod: pageData.lastUpdated
            })
    },

    buildEnd: async ({ outDir }) => {
        const sitemap = new SitemapStream({
            hostname: 'https://cookieconsent.orestbida.com/'
        })
        const writeStream = createWriteStream(resolve(outDir, 'sitemap.xml'))
        sitemap.pipe(writeStream)
        sitemapLinks.forEach((link) => sitemap.write(link))
        sitemap.end()
        await new Promise((r) => writeStream.on('finish', r))
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
                { text: 'Scripts Management', link: '/advanced/manage-scripts' },
                { text: 'UI Customization', link: '/advanced/ui-customization' },
                { text: 'Callbacks and Events', link: '/advanced/callbacks-events' },
                { text: 'Custom Attribute', link: '/advanced/custom-attribute' },
                { text: 'Revision Management', link: '/advanced/revision-management'},
                { text: 'Consent Logging', link: '/advanced/consent-logging'},
                { text: 'IframeManager Setup', link: '/advanced/iframemanager-setup'}
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