// For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
import { createLogger, format, transports } from "winston"

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
export const logger = createLogger({
  format: format.combine(format.splat(), format.simple()),
  // To see more detailed errors, change this to 'debug'
  level: "info",
  transports: [new transports.Console()],
})
