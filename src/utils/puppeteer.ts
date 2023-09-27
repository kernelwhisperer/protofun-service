import { wait } from "protofun"
import puppeteer from "puppeteer"

import { logger } from "../logger"
import { ReportRequest } from "./report"

const APP_URL = (process.env.APP_URL as string) || "https://protocol.fun"

export async function takeScreenshot(request: ReportRequest) {
  const { metricId, protocolId, since, timeframe, until, variant, priceUnit } = request

  const browser = await puppeteer.launch({ args: ["--lang=bn-BD,bn"], headless: "new" })
  const page = await browser.newPage()
  page.emulateTimezone("UTC")
  // console.log("1")

  const params = new URLSearchParams({
    machine: "true",
    since,
    timeframe,
    unit: String(priceUnit),
    until,
    variant: String(variant),
  })
  const url = `${APP_URL}/${protocolId}/${metricId}?${params}`
  await page.goto(url)
  logger.info("Screenshot url", url)

  await page.setViewport({ deviceScaleFactor: 2, height: 1080, width: 1920 })
  // console.log("3")

  const client = await page.target().createCDPSession()
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: "./screenshots",
  })
  // console.log("4")

  await page.waitForSelector("#chart-legend")
  await page.click("#screenshot-button")
  // console.log("5")

  await wait(1_000)
  // console.log("6")

  await browser.close()
  // console.log("7")
}
