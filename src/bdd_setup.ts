import { test as base } from 'playwright-bdd';
import { AutoRecorder } from './recorder/AutoRecorder.js';
import { Executor } from './executor/Executor.js';

export const test = base.extend<{
    recorder: AutoRecorder;
    executor: Executor;
}>({
    recorder: async ({ page }, use) => {
        await use(new AutoRecorder(page));
    },
    executor: async ({ page }, use) => {
        await use(new Executor(page));
    },
});
