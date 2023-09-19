import webpush from "web-push"

import { Notification } from "../client"
import type { HookContext } from "../declarations"
import { logger } from "../logger"

type PayloadShape = {
  options: NotificationOptions
  title: string
}

export const sendPush = async (context: HookContext) => {
  const notification = context.result as Notification
  const { alert } = notification
  const user = await context.app.service("users").get(notification.userId)

  if (!user.pushDevices) return

  const vapidKeys = context.app.get("webPush")
  webpush.setVapidDetails(
    "mailto:hello@danielconstantin.net",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )

  const payload: PayloadShape = {
    options: {
      badge: "/icon-512x512.png",
      body: notification.text,
      timestamp: notification.createdAt * 1000,
      // image: "/icon-512x512.png",
      ...(alert
        ? {
            data: { url: `https://protocol.fun/${alert.protocolId}/${alert.metricId}` },
            icon: `/assets/${alert.protocolId}.svg`,
            tag: "Alerts",
          }
        : {
            data: { url: "https://protocol.fun" },
            icon: "",
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
