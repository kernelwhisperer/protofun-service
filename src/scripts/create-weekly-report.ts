/* eslint-disable no-console */
import "../load-dotenv"

import { createReport } from "../api/reports-api"

export async function createReports() {
  // await createReport("eth", "base_fee")
  await createReport("eth", "tx_cost", 2)
  await createReport("eth", "tx_cost", 5)
  await createReport("eth", "eth_price")
}

createReports().then(console.log).catch(console.error)
