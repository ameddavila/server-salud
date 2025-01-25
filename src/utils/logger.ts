import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize } = format;

// Formato personalizado para los logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

// Configuración del logger
const logger = createLogger({
  level: "info", // Nivel mínimo que se registrará (info, warn, error, etc.)
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // Log en consola
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // Log diario en archivo
    new DailyRotateFile({
      dirname: "logs",
      filename: "application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// Log de errores críticos en un archivo separado
logger.add(
  new transports.File({
    filename: "logs/error.log",
    level: "error",
  })
);

export default logger;
