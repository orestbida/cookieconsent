import '../assets/textareaHighlight.scss';
import '../assets/prismTheme.scss';
import { getById, enableSyntaxHighlighting } from './utils';

const highlighterFunctions = [];

const cmTextareaFooter = getById('textarea-cm-footer');
const cmTextareaDescription = getById('textarea-cm-description');

const highlightCmFooter = enableSyntaxHighlighting(cmTextareaFooter);
const highlightCmDescription = enableSyntaxHighlighting(cmTextareaDescription);

highlighterFunctions.push(highlightCmFooter);
highlighterFunctions.push(highlightCmDescription);

export const refreshHighlighting = () => {
    highlighterFunctions.forEach(h => h());
};