import { addEvent } from './utils';

/**
 * Add a "Copy" button to every code block
 */
for (const block of document.querySelectorAll('.hl')) {
    const content = block.querySelector('.hl__content');
    const code = content && content.querySelector('code');

    if (!code)
        continue;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-live', 'polite');

    addEvent(btn, 'click', async () => {
        try {
            await navigator.clipboard.writeText(code.textContent);
            btn.textContent = 'Copied!';
        } catch (e) {
            btn.textContent = 'Copy failed';
        }

        setTimeout(() => {
            btn.textContent = 'Copy';
        }, 1500);
    });

    const actions = block.querySelector('.hl__actions');
    actions ? actions.prepend(btn) : content.appendChild(btn);
}
