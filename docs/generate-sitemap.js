const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const docsDir = './';
const publicDir = 'public';
const domain = 'https://cookieconsent.orestbida.com';

(async () => {

    /**
     * An array with your links
     * [{url: 'advanced/buttons-actions.html'}, {url: '...'}, ...]
     */
    const entries = (await fg([`${docsDir}/**/*.md`], {cwd: './docs'}))
        .map(filePath => ({ url: filePath.replace(`${docsDir}`, '').replace(/\.md$/, '.html')}));

    if(!entries) return;

    // Create a stream to write to
    const stream = new SitemapStream({ hostname: domain });

    // Promise that resolves with your XML string
    streamToPromise(Readable.from(entries).pipe(stream)).then((data) =>
        data.toString()
    ).then(sitemap => {
        fs.writeFileSync(
            path.resolve(__dirname, `${docsDir}/${publicDir}/sitemap.xml`),
            sitemap,
        )
    });

})();