import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export class Logger {
    private static level: LogLevel = LogLevel.INFO;
    private static logDir = path.join(process.cwd(), 'logs');
    private static logFile: string;

    static {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFile = path.join(this.logDir, `execution_${timestamp}.log`);
    }

    static setLevel(level: LogLevel) {
        this.level = level;
    }

    private static getTimestamp(): string {
        return new Date().toISOString();
    }

    private static format(level: string, message: string, context?: string): string {
        const ctx = context ? ` [${context}]` : '';
        return `${this.getTimestamp()} ${level.padEnd(5)}${ctx}: ${message}`;
    }

    private static writeToFile(formattedMessage: string) {
        try {
            fs.appendFileSync(this.logFile, formattedMessage + '\n');
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }
    }

    static debug(message: string, context?: string) {
        const formatted = this.format('DEBUG', message, context);
        if (this.level <= LogLevel.DEBUG) {
            console.debug(formatted);
        }
        this.writeToFile(formatted);
    }

    static info(message: string, context?: string) {
        const formatted = this.format('INFO', message, context);
        if (this.level <= LogLevel.INFO) {
            console.info(formatted);
        }
        this.writeToFile(formatted);
    }

    static warn(message: string, context?: string) {
        const formatted = this.format('WARN', message, context);
        if (this.level <= LogLevel.WARN) {
            console.warn(formatted);
        }
        this.writeToFile(formatted);
    }

    static error(message: string, context?: string) {
        const formatted = this.format('ERROR', message, context);
        if (this.level <= LogLevel.ERROR) {
            console.error(formatted);
        }
        this.writeToFile(formatted);
    }
}
