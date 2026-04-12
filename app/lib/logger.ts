type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: Record<string, unknown>
    error?: unknown
}

class Logger {
    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error
        }

        // In production, you would send this to a service like Datadog, Sentry, or CloudWatch
        // For now, we'll format it nicely for the console
        if (process.env.NODE_ENV === 'development') {
            const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m'
            const reset = '\x1b[0m'
            console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`, context || '', error || '')
        } else {
            // Structured logging for production (JSON)
            console.log(JSON.stringify(entry))
        }
    }

    info(message: string, context?: Record<string, unknown>) {
        this.log('info', message, context)
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', message, context)
    }

    error(message: string, error?: unknown, context?: Record<string, unknown>) {
        this.log('error', message, context, error)
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.log('debug', message, context)
    }
}

export const logger = new Logger()
