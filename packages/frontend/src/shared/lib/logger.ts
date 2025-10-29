type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isDev = import.meta.env.DEV;

class Logger {
    private prefix: string;

    constructor(prefix?: string) {
        this.prefix = prefix ? `[${prefix}]` : '';
    }

    private formatMessage(level: LogLevel, ...args: unknown[]): unknown[] {
        const timestamp = new Date().toISOString();
        const levelEmoji = this.getLevelEmoji(level);
        return [`${levelEmoji} ${timestamp} ${this.prefix}`.trim(), ...args];
    }

    private getLevelEmoji(level: LogLevel): string {
        const emojiMap: Record<LogLevel, string> = {
            log: '📝',
            info: 'ℹ️',
            warn: '⚠️',
            error: '❌',
            debug: '🐛',
        };
        return emojiMap[level];
    }

    public log(...args: unknown[]): void {
        if (!isDev) return;
        console.log(...this.formatMessage('log', ...args));
    }

    public info(...args: unknown[]): void {
        if (!isDev) return;
        console.info(...this.formatMessage('info', ...args));
    }

    public warn(...args: unknown[]): void {
        if (!isDev) return;
        console.warn(...this.formatMessage('warn', ...args));
    }

    public error(...args: unknown[]): void {
        console.error(...this.formatMessage('error', ...args));
    }

    public debug(...args: unknown[]): void {
        if (!isDev) return;
        console.debug(...this.formatMessage('debug', ...args));
    }

    public child(prefix: string): Logger {
        const childPrefix = this.prefix ? `${this.prefix} ${prefix}` : prefix;
        return new Logger(childPrefix);
    }
}

export const logger = new Logger();

export function createLogger(prefix: string): Logger {
    return new Logger(prefix);
}
