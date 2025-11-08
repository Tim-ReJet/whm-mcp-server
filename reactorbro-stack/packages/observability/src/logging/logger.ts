/**
 * Unified Logging System
 * Structured logging with levels, context, and multiple transports
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
  traceId?: string;
  spanId?: string;
  service?: string;
  environment?: string;
}

export type LogTransport = (entry: LogEntry) => void | Promise<void>;

export class Logger {
  private level: LogLevel;
  private transports: LogTransport[];
  private service: string;
  private environment: string;
  private defaultContext: LogContext;

  constructor(options: {
    level?: LogLevel;
    transports?: LogTransport[];
    service?: string;
    environment?: string;
    defaultContext?: LogContext;
  } = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.transports = options.transports ?? [this.consoleTransport];
    this.service = options.service ?? 'reactorbro-stack';
    this.environment = options.environment ?? process.env.NODE_ENV ?? 'development';
    this.defaultContext = options.defaultContext ?? {};
  }

  private consoleTransport(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const errorStr = entry.error ? `\n${entry.error.stack}` : '';

    const colorMap: Record<string, string> = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    const color = colorMap[levelName] || '';

    if (entry.level >= LogLevel.ERROR) {
      console.error(`${color}[${timestamp}] [${levelName}]${reset} ${entry.message}${contextStr}${errorStr}`);
    } else {
      console.log(`${color}[${timestamp}] [${levelName}]${reset} ${entry.message}${contextStr}`);
    }
  }

  private async log(level: LogLevel, message: string, context?: LogContext, error?: Error): Promise<void> {
    if (level < this.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: { ...this.defaultContext, ...context },
      error,
      service: this.service,
      environment: this.environment,
    };

    // Execute all transports
    for (const transport of this.transports) {
      try {
        await transport(entry);
      } catch (err) {
        // Don't throw - logging shouldn't break the app
        console.error('Log transport failed:', err);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  child(context: LogContext): Logger {
    return new Logger({
      level: this.level,
      transports: this.transports,
      service: this.service,
      environment: this.environment,
      defaultContext: { ...this.defaultContext, ...context },
    });
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }
}

/**
 * File transport for persistent logging
 */
export function createFileTransport(filepath: string): LogTransport {
  const fs = require('fs');
  const path = require('path');
  const { createWriteStream } = require('fs');

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const stream = createWriteStream(filepath, { flags: 'a' });

  return (entry: LogEntry) => {
    const line = JSON.stringify(entry) + '\n';
    stream.write(line);
  };
}

/**
 * JSON transport for structured logging
 */
export function createJSONTransport(filepath: string): LogTransport {
  return createFileTransport(filepath);
}

/**
 * HTTP transport for remote logging (e.g., Loki, Elasticsearch)
 */
export function createHTTPTransport(url: string, options: {
  headers?: Record<string, string>;
  batchSize?: number;
  flushInterval?: number;
} = {}): LogTransport {
  const batch: LogEntry[] = [];
  const batchSize = options.batchSize ?? 100;
  const flushInterval = options.flushInterval ?? 5000;

  const flush = async () => {
    if (batch.length === 0) return;

    const entries = batch.splice(0, batch.length);

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify({ entries }),
      });
    } catch (error) {
      console.error('HTTP log transport failed:', error);
    }
  };

  // Periodic flush
  setInterval(flush, flushInterval);

  return async (entry: LogEntry) => {
    batch.push(entry);
    if (batch.length >= batchSize) {
      await flush();
    }
  };
}

/**
 * Default logger instance
 */
export const logger = new Logger({
  level: process.env.LOG_LEVEL
    ? LogLevel[process.env.LOG_LEVEL as keyof typeof LogLevel] ?? LogLevel.INFO
    : LogLevel.INFO,
  service: 'reactorbro-stack',
  environment: process.env.NODE_ENV ?? 'development',
});

export default logger;

