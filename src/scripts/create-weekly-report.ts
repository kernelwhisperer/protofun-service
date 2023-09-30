/* eslint-disable no-console */
import "../load-dotenv"

import { sendWeeklyEthereumReport } from "../api/reports-api"

export async function createReport() {
  await sendWeeklyEthereumReport()
}

createReport().then(console.log).catch(console.error)
