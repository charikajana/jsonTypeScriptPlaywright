import * as fs from 'fs';
import * as path from 'path';

export class EnvironmentConfig {
    private static currentEnv: string = process.env.TEST_ENV || 'DEV';
    private static config: Record<string, string> = {};

    static {
        this.loadConfig();
    }

    private static loadConfig() {
        const envPath = path.join(process.cwd(), 'src', 'environments', `${this.currentEnv.toUpperCase()}.json`);

        if (fs.existsSync(envPath)) {
            try {
                this.config = JSON.parse(fs.readFileSync(envPath, 'utf-8'));
                console.log(`[Environment] Loaded configuration: ${this.currentEnv}`);
            } catch (error) {
                console.error(`[Environment] Error parsing config file: ${envPath}`, error);
            }
        } else {
            console.warn(`[Environment] Config file not found: ${envPath}. Using empty config.`);
        }
    }

    static get(key: string, defaultValue?: string): string {
        return this.config[key] || defaultValue || '';
    }

    /**
     * Resolves variables in a string (e.g., "${BASE_URL}/login")
     */
    static resolve(text: string): string {
        if (!text || !text.includes('${')) return text;

        let resolved = text;
        for (const [key, value] of Object.entries(this.config)) {
            const placeholder = `\${${key}}`;
            resolved = resolved.split(placeholder).join(value);
        }
        return resolved;
    }

    static getCurrentEnv(): string {
        return this.currentEnv;
    }

    static getAll(): Record<string, string> {
        return { ...this.config };
    }
}
