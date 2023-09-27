import { scheduleJob } from "node-schedule"

import { createReport } from "./api/reports-api"
import { logger } from "./logger"

scheduleJob("5 3 * * *", async function () {
  logger.info("Report: starting weekly")
  // await createReport("eth", "base_fee")
  await createReport("eth", "tx_cost", 2)
  await createReport("eth", "tx_cost", 5)
  await createReport("eth", "eth_price")
  await createReport("comp", "tvl")
  logger.info("Report: finished weekly")
})
