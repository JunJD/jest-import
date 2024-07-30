import dayjs from 'dayjs';
import winston from 'winston';

class Logger {
  constructor(level = 'info') {
    this.logger = winston.createLogger({
      level: level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json(),
        winston.format.printf(({ level, message }) => {
          return `${dayjs(Date.now()).format("HH:mm:ss")} ${level}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log', format: winston.format.json() }),
      ],
    });
  }

  log(message, level = 'info') {
    this.logger.log({ level: level, message: message });
  }

  debug(message) {
    this.log(message, 'debug');
  }

  info(message) {
    this.log(message, 'info');
  }

  warn(message) {
    this.log(message, 'warn');
  }

  error(message) {
    this.log(message, 'error');
  }
  success(message) {
    this.log(message, "data");
  }
}

export default Logger;