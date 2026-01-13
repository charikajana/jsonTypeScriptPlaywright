import { Page, Locator, test } from '@playwright/test';
import type { StrongElement } from '../models/StrongElement.js';
import { Logger } from '../utils/Logger.js';

export class SmartElementFinder {
    constructor(private page: Page) { }

    async findElement(target: StrongElement): Promise<Locator> {
        const identifier = target.id || target.name || target.type || 'element';

        return await test.step(`SmartFinder: Find element "${identifier}"`, async () => {
            // Smart Wait: Ensure page is ready before searching
            await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => { });

            Logger.info(`Searching for: ${identifier}`, 'SmartFinder');

            // Strategy 1: Exact XPath Match
            if (target.xpath) {
                const exactMatch = this.page.locator(`xpath=${target.xpath}`).first();
                if (await exactMatch.isVisible({ timeout: 1000 }).catch(() => false)) {
                    Logger.info('Match Found: Exact XPath', 'SmartFinder');
                    return exactMatch;
                }
            }

            // Strategy 2: ID Match
            if (target.id) {
                const idMatch = this.page.locator(`#${target.id}`).first();
                if (await idMatch.isVisible({ timeout: 1000 }).catch(() => false)) {
                    Logger.info('Match Found: ID', 'SmartFinder');
                    return idMatch;
                }
            }

            // Strategy 3: Text Match
            const text = target.text;
            if (text && text.trim().length > 0) {
                const textMatch = this.page.getByText(text.trim()).first();
                if (await textMatch.isVisible({ timeout: 1000 }).catch(() => false)) {
                    Logger.info('Match Found: Text', 'SmartFinder');
                    return textMatch;
                }
            }

            // --- SELF HEALING TRIGGERED ---
            Logger.warn(`Primary locators failed for "${identifier}". Triggering Self-Healing...`, 'SmartFinder');
            const healed = await this.attemptHealing(target);
            if (healed) {
                return healed;
            }

            Logger.error(`ALL STRATEGIES FAILED for ${identifier}`, 'SmartFinder');
            // Fallback to whatever we have
            return this.page.locator(`xpath=${target.xpath}`);
        });
    }

    private async attemptHealing(target: StrongElement): Promise<Locator | null> {
        const dna = target.fingerprint;
        if (!dna) return null;

        // Healing Strategy 1: Label Match (using nearbyText as label)
        if (dna.context.nearbyText) {
            Logger.info(`Trying Label Match: "${dna.context.nearbyText}"`, 'HEALING');
            const labelMatch = this.page.getByLabel(dna.context.nearbyText).first();
            if (await labelMatch.isVisible({ timeout: 1000 }).catch(() => false)) {
                Logger.info('[SUCCESS] Rediscovered via Label!', 'HEALING');
                return labelMatch;
            }
        }

        // Healing Strategy 2: Semantic Match (Role + Name)
        if (dna.attributes.role) {
            Logger.info(`Trying Semantic Match: Role="${dna.attributes.role}"`, 'HEALING');
            try {
                // @ts-ignore
                const semanticMatch = this.page.getByRole(dna.attributes.role, { name: target.ariaLabel || undefined }).first();
                if (await semanticMatch.isVisible({ timeout: 1000 }).catch(() => false)) {
                    Logger.info('[SUCCESS] Rediscovered via Role!', 'HEALING');
                    return semanticMatch;
                }
            } catch (e) { }
        }

        // Healing Strategy 3: Proximity Search (:near)
        if (dna.context.nearbyText) {
            Logger.info(`Trying Proximity Search near: "${dna.context.nearbyText}"`, 'HEALING');
            const tag = target.type || 'input, button, select';
            const nearMatch = this.page.locator(`${tag}:near(:text("${dna.context.nearbyText}"))`).first();
            if (await nearMatch.isVisible({ timeout: 1000 }).catch(() => false)) {
                Logger.info('[SUCCESS] Rediscovered via Proximity!', 'HEALING');
                return nearMatch;
            }
        }

        return null;
    }
}
