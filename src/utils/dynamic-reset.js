/* eslint-disable */
const fs = require('fs');
const browser = process.env.BROWSER || "NOT IE";

console.log('browser:', browser);

if(browser === 'IE')
    var scss = '@import "./reset-ie"';
else
    var scss = '@import "./reset"';

fs.writeFileSync('./src/scss/core/_dynamic-reset.scss', scss, {
    encoding: "utf-8"
});