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

const isVercel = env.VERCEL === "1"

const loggerTransports: (transports.FileTransportInstance | transports.ConsoleTransportInstance)[] =
    isVercel
        ? [new transports.Console()]
        : [
              new transports.File({
                  filename: "log/app.log",
                  format: format.json(),
              }),
              new transports.Console(),
          ]

export const logger = createLogger({
    level: "info",
    format: baseFormat,
    transports: loggerTransports,
    exceptionHandlers: isVercel
        ? [new transports.Console()]
        : [new transports.File({ filename: "log/exceptions.log" })],
    rejectionHandlers: isVercel
        ? [new transports.Console()]
        : [new transports.File({ filename: "log/rejections.log" })],
    exitOnError: false,
})
