import type { Page } from '@playwright/test';
import { Executor } from '../executor/Executor.js';

export type StepHandler = (fixtures: { page: Page, executor: Executor }, ...args: any[]) => Promise<void>;

interface RegisteredStep {
    pattern: RegExp;
    handler: StepHandler;
}

export class CustomStepRegistry {
    private static steps: RegisteredStep[] = [];

    /**
     * Registers a manual/traditional step definition.
     * Use this instead of Given/When/Then if you want the Universal Handler 
     * to fall back to this when no JSON is found.
     */
    static register(pattern: RegExp | string, handler: StepHandler) {
        const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}$`) : pattern;
        this.steps.push({ pattern: regex, handler });
        console.log(`[Registry] Registered manual step: ${pattern}`);
    }

    /**
     * Attempts to find and execute a matching manual step.
     */
    static async tryExecute(stepText: string, fixtures: { page: Page, executor: Executor }): Promise<boolean> {
        for (const step of this.steps) {
            const match = stepText.match(step.pattern);
            if (match) {
                const args = match.slice(1); // Extract capture groups
                console.log(`[Registry] Match found for: "${stepText}". Executing manual handler.`);
                await step.handler(fixtures, ...args);
                return true;
            }
        }
        return false;
    }
}
