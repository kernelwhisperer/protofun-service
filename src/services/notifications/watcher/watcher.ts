import chalk from "chalk"
import Decimal from "decimal.js"
import {
  Candle,
  formatNumber,
  getLowestTimeframe,
  getMetric,
  getMetricPrecision,
  getSignificantDigits,
  METRICS,
  PROTOCOL_MAP,
} from "protofun"

import type { Application } from "../../../declarations"
import { logger } from "../../../logger"
import { loadMetricFns } from "../../../utils"
import { Alert, alertPath } from "../../alerts/alerts.shared"
import { notificationPath } from "../notifications.shared"

function processCandles(candles: Candle[], alerts: Alert[], app: Application) {
  candles.forEach((candleRaw) => {
    const candleHigh = new Decimal(candleRaw.high)
    const candleLow = new Decimal(candleRaw.low)
    const candleClose = new Decimal(candleRaw.close)

    alerts.forEach((alert) => {
      if (alert.paused) return

      const metric = getMetric(alert.protocolId, alert.metricId)
      const triggerValue = new Decimal(alert.triggerValue)
      // if same candle, ignore high only look at close
      const sameCandle = alert.startTimestamp === candleRaw.timestamp
      let shouldTrigger = false
      let reason = ""

      logger.info(
        chalk.blue(
          `Notification watcher: Checking ${alert.id}, candleRaw=${JSON.stringify(
            candleRaw
          )} triggerValue=${alert.triggerValue} startTimestamp=${alert.startTimestamp} `
        )
      )

      if (alert.increase && sameCandle && candleClose.gte(triggerValue)) {
        shouldTrigger = true
        reason = `Value close ${candleClose.toString()} increased within the same candle past ${triggerValue.toString()}`
      }

      if (alert.increase && !sameCandle && candleHigh.gte(triggerValue)) {
        shouldTrigger = true
        reason = `Value high ${candleHigh.toString()} increased on the next candle past ${triggerValue.toString()}`
      }

      if (!alert.increase && sameCandle && candleClose.lte(triggerValue)) {
        shouldTrigger = true
        reason = `Value close ${candleLow.toString()} decreased within the same candle past ${triggerValue.toString()}`
      }
      if (!alert.increase && !sameCandle && candleLow.lte(triggerValue)) {
        shouldTrigger = true
        reason = `Value low ${candleClose.toString()} decreased on the next candle past ${triggerValue.toString()}`
      }

      if (shouldTrigger) {
        logger.info(
          chalk.red(
            `Notification watcher: Alert triggered ------------- ${alert.id}, reason:${reason}`
          )
        )
        alert.paused = true
        app.service(alertPath).patch(alert.id, {
          paused: true,
        })
        // create notification
        const protocol = PROTOCOL_MAP[alert.protocolId]
        const { priceUnits } = metric
        const unitLabel = priceUnits[alert.priceUnitIndex]

        const value = formatNumber(
          triggerValue.div(getMetricPrecision(metric, alert.variantIndex)).toNumber(),
          getSignificantDigits(metric, alert.priceUnitIndex),
          "compact"
        )

        app.service(notificationPath).create({
          alertId: alert.id,
          text: `${protocol.title}'s ${metric.title} ${
            metric.variants ? `(${metric.variants[alert.variantIndex].label})` : ""
          } ${alert.increase ? "increased" : "decreased"} to ${value} ${unitLabel}.`,
          title: metric.title,
          userId: alert.userId,
        })
      }
    })
  })
}

export async function watcher(app: Application) {
  let activeAlerts: Alert[] = []
  try {
    const { data } = await app.service(alertPath).find({
      query: {
        $limit: 1000,
        paused: false,
      },
    })
    activeAlerts = data
  } catch (error) {
    // this throws inside migration
    logger.info(`Notification watcher: error${String(error)}`)
  }

  app.service("alerts").on("created", (alert: Alert) => {
    logger.info(`Notification watcher: new alert ${JSON.stringify(alert)}`)
    activeAlerts = [...activeAlerts, alert]
  })

  app.service("alerts").on("patched", (alert: Alert) => {
    logger.info(`Notification watcher: patched alert ${JSON.stringify(alert)}`)
    if (alert.paused) {
      activeAlerts = activeAlerts.filter((x) => x.id !== alert.id)
    }
  })
  logger.info(`Notification watcher: alerts.length=${activeAlerts.length}`)

  METRICS.forEach((metric) => {
    metric.priceUnits.forEach(async (priceUnit, priceUnitIndex) => {
      const watcherId = chalk.yellow(`${metric.id} ${priceUnit}`)

      logger.info(`Notification watcher: ${watcherId} setup`)

      const { subscribe, query } = await loadMetricFns(metric.protocol, metric.id)
      const timeframe = getLowestTimeframe(metric.timeframes)

      if (!subscribe) {
        logger.info(`Notification watcher: ${watcherId} skipped`)
        return
      }

      const metricAlerts = activeAlerts.filter(
        (x) => x.metricId === metric.id && x.priceUnitIndex === priceUnitIndex
      )
      const oldestTimestamp = metricAlerts.reduce(
        (acc, x) =>
          Math.min(acc, x.startTimestamp ? parseInt(x.startTimestamp) : Number.POSITIVE_INFINITY),
        Number.POSITIVE_INFINITY
      )
      logger.info(
        `Notification watcher: ${watcherId} oldestTimestamp=${oldestTimestamp} metricAlerts.length=${metricAlerts.length}`
      )

      const initialCandles = (await query({
        limit: oldestTimestamp !== Number.POSITIVE_INFINITY ? undefined : 1,
        priceUnit,
        since: oldestTimestamp !== Number.POSITIVE_INFINITY ? String(oldestTimestamp) : undefined,
        timeframe,
      })) as Candle[]

      logger.info(
        `Notification watcher: ${watcherId} initialCandles.length=${initialCandles.length}`
      )
      processCandles(initialCandles, metricAlerts, app)

      const initialTimestamp = initialCandles[initialCandles.length - 1]?.timestamp
      logger.info(
        `Notification watcher: ${watcherId} starting interval initialTimestamp=${initialTimestamp}`
      )

      subscribe({
        onNewData: (data: Candle) => {
          const metricAlerts = activeAlerts.filter(
            (x) => x.metricId === metric.id && x.priceUnitIndex === priceUnitIndex
          )
          logger.info(
            `${watcherId} metricAlerts=${JSON.stringify(metricAlerts)} data=${JSON.stringify(data)}`
          )
          processCandles([data], metricAlerts, app)
        },
        pollingInterval: metric.id === "base_fee" ? 6_000 : 12_000,
        priceUnit,
        since: initialTimestamp,
        timeframe,
      })
    })
  })
}
