import Decimal from "decimal.js"
import path from "path"
import {
  getMetric,
  getMetricPrecision,
  getSignificantDigits,
  MetricId,
  PROTOCOL_MAP,
  ProtocolId,
} from "protofun"

import { logger } from "../logger"
import { loadMetricFns } from "../utils"
import { takeScreenshot } from "../utils/puppeteer"
import { CANDLE_INTERVAL_SECONDS, getLatestCandleTimestamp, getWeekNumber } from "../utils/report"
import { sendTelegramPhoto } from "../utils/telegram"

export async function createReport(
  protocolId: ProtocolId,
  metricId: MetricId,
  variant = 0,
  priceUnit = 0
) {
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
    formatter.format(x.div(getMetricPrecision(metric, variant)).toNumber()).replace(".", "\\.")

  let metricTitle = metric.title

  if (metric.variants && metric.variants.length > 0) {
    metricTitle += ` \\(${metric.variants[variant].label}\\)`
  }

  const caption = `Week \\#${getWeekNumber(lastWeekCandle)} for ${protocol.title}\\.

${metricTitle} has ${changeDirection} ${percentageChange
    .abs()
    .toFixed(2)
    .replace(".", "\\.")}% to *${decimalJsFormatter(close)} ${unitLabel}*\\.`

  /**
   * Screenshot
   */
  await takeScreenshot({
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

  await sendTelegramPhoto(filePath, caption)
}
