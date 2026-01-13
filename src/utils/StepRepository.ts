import * as fs from 'fs';
import * as path from 'path';

export class StepRepository {
    private static repoPath = path.join(process.cwd(), 'src', 'test', 'resources', 'locatorRepository');

    static getNormalizedName(stepText: string): string {
        // Replace quoted strings with _param_
        let normalized = stepText.replace(/"[^"]*"/g, '_param_');
        // Replace numbers with _param_
        normalized = normalized.replace(/\d+/g, '_param_');
        // Lowercase, replace non-alphanumeric with underscore, collapse underscores
        return normalized.toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }

    static hasStepJson(stepText: string): boolean {
        const normalized = this.getNormalizedName(stepText);
        const fileName = `${normalized}.json`;
        const filePath = path.join(this.repoPath, fileName);
        return fs.existsSync(filePath);
    }

    static findStepJson(stepText: string): any | null {
        const fileName = this.getNormalizedName(stepText) + '.json';
        const filePath = path.join(this.repoPath, fileName);

        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
        return null;
    }

    static extractParameters(stepText: string): string[] {
        const params: string[] = [];
        // Extract quoted strings
        const matches = stepText.match(/"([^"]*)"/g);
        if (matches) {
            matches.forEach(m => params.push(m.replace(/"/g, '')));
        }
        return params;
    }
}
