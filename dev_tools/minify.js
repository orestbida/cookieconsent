const fs = require('fs')
const minify = require("uglify-js").minify;

const inputPath = '../src/cookieconsent.js';
const outputPath = '../dist/cookieconsent.js';

const minified = minify(
    [
        fs.readFileSync(inputPath, "utf8")
    ],
    {   
        toplevel: true,
        warnings: 'verbose',
        mangle:{
            toplevel: true,
            properties: {
                regex: /^_/,    // minify ONLY properties starting with '_'
                keep_quoted: true, 
                builtins: false
            }
        },

        output: {
            comments: false,    // remove all comments
            quote_style: 1,
        },
        compress: {
            passes: 3,
            // remove the following functions from final minified version
            pure_funcs: ['ENABLE_LOGS', '_log', 'console.log', 'console.error', 'console.warn']
        },
    }
);

if(!minified.error){
    // Overwrite file produced from webpack with its minifed version
    fs.writeFileSync(outputPath, minified.code, {encoding: "utf8"});

    console.log('\033[1m\x1b[34m', `\nFinal size: ${fs.statSync(outputPath).size} bytes`)
}else
    console.error("Error: ", minified.error, minified.warnings);
