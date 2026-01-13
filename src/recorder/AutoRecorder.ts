import type { Page } from '@playwright/test';
import type { StrongElement, StepJson, Action } from '../models/StrongElement.js';
import * as fs from 'fs';
import * as path from 'path';

export class AutoRecorder {
    private currentActions: Action[] = [];
    private repositoryPath = path.join(process.cwd(), 'src', 'test', 'resources', 'locatorRepository');

    constructor(private page: Page) {
        if (!fs.existsSync(this.repositoryPath)) {
            fs.mkdirSync(this.repositoryPath, { recursive: true });
        }
    }

    async start() {
        console.log('--- [AutoRecorder] Monitoring Interactions... ---');

        await this.page.exposeFunction('onActionCaptured', (action: Action) => {
            console.log(`[AutoRecorder] Action Captured: ${action.actionType} on ${action.element?.id || action.element?.type}`);
            this.currentActions.push(action);
        });

        await this.page.addInitScript(() => {
            const getRelativeXpath = (element: HTMLElement): string => {
                if (element.id) return `//${element.tagName.toLowerCase()}[@id='${element.id}']`;

                // Find nearest parent with ID
                let current: HTMLElement | null = element;
                let path = '';
                while (current && current !== document.body) {
                    if (current.id) {
                        return `//${current.tagName.toLowerCase()}[@id='${current.id}']${path}`;
                    }
                    const tag = current.tagName.toLowerCase();
                    const siblings = Array.from(current.parentNode?.children || []);
                    const index = siblings.filter(s => s.tagName === current?.tagName).indexOf(current) + 1;
                    path = `/${tag}[${index}]${path}`;
                    current = current.parentElement;
                }
                return `/html/body${path}`;
            };

            const captureElement = (el: HTMLElement): any => {
                const rect = el.getBoundingClientRect();

                const getAttr = (name: string) => el.getAttribute(name) || (el as any)[name] || null;

                const data: any = {
                    type: el.tagName.toLowerCase(),
                    id: el.id || null,
                    name: el.getAttribute('name') || null,
                    selector: el.id ? `#${el.id}` : null,
                    cssSelector: null, // Can be computed if needed
                    xpath: getRelativeXpath(el),
                    text: el.innerText?.trim() || el.textContent?.trim() || null,
                    placeholder: el.getAttribute('placeholder') || null,
                    dataTest: el.getAttribute('data-test') || el.getAttribute('data-testid') || null,
                    ariaLabel: el.getAttribute('aria-label') || null,
                    role: el.getAttribute('role') || null,
                    title: el.getAttribute('title') || null,
                    alt: el.getAttribute('alt') || null,
                    className: el.className || null,
                    value: (el as HTMLInputElement).value || null,
                    href: (el as HTMLAnchorElement).href || null,
                    src: (el as HTMLImageElement).src || null,
                    coordinates: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
                    fingerprint: {
                        attributes: {
                            type: el.getAttribute('type') || null,
                            role: el.getAttribute('role') || null
                        },
                        context: {
                            nearbyText: null, // To be implemented
                            parentTag: el.parentElement?.tagName.toLowerCase() || null,
                            heading: document.querySelector('h1, h2, h3')?.textContent?.trim() || null
                        }
                    }
                };
                return data;
            };

            window.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                // @ts-ignore
                window.onActionCaptured({
                    actionNumber: 0, // Will be set on save
                    actionType: 'CLICK',
                    description: `Click ${target.tagName}`,
                    element: captureElement(target)
                });
            }, true);

            window.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
                    // @ts-ignore
                    window.onActionCaptured({
                        actionNumber: 0,
                        actionType: target.tagName === 'SELECT' ? 'SELECT' : 'TYPE',
                        description: `Type into ${target.tagName}`,
                        element: captureElement(target),
                        value: target.value
                    });
                }
            }, true);
        });
    }

    async saveStep(gherkinStep: string) {
        const normalized = this.normalize(gherkinStep);
        const filePath = path.join(this.repositoryPath, `${normalized}.json`);

        if (fs.existsSync(filePath)) {
            console.warn(`[AutoRecorder] Step already exists: ${normalized}. Skipping save.`);
            return;
        }

        const stepJson: StepJson = {
            stepFileName: normalized,
            gherkinStep: gherkinStep,
            normalizedStep: normalized,
            stepType: "When", // Default
            stepNumber: 1,
            status: "passed",
            actions: this.currentActions.map((a, i) => ({
                ...a,
                actionNumber: i + 1,
                value: a.value ? "___RUNTIME_PARAMETER___" : undefined
            })),
            metadata: {
                createdDate: new Date().toISOString(),
                totalActions: this.currentActions.length
            }
        };

        fs.writeFileSync(filePath, JSON.stringify(stepJson, null, 2));
        console.log(`[AutoRecorder] SAVED StrongJSON: ${filePath}`);
        this.currentActions = []; // Clear for next step
    }

    private normalize(step: string): string {
        return step.toLowerCase()
            .replace(/"[^"]*"/g, '_param_')
            .replace(/\d+/g, '_param_')
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
}
