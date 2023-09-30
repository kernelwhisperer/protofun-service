import Decimal from "decimal.js"
import path from "path"
import { getMetric, getMetricPrecision, getSignificantDigits, PROTOCOL_MAP } from "protofun"

import { logger } from "../logger"
import { loadMetricFns } from "../utils"
import { takeSnap } from "../utils/puppeteer"
import {
  CANDLE_INTERVAL_SECONDS,
  getLatestCandleTimestamp,
  getWeekNumber,
  mergeMessages,
  ReportRequest,
} from "../utils/report"
import { sendTelegramPhoto } from "../utils/telegram"
import { sendTweetWithPhotos } from "../utils/twitter"

export async function createSingleReport(request: ReportRequest) {
  const { protocolId, metricId, variant = 0, priceUnit = 0 } = request
  const { query } = await loadMetricFns(protocolId, metricId)

  const thisWeekCandle = getLatestCandleTimestamp("Week")
  const lastWeekCandle = thisWeekCandle - CANDLE_INTERVAL_SECONDS.Week
  const since = String(lastWeekCandle)
  const until = String(thisWeekCandle - 1) // we want lt not lte
  const timeframe = "Hour"

  const candles = await query({
    // limit: 168,
    since,
    timeframe: "Hour",
    until,
  })

  if (candles.length !== 168) {
    logger.warn(`Warning: Expected report to contain 168 records ${protocolId} ${metricId}`)
  }

  /**
   * Math
   */
  // let sum = new Decimal(0)
  let low = new Decimal(candles[0].low)
  let high = new Decimal(candles[0].high)

  for (const candle of candles) {
    // const closePrice = new Decimal(candle.close)
    const lowPrice = new Decimal(candle.low)
    const highPrice = new Decimal(candle.high)

    // sum = sum.plus(closePrice) // Summing up close prices for mean calculation

    if (lowPrice.lessThan(low)) low = lowPrice // Updating low
    if (highPrice.greaterThan(high)) high = highPrice // Updating high
  }

  // const mean = sum.dividedBy(candles.length) // Calculating mean
  const open = new Decimal(candles[0].open)
  const close = new Decimal(candles[candles.length - 1].close)
  const percentageChange = close.minus(open).dividedBy(open).times(100)

  /**
   * Caption
   */

  const changeDirection = percentageChange.isNegative() ? "declined" : "increased"

  const metric = getMetric(protocolId, metricId)
  const protocol = PROTOCOL_MAP[protocolId]
  const { priceUnits } = metric
  const unitLabel = priceUnits[priceUnit]

  const digits = getSignificantDigits(metric, priceUnit)
  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })

  const decimalJsFormatter = (x: Decimal) =>
    formatter.format(x.div(getMetricPrecision(metric, variant)).toNumber())

  let metricTitle = metric.title

  if (metric.variants && metric.variants.length > 0) {
    metricTitle += ` (${metric.variants[variant].label})`
  }

  const title = `Week #${getWeekNumber(lastWeekCandle)}`
  const body = `${metricTitle} has ${changeDirection} ${percentageChange
    .abs()
    .toFixed(0)}% to *${decimalJsFormatter(close)} ${unitLabel}*.`

  /**
   * Screenshot
   */
  await takeSnap({
    metricId,
    priceUnit,
    protocolId,
    since,
    timeframe,
    until,
    variant,
  })

  /**
   * Send
   */
  const lastCandleTimestamp = candles[candles.length - 1].timestamp

  const fileName = `${protocolId}-${metricId}-${variant}-${priceUnit}-${timeframe.toLowerCase()}-${lastCandleTimestamp}.png`
  const filePath = path.join(path.join(__dirname, "../../public/snaps"), fileName)

  return { body, filePath, title }
}

export async function sendWeeklyEthereumReport() {
  logger.info("Report: sendWeeklyEthereumReport start")
  const results = await Promise.all([
    createSingleReport({ metricId: "base_fee", protocolId: "eth" }),
    createSingleReport({ metricId: "tx_cost", protocolId: "eth", variant: 2 }),
    createSingleReport({ metricId: "tx_cost", protocolId: "eth", variant: 5 }),
    createSingleReport({ metricId: "eth_price", protocolId: "eth" }),
  ])

  /**
   * Telegram
   */
  try {
    for (const result of results) {
      const { body, title, filePath } = result
      await sendTelegramPhoto(filePath, mergeMessages(title, body))
    }
  } catch (error) {
    logger.error(`Cannot send telegram report ${String(error)}`, { error })
  }

  /**
   * Twitter
   */
  try {
    const title = results[0].title
    const body = results.map((x) => x.body).join("\n\n")

    await sendTweetWithPhotos(
      results.map((x) => x.filePath),
      mergeMessages(mergeMessages(title, body), "#Ethereum #GasFee #ETH $ETH")
    )
  } catch (error) {
    logger.error(`Cannot send twitter report ${String(error)}`, { error })
  }

  logger.info("Report: sendWeeklyEthereumReport end")
}
