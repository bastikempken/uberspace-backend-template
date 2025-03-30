import * as process from 'node:process';
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;
const { LOG_LEVEL, LOG_FILE } = process.env;

const instance = createLogger({
  level: LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    printf(
      (info) =>
        // eslint-disable-next-line
        `[${info.timestamp}][${info.context}] ${info.level}: ${info.message}`,
    ),
  ),
  transports: [new transports.Console()],
});

if (LOG_FILE) {
  instance.add(
    new transports.File({
      lazy: true,
      maxsize: 2048,
      maxFiles: 10,
      tailable: true,
      filename: `${LOG_FILE}`,
    }),
  );
}

export default instance;
