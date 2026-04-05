import { addColors, createLogger, format, transports } from "winston"
// import { env } from "./env"
//colors
const colors = {
    info: "blue",
    warn: "yellow",
    error: "red",
    debug: "gray",
    deal: "black",
}
addColors(colors)

//formats
const baseFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.splat(),
    format.metadata({ fillExcept: ["timestamp", "level", "message", "stack"] }),
)
// const consoleFormat = format.printf(({ timestamp, level, message, metadata }) => {
//     const timeOnly = timestamp as string
//     const metaString =
//         metadata && Object.keys(metadata).length ? `${JSON.stringify(metadata)}` : " "
//     return `${timeOnly} [${level}] ${message} ${metaString}`
// })
// const uppercaseFormat = format((info) => {
//     info.level = info.level.toUpperCase()
//     return info
// })

const loggerTransports: (transports.FileTransportInstance | transports.ConsoleTransportInstance)[] =
    [
        new transports.File({
            filename: "log/app.log",
            format: format.json(),
        }),
    ]

// if (env.NODE_ENV === "development") {
//     loggerTransports.push(
//         new transports.Console({
//             format: format.combine(uppercaseFormat(), format.colorize(), consoleFormat),
//         }),
//     )
// }

export const logger = createLogger({
    level: "info",
    format: baseFormat,
    transports: loggerTransports,
    exceptionHandlers: [new transports.File({ filename: "log/exceptions.log" })],
    rejectionHandlers: [new transports.File({ filename: "log/rejections.log" })],
    exitOnError: false,
})
