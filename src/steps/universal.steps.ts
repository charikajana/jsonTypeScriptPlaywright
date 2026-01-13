import { createBdd } from 'playwright-bdd';
import { test } from '../bdd_setup.js';
import { StepRepository } from '../utils/StepRepository.js';
import { Logger } from '../utils/Logger.js';
import type { Page } from '@playwright/test';
import type { Executor } from '../executor/Executor.js';
import { CustomStepRegistry } from './CustomStepRegistry.js';

const { Given, When, Then } = createBdd(test);

// The "Universal" Step Definition logic
const universalHandler = async ({ page, executor }: { page: Page, executor: Executor }, stepText: string) => {
    Logger.info(`Processing step: "${stepText}"`, 'Universal');

    // 1. Try to find StrongJSON 
    const stepJson = StepRepository.findStepJson(stepText);

    if (stepJson) {
        const params = StepRepository.extractParameters(stepText);
        await executor.executeStep(stepJson, params);
        return;
    }

    // 2. Fallback: Try Custom Manual Step Registry
    Logger.info(`StrongJSON not found for "${stepText}". Attempting fallback to Custom Registry/Traditional Approach.`, 'Universal');
    const handledByRegistry = await CustomStepRegistry.tryExecute(stepText, { page, executor });

    if (handledByRegistry) {
        return;
    }

    // 3. Error: Neither JSON nor Manual Step found
    const normalized = StepRepository.getNormalizedName(stepText);
    const errorMsg = `
StrongJSON Step Not Found!
--------------------------
Gherkin: ${stepText}
Expected JSON: src/test/resources/locatorRepository/${normalized}.json
OR
Registered in: CustomStepRegistry

Please run the AutoRecorder to teach me this step or add a manual fallback.
    `;
    Logger.error(errorMsg, 'Universal');
    throw new Error(`Missing definition for: ${stepText}`);
};

Given(/^(.*)$/, universalHandler);
