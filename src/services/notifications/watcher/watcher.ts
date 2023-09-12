import { Candle } from "protofun"

import type { Application } from "../../../declarations"
import { logger } from "../../../logger"
import { getLowestTimeframe, loadQueryFn } from "../../../utils"
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
        logger.info(
          `Notification watcher: Alert triggered -------------------------------- ${alert.id}`
        )
        alert.paused = true
        app.service(alertPath).patch(alert.id, {
          paused: true,
        })
        // create notification
        app.service(notificationPath).create({
          // alertId: alert.id,
          // userId: alert.userId
          text: `Base fee per gas ${
            alert.increase ? "increased" : "decreased"
          } past the value of ${triggerValue}`,
        })
      }
    })
  })
}

export async function watcher(app: Application) {
  let alerts: Alert[] = []
  const { data } = await app.service(alertPath).find({
    query: {
      metricId: "base_fee",
      // $limit: 100,
    },
  })

  alerts = data

  app.service("alerts").on("created", (alert: Alert) => {
    logger.info(`Notification watcher: new alert ${JSON.stringify(alert)}`)
    alerts = [...alerts, alert]
  })

  app.service("alerts").on("removed", (alert: Alert) => {
    logger.info(`Notification watcher: removed alert ${JSON.stringify(alert)}`)
    alerts = alerts.filter((x) => x.id === alert.id)
  })

  app.service(alertPath).on("created", () => {})

  logger.info(`Notification watcher: alerts.length=${alerts.length}`)
  console.log("📜 LOG > watcher > alerts:", alerts)

  const { query, supportedTimeframes } = await loadQueryFn("eth", "base_fee")
  const timeframe = getLowestTimeframe(supportedTimeframes)

  const oldestTimestamp = alerts.reduce(
    (acc, x) =>
      Math.min(acc, x.startTimestamp ? parseInt(x.startTimestamp) : Number.POSITIVE_INFINITY),
    Number.POSITIVE_INFINITY
  )
  logger.info(`Notification watcher: oldestTimestamp=${oldestTimestamp}`)

  const initialCandles = (await query({
    limit: oldestTimestamp !== Number.POSITIVE_INFINITY ? undefined : 1,
    since: oldestTimestamp !== Number.POSITIVE_INFINITY ? String(oldestTimestamp) : undefined,
    timeframe,
  })) as Candle[]

  logger.info(`Notification watcher: initialCandles.length=${initialCandles.length}`)
  processCandles(initialCandles, alerts, app)

  let lastTimestamp = initialCandles[initialCandles.length - 1]?.timestamp
  logger.info(`Notification watcher: starting interval lastTimestamp=${lastTimestamp}`)

  setInterval(async () => {
    logger.info(`Notification watcher: polling start alerts.length=${alerts.length}`)
    const candles = (await query({
      since: lastTimestamp,
      timeframe,
    })) as Candle[]

    lastTimestamp = candles[candles.length - 1].timestamp
    processCandles(candles, alerts, app)

    logger.info(JSON.stringify(candles))
    logger.info(`lastTimestamp=${lastTimestamp}`)
    logger.info(`Notification watcher: polling finish`)
  }, 3000)
}
