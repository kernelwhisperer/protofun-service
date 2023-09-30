import { wait } from "protofun"
import puppeteer from "puppeteer"

import { logger } from "../logger"
import { isProduction } from "../utils"
import { ReportSnapRequest } from "./report"

const APP_URL = process.env.APP_URL as string

export async function takeSnap(request: ReportSnapRequest) {
  const {
    metricId,
    protocolId,
    since,
    timeframe,
    until,
    variant,
    priceUnit,
    screenWidth = 1920,
    watermark = true,
  } = request

  const browser = await puppeteer.launch({
    ...(isProduction
      ? {
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          executablePath: "/usr/bin/google-chrome", // add other args if needed
        }
      : {}),
    headless: "new",
  })
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
    watermark: String(watermark),
  })
  const url = `${APP_URL}/${protocolId}/${metricId}?${params}`
  logger.info("Screenshot url", { url })
  await page.goto(url)

  await page.setViewport({ deviceScaleFactor: 2, height: 1080, width: screenWidth })
  // console.log("3")

  const client = await page.target().createCDPSession()
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: "./public/snaps",
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
