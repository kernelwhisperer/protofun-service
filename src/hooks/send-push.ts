import webpush from "web-push"

import { Notification } from "../client"
import type { HookContext } from "../declarations"
import { logger } from "../logger"
import { serviceAddress } from "../utils"
import { takeScreenshot } from "../utils/puppeteer"
import { CANDLE_INTERVAL_SECONDS, getLatestCandleTimestamp } from "../utils/report"

type PayloadShape = {
  options: NotificationOptions
  title: string
}

export const sendPush = async (context: HookContext) => {
  const notification = context.result as Notification
  const alert = notification.alertId
    ? await context.app.service("alerts").get(notification.alertId)
    : null
  const user = await context.app.service("users").get(notification.userId)

  if (!user.pushDevices) return

  const vapidKeys = context.app.get("webPush")
  webpush.setVapidDetails(
    "mailto:hello@danielconstantin.net",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )

  let imagePath = ""
  if (alert) {
    try {
      const { protocolId, metricId, priceUnitIndex: priceUnit, variantIndex: variant } = alert
      const thisHourlyCandle = getLatestCandleTimestamp("Hour")
      const pastWeekCandle = getLatestCandleTimestamp("Day") - 7 * CANDLE_INTERVAL_SECONDS.Day
      const since = String(pastWeekCandle)
      const until = String(thisHourlyCandle)
      // TODO: check how old is the alert
      const timeframe = "Hour"

      await takeScreenshot({
        metricId,
        priceUnit,
        protocolId,
        since,
        timeframe,
        until,
        variant,
        watermark: false,
      })

      const fileName = `${protocolId}-${metricId}-${variant}-${priceUnit}-${timeframe.toLowerCase()}-${until}.png`
      imagePath = `${serviceAddress}/snaps/${fileName}`
    } catch (error) {
      logger.error("Send-push failed to get screenshot", { error })
    }
  }

  const payload: PayloadShape = {
    options: {
      badge: "/icon-512x512.png",
      body: notification.text,
      timestamp: notification.createdAt * 1000,
      // image: "/icon-512x512.png",
      ...(alert
        ? {
            data: {
              url: `https://protocol.fun/${alert.protocolId}/${alert.metricId}?unit=${alert.priceUnitIndex}&variant=${alert.variantIndex}`,
            },
            icon: `/assets/${alert.protocolId}.svg`,
            image: imagePath,
            tag: "Alerts",
          }
        : {
            data: { url: "https://protocol.fun" },
            icon: "/icon-512x512.png",
            tag: "General",
          }),
    },
    title: notification.title,
  }

  const payloadStr = JSON.stringify(payload)

  user.pushDevices.forEach(({ sub }) => {
    webpush.sendNotification(sub, payloadStr).catch(logger.error)
  })
}
