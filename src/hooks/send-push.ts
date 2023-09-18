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
  const user = await context.app.service("users").get(notification.userId)

  if (!user.pushDevices) return

  const vapidKeys = context.app.get("webPush")
  webpush.setVapidDetails(
    "mailto:hello@danielconstantin.net",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )

  user.pushDevices.forEach(({ sub }) => {
    const payload: PayloadShape = {
      options: {
        badge: "/icon-512x512.png",
        body: notification.text,
        data: { url: "https://protocol.fun" },
        tag: "Test",
        timestamp: notification.createdAt * 1000,
        // icon: "/icon-512x512.png",
        // image: "/icon-512x512.png",
      },
      title: notification.title,
    }

    webpush.sendNotification(sub, JSON.stringify(payload)).catch(logger.error)
  })
}
