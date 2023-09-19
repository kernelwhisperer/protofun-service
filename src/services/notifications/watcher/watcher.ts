import { Candle, getLowestTimeframe, METRICS } from "protofun"

import type { Application } from "../../../declarations"
import { logger } from "../../../logger"
import { loadMetricFns } from "../../../utils"
import { Alert, alertPath } from "../../alerts/alerts.shared"
import { notificationPath } from "../notifications.shared"

function processCandles(candles: Candle[], alerts: Alert[], app: Application) {
  candles.forEach((candleRaw) => {
    const candle = {
      close: parseInt(candleRaw.close),
      high: parseInt(candleRaw.high),
      low: parseInt(candleRaw.low),
      open: parseInt(candleRaw.open),
    }

    alerts.forEach((alert) => {
      if (alert.paused) return
      const triggerValue = parseInt(alert.triggerValue)

      // same candle, ignore high only look at close TODO
      // alert.startTimestamp === candleRaw.timestamp

      if (
        (alert.increase && candle.high >= triggerValue) ||
        (!alert.increase && candle.low <= triggerValue)
      ) {
        logger.info(`Notification watcher: Alert triggered ------------- ${alert.id}`)
        alert.paused = true
        app.service(alertPath).patch(alert.id, {
          paused: true,
        })
        // create notification
        app.service(notificationPath).create({
          alertId: alert.id,
          text: `Ethereum's Base fee per gas ${alert.increase ? "increased" : "decreased"} to ${(
            triggerValue / 1e9
          ).toFixed(2)} Gwei.`,
          title: "Base fee per gas",
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
      activeAlerts = activeAlerts.filter((x) => x.id === alert.id)
    }
  })
  logger.info(`Notification watcher: alerts.length=${activeAlerts.length}`)

  METRICS.forEach(async (metric) => {
    logger.info(`Notification watcher: setup ${metric.id}`)

    const { subscribe, query } = await loadMetricFns(metric.protocol, metric.id)
    const timeframe = getLowestTimeframe(metric.timeframes)

    if (!subscribe) {
      logger.info(`Notification watcher: skipped ${metric.id}`)
      return
    }

    const metricAlerts = activeAlerts.filter((x) => x.metricId === metric.id)
    const oldestTimestamp = metricAlerts.reduce(
      (acc, x) =>
        Math.min(acc, x.startTimestamp ? parseInt(x.startTimestamp) : Number.POSITIVE_INFINITY),
      Number.POSITIVE_INFINITY
    )
    logger.info(`Notification watcher: ${metric.id} oldestTimestamp=${oldestTimestamp}`)

    const initialCandles = (await query({
      limit: oldestTimestamp !== Number.POSITIVE_INFINITY ? undefined : 1,
      since: oldestTimestamp !== Number.POSITIVE_INFINITY ? String(oldestTimestamp) : undefined,
      timeframe,
    })) as Candle[]

    logger.info(`Notification watcher: ${metric.id} initialCandles.length=${initialCandles.length}`)
    processCandles(initialCandles, metricAlerts, app)

    const initialTimestamp = initialCandles[initialCandles.length - 1]?.timestamp
    logger.info(
      `Notification watcher: ${metric.id} starting interval initialTimestamp=${initialTimestamp}`
    )

    subscribe({
      onNewData: (data: Candle) => {
        const metricAlerts = activeAlerts.filter((x) => x.metricId === metric.id)
        processCandles([data], metricAlerts, app)
        logger.info(`${metric.id} data=${JSON.stringify(data)}`)
      },
      pollingInterval: metric.id === "base_fee" ? 6_000 : 12_000,
      since: initialTimestamp,
      timeframe,
    })
  })
}
