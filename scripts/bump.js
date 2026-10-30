const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the version number provided as argument
let version = process.argv[2];

if (!version) {
    console.error('Please provide a version number to bump.');
    process.exit(1);
}

if (version.startsWith('v')) {
    version = version.slice(1)
}

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);

packageJson.version = version;

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');

console.log(`Version bumped to ${version} in package.json successfully.`);

const readmePath = path.join(process.cwd(), 'Readme.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

const oldVersionRegex = /\/cookieconsent\/releases\/(tag\/)?v?\d+\.\d+\.\d+/g;
readmeContent = readmeContent.replace(oldVersionRegex, `/cookieconsent/releases/tag/v${version}`);

fs.writeFileSync(readmePath, readmeContent);

console.log(`Version updated to ${version} in Readme.md successfully.`);

const gettingStartedPath = path.join(process.cwd(), 'docs', 'essential', 'getting-started.md');
let gettingStartedContent = fs.readFileSync(gettingStartedPath, 'utf8');

const oldVersionRegex2 = /cookieconsent@(v?\d+\.\d+\.\d+)/g;
gettingStartedContent = gettingStartedContent.replace(oldVersionRegex2, `cookieconsent@${version}`);

fs.writeFileSync(gettingStartedPath, gettingStartedContent);

console.log(`Version updated to ${version} in getting-started.md successfully.`);

/**
 * Run rollup directly: "pnpm run" can trigger an install first, which rewrites the lockfile.
 * Only the files changed above are committed.
 */
try {
    execSync('npx rollup --config ./rollup-full.config.mjs', { stdio: 'inherit' });
    execSync('npx rollup --config ./rollup-core.config.mjs', { stdio: 'inherit' });
    fs.rmSync(path.join(process.cwd(), 'src_tmp'), { recursive: true, force: true });
    execSync('git add package.json Readme.md docs/essential/getting-started.md dist');
    execSync(`git commit -m "build: bump version to ${version}"`);
} catch (error) {
    console.error('Error committing changes:', error.message);
}