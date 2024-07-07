import { createLogger, format, transports } from "winston";
import morgan from "morgan";

export const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "HH:mm:ss" }), // YYYY-MM-DD
    format.json(),
    format.errors()
  ),
  transports: [
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format: format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      ),
    }),
  ],
});

export const loggerMiddleware = morgan(
  ":method :status :url :response-time[0] ms",
  {
    stream: { write: (message) => logger.info(message) },
  }
);
