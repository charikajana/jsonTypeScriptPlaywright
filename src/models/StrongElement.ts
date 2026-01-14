export interface Fingerprint {
    attributes: {
        type: string | null;
        role: string | null;
    };
    context: {
        nearbyText: string | null;
        parentTag: string | null;
        heading: string | null;
    };
}

export interface StrongElement {
    type: string | null;
    id: string | null;
    name: string | null;
    selector: string | null;
    cssSelector: string | null;
    xpath: string | null;
    text: string | null;
    placeholder: string | null;
    dataTest: string | null;
    ariaLabel: string | null;
    role: string | null;
    title: string | null;
    alt: string | null;
    className: string | null;
    value: string | null;
    href: string | null;
    src: string | null;
    coordinates?: { x: number; y: number; width: number; height: number } | null;
    fingerprint: Fingerprint;
    // Keep internal name for logging but the schema above is priority
    elementName?: string;
    relativeXpath?: string; // Some legacy support might be needed but schema prefers 'xpath'
}

export interface Action {
    actionNumber: number;
    actionType: string;
    description: string;
    element?: StrongElement;
    value?: string;
    optional?: boolean;
}

export interface StepJson {
    stepFileName: string;
    gherkinStep: string;
    normalizedStep: string;
    stepType: string;
    stepNumber: number;
    status: string;
    actions: Action[];
    metadata: {
        createdDate: string;
        totalActions: number;
    };
}
