// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
// Imports the Google Cloud client library for Winston
import { LoggingWinston } from "@google-cloud/logging-winston"
import { createLogger, format, transports } from "winston"

import { isProduction } from "./utils"

const googleLogger = new LoggingWinston({
  defaultCallback: (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error("Error occured: " + err)
    }
  },
  keyFilename: "./config/google-logger-key.json",
  projectId: "protofun",
})

const logDate = new Date().toISOString()

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  format: isProduction
    ? format.combine(
        format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
        format.json()
      )
    : format.combine(
        format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.colorize(),
        format.simple(),
        format.printf(({ level, message, timestamp, metadata }) => {
          return `${timestamp} ${level}:${message} ${
            Object.keys(metadata).length > 0 ? "\n" + JSON.stringify(metadata) : ""
          }`
        })
      ),
  // To see more detailed errors, change this to 'debug'
  level: "info",
  transports: isProduction
    ? [
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        new transports.File({ filename: `logs/${logDate}-error.log`, level: "error" }),
        new transports.File({ filename: `logs/${logDate}-info.log` }),
        googleLogger,
      ]
    : new transports.Console(),
})
