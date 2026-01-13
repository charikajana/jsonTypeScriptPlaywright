import { Page, test } from '@playwright/test';
import { SmartElementFinder } from './SmartElementFinder.js';
import { SmartWaitStrategy } from './SmartWaitStrategy.js';
import { DateResolver } from './DateResolver.js';
import { EnvironmentConfig } from './EnvironmentConfig.js';
import { Logger } from '../utils/Logger.js';
import type { StrongElement, Action, StepJson } from '../models/StrongElement.js';

export class Executor {
    private finder: SmartElementFinder;

    constructor(private page: Page) {
        this.finder = new SmartElementFinder(page);
    }

    async executeStep(stepJson: StepJson, runtimeParams: string[]) {
        let paramIndex = 0;

        for (const action of stepJson.actions) {
            let value = action.value;
            if (value === '___RUNTIME_PARAMETER___' && paramIndex < runtimeParams.length) {
                value = runtimeParams[paramIndex++];
            }

            // Resolve environment variables like ${BASE_URL}
            if (value) {
                value = EnvironmentConfig.resolve(value);
            }

            Logger.info(`Performing: ${action.actionType} - ${action.description || ''}`, 'Executor');

            const actionType = action.actionType.toUpperCase();

            switch (actionType) {
                case 'NAVIGATE':
                    await this.page.goto(value || '');
                    await SmartWaitStrategy.waitForPageLoad(this.page);
                    break;
                case 'TYPE':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator, 'TYPE');
                        await locator.fill('');
                        await locator.fill(value || '');
                    }
                    break;
                case 'CLICK':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator, 'CLICK');
                        await locator.click();
                        await SmartWaitStrategy.waitForPageLoad(this.page);
                    }
                    break;
                case 'DOUBLE_CLICK':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator, 'CLICK');
                        await locator.dblclick();
                    }
                    break;
                case 'HOVER':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator);
                        await locator.hover();
                    }
                    break;
                case 'CHECK':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator);
                        await locator.check();
                    }
                    break;
                case 'UNCHECK':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator);
                        await locator.uncheck();
                    }
                    break;
                case 'CLEAR':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await locator.clear();
                    }
                    break;
                case 'SELECT':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator);
                        await locator.selectOption(value || '');
                    }
                    break;
                case 'SELECT_DATE':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await SmartWaitStrategy.smartWait(locator);
                        const resolvedDate = DateResolver.resolveDate(value || '');
                        await locator.fill('');
                        await locator.fill(resolvedDate);
                        await locator.press('Tab');
                    }
                    break;
                case 'VERIFY_TEXT':
                    if (value && action.element) {
                        const locator = await this.finder.findElement(action.element);
                        // Smart Wait before verification
                        await SmartWaitStrategy.smartWait(locator, 'VERIFY_TEXT');

                        // Polling retry for text verification
                        let lastContent = '';
                        const passed = await test.step(`Polling verify text: "${value}"`, async () => {
                            const start = Date.now();
                            while (Date.now() - start < 7000) {
                                const isVisible = await locator.isVisible();
                                if (isVisible) {
                                    const content = await locator.textContent();
                                    lastContent = content || '';
                                    if (content?.includes(value)) return true;
                                }
                                await new Promise(r => setTimeout(r, 500));
                            }
                            return false;
                        });

                        if (!passed) {
                            throw new Error(`Expected text "${value}" not found. Found: "${lastContent.trim()}"`);
                        }
                    } else if (value) {
                        const isVisible = await this.page.getByText(value).isVisible();
                        if (!isVisible) throw new Error(`Text "${value}" not found on page.`);
                    }
                    break;
                case 'SCREENSHOT':
                    await this.page.screenshot();
                    break;
                case 'PRESS_KEY':
                    await this.page.keyboard.press(value || 'Enter');
                    break;
                case 'RIGHT_CLICK':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await locator.click({ button: 'right' });
                    }
                    break;
                case 'SWITCH_WINDOW':
                    Logger.info(`Switching window to: ${value || 'next'}`, 'Executor');
                    const pages = this.page.context().pages();
                    const index = value === 'next' ? pages.indexOf(this.page) + 1 : parseInt(value || '0');
                    if (pages[index]) await pages[index].bringToFront();
                    break;
                case 'WAIT_NAVIGATION':
                    await this.page.waitForLoadState('load', { timeout: 10000 }).catch(() => { });
                    break;
                case 'WAIT_HIDDEN':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        await locator.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
                            Logger.warn(`Element did not hide within 15s`, 'Executor');
                        });
                    }
                    break;
                case 'VERIFY_ELEMENT':
                    if (action.element) {
                        const locator = await this.finder.findElement(action.element);
                        if (!await locator.isVisible()) throw new Error(`Element not visible for verification.`);
                    }
                    break;
                case 'DRAG_DROP':
                case 'SCROLL':
                    Logger.warn(`Action type ${actionType} is recognized but implementation is pending.`, 'Executor');
                    break;
                default:
                    Logger.warn(`Unsupported action type: ${action.actionType}`, 'Executor');
            }
        }
    }

    // Keep individual methods for direct use if needed
    async click(elementJson: StrongElement) {
        const locator = await this.finder.findElement(elementJson);
        await locator.click();
        Logger.info(`Clicked ${elementJson.elementName}`, 'Executor');
    }

    async type(elementJson: StrongElement, text: string) {
        const locator = await this.finder.findElement(elementJson);
        await locator.fill(text);
        Logger.info(`Typed "${text}" into ${elementJson.elementName}`, 'Executor');
    }
}
