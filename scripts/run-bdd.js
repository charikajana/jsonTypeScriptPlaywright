import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Use relative paths instead of absolute ones for portability
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const args = process.argv.slice(2);
const envDir = path.join(projectRoot, 'src', 'environments');
const frameworkConfigPath = path.join(projectRoot, 'config', 'framework.config.json');
let frameworkConfig = {};

if (fs.existsSync(frameworkConfigPath)) {
    frameworkConfig = JSON.parse(fs.readFileSync(frameworkConfigPath, 'utf8'));
}

// Find environment Arg
const envArg = args.find(a => {
    const potentialPath = path.join(envDir, `${a.toUpperCase()}.json`);
    return fs.existsSync(potentialPath);
});

// Find Tag Arg
const tagArg = args.find(a => a.startsWith('@') || a.includes(' and ') || a.includes(' or ') || a.startsWith('not '));

// Find Workers Arg
const workerArg = args.find(a => a.startsWith('--workers=') || /^\d+$/.test(a));

if (envArg) {
    process.env.TEST_ENV = envArg.toUpperCase();
}

if (tagArg) {
    process.env.BDD_TAGS = tagArg;
}

if (workerArg) {
    const workers = workerArg.includes('=') ? workerArg.split('=')[1] : workerArg;
    process.env.PLAYWRIGHT_WORKERS = workers;
} else if (frameworkConfig.parallel?.defaultWorkers) {
    process.env.PLAYWRIGHT_WORKERS = frameworkConfig.parallel.defaultWorkers;
}

const currentEnv = process.env.TEST_ENV || 'DEV';
const currentTags = process.env.BDD_TAGS || 'No tags (running all)';
const currentWorkers = process.env.PLAYWRIGHT_WORKERS || 'Default';

console.log(`--- Starting BDD Execution ---`);
console.log(`Environment: ${currentEnv}`);
console.log(`Tags:        ${currentTags}`);
console.log(`Workers:     ${currentWorkers}`);

const runCommand = (cmd, args) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? `${cmd}.cmd` : cmd;
    return spawnSync(command, args, { stdio: 'inherit', shell: true, env: process.env, cwd: projectRoot });
};

// 1. Run bddgen
console.log('> Generating BDD tests...');
runCommand('npx', ['bddgen']);

// 2. Run playwright test
console.log('> Running Playwright tests...');
runCommand('npx', ['playwright', 'test']);

console.log(`--- Execution Finished ---`);

