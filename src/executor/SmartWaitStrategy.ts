import { Page, Locator } from '@playwright/test';
import { Logger } from '../utils/Logger.js';

export type ActionType = 'CLICK' | 'TYPE' | 'NAVIGATE' | 'VERIFY_TEXT' | 'VERIFY_ELEMENT' | 'SCROLL' | 'WAIT_NAVIGATION';

export class SmartWaitStrategy {
    private static readonly DEFAULT_TIMEOUT = 30000;
    private static readonly SHORT_TIMEOUT = 20000;
    private static readonly MEDIUM_TIMEOUT = 7000;
    private static readonly LONG_TIMEOUT = 120000;
    private static readonly POLL_INTERVAL = 100;

    static async waitForVisible(locator: Locator, actionType?: ActionType): Promise<boolean> {
        const timeout = this.getTimeoutForAction(actionType);
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        } catch (e) {
            Logger.warn(`Element not visible within ${timeout}ms`, 'SmartWait');
            return false;
        }
    }

    static async waitForEnabled(locator: Locator): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout: this.MEDIUM_TIMEOUT });

            const start = Date.now();
            while (Date.now() - start < this.MEDIUM_TIMEOUT) {
                if (await locator.isEnabled()) return true;
                await new Promise(r => setTimeout(r, this.POLL_INTERVAL));
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    static async waitForPageLoad(page: Page) {
        try {
            await page.waitForLoadState('load', { timeout: this.LONG_TIMEOUT });
            await page.waitForLoadState('domcontentloaded', { timeout: this.MEDIUM_TIMEOUT }).catch(() => { });

            // Sabre specific loading check
            await this.waitForSabreLoading(page);

            // Wait for network to be idle to ensure dynamic content/modals are settled
            await page.waitForLoadState('networkidle', { timeout: this.SHORT_TIMEOUT }).catch(() => { });
        } catch (e) {
            Logger.warn('Page load wait timed out or failed to reach idle state', 'SmartWait');
        }
    }

    private static async waitForSabreLoading(page: Page) {
        try {
            // Check for elements containing 'Loading' text that might be visible
            const loadingElements = page.locator('div:text-is("Loading"), .loading, .spinner, #loading');
            const count = await loadingElements.count();
            if (count > 0) {
                Logger.info('Sabre Loading detected, waiting for it to hide...', 'SmartWait');
                // Wait for all of them to be hidden
                await Promise.all(
                    (await loadingElements.all()).map(el => el.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { }))
                );
            }
        } catch (e) {
            // Ignore if search fails
        }
    }

    static async smartWait(locator: Locator, actionType?: ActionType): Promise<boolean> {
        // Fast path
        try {
            await locator.waitFor({ state: 'visible', timeout: this.SHORT_TIMEOUT });
            return true;
        } catch (e) {
            // Extended path
            return await this.waitForVisible(locator, actionType);
        }
    }

    private static getTimeoutForAction(actionType?: ActionType): number {
        switch (actionType) {
            case 'NAVIGATE':
            case 'WAIT_NAVIGATION':
                return this.LONG_TIMEOUT;
            case 'VERIFY_TEXT':
            case 'VERIFY_ELEMENT':
                return this.MEDIUM_TIMEOUT;
            case 'CLICK':
            case 'TYPE':
                return this.DEFAULT_TIMEOUT;
            case 'SCROLL':
                return this.SHORT_TIMEOUT;
            default:
                return this.DEFAULT_TIMEOUT;
        }
    }
}
