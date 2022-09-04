const fs = require('fs')
const childProcess = require("child_process")

/**
 * This script is used by vercel
 * to skip build if docs did not change
 */

const SUCCESS_CODE = 1;
const FAILURE_CODE = 0;

/**
 * Check if "docs" folder exists
 */
if (!fs.existsSync('docs'))
    exitScript(FAILURE_CODE)

const exitScript = (code) => process.exit(code)

/**
 * List of all changed files
 */
const changedFiles = childProcess
    .execSync("git diff --name-only HEAD~1")
    .toString()
    .trim()
    .split("\n")

/**
 * Run build if "docs" or "package.json" are changed
 */
const shouldBuild = changedFiles.some(fileName =>
    fileName.startsWith('docs/') || fileName === 'package.json'
)

if (shouldBuild)
    exitScript(SUCCESS_CODE)
else
    exitScript(FAILURE_CODE)