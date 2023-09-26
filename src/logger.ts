// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { createLogger, format, transports } from "winston"

import { isProduction } from "./utils"

const logDate = new Date().toISOString()

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  format: format.combine(
    format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    isProduction ? format.json() : format.simple()
  ),
  // To see more detailed errors, change this to 'debug'
  level: "info",
  transports: isProduction
    ? [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new transports.File({ filename: `logs/${logDate}-error.log`, level: "error" }),
        new transports.File({ filename: `logs/${logDate}-info.log` }),
      ]
    : new transports.Console(),
})
