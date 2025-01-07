import { createLogger, format, transports } from "winston";
import morgan from "morgan";
import nodemailer from "nodemailer";

const emailTransporter = nodemailer.createTransport({
  host: "smtp-lare.alwaysdata.net",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendErrorEmail = async (error) => {
  const res = await emailTransporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.ERROR_EMAIL,
    subject: `Server error: ${error.message}`,
    text: error.stack,
  });
};

export const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "HH:mm:ss" }), // YYYY-MM-DD
    format.json(),
    format.errors()
  ),
  transports: [],
});

if (process.env.NODE_ENV === "development") {
  logger.add(
    new transports.Console({
      handleExceptions: true,
      handleRejections: true,
      format: format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      ),
    })
  );
} else if (process.env.NODE_ENV === "production") {
  logger.add(
    new transports.File({
      filename: "./logs/events.log",
    })
  );
}

export const loggerMiddleware = morgan(
  ":method :status :url :response-time[0] ms",
  {
    stream: { write: (message) => logger.info(message) },
  }
);

export const errorMiddleWare = (error, req, res, next) => {
  sendErrorEmail(error);
  logger.error(error);
  res.sendStatus(500);
};
