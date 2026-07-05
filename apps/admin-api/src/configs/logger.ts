import { env } from "./env"
import { addColors, createLogger, format, transports } from "winston"

// colors
const colors = {
    info: "blue",
    warn: "yellow",
    error: "red",
    debug: "gray",
}
addColors(colors)

// formats
const baseFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.splat(),
    format.metadata({ fillExcept: ["timestamp", "level", "message", "stack"] }),
)

const isProduction = env.NODE_ENV === "production" || !!env.VERCEL

const consoleFormat = format.combine(
    format.colorize({ all: true }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`),
)

const loggerTransports: (transports.FileTransportInstance | transports.ConsoleTransportInstance)[] =
    isProduction
        ? [new transports.Console({ format: consoleFormat })]
        : [
              new transports.File({
                  filename: "log/app.log",
                  format: format.json(),
              }),
              new transports.Console({ format: consoleFormat }),
          ]

export const logger = createLogger({
    level: "info",
    format: baseFormat,
    transports: loggerTransports,
    exceptionHandlers: isProduction
        ? [new transports.Console()]
        : [new transports.File({ filename: "log/exceptions.log" })],
    rejectionHandlers: isProduction
        ? [new transports.Console()]
        : [new transports.File({ filename: "log/rejections.log" })],
    exitOnError: false,
})
