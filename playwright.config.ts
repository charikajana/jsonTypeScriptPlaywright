import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import * as path from 'path';

const testDir = defineBddConfig({
    paths: ['src/features/*.feature'],
    steps: ['src/steps/*.ts', 'src/bdd_setup.ts'],
    tags: process.env.BDD_TAGS,
});

export default defineConfig({
    timeout: 60000,
    testDir,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.PLAYWRIGHT_WORKERS ? parseInt(process.env.PLAYWRIGHT_WORKERS) : (process.env.CI ? 1 : undefined),
    reporter: [
        ['junit', { outputFile: 'results.xml' }],
        ['list', { printSteps: true }],
        ['html', {
            printSteps: true,
            outputFolder: 'PlaywrightAutomationResult'
        }],
        ['allure-playwright', { resultsDir: 'allure-results' }]
    ],
    use: {
        trace: 'on',
        screenshot: 'on',
        video: 'on',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
});
