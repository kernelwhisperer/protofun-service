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

  if (!user.webpush) return
  const vapidKeys = context.app.get("webPush")
  webpush.setVapidDetails(
    "mailto:hello@danielconstantin.net",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )

  const subscription = JSON.parse(user.webpush)

  const payload: PayloadShape = {
    options: {
      badge: "/icon-512x512.png",
      body: notification.text,
      data: { url: "protocol.fun" },
      tag: "Test",
      timestamp: notification.createdAt * 1000,
      // icon: "/icon-512x512.png",
      // image: "/icon-512x512.png",
    },
    title: notification.title,
  }

  webpush.sendNotification(subscription, JSON.stringify(payload)).catch(logger.error)
}
