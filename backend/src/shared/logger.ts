import { createLogger, format, transports } from 'winston';

const isDev = process.env.NODE_ENV !== 'production';

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }),
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

export const logger = createLogger({
  level: isDev ? 'debug' : 'info',
  format: isDev ? devFormat : prodFormat,
  transports: [new transports.Console()],
});
