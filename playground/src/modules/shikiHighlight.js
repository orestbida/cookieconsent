import { getSingletonHighlighter } from 'shiki';

/**
 * @type {import('shikiji').BuiltinTheme}
 */
const SHIKI_THEME = 'nord';

const shiki = await getSingletonHighlighter({
    themes: [SHIKI_THEME],
    langs: ['js', 'ts', 'html', 'css', 'json', 'bash', 'yaml'],
});

/**
 * @typedef {Object} ShikiBlockProps
 * @property {string} lang
 * @property {string} code
 * @property {boolean} [showLineNumbers]
 * @property {boolean} [isDetails]
 * @property {string} [title]
 * @property {string} [focus]
 * @property {string} [highlight]
 */

/**
 * @param {string} _html
 * @param {ShikiBlockProps} props
 */
export const highlight = (_html, props) => {
    let html = shikiHighlightBlock(_html, shiki, props);
    html = createCustomBlock(html);
    return html;
}

/**
 * @param {string} html
 * @param {import('shiki').Highlighter} shiki
 * @param {ShikiBlockProps} props
 */
function shikiHighlightBlock(html, shiki, props) {
    let htmlString = html;

    const lines = htmlString.split('\n');

    // Remove empty lines from the start
    while (lines.length > 0 && lines[0].trim() === '') {
        lines.shift();
    }

    if (lines.length < 1)
        return '';

    const indentationSpaces = lines[lines.length - 1].split(' ').length - 1;

    const title = props.title;
    const language = props.lang;
    const highlightIndexes = getIndexes(props.highlight || '');
    const focusIndexes = getIndexes(props.focus || '');
    const showLineNumbers = props.showLineNumbers;
    const isDetails = props.isDetails;

    const shouldHighlightLines = Object.keys(highlightIndexes).length > 0;
    const shouldFocusLines = Object.keys(focusIndexes).length > 0;

    /**
     * code content
     */
    let body = lines;

    /**
     * Fixed indentation and replace '\r' with '\n'
     */
    let bodyCleaned = body.map(row => {
        const emptyRow = row.trim() === '';

        if (emptyRow)
            row = '';

        return (!emptyRow && row.slice(0, indentationSpaces).trim() === ''
            ? row.slice(indentationSpaces)
            : row).replace('\r', '');

    }).join('\n');

    /**
     * Number of lines of code
     */
    const nRows = body.length;

    /**
     * Html string for line numbers
     */
    let lineNumbers = '';

    if (showLineNumbers) {
        lineNumbers = '<div class="hl__numbers" aria-hidden="true">';

        for (let i=1; i<=nRows; i++) {
            const className = [];

            if (shouldFocusLines && focusIndexes[i] === true)
                className.push('line--focus');

            if (shouldHighlightLines && highlightIndexes[i] === true)
                className.push('line--highlight');

            lineNumbers += `<span class="${className.join(' ')}"></span>`;
        }

        lineNumbers += '</div>';
    }

    const preHtml = shiki.codeToHtml(bodyCleaned, {
        lang: language,
        theme: SHIKI_THEME,
        transformers: [
            {
                line: (Element, index) => {
                    let className = 'line';

                    if (shouldFocusLines && focusIndexes[index])
                        className += ' line--focus';

                    Element.properties['class'] = className;
                },
                postprocess: (html) => {
                    return html.replaceAll('{{latest_release}}', '<span data-latest-release></span>');
                }
            }
        ]
    });

    const tag = title && isDetails
        ? 'details'
        : 'div';

    const titleTag = title && isDetails
        ? 'summary'
        : 'div';

    const className = `hl hl--${tag}`
        + (showLineNumbers ? ' hl--line-numbers' : '')
        + (shouldFocusLines ? ' hl--line-focus' : '');

    const renderedCodeBlock = `
    <${tag}
        class="${className}"
    >
        ${title
            ? `<${titleTag} class="hl__title">${title.trim()}</${titleTag}>`
            : ''
        }
        <div class="hl__content">
            ${preHtml}
            ${showLineNumbers ? lineNumbers : ''}
        </div>
    </${tag}>`;

    return renderedCodeBlock;
}

/**
 * @param {string} html
 */
function createCustomBlock(html) {
    let htmlString = html;
    const codeBlocks = html.matchAll(/!!!--CustomBlock (.*?)--!!!/gs);

    for (const block of codeBlocks) {

        /**
         * @type {string}
         */
        const blockString = block[0];
        const split = blockString.split('\n');

        if (split.length < 1)
            continue;

        /**
         * All attributes (everything after "<!--SHIKI")
         */
        const attrs = split[0].split('!!!--CustomBlock')[1].trim();
        const indentationSpaces = split[split.length - 1].split(' ').length - 1;

        const title = (attrs.match(/title="([^"]+)"/i))?.[1] || '';
        const type = (attrs.match(/type="([^"]+)"/i))?.[1] || '';
        const isDetails = attrs.includes('details');

        /**
         * code content
         */
        let body = split.slice(1, split.length - 1);

        /**
         * Fixed indentation and replace '\r' with '\n'
         */
        let bodyCleaned = body.map(row => {

            const emptyRow = row.trim() === '';

            if (emptyRow)
                row = '';

            return (!emptyRow && row.slice(0, indentationSpaces).trim() === ''
                ? row.slice(indentationSpaces)
                : row).replace('\r', '');

        }).join('\n');

        bodyCleaned = bodyCleaned.replaceAll('{{latest_release}}', '<span data-latest-release></span>');

        const tag = title && isDetails
            ? 'details'
            : 'div';

        const titleTag = title && isDetails
            ? 'summary'
            : 'div';

        const className = `custom-block custom-block--${type}`
            + (isDetails ? ' custom-block--details' : '');

        const customBlock = `
        <${tag}
            class="${className}"
        >
            ${title
                ? `<${titleTag} class="custom-block__title">${title.trim()}</${titleTag}>`
                : ''
            }
            <div class="custom-block__desc">
                ${bodyCleaned}
            </div>
        </${tag}>`;

        /**
            * Replace html comment with the proper rendered code block
            */
        htmlString = htmlString.replace(blockString, customBlock);
    }

    return htmlString;
}

/**
 * @param {string} rangeStr
 * @returns {Object.<number, boolean>}
 */
function getIndexes(rangeStr) {
    /**
     * Example ranges:
     * "15"
     * "1,2,3"
     * "2-3"
     * "2-3,5,8-11"
     */

    if (!rangeStr)
        return {};

    /**
     * @type {string[]}
     */
    const split = rangeStr
        ?.trim()
        .replaceAll(' ', '')
        .split(',') || [];

    const ranges = {};

    for (const indexGroup of split) {
        const indexes = indexGroup.split('-') || [];

        if (indexes.length === 1) {
            ranges[indexes] = true;
        } else {
            const start = parseInt(indexes[0]);
            const end = parseInt(indexes[1]);

            for (let index=start; index<=end; index++) {
                ranges[index] = true;
            }
        }
    }

    return ranges;
}