import { scheduleJob } from "node-schedule"

import { sendWeeklyEthereumReport } from "./api/reports-api"
import { logger } from "./logger"

scheduleJob("0 0 * * 1", async function () {
  await sendWeeklyEthereumReport()
})

// scheduleJob("0 0 * * *", async function () {
//   await sendDailyEthereumReport()
// })

logger.info("Cron jobs: ready")
